const express = require('express');
const router = express.Router();
const { getReport } = require('../controllers/salesController');
const { protect } = require('../middleware/auth');

router.get('/report', protect, getReport);

module.exports = router;
