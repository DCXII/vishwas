import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'faces.db')

def init_db():
    conn = sqlite3.connect(DB_PATH)
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
    print(f"Face database initialized at {DB_PATH}")

def add_profile(name, age, bio, image_path, encoding):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO profiles (name, age, bio, image_path, encoding) VALUES (?, ?, ?, ?, ?)',
        (name, age, bio, image_path, encoding)
    )
    conn.commit()
    conn.close()

def get_all_profiles():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT id, name, age, bio, image_path, encoding FROM profiles')
    rows = cursor.fetchall()
    conn.close()
    return rows
