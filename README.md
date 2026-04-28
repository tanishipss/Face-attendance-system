# 🎓 Attendance Pro — AI-Powered Face Recognition System

<div align="center">

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![DeepFace](https://img.shields.io/badge/DeepFace-FaceNet512-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

A full-stack face recognition attendance system powered by deep learning.  
Built with **FastAPI** (backend) and **React.js** (frontend), enabling real-time attendance marking with liveness detection, analytics, and export features.

</div>

---

## 🚀 Features

| Feature | Description |
|--------|-------------|
| 🧠 **Face Recognition** | DeepFace + FaceNet512 for high-accuracy identification |
| 🔐 **JWT Authentication** | Role-based access for Admin & Teacher |
| 🛡️ **Liveness Detection** | Prevents spoofing via texture, blur & gradient analysis |
| 📊 **Dashboard & Analytics** | Real-time stats and attendance insights |
| 📁 **Attendance Management** | Manage sessions and records efficiently |
| 📤 **Export Reports** | Download attendance as Excel or CSV |
| 📧 **Email Alerts** | Automated alerts for low attendance |
| 🗄️ **SQLite Database** | Lightweight structured storage |
| ⚡ **Fast Matching** | Cosine similarity on stored embeddings |
| 📝 **Structured Logging** | File + console logging |

---

## 📁 Project Structure

```
attendance_pro/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── api/
│   │   ├── auth_routes.py
│   │   ├── face_routes.py
│   │   ├── attendance_routes.py
│   │   └── export_routes.py
│   ├── database/
│   │   └── db.py
│   └── utils/
│
├── frontend/
│   ├── package.json
│   ├── public/
│   └── src/
│
├── embeddings/          # Stored face embeddings (auto-generated)
├── face_db/             # Face images (auto-generated)
├── logs/                # Application logs (auto-generated)
├── .env.example
├── start_windows.bat
└── start.sh
```

---

## ⚙️ Setup & Installation

### 📌 Prerequisites

- Python **3.10+**
- Node.js **v16+**
- Webcam
- 4GB+ RAM

---

### 🔧 1. Clone the Repository

```bash
git clone https://github.com/tanishipss/Face-attendance-system.git
cd Face-attendance-system
```

---

### 🔐 2. Environment Setup

```bash
cp .env.example .env
```

> Update the values inside `.env` as needed (SMTP credentials, secret key, etc.)

---

### 🧠 3. Run the Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

| | URL |
|---|---|
| **Backend API** | http://localhost:8000 |
| **API Docs (Swagger)** | http://localhost:8000/docs |

---

### 💻 4. Run the Frontend (React)

```bash
cd frontend
npm install
npm start
```

| | URL |
|---|---|
| **Frontend** | http://localhost:3000 |

---

### 🔗 5. API Configuration

Update the API base URL in `frontend/src/api.js`:

```js
const API_URL = "http://localhost:8000";
```

---

## ▶️ Running the Application

Run both services simultaneously in **two separate terminals**:

**Terminal 1 — Backend**
```bash
cd backend
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend**
```bash
cd frontend
npm start
```

---

## 🔐 Default Login

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |

> ⚠️ Change the default password after first login.

---

## 🛡️ Liveness Detection

The system prevents fake/photo-based attendance using a multi-layer analysis:

- **Texture Analysis** — Local Binary Pattern (LBP) checks
- **Blur Detection** — Laplacian variance scoring
- **Gradient Energy** — Sobel-based sharpness measurement

> Threshold is configurable in the backend `face_routes.py`.

---

## 📡 API Endpoints

Full interactive documentation available at **http://localhost:8000/docs**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Login and get JWT token |
| `POST` | `/api/face/register` | Register a student's face |
| `POST` | `/api/face/recognize` | Recognize face & mark attendance |
| `GET` | `/api/attendance/stats/overview` | Get attendance statistics |
| `GET` | `/api/export/attendance/excel` | Export attendance as Excel |

---

## 📧 Email Alerts Configuration

Add these to your `.env` file:

```env
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
ALERT_EMAIL=admin@example.com
```

> For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password.

---

## 🌐 Deployment

**Backend**
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Frontend**
```bash
npm run build
```

> Deploy frontend on **Vercel** or **Netlify**, backend on **Render** or **Railway**.

---

## 🧠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Face Recognition | DeepFace + FaceNet512 |
| Face Detection | MTCNN / OpenCV |
| Backend | FastAPI |
| Database | SQLite |
| Frontend | React.js |
| Charts | Chart.js / Recharts |
| Authentication | JWT |
| Export | openpyxl |
| Logging | Python `logging` |

---

## 📄 License

This project is for educational purposes. Feel free to fork and build on it.

---

<div align="center">
Made with ❤️ by <a href="https://github.com/tanishipss">Tanisha</a>
</div>
