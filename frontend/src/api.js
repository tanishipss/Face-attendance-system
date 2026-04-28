const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function getToken() {
  return localStorage.getItem('ap_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('ap_token');
    localStorage.removeItem('ap_user');
    window.location.reload();
    return;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }

  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res;
}

export const api = {
  // Auth
  login: (username, password) => {
    const form = new URLSearchParams({ username, password });
    return fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
    }).then(async r => {
      if (!r.ok) { const e = await r.json(); throw new Error(e.detail || 'Login failed'); }
      return r.json();
    });
  },
  me: () => request('/api/auth/me'),
  listUsers: () => request('/api/auth/users'),
  registerUser: (data) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  // Students
  listStudents: () => request('/api/admin/students'),
  createStudent: (data) => request('/api/admin/students', { method: 'POST', body: JSON.stringify(data) }),
  deleteStudent: (enrollment_no) => request(`/api/admin/students/${enrollment_no}`, { method: 'DELETE' }),

  // Subjects
  listSubjects: () => request('/api/attendance/subjects'),
  createSubject: (data) => request('/api/attendance/subjects', { method: 'POST', body: JSON.stringify(data) }),

  // Attendance
  overviewStats: () => request('/api/attendance/stats/overview'),
  createSession: (data) => request('/api/attendance/session/create', { method: 'POST', body: JSON.stringify(data) }),
  closeSession: (id) => request(`/api/attendance/session/${id}/close`, { method: 'POST' }),
  getSessionRecords: (id) => request(`/api/attendance/session/${id}`),
  markManual: (data) => request('/api/attendance/manual', { method: 'POST', body: JSON.stringify(data) }),
  studentAttendance: (enrollment_no) => request(`/api/attendance/student/${enrollment_no}`),

  // Face — FIXED: backend expects JSON with base64, not FormData
  registerFace: ({ enrollment_no, name, image_base64 }) => {
    return request('/api/face/register', {
      method: 'POST',
      body: JSON.stringify({ enrollment_no, name, image_base64 }),
    });
  },
  recognizeFace: ({ image_base64, subject_code, session_id }) => {
    return request('/api/face/recognize', {
      method: 'POST',
      body: JSON.stringify({ image_base64, subject_code, session_id }),
    });
  },

  // Export
  exportCSV: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    const token = getToken();
    return fetch(`${API_BASE}/api/export/attendance/csv${q ? '?' + q : ''}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
  },
  exportExcel: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    const token = getToken();
    return fetch(`${API_BASE}/api/export/attendance/excel${q ? '?' + q : ''}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
  },
};

export default api;