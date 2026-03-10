from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, field_validator
import re


# ── Auth ──────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    company_id: str
    company_name: str
    api_key: str
    plan: str


class CompanyProfile(BaseModel):
    id: str
    name: str
    email: str
    plan: str
    questions_used: int
    questions_limit: int
    domains_count: int
    domains_limit: int
    created_at: datetime

    class Config:
        from_attributes = True


# ── Domains ───────────────────────────────────────────────────────────────────

class DomainCreate(BaseModel):
    slug: str
    display_name: str
    persona: Optional[str] = None
    tone: Optional[str] = "helpful and professional"
    language: Optional[str] = "English"
    fallback_msg: Optional[str] = None

    @field_validator("slug")
    @classmethod
    def slug_format(cls, v):
        if not re.match(r"^[a-z0-9-]+$", v):
            raise ValueError("Slug must be lowercase letters, numbers, and hyphens only")
        return v


class DomainUpdate(BaseModel):
    display_name: Optional[str] = None
    persona: Optional[str] = None
    tone: Optional[str] = None
    language: Optional[str] = None
    fallback_msg: Optional[str] = None
    is_active: Optional[bool] = None
    allowed_origins: Optional[List[str]] = None


class DomainResponse(BaseModel):
    id: str
    slug: str
    display_name: str
    persona: Optional[str]
    tone: Optional[str]
    language: str
    fallback_msg: Optional[str]
    is_active: bool
    chunk_count: int = 0
    allowed_origins: List[str] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DomainListResponse(BaseModel):
    domains: List[DomainResponse]
    total: int


# ── Ask ───────────────────────────────────────────────────────────────────────

class HistoryMessage(BaseModel):
    role: str
    content: str


class AskRequest(BaseModel):
    domain_id: str
    question: str
    history: Optional[List[HistoryMessage]] = []

    @field_validator("question")
    @classmethod
    def question_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Question cannot be empty")
        return v.strip()


class ChunkUsed(BaseModel):
    heading: str
    score: float


class AskResponse(BaseModel):
    answer: str
    domain_id: str
    domain_name: str
    retrieved_chunks: List[ChunkUsed]
    search_fallback: bool
    model: str
    questions_remaining: Optional[int] = None


# ── Analytics ─────────────────────────────────────────────────────────────────

class AnalyticsSummary(BaseModel):
    total_questions: int
    questions_this_month: int
    questions_limit: int
    top_domains: List[dict]
    recent_questions: List[dict]


# ── Plan ──────────────────────────────────────────────────────────────────────

class PlanInfo(BaseModel):
    plan: str
    questions_used: int
    questions_limit: int
    domains_used: int
    domains_limit: int
    max_md_size_kb: int
    usage_reset_at: datetime