from fastapi import FastAPI, status, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from pydantic import BaseModel

from services.trip_service import (
    recommend_places,
    option_transportations,
    calculate_daily_budget,
    get_trip_category,
)
from services.bedrock_service import get_ai_recommendation
from models.trip import Trip
from database import SessionLocal, init_db


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()


# ── Pydantic schemas ───────────────────────────────────────────────────────────

class TripRequest(BaseModel):
    destination:  str
    days:         int
    budget:       float
    travel_style: Optional[str] = None


class TripUpdateRequest(BaseModel):
    budget: float


class TripResponse(BaseModel):
    id:                int
    destination:       str
    days:              int
    budget:            float
    category:          str
    daily_budget:      float
    travel_style:      Optional[str]
    ai_recommendation: Optional[str]

    model_config = {"from_attributes": True}


class PaginatedTripsResponse(BaseModel):
    total:  int
    page:   int
    limit:  int
    items:  list[TripResponse]


# ── Utility routes ─────────────────────────────────────────────────────────────

@app.get("/")
def home():
    return {"message": "Welcome to KelanaAI"}


@app.get("/api/v1/recommendations")
def get_recommendations():
    return {"recommendations": recommend_places()}


@app.get("/api/v1/transportations")
def get_transportations():
    return {"transportations": option_transportations()}


# ── Trip CRUD ──────────────────────────────────────────────────────────────────

@app.post("/api/v1/trips", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
def create_trip(request: TripRequest):
    daily_budget = calculate_daily_budget(request.budget, request.days)
    category     = get_trip_category(request.budget)

    trip = Trip(
        destination  = request.destination,
        days         = request.days,
        budget       = request.budget,
        category     = category,
        daily_budget = daily_budget,
        travel_style = request.travel_style,
    )

    db = SessionLocal()
    db.add(trip)
    db.commit()
    db.refresh(trip)
    db.close()
    return trip


@app.get("/api/v1/trips", response_model=PaginatedTripsResponse)
def list_trips(
    destination: Optional[str] = Query(None, description="Filter by destination (case-insensitive, partial match)"),
    page:        int            = Query(1,    ge=1,  description="Page number"),
    limit:       int            = Query(10,   ge=1, le=100, description="Items per page"),
):
    db = SessionLocal()
    query = db.query(Trip)

    if destination:
        query = query.filter(Trip.destination.ilike(f"%{destination}%"))

    total  = query.count()
    offset = (page - 1) * limit
    trips  = query.offset(offset).limit(limit).all()
    db.close()

    return PaginatedTripsResponse(
        total=total,
        page=page,
        limit=limit,
        items=trips,
    )


@app.get("/api/v1/trips/{trip_id}", response_model=TripResponse)
def get_trip(trip_id: int):
    db   = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    db.close()

    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
    return trip


@app.post("/api/v1/trips/{trip_id}/generate", response_model=TripResponse)
def generate_trip_recommendation(trip_id: int, request: TripRequest):
    db   = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    if not trip:
        db.close()
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")

    trip.ai_recommendation = get_ai_recommendation(
        destination  = trip.destination,
        days         = trip.days,
        budget       = trip.budget,
        travel_style = request.travel_style or trip.travel_style or "general",
    )

    db.commit()
    db.refresh(trip)
    db.close()
    return trip


@app.put("/api/v1/trips/{trip_id}", response_model=TripResponse)
def update_trip(trip_id: int, request: TripUpdateRequest):
    db   = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    if not trip:
        db.close()
        raise HTTPException(status_code=404, detail="Trip not found")

    trip.budget       = request.budget
    trip.category     = get_trip_category(request.budget)
    trip.daily_budget = calculate_daily_budget(request.budget, trip.days)

    db.commit()
    db.refresh(trip)
    db.close()
    return trip


@app.delete("/api/v1/trips/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip(trip_id: int):
    db   = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    if not trip:
        db.close()
        raise HTTPException(status_code=404, detail="Trip not found")

    db.delete(trip)
    db.commit()
    db.close()
