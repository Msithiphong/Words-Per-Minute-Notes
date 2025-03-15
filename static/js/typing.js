// Retrieve file content from URL query parameters
const urlParams = new URLSearchParams(window.location.search);
const fileContent = decodeURIComponent(urlParams.get('content') || '');

const textContainer = document.getElementById('textContainer');
const typingInput = document.getElementById('typingInput');

// Render the file content into the text container
fileContent.split('').forEach((char) => {
    const span = document.createElement('span');
    span.className = 'letter';
    span.textContent = char; // Add the character
    textContainer.appendChild(span);
});

const letters = document.querySelectorAll('.letter');
let currentIndex = 0; // Tracks user position in the text
let startTime = null; // Track when typing starts
let totalErrors = 0; // Track total errors made during the test
let currentErrors = new Set(); // Track current errors to avoid double counting
let timeLimit = null;
let timerInterval = null;
let timeRemaining = 0;
let timerDisplay = document.getElementById('timer');

typingInput.addEventListener('input', () => {
    if (!startTime) startTime = Date.now(); // Start the timer when typing begins

    const input = typingInput.value;

    // Reset all letters to default if input is shorter
    for (let i = input.length; i < letters.length; i++) {
        letters[i].classList.remove('correct', 'incorrect');
        currentErrors.delete(i);
    }

    // Process each character in the input
    for (let i = 0; i < input.length; i++) {
        const currentChar = input[i];
        const letterElement = letters[i];

        if (currentChar === letterElement.textContent) {
            letterElement.classList.add('correct');
            letterElement.classList.remove('incorrect');
            currentErrors.delete(i);
        } else {
            letterElement.classList.add('incorrect');
            letterElement.classList.remove('correct');
            if (!currentErrors.has(i)) {
                totalErrors++;
                currentErrors.add(i);
            }
        }
    }

    // Prevent typing beyond the text
    currentIndex = input.length;
    if (input.length > letters.length) {
        typingInput.value = input.slice(0, letters.length);
    }

    if (input.length === letters.length) {
        finishTest();
    }
});

typingInput.addEventListener('keydown', (event) => {
    // Handle backspace key
    if (event.key === 'Backspace' && currentIndex > 0) {
        currentIndex--; // Move back one character
        letters[currentIndex].classList.remove('correct', 'incorrect'); // Reset the letter style
    }
});

// Calculate accuracy
function calculateAccuracy() {
    const totalCharacters = typingInput.value.length;
    return totalCharacters > 0 ? ((totalCharacters - currentErrors.size) / totalCharacters) * 100 : 100;
}

// Calculate WPM
function calculateWPM() {
    const elapsedTime = (Date.now() - startTime) / 1000 / 60; // Convert to minutes
    const wordsTyped = typingInput.value.trim().split(/\s+/).filter(word => word).length;
    return Math.round(wordsTyped / elapsedTime); // WPM formula
}

function restartPage() {
    typingInput.value = ""; // Clear the typing input box
    currentIndex = 0; // Reset typing index
    location.reload(); // Reload the page
}

function goToUploadPage() {
    window.location.href = "/"; // Redirects to the upload page
}

function initializeTimer() {
    const timeLimitParam = parseInt(urlParams.get('timeLimit'));
    
    if (timeLimitParam && timeLimitParam > 0) {
        timeLimit = timeLimitParam;
        timeRemaining = timeLimit;
        updateTimerDisplay(timeRemaining);
        
        // Start the timer immediately
        startTime = Date.now();
        timerInterval = setInterval(() => {
            timeRemaining--;
            updateTimerDisplay(timeRemaining);
            
            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                finishTest();
            }
        }, 1000);
    }
}

function updateTimerDisplay(seconds) {
    if (seconds < 0) seconds = 0;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    
    // Add warning color when time is running low (less than 10 seconds)
    if (seconds <= 10) {
        timerDisplay.style.color = 'var(--error-color)';
    }
}

function finishTest() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    const endTime = Date.now();
    const timeElapsed = Math.min((endTime - startTime) / 1000, timeLimit || Infinity);
    const wordsTyped = typingInput.value.trim().split(/\s+/).filter(word => word).length;
    const wpm = calculateWPM(wordsTyped, timeElapsed);
    const accuracy = calculateAccuracy();

    // Get the original content and encode it properly
    const originalContent = encodeURIComponent(fileContent);

    // Redirect to stats page with results
    const params = new URLSearchParams({
        wpm: wpm.toFixed(2),
        accuracy: accuracy.toFixed(2),
        time: timeElapsed.toFixed(1),
        errors: totalErrors,
        originalContent: originalContent
    });
    
    window.location.href = `/stats?${params.toString()}`;
}

function calculateWPM(words, time) {
    // Standard WPM calculation (words / minutes)
    return (words / (time / 60));
}

// Call initializeTimer when the page loads
document.addEventListener('DOMContentLoaded', initializeTimer); 