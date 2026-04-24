// frontend/src/services/authService.js
import api from './api';

export const login = (email, password) => api.post('/auth/login', { email, password });
export const register = (email, password, role) => api.post('/auth/register', { email, password, role });
