"""AI media detection service using AI or Not API."""
import requests
import asyncio
import time
from concurrent.futures import ThreadPoolExecutor
from app.config import settings
from app.models import MediaCheckResponse

# Thread pool for async operations
executor = ThreadPoolExecutor(max_workers=settings.MAX_WORKERS)


class MediaCheckService:
    """Service for detecting AI-generated images and videos."""
    
    @staticmethod
    async def check_media(media_url: str, media_type: str) -> MediaCheckResponse:
        """
        Check if an image or video is AI-generated using AI or Not API.
        
        Args:
            media_url: URL of the image or video
            media_type: Type of media ("image" or "video")
            
        Returns:
            MediaCheckResponse with ai_generated status, confidence, and message
        """
        if not settings.AIORNOT_API_KEY:
            raise ValueError("AIORNOT_API_KEY not configured")
        
        # AI or Not only supports images, not videos
        if media_type == "video":
            return MediaCheckResponse(
                ai_generated=False,
                confidence=0.0,
                media_type=media_type,
                message="Video detection not available (images only)"
            )
        
        try:
            if not media_url or not media_url.startswith('http'):
                raise ValueError(f"Invalid media URL: {media_url}")

            check_start = time.time()

            # AI or Not API uses simple Bearer token authentication
            headers = {
                "Authorization": f"Bearer {settings.AIORNOT_API_KEY.strip()}",
                "Content-Type": "application/json"
            }
            payload = {
                "object": media_url
            }

            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                executor,
                lambda: requests.post(
                    settings.AIORNOT_API_URL,
                    headers=headers,
                    json=payload,
                    timeout=settings.AIORNOT_TIMEOUT
                )
            )

            if response.status_code == 403:
                raise ValueError("AI or Not API authentication failed. Please check your API key.")

            if response.status_code == 400:
                raise ValueError(f"AI or Not API bad request. Response: {response.text}")

            response.raise_for_status()
            data = response.json()

            check_time = time.time() - check_start
            print(f"AI or Not check took {check_time:.2f}s")

            # Response shape: {"report": {"verdict": "ai"/"human", "ai": {"confidence": 0.x}, "human": {"confidence": 0.x}}}
            verdict = "unknown"
            confidence = 0.5

            if "report" in data:
                report = data["report"]
                verdict = report.get("verdict", "unknown")
                if verdict == "ai":
                    confidence = report.get("ai", {}).get("confidence", 0.5)
                elif verdict == "human":
                    confidence = report.get("human", {}).get("confidence", 0.5)

            ai_generated = verdict == "ai"
            
            # Determine message based on confidence
            if ai_generated:
                message = "Likely AI-generated" if confidence > 0.8 else "Possibly AI-generated"
            else:
                message = "Likely authentic" if confidence > 0.8 else "Uncertain"
            
            return MediaCheckResponse(
                ai_generated=ai_generated,
                confidence=confidence,
                media_type=media_type,
                message=message
            )
            
        except Exception as e:
            print(f"Error checking media: {str(e)}")
            raise
