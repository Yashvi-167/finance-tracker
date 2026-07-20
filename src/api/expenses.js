import api from './axios';

export const getAll = (params) => api.get('/expenses', { params });
export const getById = (id) => api.get(`/expenses/${id}`);
export const create = (data) => api.post('/expenses', data);
export const update = (id, data) => api.put(`/expenses/${id}`, data);
export const remove = (id) => api.delete(`/expenses/${id}`);
export const getSummary = () => api.get('/expenses/summary');
