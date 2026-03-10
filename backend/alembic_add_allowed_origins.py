"""
Run this once to add the allowed_origins column to existing domains table.
Usage: python3 alembic_add_allowed_origins.py
"""
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
with engine.connect() as conn:
    # Add column if it doesn't exist
    conn.execute(text("""
        ALTER TABLE domains
        ADD COLUMN IF NOT EXISTS allowed_origins JSON DEFAULT '[]'::json;
    """))
    conn.commit()
    print("✅ allowed_origins column added to domains table")