import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor DEBE estar aquí, antes de las funciones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('Token enviado:', token); // Debug
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data)
};

export const postsAPI = {
  getAll: () => api.get('/posts'),
  create: (data) => api.post('/posts', data),
  delete: (id) => api.delete(`/posts/${id}`),
  getByUser: (userId) => api.get(`/users/${userId}/posts`)
};

// Nuevo objeto para usuarios:
export const usersAPI = {
  getById: (userId) => api.get(`/users/${userId}`)
};

export default api;