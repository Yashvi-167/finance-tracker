import api from './axios';

export const getAll = (params) => api.get('/customers', { params });
export const getById = (id) => api.get(`/customers/${id}`);
export const create = (data) => api.post('/customers', data);
export const update = (id, data) => api.put(`/customers/${id}`, data);
export const remove = (id) => api.delete(`/customers/${id}`);
export const getOrders = (id) => api.get(`/customers/${id}/orders`);
