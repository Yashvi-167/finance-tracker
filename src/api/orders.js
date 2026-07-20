import api from './axios';

export const getAll = (params) => api.get('/orders', { params });
export const getById = (id) => api.get(`/orders/${id}`);
export const create = (data) => api.post('/orders', data);
export const update = (id, data) => api.put(`/orders/${id}`, data);
export const remove = (id) => api.delete(`/orders/${id}`);
export const getInvoice = (id) => api.get(`/orders/${id}/invoice`);
