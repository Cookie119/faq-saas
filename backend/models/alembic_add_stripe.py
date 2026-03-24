"""
Run this once to add Stripe columns to the company table.
    python3 alembic_add_stripe.py
"""
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

engine = create_engine(os.environ["DATABASE_URL"])

with engine.connect() as conn:
    # Add stripe_customer_id
    conn.execute(text("""
        ALTER TABLE companies
        ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR;
    """))
    # Add stripe_subscription_id
    conn.execute(text("""
        ALTER TABLE companies
        ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR;
    """))
    conn.commit()
    print("✓ Added stripe_customer_id and stripe_subscription_id to companies table")
