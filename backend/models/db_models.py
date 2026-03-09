import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean, Column, DateTime, Enum, ForeignKey,
    Integer, String, Text, JSON,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from core.database import Base


def gen_uuid():
    return str(uuid.uuid4())


class Company(Base):
    __tablename__ = "companies"

    id              = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    name            = Column(String(255), nullable=False)
    email           = Column(String(255), unique=True, nullable=False, index=True)
    password_hash   = Column(String(255), nullable=False)
    api_key         = Column(String(100), unique=True, nullable=False, index=True)
    plan            = Column(Enum("free", "pro", "enterprise", name="plan_enum"), default="free")
    questions_used  = Column(Integer, default=0)          # resets monthly
    usage_reset_at  = Column(DateTime, default=datetime.utcnow)
    created_at      = Column(DateTime, default=datetime.utcnow)

    # Relationships
    domains         = relationship("Domain", back_populates="company", cascade="all, delete")
    usage_logs      = relationship("UsageLog", back_populates="company", cascade="all, delete")


class Domain(Base):
    __tablename__ = "domains"

    id              = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    company_id      = Column(UUID(as_uuid=False), ForeignKey("companies.id"), nullable=False, index=True)
    slug            = Column(String(100), nullable=False)   # unique per company, e.g. "greenroots"
    display_name    = Column(String(255), nullable=False)
    md_content      = Column(Text, nullable=False)          # raw markdown stored in DB
    persona         = Column(String(500), nullable=True)
    tone            = Column(String(255), nullable=True)
    language        = Column(String(50), default="English")
    fallback_msg    = Column(Text, nullable=True)
    is_active       = Column(Boolean, default=True)
    created_at      = Column(DateTime, default=datetime.utcnow)
    updated_at      = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    company         = relationship("Company", back_populates="domains")
    usage_logs      = relationship("UsageLog", back_populates="domain", cascade="all, delete")


class UsageLog(Base):
    __tablename__ = "usage_logs"

    id              = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    company_id      = Column(UUID(as_uuid=False), ForeignKey("companies.id"), nullable=False, index=True)
    domain_id       = Column(UUID(as_uuid=False), ForeignKey("domains.id"), nullable=False, index=True)
    question        = Column(Text, nullable=False)
    answer          = Column(Text, nullable=False)
    chunks_used     = Column(JSON, nullable=True)           # [{heading, score}]
    tokens_used     = Column(Integer, default=0)
    search_fallback = Column(Boolean, default=False)
    created_at      = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    company         = relationship("Company", back_populates="usage_logs")
    domain          = relationship("Domain", back_populates="usage_logs")