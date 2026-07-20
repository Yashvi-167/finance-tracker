const express = require('express');
const router = express.Router();
const { getAll, getById, create, update, remove, getOrders } = require('../controllers/customerController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, getAll);
router.get('/:id/orders', protect, getOrders);
router.get('/:id', protect, getById);
router.post('/', protect, create);
router.put('/:id', protect, update);
router.delete('/:id', protect, adminOnly, remove);

module.exports = router;
