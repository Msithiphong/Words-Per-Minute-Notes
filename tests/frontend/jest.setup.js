// Add custom jest matchers for DOM elements
import '@testing-library/jest-dom';

// Mock fetch API
global.fetch = jest.fn();

// Reset all mocks before each test
beforeEach(() => {
    jest.clearAllMocks();
}); 