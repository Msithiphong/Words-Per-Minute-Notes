import '@testing-library/jest-dom';
import fs from 'fs';
import path from 'path';

// Mock the DOM elements
document.body.innerHTML = `
    <div class="stats-wrapper">
        <div class="stats-container">
            <div class="stats-grid">
                <div class="stat-box">
                    <div class="stat-value" id="wpm">0</div>
                    <div class="stat-label">WPM</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value" id="accuracy">0%</div>
                    <div class="stat-label">Accuracy</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value" id="time">0s</div>
                    <div class="stat-label">Time</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value" id="errors">0</div>
                    <div class="stat-label">Errors</div>
                </div>
            </div>
        </div>
    </div>
`;

// Mock URL parameters
const mockUrlParams = new URLSearchParams();
mockUrlParams.set('wpm', '50.5');
mockUrlParams.set('accuracy', '95.5');
mockUrlParams.set('time', '30.0');
mockUrlParams.set('errors', '2');
mockUrlParams.set('originalContent', 'test%20text');
global.URLSearchParams = jest.fn(() => mockUrlParams);
global.window = Object.create(window);
Object.defineProperty(window, 'location', {
    value: { href: '' },
    writable: true
});

// Import the stats.js file
const statsJs = fs.readFileSync(path.resolve(__dirname, '../../static/js/stats.js'), 'utf8');
eval(statsJs);

describe('Stats Page Functionality', () => {
    beforeEach(() => {
        // Reset stats display
        document.getElementById('wpm').textContent = '0';
        document.getElementById('accuracy').textContent = '0%';
        document.getElementById('time').textContent = '0s';
        document.getElementById('errors').textContent = '0';
    });

    test('displays stats correctly from URL parameters', () => {
        displayStats();
        
        // Wait for animations to complete
        jest.advanceTimersByTime(2000);
        
        expect(document.getElementById('wpm').textContent).toBe('51');
        expect(document.getElementById('accuracy').textContent).toBe('96%');
        expect(document.getElementById('time').textContent).toBe('30s');
        expect(document.getElementById('errors').textContent).toBe('2');
    });

    test('retryTest redirects to typing page with original content', () => {
        retryTest();
        expect(window.location.href).toBe('/typing?content=test%20text');
    });

    test('retryTest handles missing original content', () => {
        mockUrlParams.delete('originalContent');
        retryTest();
        expect(window.location.href).toBe('/typing');
    });

    test('goToHome redirects to home page', () => {
        goToHome();
        expect(window.location.href).toBe('/');
    });

    describe('Stats Animation', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        test('animates value from start to end', () => {
            const element = document.getElementById('wpm');
            animateValue('wpm', 0, 50, 1000);
            
            // Check value at different points during animation
            jest.advanceTimersByTime(500);
            const midValue = parseInt(element.textContent);
            expect(midValue).toBeGreaterThan(0);
            expect(midValue).toBeLessThan(50);
            
            jest.advanceTimersByTime(500);
            expect(element.textContent).toBe('50');
        });

        test('handles suffix correctly', () => {
            animateValue('accuracy', 0, 95, 1000, '%');
            jest.advanceTimersByTime(1000);
            expect(document.getElementById('accuracy').textContent).toBe('95%');
        });
    });
}); 