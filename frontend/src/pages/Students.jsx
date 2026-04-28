import React, { useState, useEffect } from 'react';
import api from '../api';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ enrollment_no: '', name: '', email: '', phone: '', department: '', semester: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    api.listStudents().then(setStudents).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg('');
    try {
      await api.createStudent({ ...form, semester: form.semester ? parseInt(form.semester) : null });
      setMsg('✅ Student registered successfully!');
      setForm({ enrollment_no: '', name: '', email: '', phone: '', department: '', semester: '' });
      setShowForm(false);
      load();
    } catch (err) {
      setMsg('❌ ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (enrollment_no, name) => {
    if (!window.confirm(`Delete student "${name}"?`)) return;
    try {
      await api.deleteStudent(enrollment_no);
      setMsg('✅ Student deleted');
      load();
    } catch (err) {
      setMsg('❌ ' + err.message);
    }
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.enrollment_no.toLowerCase().includes(search.toLowerCase()) ||
    (s.department || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.page} className="fade-in">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>👨‍🎓 Students</h1>
          <p style={styles.sub}>{students.length} student{students.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button style={styles.addBtn} onClick={() => setShowForm(p => !p)}>
          {showForm ? '✕ Cancel' : '+ Add Student'}
        </button>
      </div>

      {msg && <div style={{ ...styles.msgBox, background: msg.startsWith('✅') ? '#f0fdf4' : '#fef2f2', borderColor: msg.startsWith('✅') ? '#bbf7d0' : '#fecaca', color: msg.startsWith('✅') ? '#15803d' : '#dc2626' }}>{msg}</div>}

      {showForm && (
        <div style={styles.formCard}>
          <div style={styles.formTitle}>Register New Student</div>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGrid}>
              {[
                { key: 'enrollment_no', label: 'Enrollment No *', required: true },
                { key: 'name', label: 'Full Name *', required: true },
                { key: 'email', label: 'Email' },
                { key: 'phone', label: 'Phone' },
                { key: 'department', label: 'Department' },
                { key: 'semester', label: 'Semester', type: 'number' },
              ].map(({ key, label, required, type }) => (
                <label key={key} style={styles.label}>
                  <span style={styles.labelText}>{label}</span>
                  <input
                    style={styles.input}
                    type={type || 'text'}
                    value={form[key]}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    required={required}
                  />
                </label>
              ))}
            </div>
            <button style={styles.submitBtn} type="submit" disabled={saving}>
              {saving ? 'Saving...' : '+ Register Student'}
            </button>
          </form>
        </div>
      )}

      <div style={styles.searchWrap}>
        <input
          style={styles.search}
          placeholder="🔍 Search by name, enrollment no, or department..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={styles.loader}>Loading students...</div>
      ) : filtered.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👨‍🎓</div>
          <div style={{ fontWeight: 600, color: '#334155', marginBottom: 6 }}>No students found</div>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{search ? 'Try a different search' : 'Add your first student above'}</div>
        </div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Enrollment No</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Department</th>
                <th style={styles.th}>Semester</th>
                <th style={styles.th}>Face</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.enrollment_no} style={styles.tr}>
                  <td style={styles.td}><code style={styles.code}>{s.enrollment_no}</code></td>
                  <td style={styles.td}><strong>{s.name}</strong></td>
                  <td style={styles.td}>{s.department || '—'}</td>
                  <td style={styles.td}>{s.semester || '—'}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, background: s.face_registered ? '#dcfce7' : '#fee2e2', color: s.face_registered ? '#15803d' : '#dc2626' }}>
                      {s.face_registered ? '✅ Registered' : '❌ Not Registered'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button style={styles.deleteBtn} onClick={() => handleDelete(s.enrollment_no, s.name)}>
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: '28px 32px', maxWidth: 1100, flex: 1 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { fontSize: '1.7rem', fontWeight: 800, color: '#0f172a', marginBottom: 4 },
  sub: { fontSize: '0.85rem', color: '#64748b' },
  addBtn: {
    background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff', border: 'none',
    borderRadius: 10, padding: '10px 20px', fontSize: '0.9rem', fontWeight: 600,
    cursor: 'pointer', fontFamily: 'Sora, sans-serif',
  },
  msgBox: { borderRadius: 10, padding: '10px 16px', fontSize: '0.85rem', marginBottom: 16, border: '1px solid' },
  formCard: { background: '#fff', borderRadius: 14, padding: '24px', border: '1px solid #e2e8f0', marginBottom: 20 },
  formTitle: { fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: 16 },
  form: {},
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 16 },
  label: { display: 'flex', flexDirection: 'column', gap: 5 },
  labelText: { fontSize: '0.8rem', fontWeight: 600, color: '#475569' },
  input: {
    padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8,
    fontSize: '0.9rem', fontFamily: 'Sora, sans-serif', outline: 'none', color: '#1e293b',
  },
  submitBtn: {
    background: '#22c55e', color: '#fff', border: 'none', borderRadius: 10,
    padding: '10px 20px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Sora, sans-serif',
  },
  searchWrap: { marginBottom: 16 },
  search: {
    width: '100%', padding: '10px 16px', border: '1.5px solid #e2e8f0',
    borderRadius: 10, fontSize: '0.9rem', fontFamily: 'Sora, sans-serif',
    outline: 'none', color: '#1e293b', background: '#fff',
  },
  loader: { color: '#64748b', padding: 40, textAlign: 'center' },
  empty: { textAlign: 'center', padding: '60px 20px', color: '#64748b' },
  tableWrap: { background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#f8fafc' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' },
  tr: { borderBottom: '1px solid #f1f5f9', transition: 'background 0.1s' },
  td: { padding: '12px 16px', fontSize: '0.875rem', color: '#334155' },
  code: { background: '#f1f5f9', borderRadius: 6, padding: '2px 8px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: '#334155' },
  badge: { borderRadius: 20, padding: '3px 10px', fontSize: '0.75rem', fontWeight: 600 },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: 0.7 },
};
