"""AI media detection API routes."""
from fastapi import APIRouter, HTTPException
from app.models import MediaCheckRequest, MediaCheckResponse
from app.services import MediaCheckService

router = APIRouter(prefix="/api", tags=["media"])


@router.post("/check-media", response_model=MediaCheckResponse)
async def check_media(request: MediaCheckRequest):
    """
    AI media detection endpoint - Currently disabled.
    
    This premium feature will be available soon for detecting AI-generated images.
    
    Args:
        request: MediaCheckRequest with media_url and media_type
        
    Returns:
        HTTP 503 with coming soon message
    """
    # Block all users with "coming soon" message
    raise HTTPException(
        status_code=503,
        detail={
            "error": "Feature coming soon",
            "message": "AI media detection is currently being enhanced and will be available soon. Stay tuned!",
            "feature": "AI Media Detection",
            "status": "coming_soon"
        }
    )
