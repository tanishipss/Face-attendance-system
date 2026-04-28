"""
Admin Routes - student registration, management, dashboard
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional

from database.db import get_connection
from api.auth_routes import get_current_user

router = APIRouter()


class StudentCreate(BaseModel):
    enrollment_no: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[int] = None


@router.post("/students")
def create_student(req: StudentCreate, user=Depends(get_current_user)):
    conn = get_connection()
    try:
        conn.execute(
            """INSERT INTO students (enrollment_no, name, email, phone, department, semester)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (req.enrollment_no, req.name, req.email, req.phone, req.department, req.semester)
        )
        conn.commit()
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=400, detail=f"Student already exists or DB error: {e}")
    conn.close()
    return {"message": f"Student {req.name} registered"}


@router.get("/students")
def list_students(user=Depends(get_current_user)):
    conn = get_connection()
    students = conn.execute(
        "SELECT id, enrollment_no, name, email, department, semester, face_registered, registered_at FROM students ORDER BY name"
    ).fetchall()
    conn.close()
    return [dict(s) for s in students]


@router.get("/students/{enrollment_no}")
def get_student(enrollment_no: str, user=Depends(get_current_user)):
    conn = get_connection()
    student = conn.execute(
        "SELECT * FROM students WHERE enrollment_no = ?", (enrollment_no,)
    ).fetchone()
    conn.close()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return dict(student)


@router.delete("/students/{enrollment_no}")
def delete_student(enrollment_no: str, user=Depends(get_current_user)):
    conn = get_connection()
    conn.execute("DELETE FROM students WHERE enrollment_no = ?", (enrollment_no,))
    conn.commit()
    conn.close()
    return {"message": f"Student {enrollment_no} deleted"}
