import sqlite3
import os

DB_NAME = "faces.db"

def init_db():
    if not os.path.exists(DB_NAME):
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
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
        conn.commit()
        conn.close()
        print("Database initialized.")

def add_profile(name, age, bio, image_path, encoding):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    # encoding is a numpy array, we need to convert it to bytes to store in BLOB
    cursor.execute('INSERT INTO profiles (name, age, bio, image_path, encoding) VALUES (?, ?, ?, ?, ?)',
                   (name, age, bio, image_path, encoding))
    conn.commit()
    conn.close()

def get_all_profiles():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('SELECT id, name, age, bio, image_path, encoding FROM profiles')
    rows = cursor.fetchall()
    conn.close()
    return rows
