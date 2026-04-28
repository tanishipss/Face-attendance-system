import React, { useState } from 'react';
import api from '../api';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login(username, password);
      localStorage.setItem('ap_token', data.access_token);
      localStorage.setItem('ap_user', JSON.stringify({ role: data.role, name: data.full_name }));
      onLogin({ role: data.role, name: data.full_name });
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Left Panel */}
      <div style={styles.left}>
        <div style={styles.leftInner}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>🎓</span>
          </div>
          <h1 style={styles.brand}>Attendance Pro</h1>
          <p style={styles.tagline}>AI-powered face recognition<br/>attendance system</p>
          <div style={styles.featureList}>
            {['Face Recognition with DeepFace', 'Anti-spoofing liveness detection', 'Real-time dashboard & analytics', 'Excel / CSV export'].map(f => (
              <div key={f} style={styles.feature}>
                <span style={styles.featureDot}>✓</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
          <div style={styles.version}>v2.0 — Now with AI</div>
        </div>
        <div style={styles.bgBlob1} />
        <div style={styles.bgBlob2} />
      </div>

      {/* Right Panel */}
      <div style={styles.right}>
        <div style={styles.card}>
          <div style={styles.welcomeRow}>
            <span style={{ fontSize: 32 }}>👋</span>
            <div>
              <h2 style={styles.welcomeTitle}>Welcome Back!</h2>
              <p style={styles.welcomeSub}>Sign in to your account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <label style={styles.label}>
              <span style={styles.labelText}>👤 Username</span>
              <input
                style={styles.input}
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                autoFocus
              />
            </label>

            <label style={styles.label}>
              <span style={styles.labelText}>🔒 Password</span>
              <div style={styles.pwWrap}>
                <input
                  style={{ ...styles.input, paddingRight: 48 }}
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button type="button" style={styles.eyeBtn} onClick={() => setShowPw(p => !p)}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </label>

            {error && <div style={styles.errorBox}>{error}</div>}

            <button style={{ ...styles.loginBtn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
              {loading ? '⏳ Signing in...' : '🔓 Login'}
            </button>
          </form>

          <div style={styles.defaultCreds}>
            <span style={{ fontSize: 14, color: '#64748b' }}>🛡️ Default credentials: </span>
            <code style={styles.cred}>admin</code>
            <span style={{ color: '#94a3b8' }}> / </span>
            <code style={styles.cred}>admin123</code>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', minHeight: '100vh', fontFamily: 'Sora, sans-serif' },
  left: {
    flex: '0 0 45%', background: 'linear-gradient(135deg, #14532d 0%, #15803d 50%, #16a34a 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden', padding: '3rem',
  },
  leftInner: { position: 'relative', zIndex: 1, color: '#fff' },
  logo: {
    width: 72, height: 72, background: 'rgba(255,255,255,0.15)',
    borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 36, marginBottom: 20, backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  logoIcon: {},
  brand: { fontSize: '2.4rem', fontWeight: 800, color: '#fff', marginBottom: 8, lineHeight: 1.1 },
  tagline: { fontSize: '1rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, marginBottom: 32 },
  featureList: { display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 },
  feature: { display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' },
  featureDot: {
    width: 22, height: 22, background: '#4ade80', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 700, color: '#14532d', flexShrink: 0,
  },
  version: {
    display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8rem',
    background: 'rgba(74,222,128,0.2)', border: '1px solid rgba(74,222,128,0.3)',
    borderRadius: 30, padding: '5px 14px', color: '#86efac',
  },
  bgBlob1: {
    position: 'absolute', top: -60, right: -60, width: 240, height: 240,
    background: 'rgba(134,239,172,0.15)', borderRadius: '50%', pointerEvents: 'none',
  },
  bgBlob2: {
    position: 'absolute', bottom: -50, left: -50, width: 200, height: 200,
    background: 'rgba(254,240,138,0.12)', borderRadius: '50%', pointerEvents: 'none',
  },
  right: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#f8fafc', padding: '2rem',
  },
  card: {
    background: '#fff', borderRadius: 20, padding: '2.5rem', width: '100%',
    maxWidth: 440, boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
    border: '1px solid #f1f5f9',
  },
  welcomeRow: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 },
  welcomeTitle: { fontSize: '1.6rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 },
  welcomeSub: { color: '#64748b', fontSize: '0.9rem', marginTop: 2 },
  form: { display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 20 },
  label: { display: 'flex', flexDirection: 'column', gap: 6 },
  labelText: { fontSize: '0.85rem', fontWeight: 600, color: '#374151' },
  input: {
    width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0',
    borderRadius: 10, fontSize: '0.95rem', outline: 'none', fontFamily: 'Sora, sans-serif',
    transition: 'border-color 0.2s, box-shadow 0.2s', color: '#1e293b',
    background: '#fafafa',
  },
  pwWrap: { position: 'relative' },
  eyeBtn: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 0,
  },
  errorBox: {
    background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
    borderRadius: 8, padding: '10px 14px', fontSize: '0.85rem',
  },
  loginBtn: {
    background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff',
    border: 'none', borderRadius: 12, padding: '13px', fontSize: '1rem',
    fontWeight: 700, cursor: 'pointer', fontFamily: 'Sora, sans-serif',
    boxShadow: '0 4px 14px rgba(34,197,94,0.35)', transition: 'transform 0.15s, box-shadow 0.15s',
  },
  defaultCreds: {
    background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10,
    padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 4,
    flexWrap: 'wrap',
  },
  cred: {
    background: '#dcfce7', color: '#15803d', borderRadius: 6, padding: '2px 8px',
    fontFamily: 'JetBrains Mono, monospace', fontSize: '0.88rem', fontWeight: 600,
  },
};
