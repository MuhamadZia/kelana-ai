from fastapi import FastAPI
from services.trip_service import (
  recommend_places,
  option_transportations
) 

app = FastAPI()

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

