"""
Face Recognition Routes
- Register student face (store embeddings)
- Recognize face during attendance (DeepFace / Facenet512)
- Anti-spoofing: texture + blur + gradient analysis
"""
import os
import cv2
import numpy as np
import pickle
import base64
import logging
from pathlib import Path
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

# ── Fix: tell TF to use tf-keras instead of standalone keras ──────────────
os.environ["TF_USE_LEGACY_KERAS"] = "1"

from database.db import get_connection
from api.auth_routes import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)

EMBEDDINGS_DIR = Path("embeddings")
EMBEDDINGS_DIR.mkdir(exist_ok=True)

FACE_DB_PATH = "face_db"
os.makedirs(FACE_DB_PATH, exist_ok=True)


# ── Lazy-load DeepFace ────────────────────────────────────────────────────
_deepface = None

def get_deepface():
    global _deepface
    if _deepface is None:
        try:
            from deepface import DeepFace
            _deepface = DeepFace
            logger.info("DeepFace loaded successfully")
        except Exception as e:
            logger.error(f"DeepFace load failed: {e}")
            raise HTTPException(status_code=500,
                detail=f"DeepFace failed to load: {e}. Run: pip install tf-keras")
    return _deepface


# ── Numpy type converter (FIX for 500 error) ─────────────────────────────
def convert_numpy_types(obj):
    """Recursively convert numpy types to native Python types for JSON serialization."""
    if isinstance(obj, dict):
        return {k: convert_numpy_types(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [convert_numpy_types(v) for v in obj]
    if isinstance(obj, np.bool_):
        return bool(obj)
    if isinstance(obj, np.integer):
        return int(obj)
    if isinstance(obj, np.floating):
        return float(obj)
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    return obj


# ── Liveness Checker ─────────────────────────────────────────────────────
class LivenessChecker:
    @staticmethod
    def check_liveness(face_img: np.ndarray) -> dict:
        if face_img is None or face_img.size == 0:
            return {"is_live": False, "confidence": 0.0, "reason": "No face image"}

        gray = cv2.cvtColor(face_img, cv2.COLOR_BGR2GRAY) \
               if len(face_img.shape) == 3 else face_img

        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        gradient_energy = np.sqrt(sobelx**2 + sobely**2).mean()
        intensity_std = float(np.std(gray))

        blur_score     = min(laplacian_var  / 100.0, 1.0)
        gradient_score = min(gradient_energy / 10.0,  1.0)
        texture_score  = min(intensity_std   / 50.0,  1.0)

        combined = blur_score * 0.4 + gradient_score * 0.4 + texture_score * 0.2
        is_live  = combined > 0.30   # slightly relaxed threshold

        # ── FIX: convert all numpy types to native Python ──
        return convert_numpy_types({
            "is_live":            is_live,
            "confidence":         round(float(combined), 3),
            "laplacian_variance": round(float(laplacian_var), 2),
            "gradient_energy":    round(float(gradient_energy), 2),
            "intensity_std":      round(float(intensity_std), 2),
            "reason": "Live face detected" if is_live else "Possible spoofing: low texture/blur"
        })


liveness_checker = LivenessChecker()


# ── Schemas ───────────────────────────────────────────────────────────────
class RegisterFaceRequest(BaseModel):
    enrollment_no: str
    name: str
    image_base64: str

class RecognizeRequest(BaseModel):
    image_base64: str
    subject_code: str
    session_id: int


# ── Helpers ───────────────────────────────────────────────────────────────
def decode_image(b64: str) -> np.ndarray:
    data = base64.b64decode(b64)
    arr  = np.frombuffer(data, dtype=np.uint8)
    img  = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image data")
    return img


def get_embedding(img: np.ndarray) -> list:
    """
    Try detectors in order of reliability.
    opencv  → fastest, no extra deps
    ssd     → good fallback
    retinaface → accurate but slower
    mtcnn   → last resort (needs tf-keras)
    """
    DeepFace = get_deepface()
    detectors = ["opencv", "ssd", "retinaface", "mtcnn"]
    last_err  = None

    for detector in detectors:
        try:
            result = DeepFace.represent(
                img_path=img,
                model_name="Facenet512",
                detector_backend=detector,
                enforce_detection=True,
                align=True,
            )
            logger.info(f"Embedding obtained with detector: {detector}")
            return result[0]["embedding"]
        except Exception as e:
            last_err = e
            logger.warning(f"Detector '{detector}' failed: {e}")
            continue

    # All detectors failed — raise clear message
    raise HTTPException(
        status_code=400,
        detail=(
            "Face not detected clearly. Ensure your face is well-lit and centered. "
            f"(Last error: {str(last_err)})"
        )
    )


def cosine_similarity(a: list, b: list) -> float:
    a, b = np.array(a), np.array(b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-10))


def load_all_embeddings() -> dict:
    embeddings = {}
    for f in EMBEDDINGS_DIR.glob("*.pkl"):
        try:
            with open(f, "rb") as fh:
                data = pickle.load(fh)
                embeddings[data["enrollment_no"]] = data
        except Exception:
            pass
    return embeddings


# ── Routes ────────────────────────────────────────────────────────────────
@router.post("/register")
def register_face(req: RegisterFaceRequest, user=Depends(get_current_user)):
    """Register a student's face and store embedding."""
    img = decode_image(req.image_base64)

    # Liveness
    liveness = liveness_checker.check_liveness(img)
    logger.info(f"Liveness check for {req.enrollment_no}: {liveness}")

    if not liveness["is_live"]:
        raise HTTPException(
            status_code=400,
            detail=f"Liveness check failed: {liveness['reason']}"
        )

    # Embedding
    try:
        embedding = get_embedding(img)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Face not detected clearly. Ensure your face is well-lit and centered. "
                f"If you have tensorflow 2.21+, run: pip install tf-keras  ({e})"
            )
        )

    # Save embedding file
    emb_path = EMBEDDINGS_DIR / f"{req.enrollment_no}.pkl"
    with open(emb_path, "wb") as f:
        pickle.dump({
            "enrollment_no": req.enrollment_no,
            "name":          req.name,
            "embedding":     embedding
        }, f)

    # Save face image
    face_dir = os.path.join(FACE_DB_PATH, req.enrollment_no)
    os.makedirs(face_dir, exist_ok=True)
    cv2.imwrite(os.path.join(face_dir, f"{req.enrollment_no}.jpg"), img)

    # Update DB
    conn = get_connection()
    conn.execute(
        """INSERT OR IGNORE INTO students (enrollment_no, name, embedding_path, face_registered)
           VALUES (?, ?, ?, 0)""",
        (req.enrollment_no, req.name, str(emb_path))
    )
    conn.execute(
        """UPDATE students SET embedding_path=?, face_registered=1 WHERE enrollment_no=?""",
        (str(emb_path), req.enrollment_no)
    )
    conn.commit()
    conn.close()

    logger.info(f"Face registered: {req.enrollment_no} - {req.name}")

    # ── FIX: ensure entire response is JSON-serializable ──
    return convert_numpy_types({
        "message":  f"Face registered successfully for {req.name}",
        "liveness": liveness
    })


@router.post("/recognize")
def recognize_face(req: RecognizeRequest, user=Depends(get_current_user)):
    """Recognize a face and mark attendance."""
    img = decode_image(req.image_base64)

    liveness = liveness_checker.check_liveness(img)
    if not liveness["is_live"]:
        return convert_numpy_types({
            "recognized": False,
            "reason":     "Liveness check failed — possible spoofing",
            "liveness":   liveness
        })

    try:
        embedding = get_embedding(img)
    except HTTPException as e:
        return {"recognized": False, "reason": e.detail}
    except Exception as e:
        return {"recognized": False, "reason": f"No face detected: {e}"}

    all_embeddings = load_all_embeddings()
    if not all_embeddings:
        raise HTTPException(status_code=404, detail="No faces registered yet")

    best_match = None
    best_score = -1.0
    for enrollment_no, data in all_embeddings.items():
        score = cosine_similarity(embedding, data["embedding"])
        if score > best_score:
            best_score = score
            best_match = data

    THRESHOLD = 0.70
    if best_score < THRESHOLD:
        return convert_numpy_types({
            "recognized": False,
            "reason":     f"No match found (best score: {best_score:.3f})",
            "liveness":   liveness
        })

    # Mark attendance
    conn = get_connection()
    student = conn.execute(
        "SELECT id FROM students WHERE enrollment_no = ?",
        (best_match["enrollment_no"],)
    ).fetchone()

    if student:
        try:
            conn.execute(
                """INSERT OR IGNORE INTO attendance_records
                   (session_id, student_id, status, confidence, method)
                   VALUES (?, ?, 'present', ?, 'face')""",
                (req.session_id, student["id"], round(best_score, 4))
            )
            conn.commit()
        except Exception as e:
            logger.warning(f"Attendance insert error: {e}")
    conn.close()

    return convert_numpy_types({
        "recognized":    True,
        "enrollment_no": best_match["enrollment_no"],
        "name":          best_match["name"],
        "confidence":    round(best_score, 4),
        "liveness":      liveness
    })


@router.post("/liveness-check")
def check_liveness_only(payload: dict):
    img = decode_image(payload.get("image_base64", ""))
    return liveness_checker.check_liveness(img)


@router.get("/registered-students")
def list_registered(user=Depends(get_current_user)):
    conn = get_connection()
    rows = conn.execute(
        "SELECT enrollment_no, name, face_registered, registered_at FROM students WHERE face_registered=1"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]