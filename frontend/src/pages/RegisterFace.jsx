import React, { useState, useRef, useCallback, useEffect } from 'react';
import api from '../api';

export default function RegisterFace() {
  const [enrollmentNo, setEnrollmentNo]   = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const [stream, setStream]               = useState(null);
  const [cameraOn, setCameraOn]           = useState(false);
  const [msg, setMsg]                     = useState('');
  const [saving, setSaving]               = useState(false);
  const [students, setStudents]           = useState([]);
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const fileRef   = useRef(null);

  // Load students list so we can look up name by enrollment number
  useEffect(() => {
    api.listStudents().then(setStudents).catch(() => {});
  }, []);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(s);
      setCameraOn(true);
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = s; }, 100);
    } catch {
      setMsg('❌ Camera access denied. Use file upload instead.');
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    setStream(null);
    setCameraOn(false);
    if (videoRef.current) videoRef.current.srcObject = null;
  }, [stream]);

  const capturePhoto = () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    setCapturedImage(canvas.toDataURL('image/jpeg', 0.9));
    stopCamera();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCapturedImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  // Convert dataURL → pure base64 (strip the "data:image/jpeg;base64," prefix)
  const toBase64 = (dataURL) => dataURL.split(',')[1];

  const handleSubmit = async () => {
    if (!enrollmentNo.trim()) { setMsg('❌ Enter enrollment number'); return; }
    if (!capturedImage)       { setMsg('❌ Capture or upload a photo first'); return; }

    // Try to find name from students list
    const found = students.find(s => s.enrollment_no === enrollmentNo.trim());
    const name  = found?.name || enrollmentNo.trim(); // fallback to enrollment_no if not found

    setSaving(true); setMsg('');
    try {
      const result = await api.registerFace({
        enrollment_no: enrollmentNo.trim(),
        name,
        image_base64: toBase64(capturedImage),
      });
      setMsg(`✅ ${result.message || 'Face registered successfully!'}`);
      setCapturedImage(null);
      setEnrollmentNo('');
    } catch (err) {
      setMsg('❌ ' + (err.message || 'Registration failed'));
    } finally {
      setSaving(false);
    }
  };

  const isSuccess = msg.startsWith('✅');

  return (
    <div style={S.page} className="fade-in">
      <div style={S.header}>
        <h1 style={S.title}>Register Face</h1>
        <p style={S.sub}>Enroll a student's face for AI recognition</p>
      </div>

      {msg && (
        <div style={{ ...S.msg, background: isSuccess ? '#ECFDF5' : '#FEF2F2', borderColor: isSuccess ? '#A7F3D0' : '#FECACA', color: isSuccess ? '#166534' : '#DC2626' }}>
          {msg}
        </div>
      )}

      <div style={S.cols}>
        {/* Left — Camera */}
        <div style={S.cameraCol}>
          <div style={S.card}>
            <div style={S.cardTitle}>📸 Photo Capture</div>
            <div style={S.cameraBox}>
              {cameraOn ? (
                <video ref={videoRef} autoPlay playsInline style={S.video} />
              ) : capturedImage ? (
                <img src={capturedImage} alt="Captured" style={S.video} />
              ) : (
                <div style={S.placeholder}>
                  <div style={{ fontSize: 52, marginBottom: 10 }}>📷</div>
                  <div style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>No photo captured yet</div>
                </div>
              )}
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div style={S.controls}>
              {!cameraOn ? (
                <button style={S.btnGray} onClick={startCamera}>📷 Open Camera</button>
              ) : (
                <>
                  <button style={{ ...S.btnGray, background: '#22c55e' }} onClick={capturePhoto}>📸 Capture</button>
                  <button style={{ ...S.btnGray, background: '#EF4444' }} onClick={stopCamera}>✕ Cancel</button>
                </>
              )}
              <button style={{ ...S.btnGray, background: '#6366f1' }} onClick={() => fileRef.current?.click()}>
                📁 Upload Photo
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
            </div>

            {capturedImage && !cameraOn && (
              <button style={S.clearBtn} onClick={() => setCapturedImage(null)}>✕ Clear Photo</button>
            )}
          </div>
        </div>

        {/* Right — Form */}
        <div style={S.formCol}>
          <div style={S.card}>
            <div style={S.cardTitle}>📋 Student Details</div>
            <label style={S.label}>
              <span style={S.labelText}>Enrollment Number *</span>
              <input
                style={S.input}
                value={enrollmentNo}
                onChange={e => setEnrollmentNo(e.target.value)}
                placeholder="e.g. 229303277"
                list="students-list"
              />
              <datalist id="students-list">
                {students.map(s => (
                  <option key={s.enrollment_no} value={s.enrollment_no}>{s.name}</option>
                ))}
              </datalist>
            </label>
            {enrollmentNo && students.find(s => s.enrollment_no === enrollmentNo) && (
              <div style={S.studentFound}>
                ✅ Found: <strong>{students.find(s => s.enrollment_no === enrollmentNo)?.name}</strong>
              </div>
            )}
            <p style={S.hint}>The student must already be added in the Students section.</p>
            <button style={{ ...S.submitBtn, opacity: saving ? 0.7 : 1 }} onClick={handleSubmit} disabled={saving}>
              {saving ? '⏳ Registering...' : '🤖 Register Face'}
            </button>
          </div>

          <div style={S.tipsCard}>
            <div style={S.tipsTitle}>💡 Tips for Best Results</div>
            <ul style={S.tipsList}>
              {['Face the camera directly','Ensure good, even lighting','Remove glasses if possible','Keep a neutral expression','Make sure face is clearly visible'].map(t => (
                <li key={t} style={S.tipItem}>{t}</li>
              ))}
            </ul>
          </div>

          <div style={S.aiCard}>
            <div style={S.aiTitle}>🧠 DeepFace AI Engine</div>
            <p style={S.aiText}>Face embeddings are stored using FaceNet512 model. Anti-spoofing (liveness detection) is applied during recognition.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { padding: '28px 32px', flex: 1, fontFamily: "'Poppins', sans-serif" },
  header: { marginBottom: 24 },
  title: { fontSize: '1.55rem', fontWeight: 700, color: '#1F2937', marginBottom: 4 },
  sub: { fontSize: '0.83rem', color: '#9CA3AF' },
  msg: { borderRadius: 10, padding: '10px 16px', fontSize: '0.85rem', marginBottom: 20, border: '1px solid', fontFamily: "'Poppins', sans-serif" },
  cols: { display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' },
  cameraCol: { flex: '1 1 360px' },
  formCol: { flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: 16 },
  card: { background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,.06)' },
  cardTitle: { fontSize: '0.95rem', fontWeight: 700, color: '#1F2937', marginBottom: 16 },
  cameraBox: {
    width: '100%', aspectRatio: '4/3', background: '#F3F4F6', borderRadius: 12,
    overflow: 'hidden', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  video: { width: '100%', height: '100%', objectFit: 'cover' },
  placeholder: { textAlign: 'center' },
  controls: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 },
  btnGray: {
    flex: 1, background: '#374151', color: '#fff', border: 'none',
    borderRadius: 8, padding: '9px 12px', fontSize: '0.82rem', fontWeight: 600,
    cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
  },
  clearBtn: {
    width: '100%', background: '#FEE2E2', color: '#DC2626', border: 'none',
    borderRadius: 8, padding: 8, fontSize: '0.82rem', fontWeight: 600,
    cursor: 'pointer', fontFamily: "'Poppins', sans-serif", marginTop: 4,
  },
  label: { display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 8 },
  labelText: { fontSize: '0.8rem', fontWeight: 600, color: '#374151' },
  input: {
    padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: 8,
    fontSize: '0.9rem', fontFamily: "'Poppins', sans-serif", outline: 'none', color: '#1F2937',
    background: '#FAFAFA',
  },
  studentFound: {
    background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 8,
    padding: '6px 12px', fontSize: '0.8rem', color: '#166534', marginBottom: 8,
  },
  hint: { fontSize: '0.75rem', color: '#9CA3AF', marginBottom: 16 },
  submitBtn: {
    width: '100%', background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    color: '#fff', border: 'none', borderRadius: 10, padding: 12,
    fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
  },
  tipsCard: { background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 14, padding: '16px 20px' },
  tipsTitle: { fontSize: '0.85rem', fontWeight: 700, color: '#166534', marginBottom: 8 },
  tipsList: { paddingLeft: 16 },
  tipItem: { fontSize: '0.82rem', color: '#166534', lineHeight: 2 },
  aiCard: { background: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: 14, padding: '16px 20px' },
  aiTitle: { fontWeight: 700, color: '#7C3AED', marginBottom: 4, fontSize: '0.9rem' },
  aiText: { fontSize: '0.82rem', color: '#8B5CF6', lineHeight: 1.5 },
};