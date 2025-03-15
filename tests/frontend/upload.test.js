import '@testing-library/jest-dom';
import fs from 'fs';
import path from 'path';

// Mock the DOM elements
document.body.innerHTML = `
  <div class="upload-box" id="uploadBox"></div>
  <input type="file" id="fileInput" />
`;

// Import the upload.js file
const uploadJs = fs.readFileSync(path.resolve(__dirname, '../../static/js/upload.js'), 'utf8');
eval(uploadJs);

describe('Upload Functionality', () => {
    beforeEach(() => {
        // Reset the DOM
        document.getElementById('uploadBox').innerHTML = '';
        document.getElementById('uploadBox').className = 'upload-box';
    });

    test('displayFileName updates upload box content', () => {
        const fileName = 'test.txt';
        displayFileName(fileName);
        
        const uploadBox = document.getElementById('uploadBox');
        expect(uploadBox).toHaveClass('selected');
        expect(uploadBox.innerHTML).toBe('<strong>test.txt</strong>');
    });

    test('processFile shows alert when no file selected', () => {
        global.alert = jest.fn();
        processFile();
        expect(global.alert).toHaveBeenCalledWith('No file selected. Please choose a file.');
    });

    test('loadFile handles txt files correctly', async () => {
        const mockContent = 'Test content';
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                text: () => Promise.resolve(mockContent)
            })
        );

        global.window = Object.create(window);
        Object.defineProperty(window, 'location', {
            value: {
                href: ''
            },
            writable: true
        });

        await loadFile('test.txt');
        expect(window.location.href).toContain('/typing?content=');
    });

    test('loadFile handles PDF files correctly', async () => {
        const mockWindow = { open: jest.fn() };
        global.window = mockWindow;

        await loadFile('test.pdf');
        expect(mockWindow.open).toHaveBeenCalledWith('/files/test.pdf', '_blank');
    });
}); 