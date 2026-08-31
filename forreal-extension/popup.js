// Popup script - loads and displays quota stats.
// Reimplements getUserId() from src/services/user-id-manager.js because the
// popup runs in its own context and doesn't load the content-script bundle.
const API_BASE_URL = 'https://for-real-fpg3t.ondigitalocean.app';

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
            console.error('ForReal: Failed to load usage stats:', response.status);
        }
    } catch (error) {
        console.error('ForReal: Error loading usage stats:', error);
    }
}

function updateQuotaDisplay(data) {
    const usedEl = document.getElementById('quota-used');
    const limitEl = document.getElementById('quota-limit');
    const progressEl = document.getElementById('quota-progress');
    const resetEl = document.getElementById('quota-reset');

    if (!usedEl || !limitEl || !progressEl || !resetEl) {
        console.error('ForReal: Missing DOM elements for quota display');
        return;
    }

    usedEl.textContent = data.used_today;
    limitEl.textContent = data.daily_limit;

    const percentage = (data.used_today / data.daily_limit) * 100;
    progressEl.style.width = `${percentage}%`;

    const resetTime = new Date(data.reset_time);
    const now = new Date();
    const hoursUntilReset = Math.ceil((resetTime - now) / (1000 * 60 * 60));
    resetEl.textContent = `Resets in ${hoursUntilReset}h`;

    if (data.remaining_today <= 5) {
        progressEl.style.background = '#ff9800';
    }
    if (data.remaining_today === 0) {
        progressEl.style.background = '#f44336';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadUsageStats();
});
