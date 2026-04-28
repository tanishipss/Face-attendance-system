import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../api';

function StatCard({ icon, label, value, sub, subColor }) {
  return (
    <div style={sc.card}>
      <div style={sc.top}>
        <span style={sc.icon}>{icon}</span>
        <span style={sc.label}>{label}</span>
      </div>
      <div style={sc.value}>{value}</div>
      {sub && <div style={{ ...sc.sub, color: subColor || '#64748b' }}>{sub}</div>}
    </div>
  );
}

const sc = {
  card: {
    background: '#fff', borderRadius: 14, padding: '20px 22px',
    border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    flex: '1 1 200px',
  },
  top: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 },
  icon: { fontSize: 22 },
  label: { fontSize: '0.82rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' },
  value: { fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 },
  sub: { fontSize: '0.8rem', marginTop: 6 },
};

export default function Dashboard({ user }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.overviewStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const attendanceRate = stats?.total_students > 0
    ? ((stats.today_present / stats.total_students) * 100).toFixed(1)
    : '0.0';

  return (
    <div style={styles.page} className="fade-in">
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.date}>📅 {today}</p>
        </div>
        <div style={styles.statusBadge}>
          <span style={styles.statusDot} />
          System Online
        </div>
      </div>

      {loading ? (
        <div style={styles.loader}>Loading stats...</div>
      ) : (
        <>
          {/* Stat Cards */}
          <div style={styles.statRow}>
            <StatCard icon="👨‍🎓" label="Total Students" value={stats?.total_students ?? 0} sub="With face registered" />
            <StatCard icon="✅" label="Present Today" value={stats?.today_present ?? 0} sub={`${attendanceRate}% of registered`} subColor="#22c55e" />
            <StatCard icon="📋" label="Sessions Today" value={stats?.today_sessions ?? 0} sub="Classes conducted" />
            <StatCard icon="📈" label="Attendance Rate" value={`${attendanceRate}%`} sub="Today's rate" subColor={parseFloat(attendanceRate) >= 75 ? '#22c55e' : '#ef4444'} />
          </div>

          {/* Charts Row */}
          <div style={styles.chartRow}>
            {/* Weekly Trend */}
            <div style={styles.chartCard}>
              <div style={styles.chartTitle}>📊 Weekly Attendance Trend</div>
              {stats?.weekly_trend?.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={stats.weekly_trend} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontFamily: 'Sora, sans-serif', fontSize: 13 }} />
                    <Line type="monotone" dataKey="present_count" stroke="#22c55e" strokeWidth={2.5} dot={{ fill: '#22c55e', r: 4 }} name="Present" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={styles.noData}>📭 No trend data yet — mark some attendance first</div>
              )}
            </div>

            {/* Subject Stats */}
            <div style={styles.chartCard}>
              <div style={styles.chartTitle}>📚 Attendance by Subject</div>
              {stats?.subject_stats?.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.subject_stats} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontFamily: 'Sora, sans-serif', fontSize: 13 }} />
                    <Bar dataKey="present" fill="#22c55e" radius={[6, 6, 0, 0]} name="Present" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={styles.noData}>📭 No subject data yet</div>
              )}
            </div>
          </div>

          {/* Info Banner */}
          <div style={styles.banner}>
            <span style={{ fontSize: 20 }}>✅</span>
            <div>
              <div style={{ fontWeight: 600, color: '#15803d' }}>System is running smoothly</div>
              <div style={{ fontSize: '0.82rem', color: '#4ade80', marginTop: 2 }}>All services online · Database up to date</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  page: { padding: '28px 32px', maxWidth: 1200, flex: 1 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  title: { fontSize: '1.7rem', fontWeight: 800, color: '#0f172a', marginBottom: 4 },
  date: { fontSize: '0.85rem', color: '#64748b' },
  statusBadge: {
    display: 'flex', alignItems: 'center', gap: 8, background: '#f0fdf4',
    border: '1px solid #bbf7d0', borderRadius: 20, padding: '6px 14px',
    fontSize: '0.82rem', fontWeight: 600, color: '#15803d',
  },
  statusDot: { width: 8, height: 8, background: '#22c55e', borderRadius: '50%', animation: 'pulse 2s infinite' },
  statRow: { display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 },
  loader: { color: '#64748b', padding: 40, textAlign: 'center', fontSize: '0.9rem' },
  chartRow: { display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 },
  chartCard: {
    flex: '1 1 340px', background: '#fff', borderRadius: 14, padding: '20px 22px',
    border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  chartTitle: { fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: 16 },
  noData: { color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '40px 20px' },
  banner: {
    background: 'linear-gradient(135deg, #14532d, #15803d)', borderRadius: 14,
    padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 14, color: '#fff',
  },
};
