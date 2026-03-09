from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from core.auth import get_current_company
from core.database import get_db
from models.db_models import Company, Domain, UsageLog
from models.schemas import (DomainCreate, DomainListResponse, DomainResponse,
    DomainUpdate, AnalyticsSummary, PlanInfo)
from services.domain_loader import domain_loader
from services.usage import usage_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

def _get_domain(domain_id, company_id, db):
    domain = db.query(Domain).filter(Domain.id == domain_id, Domain.company_id == company_id).first()
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")
    return domain

@router.get("/domains", response_model=DomainListResponse)
def list_domains(company: Company = Depends(get_current_company), db: Session = Depends(get_db)):
    domains = db.query(Domain).filter(Domain.company_id == company.id).all()
    items = []
    for d in domains:
        parsed = domain_loader.parse(d)
        items.append(DomainResponse(id=str(d.id), slug=d.slug, display_name=d.display_name,
            persona=d.persona, tone=d.tone, language=d.language, fallback_msg=d.fallback_msg,
            is_active=d.is_active, chunk_count=len(parsed.chunks),
            created_at=d.created_at, updated_at=d.updated_at))
    return DomainListResponse(domains=items, total=len(items))

@router.post("/domains", response_model=DomainResponse, status_code=201)
def create_domain(payload: DomainCreate, company: Company = Depends(get_current_company), db: Session = Depends(get_db)):
    usage_service.check_domain_limit(company, db)
    if db.query(Domain).filter(Domain.company_id == company.id, Domain.slug == payload.slug).first():
        raise HTTPException(status_code=409, detail=f"Slug '{payload.slug}' already exists")
    domain = Domain(company_id=company.id, slug=payload.slug, display_name=payload.display_name,
        md_content="", persona=payload.persona, tone=payload.tone,
        language=payload.language, fallback_msg=payload.fallback_msg)
    db.add(domain); db.commit(); db.refresh(domain)
    return DomainResponse(id=str(domain.id), slug=domain.slug, display_name=domain.display_name,
        persona=domain.persona, tone=domain.tone, language=domain.language,
        fallback_msg=domain.fallback_msg, is_active=domain.is_active, chunk_count=0,
        created_at=domain.created_at, updated_at=domain.updated_at)

@router.post("/domains/{domain_id}/upload", response_model=DomainResponse)
async def upload_md(domain_id: str, file: UploadFile = File(...),
    company: Company = Depends(get_current_company), db: Session = Depends(get_db)):
    if not file.filename.endswith(".md"):
        raise HTTPException(status_code=400, detail="Only .md files accepted")
    domain = _get_domain(domain_id, company.id, db)
    content = (await file.read()).decode("utf-8")
    usage_service.check_md_size(company, content)
    fm = domain_loader.extract_frontmatter_defaults(content)
    domain.md_content = content
    if not domain.persona and fm.get("persona"): domain.persona = fm["persona"]
    if not domain.tone and fm.get("tone"): domain.tone = fm["tone"]
    if not domain.language and fm.get("language"): domain.language = fm["language"]
    if not domain.fallback_msg and fm.get("fallback"): domain.fallback_msg = fm["fallback"]
    domain.updated_at = datetime.utcnow()
    db.commit(); db.refresh(domain)
    parsed = domain_loader.parse(domain)
    return DomainResponse(id=str(domain.id), slug=domain.slug, display_name=domain.display_name,
        persona=domain.persona, tone=domain.tone, language=domain.language,
        fallback_msg=domain.fallback_msg, is_active=domain.is_active,
        chunk_count=len(parsed.chunks), created_at=domain.created_at, updated_at=domain.updated_at)

@router.put("/domains/{domain_id}", response_model=DomainResponse)
def update_domain(domain_id: str, payload: DomainUpdate,
    company: Company = Depends(get_current_company), db: Session = Depends(get_db)):
    domain = _get_domain(domain_id, company.id, db)
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(domain, field, value)
    domain.updated_at = datetime.utcnow()
    db.commit(); db.refresh(domain)
    parsed = domain_loader.parse(domain)
    return DomainResponse(id=str(domain.id), slug=domain.slug, display_name=domain.display_name,
        persona=domain.persona, tone=domain.tone, language=domain.language,
        fallback_msg=domain.fallback_msg, is_active=domain.is_active,
        chunk_count=len(parsed.chunks), created_at=domain.created_at, updated_at=domain.updated_at)

@router.delete("/domains/{domain_id}", status_code=204)
def delete_domain(domain_id: str, company: Company = Depends(get_current_company), db: Session = Depends(get_db)):
    domain = _get_domain(domain_id, company.id, db)
    db.delete(domain); db.commit()

@router.get("/analytics", response_model=AnalyticsSummary)
def get_analytics(company: Company = Depends(get_current_company), db: Session = Depends(get_db)):
    info = usage_service.get_plan_info(company, db)
    since = datetime.utcnow() - timedelta(days=30)
    monthly_logs = db.query(UsageLog).filter(UsageLog.company_id == company.id, UsageLog.created_at >= since).all()
    domain_counts = {}
    for log in monthly_logs:
        domain_counts[str(log.domain_id)] = domain_counts.get(str(log.domain_id), 0) + 1
    domains = db.query(Domain).filter(Domain.company_id == company.id).all()
    domain_name_map = {str(d.id): d.display_name for d in domains}
    top_domains = sorted([{"domain": domain_name_map.get(k, k), "questions": v}
        for k, v in domain_counts.items()], key=lambda x: -x["questions"])[:5]
    recent = [{"question": log.question[:100], "domain": domain_name_map.get(str(log.domain_id), ""),
        "at": log.created_at.isoformat()}
        for log in sorted(monthly_logs, key=lambda l: l.created_at, reverse=True)[:10]]
    total_logs = db.query(UsageLog).filter(UsageLog.company_id == company.id).count()
    return AnalyticsSummary(total_questions=total_logs, questions_this_month=len(monthly_logs),
        questions_limit=info["questions_limit"], top_domains=top_domains, recent_questions=recent)

@router.get("/plan", response_model=PlanInfo)
def get_plan(company: Company = Depends(get_current_company), db: Session = Depends(get_db)):
    return usage_service.get_plan_info(company, db)
