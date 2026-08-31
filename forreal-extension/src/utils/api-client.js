// API Client - Centralized API communication

/**
 * Call the backend API to fact-check text
 * @param {string} text - Text to fact-check
 * @returns {Promise<Object>} - Fact-check result
 */
async function factCheckTweet(text) {
    const userId = await getUserId();

    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-User-ID': userId
        },
        body: JSON.stringify({ text })
    });

    if (response.status === 429) {
        const errorData = await response.json();
        console.warn('ForReal: Rate limit exceeded:', errorData);
        throw new Error('RATE_LIMIT_EXCEEDED');
    }

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
}

/**
 * Check if media is AI-generated
 * @param {string} mediaUrl - URL of the media to check
 * @param {string} mediaType - Type of media ('image' or 'video')
 * @returns {Promise<Object>} - Media check result
 */
async function checkMedia(mediaUrl, mediaType = 'image') {
    const apiUrl = API_ENDPOINT.replace('/fact-check', '/check-media');
    const userId = await getUserId();

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-User-ID': userId
        },
        body: JSON.stringify({ media_url: mediaUrl, media_type: mediaType })
    });

    if (response.status === 503) {
        throw new Error('FEATURE_COMING_SOON');
    }

    if (!response.ok) {
        const errorText = await response.text();
        console.error('ForReal: Media check API error:', errorText);
        throw new Error(`API returned ${response.status}: ${errorText}`);
    }

    return await response.json();
}

/**
 * Generate text-to-speech audio
 * @param {string} claim - The claim/tweet text
 * @param {Object} result - The fact-check result
 * @returns {Promise<Blob>} - Audio blob
 */
async function generateTTS(claim, result) {
    const response = await fetch(TTS_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            claim: claim,
            result: result
        })
    });

    if (!response.ok) {
        throw new Error(`TTS API error: ${response.status}`);
    }

    const audioBlob = await response.blob();
    return audioBlob;
}
