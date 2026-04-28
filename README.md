# 🎓 Attendance Pro — AI-Powered Face Recognition System

> **Upgraded from basic ML → production-grade deep learning system**

---

## 🚀 What's Upgraded

| Feature | Before | After |
|---|---|---|
| Face Recognition | OpenCV LBPH (basic) | **DeepFace + FaceNet512** (deep learning) |
| Storage | CSV files | **SQLite** (structured, scalable) |
| Anti-Spoofing | ❌ None | **✅ Liveness detection** (texture, blur, gradient analysis) |
| UI | Tkinter (desktop) | **Streamlit** (browser-based, modern) |
| Architecture | Monolithic script | **FastAPI backend + Streamlit frontend** |
| Auth | ❌ None | **JWT (Admin / Teacher roles)** |
| Dashboard | ❌ None | **Real-time charts, gauges, stats** |
| Export | CSV only | **Excel + CSV with one click** |
| Email Alerts | ❌ None | **✅ SMTP alerts for low attendance** |
| Embeddings | Retrain every time | **Stored .pkl embeddings (fast matching)** |
| Logging | Print statements | **Structured logging to file + console** |

---

## 📁 Project Structure

```
attendance_pro/
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── requirements.txt
│   ├── api/
│   │   ├── auth_routes.py       # JWT login, register, user management
│   │   ├── face_routes.py       # Face registration + recognition + liveness
│   │   ├── attendance_routes.py # Sessions, records, stats
│   │   ├── admin_routes.py      # Student CRUD
│   │   └── export_routes.py     # Excel/CSV export
│   ├── database/
│   │   └── db.py               # SQLite init, all tables
│   └── utils/
│       └── email_alerts.py     # SMTP email notifications
│
├── frontend/
│   ├── app.py                   # Streamlit main app (login + routing)
│   ├── requirements.txt
│   └── pages/
│       ├── dashboard.py         # KPIs, charts, gauge
│       ├── take_attendance.py   # Live webcam + face recognition
│       ├── register_face.py     # Face enrollment with liveness check
│       ├── view_records.py      # Browse + export records
│       ├── students.py          # Student management
│       ├── subjects.py          # Subject management
│       └── admin_panel.py       # User management
│
├── embeddings/                  # Stored FaceNet512 embeddings (.pkl)
├── face_db/                     # Reference face images
├── logs/                        # Application logs
├── .env.example                 # Environment config template
├── start_windows.bat            # Windows launcher
└── start.sh                     # Linux/Mac launcher
```

---

## ⚙️ Setup

### Prerequisites
- Python 3.10+
- Webcam
- 4GB+ RAM (for DeepFace model)

### 1. Clone & setup

```bash
# Copy .env.example to .env
cp .env.example .env
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

> **First run**: DeepFace will download FaceNet512 model (~90MB). Takes 1-2 min.

### 3. Frontend

```bash
cd frontend
pip install -r requirements.txt
streamlit run app.py
```

### 4. Or use the launcher

**Windows:** Double-click `start_windows.bat`
**Linux/Mac:** `bash start.sh`

---

## 🔐 Default Login

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |

Create teacher accounts from Admin Panel.

---

## 🔒 Anti-Spoofing Details

The system implements basic liveness detection to prevent fake attendance:

1. **LBP Texture Variance** — Printed photos have lower texture variance
2. **Laplacian Blur Score** — Screens/photos appear blurrier than real faces
3. **Gradient Energy** — Real faces have higher gradient energy

Combined score threshold: **0.35** (adjustable in `face_routes.py`)

> 💡 For production: integrate [Silent-Face-Anti-Spoofing](https://github.com/minivision-ai/Silent-Face-Anti-Spoofing) for state-of-art results.

---

## 📡 API Documentation

Once backend is running: `http://localhost:8000/docs`

Key endpoints:
- `POST /api/auth/login` — Get JWT token
- `POST /api/face/register` — Register face embedding
- `POST /api/face/recognize` — Recognize face + mark attendance
- `GET /api/attendance/stats/overview` — Dashboard stats
- `GET /api/export/attendance/excel` — Download Excel report

---

## 🌐 Deployment

**Backend (Render / Railway):**
```bash
# Procfile
web: uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

**Frontend (Streamlit Cloud):**
1. Push frontend/ to GitHub
2. Connect to [streamlit.io/cloud](https://streamlit.io/cloud)
3. Set `API_URL` in secrets to your Render backend URL

---

## 📧 Email Alerts

Configure in `.env`:
```
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password  # Generate at Google Account > App Passwords
ALERT_EMAIL=principal@school.com
```

Call `send_attendance_alert()` from `utils/email_alerts.py` after computing low attendance.

---

## 🧠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Face Recognition | DeepFace + FaceNet512 |
| Face Detection | MTCNN |
| Backend | FastAPI + Uvicorn |
| Database | SQLite (via stdlib) |
| Frontend | Streamlit |
| Charts | Plotly |
| Auth | JWT (python-jose) |
| Export | openpyxl |
| Logging | Python logging |
