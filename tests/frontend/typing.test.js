import '@testing-library/jest-dom';
import fs from 'fs';
import path from 'path';

// Mock the DOM elements
document.body.innerHTML = `
    <div class="typing-container" id="textContainer"></div>
    <textarea class="input-area" id="typingInput"></textarea>
    <div class="wpm-display" id="wpmDisplay">WPM: 0</div>
    <div id="timer" class="timer">00:00</div>
`;

// Mock URL parameters
const mockUrlParams = new URLSearchParams();
mockUrlParams.set('content', 'test text');
mockUrlParams.set('timeLimit', '60'); // Add time limit parameter
global.URLSearchParams = jest.fn(() => mockUrlParams);

// Import the typing.js file
const typingJs = fs.readFileSync(path.resolve(__dirname, '../../static/js/typing.js'), 'utf8');
eval(typingJs);

describe('Typing Functionality', () => {
    beforeEach(() => {
        // Reset the DOM and timers
        document.getElementById('typingInput').value = '';
        document.getElementById('wpmDisplay').textContent = 'WPM: 0';
        document.getElementById('timer').textContent = '00:00';
        jest.useFakeTimers();
        startTime = null;
        timeLimit = null;
        if (timerInterval) clearInterval(timerInterval);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('text content is properly rendered', () => {
        const letters = document.querySelectorAll('.letter');
        const text = Array.from(letters).map(letter => letter.textContent).join('');
        expect(text).toBe('test text');
    });

    test('typing correct characters marks them as correct', () => {
        const input = document.getElementById('typingInput');
        input.value = 't';
        input.dispatchEvent(new Event('input'));

        const firstLetter = document.querySelector('.letter');
        expect(firstLetter).toHaveClass('correct');
    });

    test('typing incorrect characters marks them as incorrect', () => {
        const input = document.getElementById('typingInput');
        input.value = 'x';
        input.dispatchEvent(new Event('input'));

        const firstLetter = document.querySelector('.letter');
        expect(firstLetter).toHaveClass('incorrect');
    });

    test('calculateWPM returns correct value', () => {
        const input = document.getElementById('typingInput');
        input.value = 'test text';
        
        // Mock the timing
        jest.spyOn(Date, 'now').mockImplementation(() => 60000); // 1 minute
        startTime = 0;

        const wpm = calculateWPM();
        expect(wpm).toBe(2); // 2 words in 1 minute
    });

    test('calculateAccuracy returns correct percentage', () => {
        const input = 'test';
        const accuracy = calculateAccuracy(input);
        expect(accuracy).toBe(100);
    });

    test('restartPage clears input', () => {
        const input = document.getElementById('typingInput');
        input.value = 'test';
        
        global.location.reload = jest.fn();
        restartPage();
        
        expect(input.value).toBe('');
        expect(global.location.reload).toHaveBeenCalled();
    });

    describe('Timer Functionality', () => {
        test('timer initializes with correct time limit', () => {
            initializeTimer();
            expect(timeLimit).toBe(60);
            expect(timeRemaining).toBe(60);
            expect(document.getElementById('timer').textContent).toBe('01:00');
        });

        test('timer starts when typing begins', () => {
            initializeTimer();
            const input = document.getElementById('typingInput');
            
            input.value = 't';
            input.dispatchEvent(new Event('input'));
            
            expect(startTime).not.toBeNull();
            expect(timerInterval).not.toBeNull();
        });

        test('timer updates correctly', () => {
            initializeTimer();
            const input = document.getElementById('typingInput');
            
            // Start typing
            input.value = 't';
            input.dispatchEvent(new Event('input'));
            
            // Advance timer by 5 seconds
            jest.advanceTimersByTime(5000);
            
            expect(document.getElementById('timer').textContent).toBe('00:55');
        });

        test('timer turns red when time is running low', () => {
            mockUrlParams.set('timeLimit', '15');
            initializeTimer();
            const input = document.getElementById('typingInput');
            const timer = document.getElementById('timer');
            
            // Start typing
            input.value = 't';
            input.dispatchEvent(new Event('input'));
            
            // Advance to 6 seconds remaining
            jest.advanceTimersByTime(9000);
            
            expect(timer.style.color).toBe('var(--error-color)');
        });

        test('test finishes when time runs out', () => {
            mockUrlParams.set('timeLimit', '10');
            initializeTimer();
            const input = document.getElementById('typingInput');
            
            // Mock window.location
            const mockLocation = { href: '' };
            Object.defineProperty(window, 'location', {
                value: mockLocation,
                writable: true
            });
            
            // Start typing
            input.value = 't';
            input.dispatchEvent(new Event('input'));
            
            // Advance past time limit
            jest.advanceTimersByTime(11000);
            
            expect(timerInterval).toBeNull();
            expect(window.location.href).toContain('/stats');
        });
    });

    describe('Edge Cases', () => {
        test('handles backspace correctly', () => {
            const input = document.getElementById('typingInput');
            input.value = 'te';
            input.dispatchEvent(new Event('input'));
            
            // Simulate backspace
            input.value = 't';
            const backspaceEvent = new KeyboardEvent('keydown', { key: 'Backspace' });
            input.dispatchEvent(backspaceEvent);
            input.dispatchEvent(new Event('input'));
            
            const letters = document.querySelectorAll('.letter');
            expect(letters[1].classList.contains('correct')).toBe(false);
            expect(letters[1].classList.contains('incorrect')).toBe(false);
        });

        test('prevents typing beyond text length', () => {
            const input = document.getElementById('typingInput');
            input.value = 'test text extra';
            input.dispatchEvent(new Event('input'));
            
            expect(input.value).toBe('test text');
        });

        test('handles empty content gracefully', () => {
            mockUrlParams.set('content', '');
            // Re-render content
            document.getElementById('textContainer').innerHTML = '';
            fileContent.split('').forEach((char) => {
                const span = document.createElement('span');
                span.className = 'letter';
                span.textContent = char;
                textContainer.appendChild(span);
            });
            
            const letters = document.querySelectorAll('.letter');
            expect(letters.length).toBe(0);
        });
    });
}); 