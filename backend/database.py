from dotenv import load_dotenv
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")

# Neon (and other serverless Postgres) requires sslmode=require.
# Append it only if not already present in the URL.
if "sslmode" not in DATABASE_URL:
    separator = "&" if "?" in DATABASE_URL else "?"
    DATABASE_URL = f"{DATABASE_URL}{separator}sslmode=require"

engine = create_engine(
    DATABASE_URL,
    # pool_pre_ping sends a lightweight "SELECT 1" before handing out a
    # connection — if the connection was dropped by Neon, SQLAlchemy
    # transparently reconnects instead of raising an error.
    pool_pre_ping=True,
    # Recycle connections after 5 minutes so SQLAlchemy never holds a
    # connection longer than Neon's idle timeout (~5 min by default).
    pool_recycle=300,
    # Keep a small pool; Neon serverless works best with fewer long-lived
    # connections.
    pool_size=5,
    max_overflow=2,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

Base = declarative_base()


def init_db() -> None:
    """Create all SQLAlchemy tables for the configured database."""
    Base.metadata.create_all(bind=engine)
