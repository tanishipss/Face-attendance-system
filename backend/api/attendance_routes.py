"""
Attendance Routes - sessions, records, stats
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import date as dt_date
import datetime

from database.db import get_connection
from api.auth_routes import get_current_user, require_role

router = APIRouter()


# ─── Schemas ────────────────────────────────────────────────────────────────

class CreateSessionRequest(BaseModel):
    subject_id: int
    date: Optional[str] = None
    session_type: str = "lecture"


class ManualAttendanceRequest(BaseModel):
    session_id: int
    enrollment_no: str
    status: str = "present"  # present | absent | late


# ─── Routes ─────────────────────────────────────────────────────────────────

@router.post("/session/create")
def create_session(req: CreateSessionRequest, user=Depends(get_current_user)):
    """Create a new attendance session."""
    conn = get_connection()
    today = req.date or str(dt_date.today())
    now = datetime.datetime.now().strftime("%H:%M:%S")

    cursor = conn.execute(
        """INSERT INTO attendance_sessions (subject_id, teacher_id, date, start_time, session_type)
           VALUES (?, ?, ?, ?, ?)""",
        (req.subject_id, int(user["sub"]), today, now, req.session_type)
    )
    session_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return {"session_id": session_id, "date": today, "start_time": now}


@router.post("/session/{session_id}/close")
def close_session(session_id: int, user=Depends(get_current_user)):
    conn = get_connection()
    now = datetime.datetime.now().strftime("%H:%M:%S")
    conn.execute(
        "UPDATE attendance_sessions SET end_time = ? WHERE id = ?", (now, session_id)
    )
    conn.commit()
    conn.close()
    return {"message": "Session closed", "session_id": session_id, "end_time": now}


@router.post("/manual")
def mark_manual(req: ManualAttendanceRequest, user=Depends(get_current_user)):
    """Manually mark attendance for a student."""
    conn = get_connection()
    student = conn.execute(
        "SELECT id FROM students WHERE enrollment_no = ?", (req.enrollment_no,)
    ).fetchone()
    if not student:
        conn.close()
        raise HTTPException(status_code=404, detail="Student not found")

    conn.execute(
        """INSERT OR REPLACE INTO attendance_records (session_id, student_id, status, method)
           VALUES (?, ?, ?, 'manual')""",
        (req.session_id, student["id"], req.status)
    )
    conn.commit()
    conn.close()
    return {"message": f"Attendance marked: {req.status} for {req.enrollment_no}"}


@router.get("/session/{session_id}")
def get_session_records(session_id: int, user=Depends(get_current_user)):
    """Get all attendance records for a session."""
    conn = get_connection()
    records = conn.execute("""
        SELECT s.enrollment_no, s.name, ar.status, ar.confidence, ar.marked_at, ar.method
        FROM attendance_records ar
        JOIN students s ON s.id = ar.student_id
        WHERE ar.session_id = ?
        ORDER BY ar.marked_at
    """, (session_id,)).fetchall()
    conn.close()
    return [dict(r) for r in records]


@router.get("/stats/overview")
def get_overview_stats(user=Depends(get_current_user)):
    """Dashboard overview stats."""
    conn = get_connection()

    total_students = conn.execute("SELECT COUNT(*) FROM students WHERE face_registered = 1").fetchone()[0]
    total_sessions = conn.execute("SELECT COUNT(*) FROM attendance_sessions").fetchone()[0]
    today = str(dt_date.today())
    today_present = conn.execute("""
        SELECT COUNT(DISTINCT ar.student_id) FROM attendance_records ar
        JOIN attendance_sessions s ON s.id = ar.session_id
        WHERE s.date = ? AND ar.status = 'present'
    """, (today,)).fetchone()[0]

    today_sessions = conn.execute(
        "SELECT COUNT(*) FROM attendance_sessions WHERE date = ?", (today,)
    ).fetchone()[0]

    # Weekly trend
    weekly = conn.execute("""
        SELECT s.date, COUNT(DISTINCT ar.student_id) as present_count
        FROM attendance_records ar
        JOIN attendance_sessions s ON s.id = ar.session_id
        WHERE ar.status = 'present'
        AND s.date >= date('now', '-7 days')
        GROUP BY s.date ORDER BY s.date
    """).fetchall()

    # Per-subject stats
    subject_stats = conn.execute("""
        SELECT sub.name, COUNT(DISTINCT ar.student_id) as present,
               COUNT(DISTINCT s.id) as sessions
        FROM attendance_sessions s
        JOIN subjects sub ON sub.id = s.subject_id
        LEFT JOIN attendance_records ar ON ar.session_id = s.id AND ar.status = 'present'
        GROUP BY sub.id
    """).fetchall()

    conn.close()

    return {
        "total_students": total_students,
        "total_sessions": total_sessions,
        "today_present": today_present,
        "today_sessions": today_sessions,
        "weekly_trend": [dict(w) for w in weekly],
        "subject_stats": [dict(s) for s in subject_stats]
    }


@router.get("/student/{enrollment_no}")
def get_student_attendance(enrollment_no: str, user=Depends(get_current_user)):
    """Get attendance history for a specific student."""
    conn = get_connection()
    records = conn.execute("""
        SELECT sub.name as subject, s.date, ar.status, ar.confidence, ar.marked_at
        FROM attendance_records ar
        JOIN attendance_sessions s ON s.id = ar.session_id
        JOIN subjects sub ON sub.id = s.subject_id
        JOIN students st ON st.id = ar.student_id
        WHERE st.enrollment_no = ?
        ORDER BY s.date DESC
    """, (enrollment_no,)).fetchall()
    conn.close()
    return [dict(r) for r in records]


@router.get("/subjects")
def list_subjects(user=Depends(get_current_user)):
    conn = get_connection()
    subjects = conn.execute(
        "SELECT id, code, name FROM subjects"
    ).fetchall()
    conn.close()
    return [dict(s) for s in subjects]


@router.post("/subjects")
def create_subject(payload: dict, user=Depends(require_role("admin", "teacher"))):
    conn = get_connection()
    conn.execute(
        "INSERT OR IGNORE INTO subjects (code, name, teacher_id) VALUES (?, ?, ?)",
        (payload["code"], payload["name"], int(user["sub"]))
    )
    conn.commit()
    conn.close()
    return {"message": "Subject created"}
