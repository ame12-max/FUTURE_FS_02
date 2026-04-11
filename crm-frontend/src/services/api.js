import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
};

export const leadsAPI = {
  getAll: (url = '/leads') => api.get(url),
  getOne: (id) => api.get(`/leads/${id}`),
   getAnalytics: () => api.get('/leads/analytics'),

  create: (leadData) => api.post('/leads', leadData),
  updateStatus: (id, status) => api.put(`/leads/${id}/status`, { status }),
  delete: (id) => api.delete(`/leads/${id}`),
};

export const notesAPI = {
  getForLead: (leadId) => api.get(`/notes/lead/${leadId}`),
  add: (leadId, note) => api.post(`/notes/lead/${leadId}`, { note }),
};

export default api;