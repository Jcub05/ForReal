"""
ForReal API - Main application entry point.
Refactored modular architecture for scalability.
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import fact_check_router, media_router
from app.middleware import RateLimiter

print("-" * 50)
print("Initializing ForReal API")
print("-" * 50)

app = FastAPI(
    title="ForReal API",
    version="1.0.0",
    description="AI-powered fact-checking and media verification API"
)

rate_limiter = RateLimiter(daily_limit=settings.FREE_TIER_DAILY_LIMIT)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your extension ID
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(fact_check_router)
app.include_router(media_router)

print(f"ForReal API ready | model: {settings.GEMINI_MODEL} | search: Brave | "
      f"media detection: {'enabled' if settings.AIORNOT_API_KEY else 'disabled'} | "
      f"rate limiting: {'enabled' if settings.PRODUCTION_MODE else 'disabled (dev mode)'}")
print("-" * 50)


@app.get("/")
async def root():
    """Root endpoint - API status."""
    return {
        "message": "ForReal API is running",
        "version": "1.0.0",
        "features": {
            "fact_check": True,
            "media_check": False
        }
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "model": settings.GEMINI_MODEL,
        "search": "brave",
        "media_detection": False
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
            "media_detection": False,  # backend endpoint returns 503, see routers/media.py
            "text_to_speech": True
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=settings.HOST,
        port=settings.PORT
    )
