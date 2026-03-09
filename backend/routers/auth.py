from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from core.auth import create_access_token, get_current_company
from core.database import get_db
from core.security import generate_api_key, hash_password, verify_password
from models.db_models import Company
from models.schemas import AuthResponse, CompanyProfile, LoginRequest, RegisterRequest
from services.usage import usage_service

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=AuthResponse, status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(Company).filter(Company.email == payload.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")
    company = Company(
        name=payload.name, email=payload.email,
        password_hash=hash_password(payload.password),
        api_key=generate_api_key(), plan="free",
    )
    db.add(company); db.commit(); db.refresh(company)
    token = create_access_token(company.id)
    return AuthResponse(access_token=token, company_id=str(company.id),
        company_name=company.name, api_key=company.api_key, plan=company.plan)

@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.email == payload.email).first()
    if not company or not verify_password(payload.password, company.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    token = create_access_token(company.id)
    return AuthResponse(access_token=token, company_id=str(company.id),
        company_name=company.name, api_key=company.api_key, plan=company.plan)

@router.get("/me", response_model=CompanyProfile)
def get_me(company: Company = Depends(get_current_company), db: Session = Depends(get_db)):
    info = usage_service.get_plan_info(company, db)
    return CompanyProfile(id=str(company.id), name=company.name, email=company.email,
        plan=company.plan, questions_used=info["questions_used"],
        questions_limit=info["questions_limit"], domains_count=info["domains_used"],
        domains_limit=info["domains_limit"], created_at=company.created_at)

@router.post("/rotate-key")
def rotate_api_key(company: Company = Depends(get_current_company), db: Session = Depends(get_db)):
    company.api_key = generate_api_key()
    db.commit()
    return {"api_key": company.api_key, "message": "API key rotated successfully"}
