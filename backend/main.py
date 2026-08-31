from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from routers.auth_router import router as auth_router
from routers.trip_router import router as trip_router
from services.trip_service import recommend_places, option_transportations

import os

app = FastAPI(title="KelanaAI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import models so create_all picks them up
import models.user  # noqa: F401
import models.trip  # noqa: F401

init_db()

# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(trip_router)


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
