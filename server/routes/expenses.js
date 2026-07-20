const express = require('express');
const router = express.Router();
const { getAll, getById, create, update, remove, getSummary } = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

// IMPORTANT: /summary must come before /:id to prevent route collision
router.get('/summary', protect, getSummary);
router.get('/', protect, getAll);
router.get('/:id', protect, getById);
router.post('/', protect, create);
router.put('/:id', protect, update);
router.delete('/:id', protect, remove);

module.exports = router;
