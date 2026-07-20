import api from './axios';

export const getAll = (params) => api.get('/products', { params });
export const getById = (id) => api.get(`/products/${id}`);
export const create = (data) => api.post('/products', data);
export const update = (id, data) => api.put(`/products/${id}`, data);
export const remove = (id) => api.delete(`/products/${id}`);
