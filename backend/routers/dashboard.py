"""
routers/dashboard.py  (replace your existing dashboard/domains router)

New endpoints added:
  POST   /domains/{id}/upload          — upload one or more files
  GET    /domains/{id}/files           — list uploaded files
  DELETE /domains/{id}/files/{file_id} — delete a single file & rebuild index
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi import status as http_status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from core.auth import get_current_company
from core.database import get_db
from core.config import get_settings
from models.db_models import Company, Domain, DomainFile
from services.domain_loader import domain_loader, DomainChunk
from services.usage import usage_service
from services.file_converter import convert_to_markdown

settings = get_settings()
router   = APIRouter(prefix="/domains", tags=["Domains"])

ALLOWED_EXTENSIONS = {'md', 'txt', 'pdf', 'docx', 'csv'}
MAX_TOTAL_SIZE_MAP = {
    "free":       500 * 1024,
    "pro":        5 * 1024 * 1024,
    "enterprise": 20 * 1024 * 1024,
}


# ── Helpers ───────────────────────────────────────────────────────
def _get_domain(domain_id: str, company: Company, db: Session) -> Domain:
    domain = db.query(Domain).filter(
        Domain.id == domain_id,
        Domain.company_id == company.id,
    ).first()
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")
    return domain


def _rebuild_and_update(domain: Domain, db: Session):
    """Merge all file contents, re-chunk using domain_loader, update chunk_count."""
    files = db.query(DomainFile).filter(DomainFile.domain_id == domain.id).all()

    # Merge all raw markdown content
    all_content = "\n\n---\n\n".join(f.raw_content for f in files)

    # Use existing chunking logic from domain_loader
    chunks = domain_loader._split_chunks(all_content)

    # Store merged content on domain so knowledge_search can access it
    domain.md_content  = all_content
    domain.chunk_count = len(chunks)
    db.commit()


# ── List domains ──────────────────────────────────────────────────
@router.get("")
def list_domains(
    company: Company = Depends(get_current_company),
    db: Session      = Depends(get_db),
):
    domains = db.query(Domain).filter(Domain.company_id == company.id).all()
    result  = []
    for d in domains:
        files = db.query(DomainFile).filter(DomainFile.domain_id == d.id).all()
        result.append({
            "id":              str(d.id),
            "slug":            d.slug,
            "display_name":    d.display_name,
            "persona":         d.persona,
            "tone":            d.tone,
            "language":        d.language,
            "fallback_msg":    d.fallback_msg,
            "is_active":       d.is_active,
            "chunk_count":     d.chunk_count,
            "allowed_origins": d.allowed_origins or [],
            "enable_suggestions": getattr(d, 'enable_suggestions', False),
            "updated_at":      d.updated_at.isoformat() if d.updated_at else None,
            "files": [{
                "id":          str(f.id),
                "filename":    f.filename,
                "file_type":   f.file_type,
                "chunk_count": f.chunk_count,
                "uploaded_at": f.uploaded_at.isoformat() if f.uploaded_at else None,
            } for f in files],
        })
    return {"domains": result}


# ── Create domain ─────────────────────────────────────────────────
class DomainCreate(BaseModel):
    slug:                str
    display_name:        str
    persona:             str  = ""
    tone:                str  = "helpful and professional"
    language:            str  = "English"
    fallback_msg:        str  = ""
    enable_suggestions:  bool = False

@router.post("", status_code=201)
def create_domain(
    payload: DomainCreate,
    company: Company = Depends(get_current_company),
    db: Session      = Depends(get_db),
):
    plan_info = usage_service.get_plan_info(company, db)
    if plan_info["domains_used"] >= plan_info["domains_limit"]:
        raise HTTPException(status_code=403, detail="Domain limit reached for your plan")

    if db.query(Domain).filter(Domain.slug == payload.slug).first():
        raise HTTPException(status_code=409, detail="Slug already taken")

    domain = Domain(
        company_id=company.id,
        slug=payload.slug,
        display_name=payload.display_name,
        persona=payload.persona,
        tone=payload.tone,
        language=payload.language,
        fallback_msg=payload.fallback_msg,
        enable_suggestions=payload.enable_suggestions,
        is_active=True,
        chunk_count=0,
    )
    db.add(domain); db.commit(); db.refresh(domain)
    return {"id": str(domain.id), "slug": domain.slug, "display_name": domain.display_name}


# ── Update domain ─────────────────────────────────────────────────
class DomainUpdate(BaseModel):
    display_name:        str  = None
    persona:             str  = None
    tone:                str  = None
    language:            str  = None
    fallback_msg:        str  = None
    is_active:           bool = None
    allowed_origins:     list = None
    enable_suggestions:  bool = None

@router.put("/{domain_id}")
def update_domain(
    domain_id: str,
    payload:   DomainUpdate,
    company:   Company = Depends(get_current_company),
    db:        Session = Depends(get_db),
):
    domain = _get_domain(domain_id, company, db)
    for field, value in payload.dict(exclude_none=True).items():
        setattr(domain, field, value)
    db.commit()
    return {"ok": True}


# ── Delete domain ─────────────────────────────────────────────────
@router.delete("/{domain_id}", status_code=204)
def delete_domain(
    domain_id: str,
    company:   Company = Depends(get_current_company),
    db:        Session = Depends(get_db),
):
    domain = _get_domain(domain_id, company, db)
    db.delete(domain); db.commit()


# ── Upload files ──────────────────────────────────────────────────
@router.post("/{domain_id}/upload")
async def upload_files(
    domain_id: str,
    files:     List[UploadFile] = File(...),
    company:   Company = Depends(get_current_company),
    db:        Session = Depends(get_db),
):
    domain      = _get_domain(domain_id, company, db)
    max_bytes   = MAX_TOTAL_SIZE_MAP.get(company.plan, 500 * 1024)
    errors      = []
    uploaded    = []

    # Check current total size
    existing_size = sum(
        len(f.raw_content.encode('utf-8'))
        for f in db.query(DomainFile).filter(DomainFile.domain_id == domain.id).all()
    )

    for upload in files:
        ext = upload.filename.rsplit('.', 1)[-1].lower() if '.' in upload.filename else ''
        if ext not in ALLOWED_EXTENSIONS:
            errors.append(f"{upload.filename}: unsupported type (.{ext})")
            continue

        content = await upload.read()
        file_size = len(content)

        if existing_size + file_size > max_bytes:
            errors.append(f"{upload.filename}: would exceed {max_bytes // 1024}KB plan limit")
            continue

        # Convert to markdown
        try:
            markdown = convert_to_markdown(content, upload.filename)
        except (ValueError, ImportError) as e:
            errors.append(f"{upload.filename}: {str(e)}")
            continue

        # Check if file with same name exists — replace it
        existing = db.query(DomainFile).filter(
            DomainFile.domain_id == domain.id,
            DomainFile.filename  == upload.filename,
        ).first()

        if existing:
            existing.raw_content = markdown
            existing.file_type   = ext
        else:
            db.add(DomainFile(
                domain_id   = domain.id,
                filename    = upload.filename,
                file_type   = ext,
                raw_content = markdown,
                chunk_count = 0,
            ))

        existing_size += file_size
        uploaded.append(upload.filename)

    if uploaded:
        db.commit()
        _rebuild_and_update(domain, db)

    # Refresh file list for response
    domain_files = db.query(DomainFile).filter(DomainFile.domain_id == domain.id).all()

    return {
        "uploaded":    uploaded,
        "errors":      errors,
        "chunk_count": domain.chunk_count,
        "files": [{
            "id":          str(f.id),
            "filename":    f.filename,
            "file_type":   f.file_type,
            "chunk_count": f.chunk_count,
            "uploaded_at": f.uploaded_at.isoformat() if f.uploaded_at else None,
        } for f in domain_files],
    }


# ── List files ────────────────────────────────────────────────────
@router.get("/{domain_id}/files")
def list_files(
    domain_id: str,
    company:   Company = Depends(get_current_company),
    db:        Session = Depends(get_db),
):
    domain = _get_domain(domain_id, company, db)
    files  = db.query(DomainFile).filter(DomainFile.domain_id == domain.id).all()
    return {"files": [{
        "id":          str(f.id),
        "filename":    f.filename,
        "file_type":   f.file_type,
        "chunk_count": f.chunk_count,
        "uploaded_at": f.uploaded_at.isoformat() if f.uploaded_at else None,
    } for f in files]}


# ── Get single file content (for editor) ─────────────────────────
@router.get("/{domain_id}/files/{file_id}/content")
def get_file_content(
    domain_id: str,
    file_id:   str,
    company:   Company = Depends(get_current_company),
    db:        Session = Depends(get_db),
):
    domain = _get_domain(domain_id, company, db)
    f = db.query(DomainFile).filter(
        DomainFile.id        == file_id,
        DomainFile.domain_id == domain.id,
    ).first()
    if not f:
        raise HTTPException(status_code=404, detail="File not found")
    return {
        "id":          str(f.id),
        "filename":    f.filename,
        "file_type":   f.file_type,
        "raw_content": f.raw_content,
        "chunk_count": f.chunk_count,
    }


# ── Update file content (from MD editor) ─────────────────────────
class FileContentUpdate(BaseModel):
    raw_content: str

@router.put("/{domain_id}/files/{file_id}/content")
def update_file_content(
    domain_id: str,
    file_id:   str,
    payload:   FileContentUpdate,
    company:   Company = Depends(get_current_company),
    db:        Session = Depends(get_db),
):
    domain = _get_domain(domain_id, company, db)
    f = db.query(DomainFile).filter(
        DomainFile.id        == file_id,
        DomainFile.domain_id == domain.id,
    ).first()
    if not f:
        raise HTTPException(status_code=404, detail="File not found")

    if not payload.raw_content.strip():
        raise HTTPException(status_code=400, detail="Content cannot be empty")

    f.raw_content = payload.raw_content
    db.commit()

    # Rebuild index immediately
    _rebuild_and_update(domain, db)

    # Update per-file chunk count estimate
    file_chunks = domain_loader._split_chunks(payload.raw_content)
    f.chunk_count = len(file_chunks)
    db.commit()

    return {
        "ok":          True,
        "chunk_count": domain.chunk_count,
        "file_chunks": f.chunk_count,
    }


# ── Delete single file ────────────────────────────────────────────
@router.delete("/{domain_id}/files/{file_id}")
def delete_file(
    domain_id: str,
    file_id:   str,
    company:   Company = Depends(get_current_company),
    db:        Session = Depends(get_db),
):
    domain = _get_domain(domain_id, company, db)

    domain_file = db.query(DomainFile).filter(
        DomainFile.id        == file_id,
        DomainFile.domain_id == domain.id,
    ).first()

    if not domain_file:
        raise HTTPException(status_code=404, detail="File not found")

    db.delete(domain_file)
    db.commit()

    # Rebuild index from remaining files immediately
    _rebuild_and_update(domain, db)

    return {
        "deleted":     domain_file.filename,
        "chunk_count": domain.chunk_count,
    }