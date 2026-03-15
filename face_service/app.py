from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import numpy as np
import pickle
import database
import face_logic
import uuid

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize DB
database.init_db()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "service": "face-detection"})

@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/api/register', methods=['POST'])
def register():
    """Register a known face profile (used by police to build the database)."""
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

        encoding_bytes = pickle.dumps(encoding)
        database.add_profile(name, age, bio, filepath, encoding_bytes)

        return jsonify({"message": "Profile registered successfully", "image_path": filepath})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/identify', methods=['POST'])
def identify():
    """Identify a suspect by matching against all registered profiles."""
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image part"}), 400

        file = request.files['image']
        filename = f"temp_{uuid.uuid4()}_{file.filename}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        unknown_encoding = face_logic.load_and_encode(filepath)

        if unknown_encoding is None:
            # Clean up
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({"error": "No face found in image"}), 400

        all_profiles = database.get_all_profiles()

        best_match = None
        best_score = 0

        for profile in all_profiles:
            pid, name, age, bio, img_path, enc_bytes = profile
            known_encoding = pickle.loads(enc_bytes)

            is_match, score = face_logic.compare_faces(known_encoding, unknown_encoding)

            if is_match and score > best_score:
                best_score = score
                image_filename = os.path.basename(img_path)
                best_match = {
                    "name": name,
                    "age": age,
                    "bio": bio,
                    "image_path": f"/uploads/{image_filename}"
                }

        # Clean up temp file
        if os.path.exists(filepath):
            os.remove(filepath)

        if best_match:
            return jsonify({
                "match": True,
                "score": float(best_score),
                "profile": best_match
            })

        return jsonify({"match": False, "message": "No match found"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/profiles', methods=['GET'])
def list_profiles():
    """List all registered face profiles (for police dashboard)."""
    try:
        profiles = database.get_all_profiles()
        result = []
        for p in profiles:
            pid, name, age, bio, img_path, enc_bytes = p
            image_filename = os.path.basename(img_path) if img_path else None
            result.append({
                "id": pid,
                "name": name,
                "age": age,
                "bio": bio,
                "image_url": f"/uploads/{image_filename}" if image_filename else None
            })
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("=" * 50)
    print("VISHWAS Face Detection Service")
    print("Running on port 5002")
    print("=" * 50)
    app.run(debug=True, port=5002, host='0.0.0.0')
