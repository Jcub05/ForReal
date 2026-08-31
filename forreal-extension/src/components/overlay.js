// Overlay Component - Result display for fact-checks

/**
 * Show the fact-check result overlay on a tweet
 * @param {HTMLElement} tweet - Tweet element
 * @param {Object} result - Fact-check result
 */
function showFactCheckResult(tweet, result) {
    const existingOverlay = document.querySelector('.forreal-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }

    const overlay = createElement('div', 'forreal-overlay');
    const labelClass = result.label.toLowerCase().replace(/\s+/g, '-');
    const sourcesHTML = buildSourcesHTML(result.sources);
    const biasHTML = buildBiasHTML(result);

    const images = getTweetImages(tweet);
    const hasVideoElement = hasVideo(tweet);
    let mediaCheckHTML = '';

    if (images.length > 0 && !hasVideoElement) {
        mediaCheckHTML = createMediaCheckHTML(tweet, images.length);
    }

    const tweetText = extractTweetText(tweet);

    overlay.innerHTML = `
    <div class="forreal-header">
      <span class="forreal-label forreal-label-${labelClass}">${result.label}</span>
      <div class="forreal-header-buttons">
        <span id="forreal-speaker-container"></span>
        <button class="forreal-close">×</button>
      </div>
    </div>
    <div class="forreal-body">
      ${biasHTML}
      <p class="forreal-explanation">${result.explanation}</p>
      ${sourcesHTML}
      ${mediaCheckHTML}
    </div>
  `;

    setupOverlayEventHandlers(overlay);

    const closeButton = overlay.querySelector('.forreal-close');
    closeButton.addEventListener('click', (e) => {
        stopEvent(e);
        overlay.remove();
    });

    if (tweetText) {
        const speakerContainer = overlay.querySelector('#forreal-speaker-container');
        const speakerButton = createTTSButton(tweetText, result);
        speakerContainer.appendChild(speakerButton);
    }

    if (mediaCheckHTML) {
        attachMediaCheckHandlers(overlay, tweet);
    }

    const tweetTextContainer = tweet.querySelector(SELECTORS.TWEET_TEXT);
    if (tweetTextContainer && tweetTextContainer.parentElement) {
        tweetTextContainer.parentElement.appendChild(overlay);
    } else {
        tweet.appendChild(overlay);
    }
}

/**
 * Show validation result for generic text selection (Fixed Bottom-Right)
 * @param {Object} result - Fact-check result
 * @param {string} claimText - The claim text (optional)
 */
function showGenericOverlay(result, claimText = null) {
    removeElementById('forreal-generic-overlay');

    const overlay = createElement('div', 'forreal-overlay forreal-fixed-overlay');
    overlay.id = 'forreal-generic-overlay';

    let labelClass = 'neutral';
    let labelText = result.label || '...';

    if (result.isLoading) {
        labelClass = 'loading';
    } else if (result.error) {
        labelClass = 'error';
    } else if (result.label) {
        labelClass = result.label.toLowerCase().replace(/\s+/g, '-');
    }

    const sourcesHTML = buildSourcesHTML(result.sources);
    const biasHTML = result.isLoading ? '' : buildBiasHTML(result);

    overlay.innerHTML = `
    <div class="forreal-header">
      <span class="forreal-label forreal-label-${labelClass}">
        ${result.isLoading ? '<span class="forreal-spinner"></span> Analyzing' : labelText}
      </span>
      <div class="forreal-header-buttons">
        ${claimText && !result.isLoading && !result.error ? '<span id="forreal-speaker-container"></span>' : ''}
        <button class="forreal-close">×</button>
      </div>
    </div>
    <div class="forreal-body">
      ${biasHTML}
      <p class="forreal-explanation">${result.explanation}</p>
      ${sourcesHTML}
    </div>
  `;

    overlay.querySelector('.forreal-close').addEventListener('click', () => {
        overlay.remove();
    });

    if (claimText && !result.isLoading && !result.error) {
        const speakerContainer = overlay.querySelector('#forreal-speaker-container');
        if (speakerContainer) {
            const speakerButton = createTTSButton(claimText, result);
            speakerContainer.appendChild(speakerButton);
        }
    }

    document.body.appendChild(overlay);
}

/**
 * Build sources HTML
 * @param {Array} sources - Array of source objects
 * @returns {string} - HTML string
 */
function buildSourcesHTML(sources) {
    if (!sources || sources.length === 0) return '';

    let html = '<div class="forreal-sources">';
    sources.forEach(source => {
        const dateStr = source.published_date ? `<span class="forreal-date">${source.published_date}</span> ` : '';
        html += `<div class="forreal-source-item">${dateStr}<a href="${source.url}" target="_blank" rel="noopener noreferrer" class="forreal-source-link">${source.title || source.url}</a></div>`;
    });
    html += '</div>';
    return html;
}

/**
 * Build bias warning HTML
 * @param {Object} result - Fact-check result
 * @returns {string} - HTML string
 */
function buildBiasHTML(result) {
    if (!result.bias || result.bias.toLowerCase() === 'none') return '';
    if (result.label && result.label.toLowerCase() !== 'misleading') return '';

    const biasLevel = result.bias.toLowerCase() === 'likely' ? 'Likely bias' : 'Potential bias';
    return `<div class="forreal-bias">⚠️ ${biasLevel} detected in this post</div>`;
}

/**
 * Setup event handlers for overlay to prevent propagation
 * @param {HTMLElement} overlay - Overlay element
 */
function setupOverlayEventHandlers(overlay) {
    overlay.addEventListener('click', (e) => {
        // Let source links navigate instead of being swallowed by the overlay
        if (e.target.classList.contains('forreal-source-link') || e.target.tagName === 'A') {
            return;
        }
        stopEvent(e);
    });

    overlay.addEventListener('mousedown', (e) => e.stopPropagation());
    overlay.addEventListener('mouseup', (e) => e.stopPropagation());
}
