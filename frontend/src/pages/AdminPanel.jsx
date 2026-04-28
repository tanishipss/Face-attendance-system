import React, { useState, useEffect } from 'react';
import api from '../api';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', full_name: '', role: 'teacher' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = () => {
    setLoading(true);
    api.listUsers().then(setUsers).catch(e => setMsg('❌ ' + e.message)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg('');
    try {
      await api.registerUser(form);
      setMsg('✅ User created successfully!');
      setForm({ username: '', email: '', password: '', full_name: '', role: 'teacher' });
      setShowForm(false);
      load();
    } catch (err) {
      setMsg('❌ ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const roleBadge = { admin: { bg: '#fef3c7', color: '#92400e' }, teacher: { bg: '#dbeafe', color: '#1d4ed8' }, student: { bg: '#dcfce7', color: '#15803d' } };

  return (
    <div style={styles.page} className="fade-in">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>⚙️ Admin Panel</h1>
          <p style={styles.sub}>Manage system users and roles</p>
        </div>
        <button style={styles.addBtn} onClick={() => setShowForm(p => !p)}>
          {showForm ? '✕ Cancel' : '+ Add User'}
        </button>
      </div>

      {msg && <div style={{ ...styles.msg, background: msg.startsWith('✅') ? '#f0fdf4' : '#fef2f2', borderColor: msg.startsWith('✅') ? '#bbf7d0' : '#fecaca', color: msg.startsWith('✅') ? '#15803d' : '#dc2626' }}>{msg}</div>}

      {showForm && (
        <div style={styles.formCard}>
          <div style={styles.formTitle}>Create New User</div>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGrid}>
              {[
                { key: 'full_name', label: 'Full Name *', required: true },
                { key: 'username', label: 'Username *', required: true },
                { key: 'email', label: 'Email *', required: true, type: 'email' },
                { key: 'password', label: 'Password *', required: true, type: 'password' },
              ].map(({ key, label, required, type }) => (
                <label key={key} style={styles.label}>
                  <span style={styles.labelText}>{label}</span>
                  <input style={styles.input} type={type || 'text'} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} required={required} />
                </label>
              ))}
              <label style={styles.label}>
                <span style={styles.labelText}>Role</span>
                <select style={styles.select} value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                  <option value="student">Student</option>
                </select>
              </label>
            </div>
            <button style={styles.submitBtn} type="submit" disabled={saving}>
              {saving ? 'Creating...' : '+ Create User'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div style={styles.loader}>Loading users...</div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Username</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={styles.tr}>
                  <td style={styles.td}><strong>{u.full_name}</strong></td>
                  <td style={styles.td}><code style={styles.code}>{u.username}</code></td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, ...(roleBadge[u.role] || {}) }}>{u.role}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, background: u.is_active ? '#dcfce7' : '#f1f5f9', color: u.is_active ? '#15803d' : '#64748b' }}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={styles.td}>{new Date(u.created_at).toLocaleDateString()}</td>
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
  addBtn: { background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Sora, sans-serif' },
  msg: { borderRadius: 10, padding: '10px 16px', fontSize: '0.85rem', marginBottom: 16, border: '1px solid' },
  formCard: { background: '#fff', borderRadius: 14, padding: '24px', border: '1px solid #e2e8f0', marginBottom: 20 },
  formTitle: { fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: 16 },
  form: {},
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 16 },
  label: { display: 'flex', flexDirection: 'column', gap: 5 },
  labelText: { fontSize: '0.8rem', fontWeight: 600, color: '#475569' },
  input: { padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.9rem', fontFamily: 'Sora, sans-serif', outline: 'none', color: '#1e293b' },
  select: { padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.9rem', fontFamily: 'Sora, sans-serif', outline: 'none', color: '#1e293b', background: '#fff' },
  submitBtn: { background: '#6366f1', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Sora, sans-serif' },
  loader: { color: '#64748b', padding: 40, textAlign: 'center' },
  tableWrap: { background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#f8fafc' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '12px 16px', fontSize: '0.875rem', color: '#334155' },
  code: { background: '#f1f5f9', borderRadius: 6, padding: '2px 8px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: '#334155' },
  badge: { borderRadius: 20, padding: '3px 10px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-block' },
};
