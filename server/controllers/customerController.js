const prisma = require('../config/db');

// @desc    Get all customers
// @route   GET /api/customers
// @access  Protected
const getAll = async (req, res) => {
  const { search } = req.query;

  const where = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  const customers = await prisma.customer.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { orders: true } },
    },
  });

  res.json({ success: true, data: customers });
};

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Protected
const getById = async (req, res) => {
  const customer = await prisma.customer.findUnique({
    where: { id: req.params.id },
    include: {
      _count: { select: { orders: true } },
    },
  });

  if (!customer) {
    return res.status(404).json({ success: false, message: 'Customer not found' });
  }

  res.json({ success: true, data: customer });
};

// @desc    Create customer
// @route   POST /api/customers
// @access  Protected
const create = async (req, res) => {
  const { name, email, phone, address } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Customer name is required' });
  }

  const customer = await prisma.customer.create({
    data: { name, email, phone, address },
  });

  res.status(201).json({ success: true, message: 'Customer created', data: customer });
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Protected
const update = async (req, res) => {
  const { name, email, phone, address } = req.body;

  const existing = await prisma.customer.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Customer not found' });
  }

  const customer = await prisma.customer.update({
    where: { id: req.params.id },
    data: {
      ...(name && { name }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(address !== undefined && { address }),
    },
  });

  res.json({ success: true, message: 'Customer updated', data: customer });
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Protected (Admin)
const remove = async (req, res) => {
  const existing = await prisma.customer.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Customer not found' });
  }

  const orderCount = await prisma.order.count({ where: { customerId: req.params.id } });
  if (orderCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete customer with ${orderCount} order(s). Delete orders first.`,
    });
  }

  await prisma.customer.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Customer deleted' });
};

// @desc    Get all orders for a customer
// @route   GET /api/customers/:id/orders
// @access  Protected
const getOrders = async (req, res) => {
  const customer = await prisma.customer.findUnique({ where: { id: req.params.id } });
  if (!customer) {
    return res.status(404).json({ success: false, message: 'Customer not found' });
  }

  const orders = await prisma.order.findMany({
    where: { customerId: req.params.id },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: { product: { select: { name: true } } },
      },
    },
  });

  const totalSpent = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  res.json({ success: true, data: { customer, orders, totalSpent } });
};

module.exports = { getAll, getById, create, update, remove, getOrders };
