from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import numpy as np
import pickle
import database
import face_logic
import uuid

app = Flask(__name__, static_folder='../frontend', static_url_path='/')
CORS(app)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize DB
database.init_db()

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    from flask import send_from_directory
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"})

@app.route('/api/register', methods=['POST'])
def register():
    try:
        name = request.form['name']
        age = request.form.get('age', 0)
        bio = request.form.get('bio', '')
        file = request.files['image']

        filename = f"{uuid.uuid4()}_{file.filename}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        encoding = face_logic.load_and_encode(filepath)
        if encoding is None:
            os.remove(filepath)
            return jsonify({"error": "No face found in image"}), 400

        # Store encoding as bytes (pickle) to put in SQLite BLOB
        encoding_bytes = pickle.dumps(encoding)
        
        database.add_profile(name, age, bio, filepath, encoding_bytes)
        
        return jsonify({"message": "Profile registered successfully", "image_path": filepath})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/identify', methods=['POST'])
def identify():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image part"}), 400
            
        file = request.files['image']
        filename = f"temp_{uuid.uuid4()}_{file.filename}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        unknown_encoding = face_logic.load_and_encode(filepath)
        
        # Clean up temp file
        # os.remove(filepath) # Optional: keep for debug or delete

        if unknown_encoding is None:
            return jsonify({"error": "No face found in image"}), 400

        all_profiles = database.get_all_profiles()
        
        # Check against all profiles
        for profile in all_profiles:
            pid, name, age, bio, img_path, enc_bytes = profile
            known_encoding = pickle.loads(enc_bytes)
            
            # Compare
            is_match, score = face_logic.compare_faces(known_encoding, unknown_encoding)
            
            if is_match:
                # Construct accessible URL (assuming server is localhost:5000)
                # In production, use url_for or full domain
                image_filename = os.path.basename(img_path)
                image_url = f"http://127.0.0.1:5000/uploads/{image_filename}"
                
                return jsonify({
                    "match": True,
                    "score": float(score),
                    "profile": {
                        "name": name,
                        "age": age,
                        "bio": bio,
                        "image_path": image_url
                    }
                })

        return jsonify({"match": False, "message": "No match found"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
