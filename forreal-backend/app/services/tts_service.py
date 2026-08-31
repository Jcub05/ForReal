"""Text-to-speech service using ElevenLabs."""
import httpx
from typing import Optional
from datetime import datetime
from app.config import settings
from app.models import FactCheckResponse


class TTSService:
    """Service for generating text-to-speech audio using ElevenLabs."""
    
    @staticmethod
    def format_fact_check_for_speech(
        claim: str,
        result: FactCheckResponse
    ) -> str:
        """
        Format a fact check result into a speech-friendly text.
        
        Args:
            claim: The original claim that was fact-checked
            result: The fact check response from the API
            
        Returns:
            Formatted text ready for text-to-speech conversion
        """
        speech_text = f"The tweet claims that {claim}. "
        speech_text += f"After fact check, it has been determined that this post is {result.label.lower()}. "
        speech_text += f"{result.explanation} "

        if result.sources and len(result.sources) > 0:
            speech_text += "This information is based on the following sources: "

            for i, source in enumerate(result.sources):
                speech_text += f"Source {i + 1}: {source.title}. "
                if source.published_date:
                    speech_text += f"Published {source.published_date}. "
        else:
            speech_text += "No sources were found to verify this claim."
        
        return speech_text
    
    @staticmethod
    async def generate_speech(
        text: str,
        voice_id: Optional[str] = None
    ) -> bytes:
        """
        Generate speech audio from text using ElevenLabs API.
        
        Args:
            text: The text to convert to speech
            voice_id: Optional custom voice ID (uses default if not provided)
            
        Returns:
            Audio data as bytes (MP3 format)
            
        Raises:
            Exception: If API call fails or API key is not configured
        """
        if not settings.ELEVENLABS_API_KEY:
            raise Exception("ElevenLabs API key not configured")
        
        voice = voice_id or settings.ELEVENLABS_VOICE_ID
        url = f"{settings.ELEVENLABS_API_URL}/{voice}"

        headers = {
            "xi-api-key": settings.ELEVENLABS_API_KEY,
            "Content-Type": "application/json"
        }
        payload = {
            "text": text,
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75
            }
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                url,
                headers=headers,
                json=payload
            )
            
            if response.status_code != 200:
                error_text = response.text
                raise Exception(f"ElevenLabs API error ({response.status_code}): {error_text}")
            
            # Return the audio data
            return response.content
    
    @staticmethod
    async def generate_fact_check_speech(
        claim: str,
        result: FactCheckResponse
    ) -> bytes:
        """
        Generate speech audio for a complete fact check result.
        
        Args:
            claim: The original claim that was fact-checked
            result: The fact check response from the API
            
        Returns:
            Audio data as bytes (MP3 format)
        """
        speech_text = TTSService.format_fact_check_for_speech(claim, result)
        return await TTSService.generate_speech(speech_text)
