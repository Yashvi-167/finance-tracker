import api from './axios';

export const getReport = (year) => api.get('/sales/report', { params: { year } });
