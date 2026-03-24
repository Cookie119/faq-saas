"""
Run once to create the password_reset_tokens table.
    python3 alembic_add_password_reset.py
"""
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

engine = create_engine(os.environ["DATABASE_URL"])

with engine.connect() as conn:
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
            token       VARCHAR NOT NULL UNIQUE,
            expires_at  TIMESTAMP NOT NULL,
            created_at  TIMESTAMP DEFAULT NOW()
        );
    """))
    conn.execute(text("""
        CREATE INDEX IF NOT EXISTS idx_reset_token ON password_reset_tokens(token);
    """))
    conn.commit()
    print("✓ Created password_reset_tokens table")
