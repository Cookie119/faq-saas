import bcrypt
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from core.config import get_settings
from core.database import get_db
from models.db_models import Company, Domain, UsageLog

settings = get_settings()
router = APIRouter(prefix="/admin", tags=["Admin"])


def verify_admin(email: str, secret_key: str) -> bool:
    if not settings.admin_email or not settings.admin_secret_key_hash:
        raise HTTPException(status_code=503, detail="Admin credentials not configured in .env")
    email_ok = email.strip().lower() == settings.admin_email.strip().lower()
    if not email_ok:
        return False
    try:
        return bcrypt.checkpw(secret_key.encode("utf-8"), settings.admin_secret_key_hash.encode("utf-8"))
    except Exception:
        return False


@router.post("/login")
def admin_login(payload: dict):
    if not verify_admin(payload.get("email", ""), payload.get("secret_key", "")):
        raise HTTPException(status_code=403, detail="Invalid email or secret key")
    return {"message": "Admin access granted", "email": payload.get("email")}


@router.get("/companies")
def list_companies(email: str, secret_key: str, db: Session = Depends(get_db)):
    if not verify_admin(email, secret_key):
        raise HTTPException(status_code=403, detail="Unauthorized")
    companies = db.query(Company).order_by(Company.created_at.desc()).all()
    result = []
    for c in companies:
        domain_count   = db.query(func.count(Domain.id)).filter(Domain.company_id == c.id).scalar()
        question_count = db.query(func.count(UsageLog.id)).filter(UsageLog.company_id == c.id).scalar()
        result.append({
            "id":              str(c.id),
            "name":            c.name,
            "email":           c.email,
            "plan":            c.plan,
            "questions_used":  c.questions_used,
            "domains":         domain_count,
            "total_questions": question_count,
            "created_at":      c.created_at.isoformat(),
        })
    return {"companies": result, "total": len(result)}


@router.put("/companies/{company_id}/plan")
def update_plan(company_id: str, body: dict, db: Session = Depends(get_db)):
    if not verify_admin(body.get("email", ""), body.get("secret_key", "")):
        raise HTTPException(status_code=403, detail="Unauthorized")
    plan = body.get("plan")
    if plan not in ("free", "pro", "enterprise"):
        raise HTTPException(status_code=400, detail="Invalid plan. Use: free, pro, enterprise")
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    company.plan = plan
    db.commit()
    return {"message": f"{company.name} updated to {plan}", "plan": plan}


@router.delete("/companies/{company_id}")
def delete_company(company_id: str, body: dict, db: Session = Depends(get_db)):
    if not verify_admin(body.get("email", ""), body.get("secret_key", "")):
        raise HTTPException(status_code=403, detail="Unauthorized")
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    db.delete(company)
    db.commit()
    return {"message": f"Company {company.name} deleted"}


@router.get("/stats")
def global_stats(email: str, secret_key: str, db: Session = Depends(get_db)):
    if not verify_admin(email, secret_key):
        raise HTTPException(status_code=403, detail="Unauthorized")
    return {
        "total_companies": db.query(func.count(Company.id)).scalar(),
        "total_domains":   db.query(func.count(Domain.id)).scalar(),
        "total_questions": db.query(func.count(UsageLog.id)).scalar(),
        "plan_breakdown": {
            "free":       db.query(func.count(Company.id)).filter(Company.plan == "free").scalar(),
            "pro":        db.query(func.count(Company.id)).filter(Company.plan == "pro").scalar(),
            "enterprise": db.query(func.count(Company.id)).filter(Company.plan == "enterprise").scalar(),
        }
    }
