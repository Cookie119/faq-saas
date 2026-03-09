from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.auth import get_company_by_api_key
from core.database import get_db
from core.config import get_settings
from models.db_models import Company, Domain, UsageLog
from models.schemas import AskRequest, AskResponse, ChunkUsed
from services.domain_loader import domain_loader
from services.faq_bot import faq_bot
from services.usage import usage_service

settings = get_settings()
router = APIRouter(tags=["Ask"])

@router.post("/ask", response_model=AskResponse)
async def ask(payload: AskRequest, company: Company = Depends(get_company_by_api_key), db: Session = Depends(get_db)):
    questions_remaining = usage_service.check_and_increment(company, db)
    domain_db = db.query(Domain).filter(
        Domain.slug == payload.domain_id,
        Domain.company_id == company.id,
        Domain.is_active == True,
    ).first()
    if not domain_db:
        raise HTTPException(status_code=404, detail=f"Domain '{payload.domain_id}' not found or inactive.")
    if not domain_db.md_content:
        raise HTTPException(status_code=400, detail=f"Domain '{payload.domain_id}' has no knowledge base uploaded yet.")
    parsed = domain_loader.parse(domain_db)
    history = [{"role": m.role, "content": m.content} for m in (payload.history or [])]
    result = await faq_bot.ask(domain=parsed, question=payload.question, history=history)
    log = UsageLog(company_id=company.id, domain_id=domain_db.id,
        question=payload.question, answer=result.answer,
        chunks_used=[{"heading": r.heading, "score": r.score} for r in result.retrieved_chunks],
        tokens_used=result.tokens_used, search_fallback=result.search_fallback)
    db.add(log); db.commit()
    return AskResponse(answer=result.answer, domain_id=domain_db.slug,
        domain_name=domain_db.display_name,
        retrieved_chunks=[ChunkUsed(heading=r.heading, score=r.score) for r in result.retrieved_chunks],
        search_fallback=result.search_fallback, model=settings.ai_model,
        questions_remaining=questions_remaining)
