// Popup script - Load and display quota stats

// Load API base URL from constants
const API_BASE_URL = 'https://for-real-fpg3t.ondigitalocean.app';

// Load user ID manager from service
async function getUserId() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['userId'], (result) => {
            if (result.userId) {
                resolve(result.userId);
            } else {
                const newUserId = crypto.randomUUID();
                chrome.storage.local.set({ userId: newUserId }, () => {
                    resolve(newUserId);
                });
            }
        });
    });
}

// Fetch and display usage stats
async function loadUsageStats() {
    try {
        const userId = await getUserId();
        const response = await fetch(`${API_BASE_URL}/api/usage`, {
            method: 'GET',
            headers: {
                'X-User-ID': userId
            }
        });

        if (response.ok) {
            const data = await response.json();
            updateQuotaDisplay(data);
        } else {
            console.error('Failed to load usage stats:', response.status);
        }
    } catch (error) {
        console.error('Error loading usage stats:', error);
    }
}

// Update the quota display UI
function updateQuotaDisplay(data) {
    const usedEl = document.getElementById('quota-used');
    const limitEl = document.getElementById('quota-limit');
    const progressEl = document.getElementById('quota-progress');
    const resetEl = document.getElementById('quota-reset');

    usedEl.textContent = data.used_today;
    limitEl.textContent = data.daily_limit;

    // Update progress bar
    const percentage = (data.used_today / data.daily_limit) * 100;
    progressEl.style.width = `${percentage}%`;

    // Format reset time
    const resetTime = new Date(data.reset_time);
    const now = new Date();
    const hoursUntilReset = Math.ceil((resetTime - now) / (1000 * 60 * 60));
    resetEl.textContent = `Resets in ${hoursUntilReset}h`;

    // Change color if quota is low
    if (data.remaining_today <= 5) {
        progressEl.style.background = '#ff9800';
    }
    if (data.remaining_today === 0) {
        progressEl.style.background = '#f44336';
    }
}

// Load stats when popup opens
document.addEventListener('DOMContentLoaded', loadUsageStats);
