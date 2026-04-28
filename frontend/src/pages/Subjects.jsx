import React, { useState, useEffect } from 'react';
import api from '../api';

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', name: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = () => {
    setLoading(true);
    api.listSubjects().then(setSubjects).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg('');
    try {
      await api.createSubject(form);
      setMsg('✅ Subject created!');
      setForm({ code: '', name: '' });
      setShowForm(false);
      load();
    } catch (err) {
      setMsg('❌ ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.page} className="fade-in">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📚 Subjects</h1>
          <p style={styles.sub}>{subjects.length} subject{subjects.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button style={styles.addBtn} onClick={() => setShowForm(p => !p)}>
          {showForm ? '✕ Cancel' : '+ Add Subject'}
        </button>
      </div>

      {msg && <div style={{ ...styles.msg, background: msg.startsWith('✅') ? '#f0fdf4' : '#fef2f2', borderColor: msg.startsWith('✅') ? '#bbf7d0' : '#fecaca', color: msg.startsWith('✅') ? '#15803d' : '#dc2626' }}>{msg}</div>}

      {showForm && (
        <div style={styles.formCard}>
          <div style={styles.formTitle}>Add New Subject</div>
          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.label}>
              <span style={styles.labelText}>Subject Code *</span>
              <input style={styles.input} value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} placeholder="e.g. CS101" required />
            </label>
            <label style={styles.label}>
              <span style={styles.labelText}>Subject Name *</span>
              <input style={styles.input} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Data Structures" required />
            </label>
            <button style={styles.submitBtn} type="submit" disabled={saving}>
              {saving ? 'Saving...' : '+ Add Subject'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div style={styles.loader}>Loading subjects...</div>
      ) : subjects.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
          <div style={{ fontWeight: 600, color: '#334155', marginBottom: 6 }}>No subjects yet</div>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Add your first subject above</div>
        </div>
      ) : (
        <div style={styles.grid}>
          {subjects.map(s => (
            <div key={s.id} style={styles.subjectCard}>
              <div style={styles.subjectIcon}>📖</div>
              <div>
                <div style={styles.subjectName}>{s.name}</div>
                <code style={styles.subjectCode}>{s.code}</code>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: '28px 32px', maxWidth: 900, flex: 1 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { fontSize: '1.7rem', fontWeight: 800, color: '#0f172a', marginBottom: 4 },
  sub: { fontSize: '0.85rem', color: '#64748b' },
  addBtn: { background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Sora, sans-serif' },
  msg: { borderRadius: 10, padding: '10px 16px', fontSize: '0.85rem', marginBottom: 16, border: '1px solid' },
  formCard: { background: '#fff', borderRadius: 14, padding: '24px', border: '1px solid #e2e8f0', marginBottom: 20, maxWidth: 500 },
  formTitle: { fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: 16 },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  label: { display: 'flex', flexDirection: 'column', gap: 5 },
  labelText: { fontSize: '0.8rem', fontWeight: 600, color: '#475569' },
  input: { padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.9rem', fontFamily: 'Sora, sans-serif', outline: 'none', color: '#1e293b' },
  submitBtn: { background: '#22c55e', color: '#fff', border: 'none', borderRadius: 10, padding: '10px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Sora, sans-serif', marginTop: 4 },
  loader: { color: '#64748b', padding: 40, textAlign: 'center' },
  empty: { textAlign: 'center', padding: '60px 20px', color: '#64748b' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 },
  subjectCard: { background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 14 },
  subjectIcon: { width: 48, height: 48, background: '#f0fdf4', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 },
  subjectName: { fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: 4 },
  subjectCode: { background: '#f1f5f9', borderRadius: 6, padding: '2px 8px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: '#475569' },
};
