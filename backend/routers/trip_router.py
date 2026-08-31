from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from models.trip import Trip
from models.user import User
from services.trip_service import (
    calculate_daily_budget,
    get_trip_category,
)
from services.bedrock_service import get_ai_recommendation
from services.auth_service import get_db, get_current_user

router = APIRouter(prefix="/api/v1/trips", tags=["trips"])


# ── Schemas ────────────────────────────────────────────────────────────────────

class TripRequest(BaseModel):
    destination:  str
    days:         int
    budget:       float
    travel_style: Optional[str] = None


class TripUpdateRequest(BaseModel):
    budget: float


class TripResponse(BaseModel):
    id:                int
    user_id:           int
    destination:       str
    days:              int
    budget:            float
    category:          str
    daily_budget:      float
    travel_style:      Optional[str]
    ai_recommendation: Optional[str]
    created_at:        datetime
    updated_at:        datetime

    model_config = {"from_attributes": True}


class PaginatedTripsResponse(BaseModel):
    total: int
    page:  int
    limit: int
    items: list[TripResponse]


# ── Helpers ────────────────────────────────────────────────────────────────────

def _get_owned_trip(trip_id: int, current_user: User, db: Session) -> Trip:
    """Fetch a non-deleted trip that belongs to the current user."""
    trip = db.query(Trip).filter(
        Trip.id == trip_id,
        Trip.user_id == current_user.id,
        Trip.deleted_at.is_(None),
    ).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found.")
    return trip


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.post("", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
def create_trip(
    request: TripRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    trip = Trip(
        user_id      = current_user.id,
        destination  = request.destination,
        days         = request.days,
        budget       = request.budget,
        category     = get_trip_category(request.budget),
        daily_budget = calculate_daily_budget(request.budget, request.days),
        travel_style = request.travel_style,
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip


@router.get("", response_model=PaginatedTripsResponse)
def list_trips(
    destination: Optional[str] = Query(None, description="Filter by destination (partial, case-insensitive)"),
    page:        int            = Query(1,    ge=1),
    limit:       int            = Query(10,   ge=1, le=100),
    db: Session          = Depends(get_db),
    current_user: User   = Depends(get_current_user),
):
    query = db.query(Trip).filter(
        Trip.user_id == current_user.id,
        Trip.deleted_at.is_(None),
    )

    if destination:
        query = query.filter(Trip.destination.ilike(f"%{destination}%"))

    total  = query.count()
    offset = (page - 1) * limit
    trips  = query.order_by(Trip.created_at.desc()).offset(offset).limit(limit).all()

    return PaginatedTripsResponse(total=total, page=page, limit=limit, items=trips)


@router.get("/{trip_id}", response_model=TripResponse)
def get_trip(
    trip_id: int,
    db: Session        = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _get_owned_trip(trip_id, current_user, db)


@router.post("/{trip_id}/generate", response_model=TripResponse)
def generate_trip_recommendation(
    trip_id: int,
    request: TripRequest,
    db: Session        = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    trip = _get_owned_trip(trip_id, current_user, db)

    trip.ai_recommendation = get_ai_recommendation(
        destination  = trip.destination,
        days         = trip.days,
        budget       = trip.budget,
        travel_style = request.travel_style or trip.travel_style or "general",
    )

    db.commit()
    db.refresh(trip)
    return trip


@router.put("/{trip_id}", response_model=TripResponse)
def update_trip(
    trip_id: int,
    request: TripUpdateRequest,
    db: Session        = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    trip = _get_owned_trip(trip_id, current_user, db)

    trip.budget       = request.budget
    trip.category     = get_trip_category(request.budget)
    trip.daily_budget = calculate_daily_budget(request.budget, trip.days)

    db.commit()
    db.refresh(trip)
    return trip


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
def soft_delete_trip(
    trip_id: int,
    db: Session        = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    trip = _get_owned_trip(trip_id, current_user, db)
    trip.deleted_at = datetime.now(timezone.utc)
    db.commit()
