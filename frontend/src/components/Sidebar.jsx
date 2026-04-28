import React from 'react';

const navItems = [
  { id: 'dashboard',   icon: '🏠', label: 'Dashboard' },
  { id: 'attendance',  icon: '📋', label: 'Take Attendance' },
  { id: 'students',    icon: '👨‍🎓', label: 'Students' },
  { id: 'subjects',    icon: '📚', label: 'Subjects' },
  { id: 'records',     icon: '📊', label: 'View Records' },
  { id: 'register',    icon: '🤳', label: 'Register Face' },
  { id: 'admin',       icon: '⚙️',  label: 'Admin Panel', adminOnly: true },
];

export default function Sidebar({ current, onNav, user, onLogout }) {
  const items = navItems.filter(i => !i.adminOnly || user?.role === 'admin');

  return (
    <aside style={styles.sidebar}>
      {/* Brand */}
      <div style={styles.brand}>
        <div style={styles.brandIcon}>🎓</div>
        <div>
          <div style={styles.brandName}>Attendance Pro</div>
          <div style={styles.brandSub}>Smart Attendance System</div>
        </div>
      </div>

      <div style={styles.divider} />

      {/* Nav Label */}
      <div style={styles.sectionLabel}>MAIN MENU</div>

      {/* Nav Items */}
      <nav style={styles.nav}>
        {items.map(item => {
          const active = current === item.id;
          return (
            <button
              key={item.id}
              style={{ ...styles.navItem, ...(active ? styles.navItemActive : {}) }}
              onClick={() => onNav(item.id)}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              <span style={styles.navLabel}>{item.label}</span>
              {active && <span style={styles.navActiveDot} />}
            </button>
          );
        })}
      </nav>

      <div style={{ flex: 1 }} />

      {/* User Card */}
      <div style={styles.userCard}>
        <div style={styles.avatar}>{user?.name?.[0] || '?'}</div>
        <div style={styles.userInfo}>
          <div style={styles.userName}>{user?.name || 'User'}</div>
          <div style={styles.userRole}>{user?.role || ''}</div>
        </div>
        <button style={styles.logoutBtn} onClick={onLogout} title="Logout">⏏</button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 260, minHeight: '100vh', background: '#fff',
    borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column',
    padding: '0 0 16px 0', flexShrink: 0, position: 'sticky', top: 0, height: '100vh',
    overflowY: 'auto',
  },
  brand: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '20px 20px 16px 20px',
  },
  brandIcon: {
    width: 44, height: 44, background: 'linear-gradient(135deg, #22c55e, #15803d)',
    borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 22, flexShrink: 0,
  },
  brandName: { fontSize: '1rem', fontWeight: 700, color: '#0f172a' },
  brandSub: { fontSize: '0.72rem', color: '#64748b', marginTop: 1 },
  divider: { height: 1, background: '#f1f5f9', margin: '0 16px' },
  sectionLabel: {
    fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8',
    letterSpacing: '0.1em', padding: '14px 20px 8px 20px',
  },
  nav: { display: 'flex', flexDirection: 'column', gap: 2, padding: '0 10px' },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
    borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer',
    fontFamily: 'Sora, sans-serif', fontSize: '0.875rem', fontWeight: 500,
    color: '#475569', transition: 'all 0.15s', textAlign: 'left', position: 'relative',
  },
  navItemActive: {
    background: '#f0fdf4', color: '#15803d', fontWeight: 600,
  },
  navIcon: { fontSize: 18, flexShrink: 0 },
  navLabel: { flex: 1 },
  navActiveDot: {
    width: 6, height: 6, background: '#22c55e', borderRadius: '50%',
  },
  userCard: {
    display: 'flex', alignItems: 'center', gap: 10, margin: '8px 10px 0',
    padding: '12px 14px', background: '#f8fafc', borderRadius: 12,
    border: '1px solid #e2e8f0',
  },
  avatar: {
    width: 36, height: 36, background: 'linear-gradient(135deg, #22c55e, #15803d)',
    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16, fontWeight: 700, color: '#fff', flexShrink: 0, textTransform: 'uppercase',
  },
  userInfo: { flex: 1, minWidth: 0 },
  userName: { fontSize: '0.82rem', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userRole: { fontSize: '0.72rem', color: '#64748b', textTransform: 'capitalize' },
  logoutBtn: {
    background: 'none', border: 'none', cursor: 'pointer', fontSize: 16,
    color: '#94a3b8', padding: 4, borderRadius: 6,
    transition: 'color 0.15s',
  },
};
