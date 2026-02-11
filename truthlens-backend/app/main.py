"""
TruthLens API - Main application entry point.
Refactored modular architecture for scalability.
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import fact_check_router, media_router
from app.middleware import RateLimiter

print("=" * 50)
print("🚀 Initializing TruthLens API")
print("=" * 50)

# Initialize FastAPI app
app = FastAPI(
    title="TruthLens API",
    version="1.0.0",
    description="AI-powered fact-checking and media verification API"
)
print("✓ FastAPI app initialized")

# Initialize rate limiter
rate_limiter = RateLimiter(daily_limit=settings.FREE_TIER_DAILY_LIMIT)
print(f"✓ Rate limiter initialized (limit: {settings.FREE_TIER_DAILY_LIMIT} requests/day)")
print(f"✓ Production mode: {settings.PRODUCTION_MODE}")

# Configure CORS for Chrome Extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your extension ID
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
print("✓ CORS middleware configured")

# Include routers
app.include_router(fact_check_router)
app.include_router(media_router)
print("✓ API routers registered")

print("=" * 50)
print(f"✅ TruthLens API Ready")
print(f"📍 Model: {settings.GEMINI_MODEL}")
print(f"🔍 Search: Brave Search API")
print(f"🤖 Media Detection: {'Enabled (AI or Not)' if settings.AIORNOT_API_KEY else 'Disabled'}")
print(f"🚦 Rate Limiting: {'Enabled' if settings.PRODUCTION_MODE else 'Disabled (Dev Mode)'}")
print("=" * 50)


@app.get("/")
async def root():
    """Root endpoint - API status."""
    return {
        "message": "TruthLens API is running",
        "version": "1.0.0",
        "features": {
            "fact_check": True,
            "media_check": bool(settings.AIORNOT_API_KEY)
        }
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "model": settings.GEMINI_MODEL,
        "search": "brave",
        "media_detection": bool(settings.AIORNOT_API_KEY)
    }


@app.get("/api/usage")
async def get_usage(request: Request):
    """
    Get usage statistics for the current user.
    Returns remaining quota and reset time.
    """
    stats = rate_limiter.get_usage_stats(request)
    return {
        "status": "success",
        "tier": "free",
        "daily_limit": stats["limit"],
        "used_today": stats["used"],
        "remaining_today": stats["remaining"],
        "reset_time": stats["reset_time"],
        "features": {
            "fact_checking": True,
            "media_detection": False,  # Coming soon
            "text_to_speech": False   # Coming soon
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=settings.HOST,
        port=settings.PORT
    )
