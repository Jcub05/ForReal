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
    console.log('🔍 ForReal: Loading usage stats...');
    try {
        const userId = await getUserId();
        console.log('📝 ForReal: User ID:', userId);

        const url = `${API_BASE_URL}/api/usage`;
        console.log('🌐 ForReal: Fetching from:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-User-ID': userId
            }
        });

        console.log('📊 ForReal: Response status:', response.status);

        if (response.ok) {
            const data = await response.json();
            console.log('✅ ForReal: Usage data:', data);
            updateQuotaDisplay(data);
        } else {
            console.error('❌ ForReal: Failed to load usage stats:', response.status);
            const errorText = await response.text();
            console.error('❌ ForReal: Error details:', errorText);
        }
    } catch (error) {
        console.error('❌ ForReal: Error loading usage stats:', error);
        console.error('❌ ForReal: Error stack:', error.stack);
    }
}

// Update the quota display UI
function updateQuotaDisplay(data) {
    console.log('🎨 ForReal: Updating quota display with:', data);

    const usedEl = document.getElementById('quota-used');
    const limitEl = document.getElementById('quota-limit');
    const progressEl = document.getElementById('quota-progress');
    const resetEl = document.getElementById('quota-reset');

    if (!usedEl || !limitEl || !progressEl || !resetEl) {
        console.error('❌ ForReal: Missing DOM elements!', {
            usedEl, limitEl, progressEl, resetEl
        });
        return;
    }

    usedEl.textContent = data.used_today;
    limitEl.textContent = data.daily_limit;

    // Update progress bar
    const percentage = (data.used_today / data.daily_limit) * 100;
    progressEl.style.width = `${percentage}%`;
    console.log(`📊 ForReal: Progress bar set to ${percentage}%`);

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

    console.log('✅ ForReal: Quota display updated successfully');
}

// Load stats when popup opens
console.log('🚀 ForReal: Popup loaded, waiting for DOM...');
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ ForReal: DOM ready, loading usage stats...');
    loadUsageStats();
});
