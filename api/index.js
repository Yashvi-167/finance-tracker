const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('../server/routes/auth');
const productRoutes = require('../server/routes/products');
const customerRoutes = require('../server/routes/customers');
const orderRoutes = require('../server/routes/orders');
const dashboardRoutes = require('../server/routes/dashboard');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', serverless: true }));

module.exports = app;