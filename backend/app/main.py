import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.seed import seed_database
from app.api import auth, scans, reports, dashboard, copilot, preferences

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("cyberguard")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure DB schema & seed demo account exist
    logger.info("Initializing CYBERGUARD Defensive Cybersecurity Platform...")
    await seed_database()
    logger.info("CYBERGUARD Core Engine is ONLINE and ready.")
    yield
    # Shutdown
    logger.info("CYBERGUARD Engine shutting down.")

app = FastAPI(
    title="CYBERGUARD API",
    description="Enterprise Defensive Cybersecurity Threat Analysis & Explainability Platform",
    version="1.0.0",
    docs_url="/api/docs" if settings.debug else None,
    redoc_url=None,
    lifespan=lifespan,
)

# CORS Configuration - Supports localhost, Vercel deployments (*.vercel.app), and custom origins
raw_cors = settings.cors_origins
if isinstance(raw_cors, str):
    parsed_origins = [o.strip() for o in raw_cors.split(",") if o.strip()]
else:
    parsed_origins = list(raw_cors)

app.add_middleware(
    CORSMiddleware,
    allow_origins=parsed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security Headers Middleware
@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    # Payload size guard (max 10MB)
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > 10 * 1024 * 1024:
        return JSONResponse(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            content={"detail": "Payload exceeds 10MB limit."},
        )

    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# Register API Routers
app.include_router(auth.router, prefix="/api")
app.include_router(scans.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(copilot.router, prefix="/api")
app.include_router(preferences.router, prefix="/api")

@app.get("/api/health", tags=["Health"])
async def health_check():
    """Health status check."""
    return {
        "status": "healthy",
        "app": settings.app_name,
        "environment": settings.environment,
        "mode": "DEFENSIVE_DETECTION",
    }
