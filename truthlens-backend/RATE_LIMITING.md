# Rate Limiting Quick Reference

## Overview
The backend now includes rate limiting to manage API quota usage. Free tier users are limited to 25 fact-checks per day.

## Configuration

### Environment Variables
Add to your `.env` file:
```bash
PRODUCTION_MODE=true          # Enable rate limiting
FREE_TIER_DAILY_LIMIT=25      # Requests per day
```

### Digital Ocean Deployment
When deploying to Digital Ocean, set these environment variables in your app settings:
- `PRODUCTION_MODE=true`
- `FREE_TIER_DAILY_LIMIT=25`

## Features Implemented

### 1. Rate Limiting (25/day)
- Tracks requests per user via `X-User-ID` header or IP address
- Returns HTTP 429 when limit exceeded
- Resets daily at midnight UTC

### 2. Media Endpoint Blocked
- `/api/check-media` returns 503 "Coming soon" for all users
- Message: "AI media detection is currently being enhanced and will be available soon"

### 3. Usage Statistics
- New endpoint: `GET /api/usage`
- Returns: used count, remaining, limit, reset time

## API Endpoints

### GET /api/usage
Returns current user's quota statistics:
```json
{
  "status": "success",
  "tier": "free",
  "daily_limit": 25,
  "used_today": 5,
  "remaining_today": 20,
  "reset_time": "2026-02-11T00:00:00",
  "features": {
    "fact_checking": true,
    "media_detection": false,
    "text_to_speech": false
  }
}
```

### POST /api/fact-check
Now includes rate limiting in production mode.

**Rate Limit Headers** (when exceeded):
- `X-RateLimit-Limit`: 25
- `X-RateLimit-Remaining`: 0
- `X-RateLimit-Reset`: ISO timestamp
- `Retry-After`: Seconds until reset

**Error Response** (429):
```json
{
  "detail": {
    "error": "Rate limit exceeded",
    "message": "You have reached your daily limit of 25 fact-checks...",
    "limit": 25,
    "reset_time": "2026-02-11T00:00:00",
    "retry_after_seconds": 43200
  }
}
```

### POST /api/check-media
Returns 503 "Feature coming soon" for all users.

## Testing Locally

### Option 1: Test WITHOUT Rate Limiting (Development)
```bash
# In .env file
PRODUCTION_MODE=false

# Run server
python -m uvicorn app.main:app --reload --port 8000
```

### Option 2: Test WITH Rate Limiting (Production Simulation)
```bash
# In .env file
PRODUCTION_MODE=true
FREE_TIER_DAILY_LIMIT=25

# Run server
python -m uvicorn app.main:app --reload --port 8000
```

### Test Rate Limit
Use curl or a tool like Postman to make 26 requests:
```bash
# First 25 should succeed
for i in {1..25}; do
  curl -X POST http://localhost:8000/api/fact-check \
    -H "Content-Type: application/json" \
    -H "X-User-ID: test-user-123" \
    -d '{"text": "Test claim"}' \
  echo "\nRequest $i complete"
done

# 26th request should return 429
curl -X POST http://localhost:8000/api/fact-check \
  -H "Content-Type: application/json" \
  -H "X-User-ID: test-user-123" \
  -d '{"text": "Test claim"}'
```

### Test Usage Endpoint
```bash
curl http://localhost:8000/api/usage \
  -H "X-User-ID: test-user-123"
```

### Test Media Endpoint
```bash
curl -X POST http://localhost:8000/api/check-media \
  -H "Content-Type: application/json" \
  -d '{"media_url": "https://example.com/image.jpg", "media_type": "image"}'

# Should return 503 with "coming soon" message
```

## Cache Clearing Issue

**User Question**: "Couldn't they clear cache and keep going?"

**Answer**: Yes, with anonymous tracking, users could potentially:
1. Clear browser storage to get a new anonymous ID
2. Use incognito mode
3. Use different browsers

**Mitigation strategies** (for future):
- IP-based tracking (current fallback) makes it harder
- Require email verification for higher limits
- Implement device fingerprinting
- Add CAPTCHA after suspicious patterns

**Current approach**: We use IP as fallback when no X-User-ID is provided, making it slightly harder to bypass.

## Digital Ocean Information Needed

To help you deploy, please provide:
1. **Digital Ocean App URL**: What's your current backend URL?
2. **How to set environment variables**: Do you use App Platform, Droplet, or another service?
3. **Current deployment method**: Git auto-deploy, manual upload, or Docker?

## Next Steps

1. **Test locally** with `PRODUCTION_MODE=true`
2. **Verify 25-request limit** works correctly
3. **Set up environment variables** on Digital Ocean
4. **Deploy and test** in production
5. **Update extension** (you'll handle this) to:
   - Send `X-User-ID` header
   - Handle 429 errors gracefully
   - Call `/api/usage` to show remaining quota
