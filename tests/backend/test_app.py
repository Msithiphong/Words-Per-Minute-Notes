import unittest
import os
import sys
import tempfile
from pathlib import Path

# Add the parent directory to Python path to import the Flask app
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from app import app

class TestApp(unittest.TestCase):
    def setUp(self):
        # Create a temporary directory for test uploads
        self.test_uploads_dir = tempfile.mkdtemp()
        app.config['UPLOAD_FOLDER'] = self.test_uploads_dir
        app.config['TESTING'] = True
        self.client = app.test_client()

    def tearDown(self):
        # Clean up the temporary directory
        for file in Path(self.test_uploads_dir).glob('*'):
            file.unlink()
        os.rmdir(self.test_uploads_dir)

    def test_home_page(self):
        """Test that the home page loads correctly"""
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Upload a text or PDF file', response.data)

    def test_typing_page(self):
        """Test that the typing page loads correctly"""
        response = self.client.get('/typing')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Start typing here', response.data)

    def test_file_upload_txt(self):
        """Test uploading a text file"""
        data = {
            'file': (tempfile.SpooledTemporaryFile(), 'test.txt')
        }
        response = self.client.post('/upload', data=data)
        self.assertEqual(response.status_code, 200)

    def test_file_upload_pdf(self):
        """Test uploading a PDF file"""
        data = {
            'file': (tempfile.SpooledTemporaryFile(), 'test.pdf')
        }
        response = self.client.post('/upload', data=data)
        self.assertEqual(response.status_code, 200)

    def test_file_upload_invalid(self):
        """Test uploading an invalid file type"""
        data = {
            'file': (tempfile.SpooledTemporaryFile(), 'test.exe')
        }
        response = self.client.post('/upload', data=data)
        self.assertEqual(response.status_code, 400)

    def test_file_list(self):
        """Test that uploaded files appear in the file list"""
        # Create a test file
        test_file = Path(self.test_uploads_dir) / 'test file.txt'
        test_file.write_text('Test content')

        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'test file.txt', response.data)

if __name__ == '__main__':
    unittest.main() 