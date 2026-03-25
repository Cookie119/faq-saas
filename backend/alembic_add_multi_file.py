"""
Run once to create domain_files table and update domains table.
    python3 alembic_add_multi_file.py
"""
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
engine = create_engine(os.environ["DATABASE_URL"])

with engine.connect() as conn:

    # Create domain_files table
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS domain_files (
            id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            domain_id    UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
            filename     VARCHAR NOT NULL,
            file_type    VARCHAR NOT NULL,
            raw_content  TEXT NOT NULL,
            chunk_count  INTEGER DEFAULT 0,
            uploaded_at  TIMESTAMP DEFAULT NOW()
        );
    """))
    conn.execute(text("""
        CREATE INDEX IF NOT EXISTS idx_domain_files_domain_id
        ON domain_files(domain_id);
    """))

    # domains table — drop old md_content column if exists, keep chunk_count as total
    conn.execute(text("""
        ALTER TABLE domains
        ADD COLUMN IF NOT EXISTS total_chunk_count INTEGER DEFAULT 0;
    """))

    conn.commit()
    print("✓ Created domain_files table")
    print("✓ Added total_chunk_count to domains")
