"""AI media detection service using Hive API."""
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
        Check if an image or video is AI-generated using Hive API.
        
        Args:
            media_url: URL of the image or video
            media_type: Type of media ("image" or "video")
            
        Returns:
            MediaCheckResponse with ai_generated status, confidence, and message
        """
        if not settings.HIVE_API_KEY:
            raise ValueError("HIVE_API_KEY not configured")
        
        try:
            print(f"Checking {media_type}: {media_url[:100]}...")
            check_start = time.time()
            
            # Hive API expects 'token' in lowercase and the key directly
            headers = {
                "Authorization": f"token {settings.HIVE_API_KEY}",
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
            
            payload = {
                "url": media_url,
                "classes": ["ai_generated"]
            }
            
            print(f"🔑 Using API key: {settings.HIVE_API_KEY[:10]}...")
            print(f"📤 Request payload: {payload}")
            
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                executor,
                lambda: requests.post(
                    settings.HIVE_API_URL,
                    headers=headers,
                    json=payload,
                    timeout=settings.HIVE_TIMEOUT
                )
            )
            
            print(f"📥 Response status: {response.status_code}")
            print(f"📥 Response headers: {response.headers}")
            
            if response.status_code == 403:
                print("❌ 403 Forbidden - API key might be invalid")
                print(f"Response body: {response.text[:500]}")
                raise ValueError(f"Hive API authentication failed. Please check your API key. Response: {response.text[:200]}")
            
            response.raise_for_status()
            data = response.json()
            print(f"✓ Response data received: {data}")
            
            check_time = time.time() - check_start
            print(f"⏱️  Hive AI check took: {check_time:.2f}s")
            
            # Parse Hive response
            ai_generated = False
            confidence = 0.0
            
            if "status" in data and data["status"][0]["response"]["output"]:
                classes = data["status"][0]["response"]["output"][0]["classes"]
                for cls in classes:
                    if cls["class"] == "ai_generated":
                        confidence = cls["score"]
                        ai_generated = confidence > 0.5
                        break
            
            # Determine message based on confidence
            if ai_generated:
                message = "Likely AI-generated" if confidence > 0.8 else "Possibly AI-generated"
            else:
                message = "Likely authentic" if confidence < 0.2 else "Uncertain"
            
            return MediaCheckResponse(
                ai_generated=ai_generated,
                confidence=confidence,
                media_type=media_type,
                message=message
            )
            
        except Exception as e:
            print(f"Error checking media: {str(e)}")
            raise
