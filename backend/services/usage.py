"""
UsageService
Handles plan limit enforcement and monthly usage tracking.
"""

from datetime import datetime, timedelta
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from core.config import get_settings
from models.db_models import Company

settings = get_settings()


class UsageService:

    def get_limits(self, plan: str) -> dict:
        return settings.plan_limits.get(plan, settings.plan_limits["free"])

    def check_and_increment(self, company: Company, db: Session) -> int:
        """
        Check if company is within their monthly question limit.
        Auto-resets counter if a new month has started.
        Returns remaining questions after increment.
        Raises 429 if limit exceeded.
        """
        self._maybe_reset_monthly(company, db)

        limits = self.get_limits(company.plan)
        limit = limits["questions_per_month"]

        if company.questions_used >= limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Monthly question limit of {limit} reached. Please upgrade your plan.",
            )

        company.questions_used += 1
        db.commit()
        return limit - company.questions_used

    def check_domain_limit(self, company: Company, db: Session):
        """Raise 403 if the company has hit their domain count limit."""
        from models.db_models import Domain
        limits = self.get_limits(company.plan)
        current_count = db.query(Domain).filter(Domain.company_id == company.id).count()

        if current_count >= limits["domains"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Domain limit of {limits['domains']} reached for your plan. Please upgrade.",
            )

    def check_md_size(self, company: Company, content: str):
        """Raise 413 if the uploaded markdown exceeds plan's size limit."""
        limits = self.get_limits(company.plan)
        max_bytes = limits["max_md_size_kb"] * 1024
        if len(content.encode("utf-8")) > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"Markdown file exceeds the {limits['max_md_size_kb']}KB limit for your plan.",
            )

    def get_plan_info(self, company: Company, db: Session) -> dict:
        from models.db_models import Domain
        self._maybe_reset_monthly(company, db)
        limits = self.get_limits(company.plan)
        domains_used = db.query(Domain).filter(Domain.company_id == company.id).count()

        return {
            "plan": company.plan,
            "questions_used": company.questions_used,
            "questions_limit": limits["questions_per_month"],
            "domains_used": domains_used,
            "domains_limit": limits["domains"],
            "max_md_size_kb": limits["max_md_size_kb"],
            "usage_reset_at": company.usage_reset_at,
        }

    # ── Private ───────────────────────────────────────────────────────────────

    def _maybe_reset_monthly(self, company: Company, db: Session):
        """Reset question counter if it's been more than 30 days."""
        now = datetime.utcnow()
        if company.usage_reset_at and (now - company.usage_reset_at) >= timedelta(days=30):
            company.questions_used = 0
            company.usage_reset_at = now
            db.commit()


# Singleton
usage_service = UsageService()