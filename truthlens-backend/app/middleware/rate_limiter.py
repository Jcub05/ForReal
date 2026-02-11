"""Rate limiting middleware for TruthLens API."""
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
from typing import Dict, Optional
import time

class RateLimiter:
    """
    Simple in-memory rate limiter for API requests.
    Tracks requests per user ID (from header) with daily limits.
    """
    
    def __init__(self, daily_limit: int = 25):
        """
        Initialize rate limiter.
        
        Args:
            daily_limit: Maximum requests per user per day (default: 25)
        """
        self.daily_limit = daily_limit
        # Storage: {user_id: {"count": int, "reset_time": datetime}}
        self.storage: Dict[str, Dict] = {}
        
    def _get_user_id(self, request: Request) -> str:
        """
        Extract user ID from request headers or use IP as fallback.
        
        Args:
            request: FastAPI request object
            
        Returns:
            User identifier string
        """
        # Try to get user ID from custom header (extension will send this)
        user_id = request.headers.get("X-User-ID")
        
        # Fallback to client IP if no user ID provided
        if not user_id:
            client_host = request.client.host if request.client else "unknown"
            user_id = f"ip_{client_host}"
            
        return user_id
    
    def _get_reset_time(self) -> datetime:
        """
        Calculate next reset time (midnight UTC + 1 day).
        
        Returns:
            Datetime object for next reset
        """
        now = datetime.utcnow()
        tomorrow = now + timedelta(days=1)
        # Reset at midnight UTC
        reset_time = datetime(tomorrow.year, tomorrow.month, tomorrow.day, 0, 0, 0)
        return reset_time
    
    def _clean_expired_entries(self):
        """Remove entries that have passed their reset time."""
        now = datetime.utcnow()
        expired_keys = [
            user_id for user_id, data in self.storage.items()
            if data["reset_time"] < now
        ]
        for key in expired_keys:
            del self.storage[key]
    
    def check_rate_limit(self, request: Request) -> tuple[bool, int, datetime]:
        """
        Check if request is within rate limit.
        
        Args:
            request: FastAPI request object
            
        Returns:
            Tuple of (is_allowed, remaining_requests, reset_time)
        """
        user_id = self._get_user_id(request)
        now = datetime.utcnow()
        
        # Clean up expired entries periodically
        self._clean_expired_entries()
        
        # Get or create user entry
        if user_id not in self.storage:
            self.storage[user_id] = {
                "count": 0,
                "reset_time": self._get_reset_time()
            }
        
        user_data = self.storage[user_id]
        
        # Check if reset time has passed
        if user_data["reset_time"] < now:
            # Reset counter
            user_data["count"] = 0
            user_data["reset_time"] = self._get_reset_time()
        
        # Check rate limit
        is_allowed = user_data["count"] < self.daily_limit
        remaining = max(0, self.daily_limit - user_data["count"])
        
        return is_allowed, remaining, user_data["reset_time"]
    
    def increment_usage(self, request: Request):
        """
        Increment usage counter for a user.
        
        Args:
            request: FastAPI request object
        """
        user_id = self._get_user_id(request)
        
        if user_id in self.storage:
            self.storage[user_id]["count"] += 1
        else:
            # Initialize if not exists
            self.storage[user_id] = {
                "count": 1,
                "reset_time": self._get_reset_time()
            }
    
    def get_usage_stats(self, request: Request) -> dict:
        """
        Get current usage statistics for a user.
        
        Args:
            request: FastAPI request object
            
        Returns:
            Dict with usage stats (used, remaining, limit, reset_time)
        """
        user_id = self._get_user_id(request)
        now = datetime.utcnow()
        
        if user_id not in self.storage or self.storage[user_id]["reset_time"] < now:
            # No usage or expired
            return {
                "used": 0,
                "remaining": self.daily_limit,
                "limit": self.daily_limit,
                "reset_time": self._get_reset_time().isoformat()
            }
        
        user_data = self.storage[user_id]
        used = user_data["count"]
        remaining = max(0, self.daily_limit - used)
        
        return {
            "used": used,
            "remaining": remaining,
            "limit": self.daily_limit,
            "reset_time": user_data["reset_time"].isoformat()
        }


async def rate_limit_middleware(request: Request, rate_limiter: RateLimiter):
    """
    Middleware function to check and enforce rate limits.
    
    Args:
        request: FastAPI request object
        rate_limiter: RateLimiter instance
        
    Raises:
        HTTPException: 429 if rate limit exceeded
    """
    is_allowed, remaining, reset_time = rate_limiter.check_rate_limit(request)
    
    if not is_allowed:
        # Calculate seconds until reset
        now = datetime.utcnow()
        retry_after = int((reset_time - now).total_seconds())
        
        raise HTTPException(
            status_code=429,
            detail={
                "error": "Rate limit exceeded",
                "message": f"You have reached your daily limit of {rate_limiter.daily_limit} fact-checks. Please try again after the reset time.",
                "limit": rate_limiter.daily_limit,
                "reset_time": reset_time.isoformat(),
                "retry_after_seconds": retry_after
            },
            headers={
                "X-RateLimit-Limit": str(rate_limiter.daily_limit),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": reset_time.isoformat(),
                "Retry-After": str(retry_after)
            }
        )
