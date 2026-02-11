// User ID Manager - Generates and persists anonymous user ID for rate limiting

/**
 * Get or create anonymous user ID
 * @returns {Promise<string>} User ID (UUID)
 */
async function getUserId() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['userId'], (result) => {
            if (result.userId) {
                console.log('TruthLens: Retrieved existing user ID');
                resolve(result.userId);
            } else {
                // Generate new UUID
                const newUserId = crypto.randomUUID();
                chrome.storage.local.set({ userId: newUserId }, () => {
                    console.log('TruthLens: Generated new user ID:', newUserId);
                    resolve(newUserId);
                });
            }
        });
    });
}

/**
 * Get current usage statistics from backend
 * @returns {Promise<Object>} Usage stats with used, remaining, limit, reset_time
 */
async function getUsageStats() {
    try {
        const userId = await getUserId();
        const response = await fetch(`${API_BASE_URL}/api/usage`, {
            method: 'GET',
            headers: {
                'X-User-ID': userId
            }
        });

        if (response.ok) {
            return await response.json();
        }

        console.error('Failed to fetch usage stats:', response.status);
        return null;
    } catch (error) {
        console.error('Error fetching usage stats:', error);
        return null;
    }
}
