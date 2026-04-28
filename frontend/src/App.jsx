import React, { useState, useEffect } from 'react';
import './index.css';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Subjects from './pages/Subjects';
import TakeAttendance from './pages/TakeAttendance';
import Records from './pages/Records';
import RegisterFace from './pages/RegisterFace';
import AdminPanel from './pages/AdminPanel';

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('dashboard');

  useEffect(() => {
    const token = localStorage.getItem('ap_token');
    const stored = localStorage.getItem('ap_user');
    if (token && stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
  }, []);

  const handleLogin = (userData) => setUser(userData);

  const handleLogout = () => {
    localStorage.removeItem('ap_token');
    localStorage.removeItem('ap_user');
    setUser(null);
    setPage('dashboard');
  };

  if (!user) return <Login onLogin={handleLogin} />;

  const pages = {
    dashboard: <Dashboard user={user} />,
    attendance: <TakeAttendance />,
    students: <Students />,
    subjects: <Subjects />,
    records: <Records />,
    register: <RegisterFace />,
    admin: user.role === 'admin' ? <AdminPanel /> : <Dashboard user={user} />,
  };

  return (
    <div style={styles.app}>
      <Sidebar current={page} onNav={setPage} user={user} onLogout={handleLogout} />
      <main style={styles.main}>
        {pages[page] || <Dashboard user={user} />}
      </main>
    </div>
  );
}

const styles = {
  app: { display: 'flex', minHeight: '100vh' },
  main: { flex: 1, overflowY: 'auto', background: '#f8fafc' },
};

export default App;
