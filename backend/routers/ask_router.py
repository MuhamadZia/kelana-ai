from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from services.bedrock_service import ask_knowledge_base
from services.auth_service import get_current_user
from models.user import User

router = APIRouter(prefix="/api/v1", tags=["ask"])


# ── Schemas ────────────────────────────────────────────────────────────────────

class AskRequest(BaseModel):
    question: str


class AskResponse(BaseModel):
    question: str
    answer:   str


# ── Endpoint ───────────────────────────────────────────────────────────────────

@router.post("/ask", response_model=AskResponse)
def ask(
    request: AskRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Query the AWS Bedrock Knowledge Base with a user question.
    Returns the original question alongside the AI-generated answer.
    """
    try:
        answer = ask_knowledge_base(request.question)
    except (ValueError, RuntimeError) as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    return AskResponse(question=request.question, answer=answer)
