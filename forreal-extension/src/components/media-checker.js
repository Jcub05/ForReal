// Media Checker Component - AI-generated image detection.
// The backend /api/check-media endpoint is disabled (always returns 503,
// see routers/media.py), so the button is hidden until that's live.
function createMediaCheckHTML(tweet, imageCount) {
    return '';
}

/**
 * Attach media check button handlers
 * @param {HTMLElement} overlay - Overlay element containing the buttons
 * @param {HTMLElement} tweet - Tweet element
 */
function attachMediaCheckHandlers(overlay, tweet) {
    const mediaCheckBtns = overlay.querySelectorAll('.forreal-media-check-btn');

    mediaCheckBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            stopEvent(e);

            const resultDiv = overlay.querySelector('.forreal-media-result');
            const imageCount = parseInt(e.target.getAttribute('data-image-count'));
            const imageIndex = e.target.getAttribute('data-image-index');

            // If this is the initial button and there are multiple images, show numbered buttons
            if (imageCount && imageCount > 1 && !imageIndex) {
                expandToImageSelection(e.target, imageCount, overlay, tweet);
                return;
            }

            // Otherwise proceed with the check
            const idx = parseInt(imageIndex || '0');
            await performMediaCheck(tweet, idx, resultDiv);
        });
    });
}

/**
 * Expand button to show numbered image selection
 * @param {HTMLElement} button - Button to replace
 * @param {number} imageCount - Number of images
 * @param {HTMLElement} overlay - Overlay element
 * @param {HTMLElement} tweet - Tweet element
 */
function expandToImageSelection(button, imageCount, overlay, tweet) {
    let numberedButtonsHTML = '<div class="forreal-media-check-container">';
    numberedButtonsHTML += '<div style="font-size: 13px; color: rgb(83, 100, 113); margin-bottom: 6px;">Select image to check:</div>';
    for (let i = 0; i < imageCount; i++) {
        numberedButtonsHTML += `<button class="forreal-media-check-btn forreal-media-check-btn-small" data-image-index="${i}">Image ${i + 1}</button> `;
    }
    numberedButtonsHTML += '</div>';

    button.outerHTML = numberedButtonsHTML;

    // Attach click handlers to new buttons
    const resultDiv = overlay.querySelector('.forreal-media-result');
    const newBtns = overlay.querySelectorAll('.forreal-media-check-btn');
    newBtns.forEach(newBtn => {
        newBtn.addEventListener('click', async (e2) => {
            stopEvent(e2);
            const idx = parseInt(e2.target.getAttribute('data-image-index'));
            await performMediaCheck(tweet, idx, resultDiv);
        });
    });
}

/**
 * Perform media check on a specific image
 * @param {HTMLElement} tweet - Tweet element
 * @param {number} selectedIndex - Index of image to check
 * @param {HTMLElement} resultDiv - Result display element
 */
async function performMediaCheck(tweet, selectedIndex, resultDiv) {
    resultDiv.innerHTML = '<div class="forreal-loading-small">Checking...</div>';

    try {
        const allImages = getTweetImages(tweet);

        if (allImages.length === 0) {
            console.error('ForReal: No images found in tweet');
            resultDiv.innerHTML = '<div class="forreal-error">Could not find images</div>';
            return;
        }

        const mediaElement = allImages[selectedIndex];
        if (!mediaElement) {
            console.error('ForReal: Invalid image index:', selectedIndex);
            resultDiv.innerHTML = '<div class="forreal-error">Image not found</div>';
            return;
        }

        const mediaUrl = mediaElement.src;
        if (!mediaUrl) {
            console.error('ForReal: Could not extract media URL from tweet');
            resultDiv.innerHTML = '<div class="forreal-error">Could not extract image URL</div>';
            return;
        }

        const data = await checkMedia(mediaUrl, 'image');

        const icon = data.ai_generated ? '🤖' : '👤';
        const verdict = data.ai_generated ? 'AI-generated' : 'Human-created';
        const confidencePercent = Math.round(data.confidence * 100);
        resultDiv.innerHTML = `<div class="forreal-media-result-text">${icon} ${verdict} (${confidencePercent}% confidence)</div>`;

    } catch (error) {
        console.error('ForReal: Media check error:', error);
        resultDiv.innerHTML = `<div class="forreal-error">Check failed: ${error.message}</div>`;
    }
}
