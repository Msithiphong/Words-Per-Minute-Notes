from flask import Flask, render_template, request, jsonify, send_from_directory
import os

app = Flask(__name__)

UPLOAD_FOLDER = './uploads'
ALLOWED_EXTENSIONS = {'txt', 'pdf'}  # Add allowed file extensions

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_saved_files():
    files = []
    for filename in os.listdir(UPLOAD_FOLDER):
        if filename.endswith(('.txt', '.pdf')):
            files.append({
                'name': filename,
                'path': os.path.join(UPLOAD_FOLDER, filename)
            })
    return files

@app.route('/')
def home():
    files = get_saved_files()
    return render_template('upload.html', files=files)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file and file.filename:
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type'}), 400
            
        filename = file.filename
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        content = ''
        if filename.endswith('.txt'):
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
        return jsonify({"content": content, "filename": filename}), 200
    return jsonify({'error': 'File upload failed'}), 500

@app.route('/files/<path:filename>', methods=['GET', 'DELETE'])
def handle_file(filename):
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    
    if request.method == 'DELETE':
        try:
            os.remove(filepath)
            return '', 204  # No content, successful deletion
        except FileNotFoundError:
            return jsonify({'error': 'File not found'}), 404
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    # GET method - serve the file
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/typing')
def typing_page():
    return render_template('typing.html')

@app.route('/stats')
def stats_page():
    return render_template('stats.html')

if __name__ == '__main__':
    app.run(debug=True) 