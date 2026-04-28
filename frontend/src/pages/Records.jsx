import React, { useState, useEffect } from 'react';
import api from '../api';

export default function Records() {
  const [subjects, setSubjects] = useState([]);
  const [filterSubject, setFilterSubject] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [enrollSearch, setEnrollSearch] = useState('');
  const [studentRecords, setStudentRecords] = useState(null);
  const [loadingSR, setLoadingSR] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.listSubjects().then(setSubjects).catch(console.error);
  }, []);

  const searchStudent = async () => {
    if (!enrollSearch.trim()) { setMsg('❌ Enter enrollment number'); return; }
    setLoadingSR(true); setMsg('');
    try {
      const records = await api.studentAttendance(enrollSearch.trim());
      setStudentRecords(records);
      if (records.length === 0) setMsg('ℹ️ No records found for this student');
    } catch (err) {
      setMsg('❌ ' + err.message);
    } finally {
      setLoadingSR(false);
    }
  };

  const downloadFile = async (type) => {
    setMsg('');
    try {
      const params = {};
      if (filterSubject) params.subject_id = filterSubject;
      if (filterDate) params.date = filterDate;
      const res = type === 'excel' ? await api.exportExcel(params) : await api.exportCSV(params);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_report.${type === 'excel' ? 'xlsx' : 'csv'}`;
      a.click();
      URL.revokeObjectURL(url);
      setMsg(`✅ ${type.toUpperCase()} downloaded`);
    } catch (err) {
      setMsg('❌ Export failed: ' + err.message);
    }
  };

  const statusColors = { present: { bg: '#dcfce7', color: '#15803d' }, absent: { bg: '#fee2e2', color: '#dc2626' }, late: { bg: '#fef3c7', color: '#92400e' } };

  return (
    <div style={styles.page} className="fade-in">
      <div style={styles.header}>
        <h1 style={styles.title}>📊 View Records</h1>
        <p style={styles.sub}>Browse and export attendance data</p>
      </div>

      {msg && <div style={{ ...styles.msg, background: msg.startsWith('✅') ? '#f0fdf4' : msg.startsWith('ℹ️') ? '#eff6ff' : '#fef2f2', borderColor: msg.startsWith('✅') ? '#bbf7d0' : msg.startsWith('ℹ️') ? '#bfdbfe' : '#fecaca', color: msg.startsWith('✅') ? '#15803d' : msg.startsWith('ℹ️') ? '#1d4ed8' : '#dc2626' }}>{msg}</div>}

      <div style={styles.cols}>
        {/* Left: Student Search */}
        <div style={styles.leftCol}>
          <div style={styles.card}>
            <div style={styles.cardTitle}>🔍 Student Attendance</div>
            <p style={styles.cardSub}>View attendance history for a specific student</p>
            <div style={styles.searchRow}>
              <input
                style={styles.input}
                placeholder="Enrollment No..."
                value={enrollSearch}
                onChange={e => setEnrollSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchStudent()}
              />
              <button style={styles.searchBtn} onClick={searchStudent} disabled={loadingSR}>
                {loadingSR ? '...' : '→'}
              </button>
            </div>

            {studentRecords && studentRecords.length > 0 && (
              <div style={styles.srList}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: 10 }}>
                  {studentRecords.length} record(s) found
                </div>
                {studentRecords.map((r, i) => (
                  <div key={i} style={styles.srRow}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{r.subject}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{r.date}</div>
                    </div>
                    <span style={{ ...styles.badge, ...statusColors[r.status] }}>{r.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Export */}
        <div style={styles.rightCol}>
          <div style={styles.card}>
            <div style={styles.cardTitle}>⬇️ Export Attendance</div>
            <p style={styles.cardSub}>Download attendance data as Excel or CSV</p>

            <label style={styles.label}>
              <span style={styles.labelText}>Filter by Subject</span>
              <select style={styles.select} value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
                <option value="">All Subjects</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </label>

            <label style={styles.label}>
              <span style={styles.labelText}>Filter by Date</span>
              <input type="date" style={styles.input} value={filterDate} onChange={e => setFilterDate(e.target.value)} />
            </label>

            <div style={styles.exportBtns}>
              <button style={{ ...styles.exportBtn, background: '#15803d' }} onClick={() => downloadFile('excel')}>
                <span>📊</span> Export Excel (.xlsx)
              </button>
              <button style={{ ...styles.exportBtn, background: '#1d4ed8' }} onClick={() => downloadFile('csv')}>
                <span>📄</span> Export CSV
              </button>
            </div>
          </div>

          <div style={styles.infoCard}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#92400e', marginBottom: 8 }}>📋 Export Tips</div>
            <ul style={{ fontSize: '0.82rem', color: '#78350f', lineHeight: 1.8, paddingLeft: 16 }}>
              <li>Leave filters empty to export all data</li>
              <li>Excel format includes color coding by status</li>
              <li>CSV format works with any spreadsheet app</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '28px 32px', maxWidth: 1000, flex: 1 },
  header: { marginBottom: 24 },
  title: { fontSize: '1.7rem', fontWeight: 800, color: '#0f172a', marginBottom: 4 },
  sub: { fontSize: '0.85rem', color: '#64748b' },
  msg: { borderRadius: 10, padding: '10px 16px', fontSize: '0.85rem', marginBottom: 20, border: '1px solid' },
  cols: { display: 'flex', gap: 20, alignItems: 'flex-start' },
  leftCol: { flex: 1 },
  rightCol: { flex: 1, display: 'flex', flexDirection: 'column', gap: 16 },
  card: { background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  cardTitle: { fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: 6 },
  cardSub: { fontSize: '0.8rem', color: '#64748b', marginBottom: 14 },
  searchRow: { display: 'flex', gap: 8, marginBottom: 16 },
  input: { flex: 1, padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.9rem', fontFamily: 'Sora, sans-serif', outline: 'none', color: '#1e293b' },
  searchBtn: { background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: '1rem', cursor: 'pointer', fontWeight: 700 },
  srList: { borderTop: '1px solid #f1f5f9', paddingTop: 12 },
  srRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f8fafc' },
  badge: { borderRadius: 20, padding: '3px 10px', fontSize: '0.75rem', fontWeight: 600 },
  label: { display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 },
  labelText: { fontSize: '0.8rem', fontWeight: 600, color: '#475569' },
  select: { padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.9rem', fontFamily: 'Sora, sans-serif', outline: 'none', color: '#1e293b', background: '#fff' },
  exportBtns: { display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 },
  exportBtn: { color: '#fff', border: 'none', borderRadius: 10, padding: '11px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Sora, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  infoCard: { background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 14, padding: '18px' },
};
