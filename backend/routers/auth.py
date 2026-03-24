import secrets
import resend
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from core.auth import create_access_token, get_current_company
from core.config import get_settings
from core.database import get_db
from core.security import generate_api_key, hash_password, verify_password
from models.db_models import Company, PasswordResetToken
from models.schemas import AuthResponse, CompanyProfile, LoginRequest, RegisterRequest
from services.usage import usage_service

settings = get_settings()
resend.api_key = settings.resend_api_key

router = APIRouter(prefix="/auth", tags=["Auth"])


# ── Schemas ───────────────────────────────────────────────────────
class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


# ── Email template ────────────────────────────────────────────────
def build_reset_email(reset_url: str) -> str:
    return f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#F4FAF0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4FAF0;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #C7EABB;overflow:hidden;">
          <tr>
            <td style="background:#84B179;padding:28px 40px;text-align:center;">
              <span style="font-family:Georgia,serif;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                ginkgo
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#1D2E1A;letter-spacing:-0.3px;">
                Reset your password
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#6B8E62;line-height:1.6;">
                We received a request to reset the password for your Ginkgo account.
                Click the button below to choose a new password.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background:#84B179;border-radius:8px;">
                    <a href="{reset_url}"
                       style="display:inline-block;padding:13px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:-0.2px;">
                      Reset password →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:13px;color:#6B8E62;line-height:1.6;">
                This link expires in <strong>1 hour</strong>. If you didn't request a password reset,
                you can safely ignore this email — your password won't change.
              </p>
              <div style="margin-top:24px;padding:14px 16px;background:#F4FAF0;border-radius:8px;border:1px solid #C7EABB;">
                <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#6B8E62;">
                  Or copy this link
                </p>
                <p style="margin:0;font-size:12px;color:#3A5234;word-break:break-all;font-family:'Courier New',monospace;">
                  {reset_url}
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px 28px;border-top:1px solid #C7EABB;">
              <p style="margin:0;font-size:12px;color:#6B8E62;text-align:center;">
                © {datetime.now().year} Ginkgo · Built for developers
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


# ── Register ──────────────────────────────────────────────────────
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


# ── Login ─────────────────────────────────────────────────────────
@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.email == payload.email).first()
    if not company or not verify_password(payload.password, company.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    token = create_access_token(company.id)
    return AuthResponse(access_token=token, company_id=str(company.id),
        company_name=company.name, api_key=company.api_key, plan=company.plan)


# ── Me ────────────────────────────────────────────────────────────
@router.get("/me", response_model=CompanyProfile)
def get_me(company: Company = Depends(get_current_company), db: Session = Depends(get_db)):
    info = usage_service.get_plan_info(company, db)
    return CompanyProfile(id=str(company.id), name=company.name, email=company.email,
        plan=company.plan, questions_used=info["questions_used"],
        questions_limit=info["questions_limit"], domains_count=info["domains_used"],
        domains_limit=info["domains_limit"], created_at=company.created_at)


# ── Rotate API key ────────────────────────────────────────────────
@router.post("/rotate-key")
def rotate_api_key(company: Company = Depends(get_current_company), db: Session = Depends(get_db)):
    company.api_key = generate_api_key()
    db.commit()
    return {"api_key": company.api_key, "message": "API key rotated successfully"}


# ── Forgot password ───────────────────────────────────────────────
@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    company = db.query(Company).filter(
        Company.email == payload.email.lower().strip()
    ).first()

    if company:
        db.query(PasswordResetToken).filter(
            PasswordResetToken.company_id == company.id
        ).delete()
        db.commit()

        raw_token  = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(hours=1)

        db.add(PasswordResetToken(
            company_id=company.id,
            token=raw_token,
            expires_at=expires_at,
        ))
        db.commit()

        reset_url = f"{settings.frontend_url}/reset-password?token={raw_token}"
        try:
            resend.Emails.send({
                "from":    "Ginkgo <onboarding@resend.dev>",
                "to":      [company.email],
                "subject": "Reset your Ginkgo password",
                "html":    build_reset_email(reset_url),
            })
        except Exception as e:
            print(f"[email error] {e}")

    return {"message": "If that email exists, a reset link has been sent."}


# ── Reset password ────────────────────────────────────────────────
@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    if len(payload.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    reset_token = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == payload.token
    ).first()

    if not reset_token:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")

    if reset_token.expires_at < datetime.utcnow():
        db.delete(reset_token)
        db.commit()
        raise HTTPException(status_code=400, detail="Reset link has expired. Please request a new one.")

    company = db.query(Company).filter(Company.id == reset_token.company_id).first()
    if not company:
        raise HTTPException(status_code=400, detail="Account not found")

    company.password_hash = hash_password(payload.new_password)
    db.delete(reset_token)
    db.commit()

    return {"message": "Password updated successfully"}