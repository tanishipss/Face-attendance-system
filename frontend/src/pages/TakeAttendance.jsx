import React, { useState, useEffect } from 'react';
import api from '../api';

export default function TakeAttendance() {
  const [subjects, setSubjects] = useState([]);
  const [session, setSession] = useState(null);
  const [records, setRecords] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [sessionType, setSessionType] = useState('lecture');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Manual mark
  const [manualEnroll, setManualEnroll] = useState('');
  const [manualStatus, setManualStatus] = useState('present');

  useEffect(() => {
    api.listSubjects().then(setSubjects).catch(console.error);
  }, []);

  const refreshRecords = async (sid) => {
    const recs = await api.getSessionRecords(sid);
    setRecords(recs);
  };

  const startSession = async () => {
    if (!selectedSubject) { setMsg('❌ Please select a subject first'); return; }
    setLoading(true); setMsg('');
    try {
      const s = await api.createSession({ subject_id: parseInt(selectedSubject), session_type: sessionType });
      setSession(s);
      setRecords([]);
      setMsg(`✅ Session started (ID: ${s.session_id}) at ${s.start_time}`);
    } catch (err) {
      setMsg('❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const closeSession = async () => {
    if (!session) return;
    setLoading(true);
    try {
      await api.closeSession(session.session_id);
      setMsg(`✅ Session closed. ${records.length} student(s) marked.`);
      setSession(null);
    } catch (err) {
      setMsg('❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const markManual = async () => {
    if (!session) { setMsg('❌ Start a session first'); return; }
    if (!manualEnroll.trim()) { setMsg('❌ Enter enrollment number'); return; }
    try {
      await api.markManual({ session_id: session.session_id, enrollment_no: manualEnroll.trim(), status: manualStatus });
      setMsg(`✅ Marked ${manualEnroll} as ${manualStatus}`);
      setManualEnroll('');
      refreshRecords(session.session_id);
    } catch (err) {
      setMsg('❌ ' + err.message);
    }
  };

  const statusColors = { present: { bg: '#dcfce7', color: '#15803d' }, absent: { bg: '#fee2e2', color: '#dc2626' }, late: { bg: '#fef3c7', color: '#92400e' } };

  return (
    <div style={styles.page} className="fade-in">
      <div style={styles.header}>
        <h1 style={styles.title}>📋 Take Attendance</h1>
        <p style={styles.sub}>Create a session and mark student attendance</p>
      </div>

      {msg && (
        <div style={{ ...styles.msg, background: msg.startsWith('✅') ? '#f0fdf4' : '#fef2f2', borderColor: msg.startsWith('✅') ? '#bbf7d0' : '#fecaca', color: msg.startsWith('✅') ? '#15803d' : '#dc2626' }}>
          {msg}
        </div>
      )}

      <div style={styles.cols}>
        {/* Left — Session Control */}
        <div style={styles.col}>
          <div style={styles.card}>
            <div style={styles.cardTitle}>🎯 Session Control</div>

            {!session ? (
              <>
                <label style={styles.label}>
                  <span style={styles.labelText}>Subject</span>
                  <select style={styles.select} value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
                    <option value="">— Select Subject —</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </label>

                <label style={styles.label}>
                  <span style={styles.labelText}>Session Type</span>
                  <select style={styles.select} value={sessionType} onChange={e => setSessionType(e.target.value)}>
                    <option value="lecture">Lecture</option>
                    <option value="lab">Lab</option>
                    <option value="tutorial">Tutorial</option>
                  </select>
                </label>

                <button style={styles.startBtn} onClick={startSession} disabled={loading}>
                  {loading ? '⏳ Starting...' : '▶ Start Session'}
                </button>
              </>
            ) : (
              <div>
                <div style={styles.sessionInfo}>
                  <div style={styles.sessionRow}>
                    <span style={styles.sessionKey}>Session ID</span>
                    <code style={styles.sessionVal}>{session.session_id}</code>
                  </div>
                  <div style={styles.sessionRow}>
                    <span style={styles.sessionKey}>Started</span>
                    <span style={styles.sessionVal}>{session.start_time}</span>
                  </div>
                  <div style={styles.sessionRow}>
                    <span style={styles.sessionKey}>Date</span>
                    <span style={styles.sessionVal}>{session.date}</span>
                  </div>
                  <div style={styles.sessionRow}>
                    <span style={styles.sessionKey}>Marked</span>
                    <span style={{ ...styles.sessionVal, color: '#22c55e', fontWeight: 700 }}>{records.length} student(s)</span>
                  </div>
                </div>
                <button style={styles.closeBtn} onClick={closeSession} disabled={loading}>
                  ⏹ Close Session
                </button>
              </div>
            )}
          </div>

          {/* Manual Mark */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>✍️ Manual Mark</div>
            <p style={styles.cardSub}>Mark attendance manually by enrollment number</p>
            <label style={styles.label}>
              <span style={styles.labelText}>Enrollment No</span>
              <input style={styles.input} value={manualEnroll} onChange={e => setManualEnroll(e.target.value)} placeholder="e.g. 2024001" />
            </label>
            <label style={styles.label}>
              <span style={styles.labelText}>Status</span>
              <select style={styles.select} value={manualStatus} onChange={e => setManualStatus(e.target.value)}>
                <option value="present">✅ Present</option>
                <option value="absent">❌ Absent</option>
                <option value="late">⏰ Late</option>
              </select>
            </label>
            <button style={{ ...styles.startBtn, background: '#3b82f6' }} onClick={markManual} disabled={!session}>
              Mark Attendance
            </button>
            {!session && <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 6 }}>Start a session first</p>}
          </div>

          {/* Face Recognition Note */}
          <div style={styles.infoCard}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🤖</div>
            <div style={{ fontWeight: 600, color: '#1e40af', marginBottom: 4 }}>Face Recognition</div>
            <p style={{ fontSize: '0.82rem', color: '#3b82f6', lineHeight: 1.5 }}>
              Face-based attendance is processed by the backend AI engine.
              Use the Register Face page to enroll students, then your backend
              webcam endpoint handles recognition automatically.
            </p>
          </div>
        </div>

        {/* Right — Records */}
        <div style={styles.col}>
          <div style={{ ...styles.card, flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={styles.cardTitle}>📝 Session Records</div>
              {session && (
                <button style={styles.refreshBtn} onClick={() => refreshRecords(session.session_id)}>
                  ↻ Refresh
                </button>
              )}
            </div>

            {records.length === 0 ? (
              <div style={styles.emptyRecords}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
                <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  {session ? 'No attendance marked yet' : 'Start a session to see records'}
                </div>
              </div>
            ) : (
              <div style={styles.recordsList}>
                {records.map((r, i) => (
                  <div key={i} style={styles.recordRow}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>{r.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>{r.enrollment_no}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ ...styles.badge, ...statusColors[r.status] }}>{r.status}</span>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 3 }}>
                        {r.method} {r.confidence ? `· ${(r.confidence * 100).toFixed(0)}%` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '28px 32px', flex: 1, maxWidth: 1100 },
  header: { marginBottom: 24 },
  title: { fontSize: '1.7rem', fontWeight: 800, color: '#0f172a', marginBottom: 4 },
  sub: { fontSize: '0.85rem', color: '#64748b' },
  msg: { borderRadius: 10, padding: '10px 16px', fontSize: '0.85rem', marginBottom: 20, border: '1px solid' },
  cols: { display: 'flex', gap: 20, alignItems: 'flex-start' },
  col: { flex: 1, display: 'flex', flexDirection: 'column', gap: 16 },
  card: { background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  cardTitle: { fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: 14 },
  cardSub: { fontSize: '0.8rem', color: '#64748b', marginBottom: 14, marginTop: -8 },
  label: { display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 },
  labelText: { fontSize: '0.8rem', fontWeight: 600, color: '#475569' },
  input: { padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.9rem', fontFamily: 'Sora, sans-serif', outline: 'none', color: '#1e293b' },
  select: { padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.9rem', fontFamily: 'Sora, sans-serif', outline: 'none', color: '#1e293b', background: '#fff' },
  startBtn: { background: '#22c55e', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Sora, sans-serif', width: '100%', marginTop: 4 },
  closeBtn: { background: '#ef4444', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Sora, sans-serif', width: '100%', marginTop: 12 },
  sessionInfo: { background: '#f8fafc', borderRadius: 10, padding: '14px', marginBottom: 4 },
  sessionRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sessionKey: { fontSize: '0.78rem', color: '#64748b', fontWeight: 600 },
  sessionVal: { fontSize: '0.82rem', color: '#0f172a', fontFamily: 'JetBrains Mono, monospace' },
  infoCard: { background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 14, padding: '18px', textAlign: 'center' },
  refreshBtn: { background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 12px', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'Sora, sans-serif', color: '#475569' },
  emptyRecords: { textAlign: 'center', padding: '40px 20px' },
  recordsList: { display: 'flex', flexDirection: 'column', gap: 10 },
  recordRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#f8fafc', borderRadius: 10 },
  badge: { borderRadius: 20, padding: '3px 10px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-block' },
};
