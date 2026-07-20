import api from './axios';

export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export const signup = (name, email, password, role) =>
  api.post('/auth/signup', { name, email, password, role });

export const getMe = () => api.get('/auth/me');
