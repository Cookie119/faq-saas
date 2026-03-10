from fastapi import APIRouter, Depends, HTTPException, Request
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


def check_origin(request: Request, domain: Domain):
    """
    If the domain has allowed_origins configured, verify the request
    Origin header matches. Empty list = allow all (backward compatible).
    """
    allowed = domain.allowed_origins or []
    if not allowed:
        return  # No restrictions set — allow all

    origin = request.headers.get("origin") or request.headers.get("referer", "")

    # Strip trailing slash and path from referer if present
    if origin:
        from urllib.parse import urlparse
        parsed = urlparse(origin)
        origin = f"{parsed.scheme}://{parsed.netloc}"

    if not origin:
        raise HTTPException(
            status_code=403,
            detail="Origin header required for this domain"
        )

    # Check if origin matches any allowed origin
    origin_clean = origin.rstrip("/").lower()
    allowed_clean = [o.rstrip("/").lower() for o in allowed]

    if origin_clean not in allowed_clean:
        raise HTTPException(
            status_code=403,
            detail=f"Origin '{origin}' is not allowed for this domain. "
                   f"Add it in your dashboard under Domain Settings."
        )


@router.post("/ask", response_model=AskResponse)
async def ask(
    payload: AskRequest,
    request: Request,
    company: Company = Depends(get_company_by_api_key),
    db: Session = Depends(get_db),
):
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

    # ── Origin check ──────────────────────────────────────────────────────────
    check_origin(request, domain_db)

    parsed  = domain_loader.parse(domain_db)
    history = [{"role": m.role, "content": m.content} for m in (payload.history or [])]
    result  = await faq_bot.ask(domain=parsed, question=payload.question, history=history)

    log = UsageLog(
        company_id=company.id,
        domain_id=domain_db.id,
        question=payload.question,
        answer=result.answer,
        chunks_used=[{"heading": r.heading, "score": r.score} for r in result.retrieved_chunks],
        tokens_used=result.tokens_used,
        search_fallback=result.search_fallback,
    )
    db.add(log)
    db.commit()

    return AskResponse(
        answer=result.answer,
        domain_id=domain_db.slug,
        domain_name=domain_db.display_name,
        retrieved_chunks=[ChunkUsed(heading=r.heading, score=r.score) for r in result.retrieved_chunks],
        search_fallback=result.search_fallback,
        model=settings.ai_model,
        questions_remaining=questions_remaining,
    )