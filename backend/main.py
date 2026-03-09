from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import get_settings
from core.database import Base, engine
from routers import auth, dashboard, ask, admin

settings = get_settings()

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FAQ Bot SaaS API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(ask.router)
app.include_router(admin.router)

@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}

@app.get("/", tags=["Health"])
def root():
    return {"message": "FAQ Bot SaaS API", "docs": "/docs"}
