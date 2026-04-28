"""
Email Alert Utility
Sends alerts when attendance drops below threshold
"""
import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger(__name__)

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
ALERT_EMAIL = os.getenv("ALERT_EMAIL", "")


def send_attendance_alert(student_name: str, enrollment_no: str, attendance_pct: float, subject: str):
    """Send an alert when a student's attendance is low."""
    if not all([SMTP_USER, SMTP_PASS, ALERT_EMAIL]):
        logger.warning("Email not configured. Skipping alert.")
        return

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"⚠️ Low Attendance Alert: {student_name}"
        msg["From"] = SMTP_USER
        msg["To"] = ALERT_EMAIL

        html = f"""
        <html><body>
        <h2 style="color:#EF4444">⚠️ Low Attendance Alert</h2>
        <table border="1" cellpadding="8" style="border-collapse:collapse">
            <tr><th>Student</th><td>{student_name}</td></tr>
            <tr><th>Enrollment No</th><td>{enrollment_no}</td></tr>
            <tr><th>Subject</th><td>{subject}</td></tr>
            <tr><th>Attendance</th><td style="color:red"><b>{attendance_pct:.1f}%</b></td></tr>
        </table>
        <p>Please take necessary action.</p>
        <p><i>— Attendance Pro System</i></p>
        </body></html>
        """

        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_USER, ALERT_EMAIL, msg.as_string())

        logger.info(f"📧 Alert sent for {student_name} ({enrollment_no})")

    except Exception as e:
        logger.error(f"Email alert failed: {e}")
