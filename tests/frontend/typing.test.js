import '@testing-library/jest-dom';
import fs from 'fs';
import path from 'path';

// Mock the DOM elements
document.body.innerHTML = `
    <div class="typing-container" id="textContainer"></div>
    <textarea class="input-area" id="typingInput"></textarea>
    <div class="wpm-display" id="wpmDisplay">WPM: 0</div>
`;

// Mock URL parameters
const mockUrlParams = new URLSearchParams();
mockUrlParams.set('content', 'test text');
global.URLSearchParams = jest.fn(() => mockUrlParams);

// Import the typing.js file
const typingJs = fs.readFileSync(path.resolve(__dirname, '../../static/js/typing.js'), 'utf8');
eval(typingJs);

describe('Typing Functionality', () => {
    beforeEach(() => {
        // Reset the DOM
        document.getElementById('typingInput').value = '';
        document.getElementById('wpmDisplay').textContent = 'WPM: 0';
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
}); 