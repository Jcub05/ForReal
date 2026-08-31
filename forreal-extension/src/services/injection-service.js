// Injection Service - Handles icon injection and DOM observation

/**
 * Initialize the ForReal extension
 */
function init() {
    if (!isTwitter()) {
        return;
    }

    // X is a SPA, so watch for new tweets being loaded in
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(() => {
            injectFactCheckIcons();
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    injectFactCheckIcons();
    setupNavigationObserver();

    window.addEventListener('popstate', () => {
        setTimeout(() => injectFactCheckIcons(), CONFIG.NAVIGATION_DELAY);
        setTimeout(() => injectFactCheckIcons(), CONFIG.NAVIGATION_DELAY * 2);
    });

    // Fallback safety net in case icons get wiped by a Twitter re-render
    setInterval(() => {
        injectFactCheckIcons();
    }, CONFIG.OBSERVER_CHECK_INTERVAL);

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "verify_selection") {
            handleSelectionVerification(request.text);
        }
    });

    document.addEventListener('mouseup', handleTextSelection);
    document.addEventListener('keyup', handleTextSelection);

    document.addEventListener('mousedown', (e) => {
        if (!e.target.classList.contains('forreal-fab') && !e.target.closest('.forreal-fab')) {
            removeFloatingButton();
        }
    });
}

/**
 * Setup navigation observer for SPA routing
 */
function setupNavigationObserver() {
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            // Delay to allow Twitter to render new content
            setTimeout(() => injectFactCheckIcons(), CONFIG.NAVIGATION_DELAY);
            setTimeout(() => injectFactCheckIcons(), CONFIG.NAVIGATION_DELAY * 2);
        }
    }).observe(document, { subtree: true, childList: true });
}

/**
 * Find all tweets and inject the magnifying glass icon
 */
function injectFactCheckIcons() {
    const tweets = findAllTweets();

    tweets.forEach((tweet) => {
        const actionBar = tweet.querySelector(SELECTORS.ACTION_BAR);
        if (!actionBar) {
            return;
        }

        const existingButton = actionBar.querySelector('.forreal-button');

        // Twitter's SPA re-renders can drop our button from the DOM while
        // leaving the processed marker on the tweet - detect and reset that case.
        if (existingButton && existingButton.isConnected) {
            return;
        }
        if (tweet.hasAttribute('data-forreal-processed') && !existingButton) {
            tweet.removeAttribute('data-forreal-processed');
        }
        if (tweet.hasAttribute('data-forreal-processed') && existingButton) {
            return;
        }

        const tweetId = getTweetId(tweet);
        const factCheckButton = createFactCheckButton(tweet, tweetId);
        tweet.setAttribute('data-forreal-processed', 'true');
        actionBar.appendChild(factCheckButton);
    });
}
