from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from models.conversation import Conversation, Message
from models.user import User
from services.bedrock_service import chat_with_ai
from services.auth_service import get_db, get_current_user

router = APIRouter(prefix="/api/v1/conversations", tags=["chat"])


# ── Schemas ────────────────────────────────────────────────────────────────────

class ConversationCreate(BaseModel):
    title: str


class ConversationUpdate(BaseModel):
    title: str


class MessageResponse(BaseModel):
    id:              int
    conversation_id: int
    role:            str
    content:         str
    created_at:      datetime

    model_config = {"from_attributes": True}


class ConversationResponse(BaseModel):
    id:         int
    user_id:    int
    title:      str
    created_at: datetime
    updated_at: datetime
    messages:   list[MessageResponse] = []

    model_config = {"from_attributes": True}


class ConversationSummary(BaseModel):
    id:         int
    title:      str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SendMessageRequest(BaseModel):
    content: str


# ── Helpers ────────────────────────────────────────────────────────────────────

def _get_owned_conversation(
    conversation_id: int,
    current_user: User,
    db: Session,
) -> Conversation:
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id,
        Conversation.deleted_at.is_(None),
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    return conv


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.post("", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
def create_conversation(
    request: ConversationCreate,
    db: Session        = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conv = Conversation(user_id=current_user.id, title=request.title)
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv


@router.get("", response_model=list[ConversationSummary])
def list_conversations(
    db: Session        = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Conversation)
        .filter(
            Conversation.user_id == current_user.id,
            Conversation.deleted_at.is_(None),
        )
        .order_by(Conversation.updated_at.desc())
        .all()
    )


@router.get("/{conversation_id}", response_model=ConversationResponse)
def get_conversation(
    conversation_id: int,
    db: Session        = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _get_owned_conversation(conversation_id, current_user, db)


@router.patch("/{conversation_id}", response_model=ConversationSummary)
def update_conversation_title(
    conversation_id: int,
    request: ConversationUpdate,
    db: Session        = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conv = _get_owned_conversation(conversation_id, current_user, db)
    conv.title = request.title
    db.commit()
    db.refresh(conv)
    return conv


@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_conversation(
    conversation_id: int,
    db: Session        = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conv = _get_owned_conversation(conversation_id, current_user, db)
    conv.deleted_at = datetime.now(timezone.utc)
    db.commit()


@router.post("/{conversation_id}/messages", response_model=MessageResponse)
def send_message(
    conversation_id: int,
    request: SendMessageRequest,
    db: Session        = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conv = _get_owned_conversation(conversation_id, current_user, db)

    # Persist user message
    user_msg = Message(
        conversation_id=conv.id,
        role="user",
        content=request.content,
    )
    db.add(user_msg)
    db.flush()  # get user_msg.id without full commit

    # Build history for Bedrock (all previous messages + current)
    all_messages = (
        db.query(Message)
        .filter(Message.conversation_id == conv.id)
        .order_by(Message.created_at)
        .all()
    )
    history = [{"role": m.role, "content": m.content} for m in all_messages]

    # Call Bedrock
    try:
        ai_reply = chat_with_ai(history)
    except RuntimeError as exc:
        db.rollback()
        raise HTTPException(status_code=502, detail=str(exc))

    # Persist assistant message
    assistant_msg = Message(
        conversation_id=conv.id,
        role="assistant",
        content=ai_reply,
    )
    db.add(assistant_msg)

    # Bump conversation updated_at so it sorts to top of list
    conv.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(assistant_msg)
    return assistant_msg
