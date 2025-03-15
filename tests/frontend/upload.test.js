import '@testing-library/jest-dom';
import fs from 'fs';
import path from 'path';

// Mock the DOM elements
document.body.innerHTML = `
  <div class="upload-box" id="uploadBox"></div>
  <input type="file" id="fileInput" />
  <div class="time-input">
    <input type="number" id="minutes" min="0" value="0" />
    <input type="number" id="seconds" min="0" max="59" value="0" />
  </div>
`;

// Import the upload.js file
const uploadJs = fs.readFileSync(path.resolve(__dirname, '../../static/js/upload.js'), 'utf8');
eval(uploadJs);

describe('Upload Functionality', () => {
    beforeEach(() => {
        // Reset the DOM
        document.getElementById('uploadBox').innerHTML = '';
        document.getElementById('uploadBox').className = 'upload-box';
        document.getElementById('minutes').value = '0';
        document.getElementById('seconds').value = '0';
        
        // Reset fetch mock
        global.fetch.mockClear();
    });

    test('displayFileName updates upload box content', () => {
        const fileName = 'test.txt';
        displayFileName(fileName);
        
        const uploadBox = document.getElementById('uploadBox');
        expect(uploadBox).toHaveClass('selected');
        expect(uploadBox.innerHTML).toBe('<strong>test.txt</strong>');
    });

    test('validateFileType accepts valid file types', () => {
        const txtFile = { name: 'test.txt' };
        const pdfFile = { name: 'test.PDF' };
        
        expect(validateFileType(txtFile)).toBe(true);
        expect(validateFileType(pdfFile)).toBe(true);
    });

    test('validateFileType rejects invalid file types', () => {
        const docFile = { name: 'test.doc' };
        const exeFile = { name: 'test.exe' };
        
        expect(validateFileType(docFile)).toBe(false);
        expect(validateFileType(exeFile)).toBe(false);
    });

    test('processFile shows alert when no file selected', () => {
        global.alert = jest.fn();
        processFile();
        expect(global.alert).toHaveBeenCalledWith('No file selected. Please choose a file.');
    });

    describe('Time Limit Validation', () => {
        test('validates valid time input', async () => {
            const mockContent = 'Test content';
            global.fetch.mockImplementationOnce(() =>
                Promise.resolve({
                    text: () => Promise.resolve(mockContent)
                })
            );

            global.window = Object.create(window);
            Object.defineProperty(window, 'location', {
                value: { href: '' },
                writable: true
            });

            document.getElementById('minutes').value = '2';
            document.getElementById('seconds').value = '30';

            await loadFile('test.txt');
            expect(window.location.href).toContain('timeLimit=150');
        });

        test('rejects negative time input', async () => {
            global.alert = jest.fn();
            document.getElementById('minutes').value = '-1';
            document.getElementById('seconds').value = '0';

            await loadFile('test.txt');
            expect(global.alert).toHaveBeenCalledWith('Please enter a valid time limit');
        });

        test('handles invalid seconds input', async () => {
            global.alert = jest.fn();
            document.getElementById('minutes').value = '1';
            document.getElementById('seconds').value = '60';

            await loadFile('test.txt');
            expect(global.alert).toHaveBeenCalledWith('Please enter a valid time limit');
        });
    });

    describe('File Management', () => {
        test('deleteFile shows confirmation dialog', () => {
            global.confirm = jest.fn(() => false);
            deleteFile('test.txt');
            expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete "test.txt"?');
        });

        test('deleteFile sends DELETE request when confirmed', async () => {
            global.confirm = jest.fn(() => true);
            global.fetch.mockImplementationOnce(() =>
                Promise.resolve({
                    ok: true
                })
            );

            await deleteFile('test.txt');
            
            expect(global.fetch).toHaveBeenCalledWith('/files/test.txt', {
                method: 'DELETE'
            });
        });

        test('deleteFile handles errors', async () => {
            global.confirm = jest.fn(() => true);
            global.alert = jest.fn();
            global.fetch.mockImplementationOnce(() =>
                Promise.reject(new Error('Delete failed'))
            );

            await deleteFile('test.txt');
            
            expect(global.alert).toHaveBeenCalledWith('Error deleting file');
        });

        test('loadFile handles errors', async () => {
            global.alert = jest.fn();
            global.fetch.mockImplementationOnce(() =>
                Promise.reject(new Error('Load failed'))
            );

            await loadFile('test.txt');
            
            expect(global.alert).toHaveBeenCalledWith('Error loading file');
        });
    });
}); 