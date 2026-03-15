import os
import sqlite3
import pickle
import numpy as np
import datetime
import shutil
import uuid
import random
from pymongo import MongoClient

# Import face logic for real embeddings
import face_logic

# Configuration
MONGO_URI = 'mongodb://localhost:27017/vishwas'
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FACE_DB_PATH = os.path.join(BASE_DIR, 'faces.db')
SOURCE_IMAGES_DIR = os.path.join(BASE_DIR, '..', 'img_align_celeba') # Updated to use CelebA
UPLOADS_DIR = os.path.join(BASE_DIR, 'uploads')

def get_mongo_users():
    """Fetch all users from MongoDB."""
    try:
        client = MongoClient(MONGO_URI)
        db = client['vishwas']
        users_collection = db['users']
        users = list(users_collection.find({}, {'name': 1, 'role': 1, 'email': 1, 'dateOfBirth': 1, 'gender': 1}))
        client.close()
        print(f"✅ Fetched {len(users)} users from MongoDB.")
        return users
    except Exception as e:
        print(f"❌ Error connecting to MongoDB: {e}")
        return []

def init_face_db():
    """Initialize SQLite database, clearing old data."""
    # Ensure uploads dir exists
    if not os.path.exists(UPLOADS_DIR):
        os.makedirs(UPLOADS_DIR)
    
    # Connect and clear table
    conn = sqlite3.connect(FACE_DB_PATH)
    cursor = conn.cursor()
    
    # Create table if not exists
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            age INTEGER,
            bio TEXT,
            image_path TEXT,
            encoding BLOB
        )
    ''')
    
    # Clear existing data
    cursor.execute('DELETE FROM profiles')
    conn.commit()
    conn.close()
    print("🧹 Cleared existing Face DB records.")

    # Clear uploads directory (optional, but good for cleanup)
    for filename in os.listdir(UPLOADS_DIR):
        file_path = os.path.join(UPLOADS_DIR, filename)
        try:
            if os.path.isfile(file_path):
                os.unlink(file_path)
        except Exception as e:
            print(f"Error deleting {file_path}: {e}")
    print("🧹 Cleared uploads directory.")

def get_source_images(limit=100):
    """Get list of available source images, shuffled and limited."""
    if not os.path.exists(SOURCE_IMAGES_DIR):
        print(f"❌ Source images directory not found: {SOURCE_IMAGES_DIR}")
        return []
    
    # List all files (might be large, but acceptable for ~200k)
    try:
        all_files = os.listdir(SOURCE_IMAGES_DIR)
    except OSError as e:
        print(f"❌ Error reading source directory: {e}")
        return []

    images = [f for f in all_files if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    
    if not images:
        print("❌ No source images found!")
        return []
    
    print(f"🖼️  Found {len(images)} total source images in CelebA.")
    
    # Shuffle and limit
    random.shuffle(images)
    selected_images = images[:limit]
    
    print(f"🎯 Selected {len(selected_images)} images for processing.")
    
    return [os.path.join(SOURCE_IMAGES_DIR, img) for img in selected_images]

def calculate_age(dob):
    """Calculate age from Date of Birth."""
    if not dob:
        return 30
    today = datetime.date.today()
    try:
        if isinstance(dob, datetime.datetime):
            dob = dob.date()
        if hasattr(dob, 'year'):
            return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    except:
        pass
    return 30

def main():
    print("🚀 Starting REAL face population script (CelebA Edition)...")
    
    # 1. Initialize DB (Clear old data)
    init_face_db()
    
    # 2. Get Users
    users = get_mongo_users()
    if not users:
        print("❌ No users found to process.")
        return

    # 3. Load source images (Limit to number of users + buffer)
    # We need a buffer because some images might not have detectable faces
    buffer_size = 50 
    target_count = len(users) + buffer_size
    source_images = get_source_images(limit=target_count)

    if not source_images:
        return

    # 4. Pre-compute embeddings for source images
    print("🧠 Pre-computing embeddings for source images...")
    source_embeddings = {}
    for img_path in source_images:
        # print(f"   Processing {os.path.basename(img_path)}...") # Too verbose for many images
        encoding = face_logic.load_and_encode(img_path)
        if encoding is not None:
             source_embeddings[img_path] = encoding
        # else:
            #  print(f"   ⚠️ Could not detect face in {img_path}") # Optional to reduce noise

    valid_sources = list(source_embeddings.keys())
    print(f"✅ Successfully encoded {len(valid_sources)} source images.")

    if not valid_sources:
        print("❌ No valid source images with detectable faces!")
        return

    count_added = 0
    conn = sqlite3.connect(FACE_DB_PATH)
    cursor = conn.cursor()

    print(f"⚙️  Assigning faces to {len(users)} users...")

    used_sources = set()

    for i, user in enumerate(users):
        name = user.get('name', 'Unknown')
        
        # Pick random distinct source
        available_sources = [s for s in valid_sources if s not in used_sources]
        
        if not available_sources:
             print("⚠️ Ran out of unique source images! Reusing...")
             available_sources = valid_sources # Fallback to reuse if we run out
        
        source_img_path = random.choice(available_sources)
        used_sources.add(source_img_path)
        
        encoding = source_embeddings[source_img_path]
        
        # Create unique file for this user
        ext = os.path.splitext(source_img_path)[1]
        new_filename = f"{uuid.uuid4()}{ext}"
        new_filepath = os.path.join(UPLOADS_DIR, new_filename)
        
        # Copy file
        shutil.copy2(source_img_path, new_filepath)
        
        # Metadata
        age = calculate_age(user.get('dateOfBirth'))
        role = user.get('role', 'Citizen')
        email = user.get('email', 'N/A')
        bio = f"{role} | Email: {email}"
        
        # Serialize encoding
        encoding_bytes = pickle.dumps(encoding)

        # Insert into SQLite
        cursor.execute(
            'INSERT INTO profiles (name, age, bio, image_path, encoding) VALUES (?, ?, ?, ?, ?)',
            (name, age, bio, new_filepath, encoding_bytes)
        )
        
        # Update MongoDB User
        try:
             # Convert numpy array to list for MongoDB
             encoding_list = encoding.flatten().tolist()
             
             # The new path for the frontend to access
             # relative path from "public" or similar?
             # For now, let's store the absolute path or a relative path from the server root
             # Ideally: /uploads/filename
             web_path = f"/uploads/{new_filename}"

             db = MongoClient(MONGO_URI)['vishwas']
             db['users'].update_one(
                 {'_id': user['_id']},
                 {'$set': {
                     'faceEncoding': encoding_list,
                     'profileImage': web_path
                 }}
             )
        except Exception as e:
             print(f"❌ Error updating MongoDB for {name}: {e}")

        count_added += 1
        
        if count_added % 50 == 0:
             print(f"✅ Processed {count_added} users...")
             conn.commit()

    conn.commit()
    conn.close()

    print("-" * 40)
    print(f"🎉 Process Complete!")
    print(f"✅ Total Profiles: {count_added}")
    print(f"📂 Images Saved in: {UPLOADS_DIR}")
    print("-" * 40)

if __name__ == '__main__':
    main()
