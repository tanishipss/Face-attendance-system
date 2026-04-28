"""
Database initialization and connection management using SQLite
"""
import sqlite3
import os
from pathlib import Path

DB_PATH = os.getenv("DB_PATH", "attendance_pro.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # Users table (admin / teacher / student roles)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'teacher',  -- admin | teacher | student
            full_name TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_active INTEGER DEFAULT 1
        )
    """)

    # Students table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            enrollment_no TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            department TEXT,
            semester INTEGER,
            embedding_path TEXT,
            face_registered INTEGER DEFAULT 0,
            registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Subjects table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS subjects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            teacher_id INTEGER,
            FOREIGN KEY(teacher_id) REFERENCES users(id)
        )
    """)

    # Attendance sessions
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS attendance_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject_id INTEGER,
            teacher_id INTEGER,
            date TEXT NOT NULL,
            start_time TEXT,
            end_time TEXT,
            session_type TEXT DEFAULT 'lecture',
            FOREIGN KEY(subject_id) REFERENCES subjects(id),
            FOREIGN KEY(teacher_id) REFERENCES users(id)
        )
    """)

    # Attendance records
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS attendance_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER NOT NULL,
            student_id INTEGER NOT NULL,
            status TEXT DEFAULT 'present',  -- present | absent | late
            confidence REAL,
            marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            method TEXT DEFAULT 'face',  -- face | manual
            FOREIGN KEY(session_id) REFERENCES attendance_sessions(id),
            FOREIGN KEY(student_id) REFERENCES students(id),
            UNIQUE(session_id, student_id)
        )
    """)

    # Insert default admin if not exists
    from passlib.context import CryptContext
    pwd_ctx = CryptContext(schemes=["bcrypt"])
    admin_hash = pwd_ctx.hash("admin123")
    cursor.execute("""
        INSERT OR IGNORE INTO users (username, email, password_hash, role, full_name)
        VALUES (?, ?, ?, ?, ?)
    """, ("admin", "admin@attendancepro.com", admin_hash, "admin", "System Admin"))

    conn.commit()
    conn.close()
    print("✅ Database initialized at", DB_PATH)
