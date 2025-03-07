from flask import Flask, render_template, request, jsonify
import os

app = Flask(__name__)

UPLOAD_FOLDER = './uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/')

def home():
    return app.send_static_file('upload.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file:
        # Read the file content
        content = file.read().decode('utf-8')  # Decode for .txt files
        return jsonify({"content": content}), 200
    return jsonify({'error': 'File upload failed'}), 500

@app.route('/typing')
def typing_page():
    return app.send_static_file('typing.html')  # Serve the typing page

if __name__ == '__main__':
    app.run(debug=True) 