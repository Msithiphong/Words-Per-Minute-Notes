# Testing Guide

This project includes both backend (Python) and frontend (JavaScript) tests.

## Backend Tests

The backend tests use Python's `unittest` framework to test the Flask application.

To run the backend tests:

```bash
python -m unittest tests/backend/test_app.py
```

## Frontend Tests

The frontend tests use Jest and Testing Library to test the JavaScript functionality.

First, install the dependencies:

```bash
npm install
```

Then run the tests:

```bash
npm test
```

## Test Structure

### Backend Tests (`tests/backend/`)
- `test_app.py`: Tests the Flask application routes and file handling

### Frontend Tests (`tests/frontend/`)
- `upload.test.js`: Tests the file upload functionality
- `typing.test.js`: Tests the typing test functionality
- `jest.setup.js`: Jest configuration and global test setup

## Test Coverage

The tests cover:

### Backend
- Route accessibility
- File upload handling
- File type validation
- File listing functionality

### Frontend
- File upload UI interactions
- Typing test mechanics
- WPM calculation
- Accuracy calculation
- Navigation between pages

## Adding New Tests

### Backend
1. Add new test methods to `test_app.py`
2. Follow the unittest convention of prefixing test methods with `test_`
3. Use `self.client` to make requests to the application

### Frontend
1. Create new test files in `tests/frontend/`
2. Use Jest's `describe` and `test` functions
3. Mock DOM elements and browser APIs as needed
4. Use Testing Library utilities for DOM interactions 