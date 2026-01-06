let lastKnownTime = 0;

/**
 * Parses timestamp from URL parameters.
 * Supports standard integers and YT format (e.g., 1h2m3s).
 */
function parseTimeParam(t) {
    if (!t) return 0;
    if (!isNaN(t)) return parseInt(t, 10);

    let seconds = 0;
    const hours = t.match(/(\d+)h/);
    const minutes = t.match(/(\d+)m/);
    const secs = t.match(/(\d+)s/);

    if (hours) seconds += parseInt(hours[1], 10) * 3600;
    if (minutes) seconds += parseInt(minutes[1], 10) * 60;
    if (secs) seconds += parseInt(secs[1], 10);

    return seconds > 0 ? seconds : parseInt(t, 10) || 0;
}

// Sync state on load
const urlParams = new URLSearchParams(window.location.search);
const tParam = urlParams.get('t');
if (tParam) {
    lastKnownTime = parseTimeParam(tParam);
}

function checkForAds() {
    const player = document.getElementById('movie_player');
    const video = document.querySelector('video');

    if (!player || !video) return;

    // Detect ad elements
    const adShowing = player.classList.contains('ad-showing');
    const adOverlay = document.querySelector('.ytp-ad-player-overlay');
    const skipButton = document.querySelector('.ytp-ad-skip-button');
    const adPreview = document.querySelector('.ytp-ad-preview-container');

    // Strategy 1: Native Skip
    if (skipButton) {
        skipButton.click();
        return;
    }

    const isAd = adShowing || adOverlay || adPreview;

    if (isAd) {
        // Strategy 2: URL Timestamp Reload
        let skipTime = Math.floor(lastKnownTime);
        if (skipTime < 1) skipTime = 1;

        const currentUrl = new URL(window.location.href);
        const currentT = currentUrl.searchParams.get('t');

        // Loop protection: Advance time if stuck
        if (currentT) {
            const currentTVal = parseTimeParam(currentT);
            if (Math.abs(currentTVal - skipTime) < 1) {
                skipTime += 1;
            }
        }

        currentUrl.searchParams.set('t', skipTime);
        window.location.replace(currentUrl.toString());
    } else {
        // Update playback state
        if (!isNaN(video.currentTime)) {
            lastKnownTime = video.currentTime;
        }
    }
}

// Poll player state
setInterval(checkForAds, 500);
