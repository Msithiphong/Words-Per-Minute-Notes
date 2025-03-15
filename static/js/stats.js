// Get stats from URL parameters
function getStats() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        wpm: parseFloat(urlParams.get('wpm')) || 0,
        accuracy: parseFloat(urlParams.get('accuracy')) || 0,
        time: parseFloat(urlParams.get('time')) || 0,
        errors: parseInt(urlParams.get('errors')) || 0
    };
}

// Display stats with animation
function displayStats() {
    const stats = getStats();
    
    // Animate WPM
    animateValue('wpm', 0, Math.round(stats.wpm), 1500);
    
    // Animate Accuracy
    animateValue('accuracy', 0, Math.round(stats.accuracy), 1500, '%');
    
    // Animate Time
    animateValue('time', 0, Math.round(stats.time), 1500, 's');
    
    // Animate Errors
    animateValue('errors', 0, stats.errors, 1500);
}

// Animate value from start to end
function animateValue(id, start, end, duration, suffix = '') {
    const element = document.getElementById(id);
    const range = end - start;
    const startTime = performance.now();
    
    function updateValue(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.round(start + (range * easeOutQuart));
        
        element.textContent = current + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(updateValue);
        }
    }
    
    requestAnimationFrame(updateValue);
}

// Navigation functions
function retryTest() {
    const urlParams = new URLSearchParams(window.location.search);
    const content = urlParams.get('originalContent');
    if (content) {
        window.location.href = `/typing?content=${content}`;
    } else {
        window.location.href = '/typing';
    }
}

function goToHome() {
    window.location.href = '/';
}

// Start animations when page loads
document.addEventListener('DOMContentLoaded', displayStats); 