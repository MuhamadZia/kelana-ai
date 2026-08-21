from fastapi import FastAPI, status, HTTPException
from services.trip_service import (
  recommend_places,
  option_transportations,
  calculate_daily_budget,
  get_trip_category
)
from models.trip import Trip
from database import SessionLocal
from database import init_db

from pydantic import BaseModel

app = FastAPI()

init_db()

class TripRequest(BaseModel):
  destination: str
  days: int
  budget: float
  travel_style: str

class TripUpdateRequest(BaseModel):
  budget: float


# a GET endpoint at the root path
@app.get("/")
def home():
 return {
   "message" : "Welcome to KelanaAI"
 }

# Get recommendations
@app.get("/api/v1/recommendations")
def get_recommendations():
  return {
    "recommendations" : recommend_places()
  }

# Get transportaions
@app.get("/api/v1/transportations")
def get_transportaitons():
  return {
    "transportaions": option_transportations()
  }

@app.post("/api/v1/trips")
def create_trip(request: TripRequest):
    # reuse Session 2 business logic
    daily_budget = calculate_daily_budget(request.budget, request.days)
    category     = get_trip_category(request.budget)

    # create a Trip ORM object
    trip = Trip(
        destination  = request.destination,
        days         = request.days,
        budget       = request.budget,
        category     = category,
        daily_budget = daily_budget,
    )

    # save to PostgreSQL
    db = SessionLocal()
    db.add(trip)
    db.commit()
    db.refresh(trip)   # get the auto-generated id
    db.close()
    return trip

@app.get("/api/v1/trips")
def list_trips():
    db = SessionLocal()
    trips = db.query(Trip).all()
    db.close()
    return trips

@app.get("/api/v1/trips/{trip_id}")
def get_trip(trip_id: int):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    db.close()
    
    # handling not found
    if trip is None:
          raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
    return trip

@app.put("/api/v1/trips/{trip_id}")
def update_trip(trip_id: int, request: TripUpdateRequest):
  db = SessionLocal()
  trip = db.query(Trip).filter(Trip.id == trip_id).first()

  if not trip:
    raise HTTPException(status_code=404, detail="Trip is not found")

  daily_budget = calculate_daily_budget(request.budget, trip.days)
  category     = get_trip_category(request.budget)

  trip.budget = request.budget
  trip.category = category
  trip.daily_budget = daily_budget

  db.commit()
  db.refresh(trip)

  return trip

@app.delete("/api/v1/trips/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip(trip_id: int):
  db = SessionLocal()
  trip = db.query(Trip).filter(Trip.id == trip_id).first()

  if not trip:
    raise HTTPException(status_code=404, detail="Trip is not found")

  db.delete(trip)
  db.commit()

  return None