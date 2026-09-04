from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from routers.auth_router import router as auth_router
from routers.trip_router import router as trip_router
from routers.ask_router  import router as ask_router
from routers.chat_router import router as chat_router
from services.trip_service import recommend_places, option_transportations

import os

from dotenv import load_dotenv
load_dotenv()

app = FastAPI(title="KelanaAI API")

# Build allowed origins from env — supports comma-separated list
# e.g. FRONTEND_URL=https://kelana-ai-delta.vercel.app,http://localhost:3000
_frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
ALLOWED_ORIGINS = [url.strip() for url in _frontend_url.split(",") if url.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import models so create_all picks them up
import models.user          # noqa: F401
import models.trip          # noqa: F401
import models.conversation  # noqa: F401

init_db()

# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(trip_router)
app.include_router(ask_router)
app.include_router(chat_router)


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
