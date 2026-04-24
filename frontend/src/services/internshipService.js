// frontend/src/services/internshipService.js
import api from './api';

export const getInternships = (params) => api.get('/internships', { params });
export const createInternship = (data) => api.post('/internships', data);
