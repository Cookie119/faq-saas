from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer, APIKeyHeader
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from core.config import get_settings
from core.database import get_db
from models.db_models import Company

settings = get_settings()

# ── JWT (for dashboard) ───────────────────────────────────────────────────────

bearer_scheme = HTTPBearer()


def create_access_token(company_id: str, expires_delta: Optional[timedelta] = None) -> str:
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    )
    return jwt.encode(
        {"sub": str(company_id), "exp": expire},
        settings.jwt_secret_key,
        algorithm=settings.algorithm,
    )


def get_current_company(
    credentials: HTTPAuthorizationCredentials = Security(bearer_scheme),
    db: Session = Depends(get_db),
) -> Company:
    """FastAPI dependency — validates JWT and returns the company."""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.algorithm])
        company_id: str = payload.get("sub")
        if not company_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=401, detail="Company not found")
    return company


# ── API Key (for /ask endpoint) ───────────────────────────────────────────────

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=True)


def get_company_by_api_key(
    api_key: str = Security(api_key_header),
    db: Session = Depends(get_db),
) -> Company:
    """FastAPI dependency — validates API key and returns the company."""
    company = db.query(Company).filter(Company.api_key == api_key).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
        )
    return company