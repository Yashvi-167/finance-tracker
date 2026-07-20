const prisma = require('../config/db');

// @desc    Get all products
// @route   GET /api/products
// @access  Protected
const getAll = async (req, res) => {
  const { search, category } = req.query;

  const where = {};
  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }
  if (category) {
    where.category = { equals: category, mode: 'insensitive' };
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { name: 'asc' },
  });

  const productsWithLowStock = products.map((p) => ({
    ...p,
    isLowStock: p.quantity <= p.lowStockThreshold,
  }));

  res.json({ success: true, data: productsWithLowStock });
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Protected
const getById = async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
  });

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  res.json({ success: true, data: { ...product, isLowStock: product.quantity <= product.lowStockThreshold } });
};

// @desc    Create product
// @route   POST /api/products
// @access  Protected (Admin)
const create = async (req, res) => {
  const { name, category, price, costPrice, shippingCost, quantity, lowStockThreshold, description } = req.body;

  if (!name || !category || price == null || costPrice == null) {
    return res.status(400).json({ success: false, message: 'Name, category, price and cost price are required' });
  }

  const product = await prisma.product.create({
    data: {
      name,
      category,
      price: parseFloat(price),
      costPrice: parseFloat(costPrice),
      shippingCost: parseFloat(shippingCost) || 0,
      quantity: parseInt(quantity) || 0,
      lowStockThreshold: parseInt(lowStockThreshold) || 10,
      description,
    },
  });

  res.status(201).json({ success: true, message: 'Product created', data: product });
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Protected (Admin)
const update = async (req, res) => {
  const { name, category, price, costPrice, shippingCost, quantity, lowStockThreshold, description } = req.body;

  const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: {
      ...(name && { name }),
      ...(category && { category }),
      ...(price != null && { price: parseFloat(price) }),
      ...(costPrice != null && { costPrice: parseFloat(costPrice) }),
      ...(shippingCost != null && { shippingCost: parseFloat(shippingCost) }),
      ...(quantity != null && { quantity: parseInt(quantity) }),
      ...(lowStockThreshold != null && { lowStockThreshold: parseInt(lowStockThreshold) }),
      ...(description !== undefined && { description }),
    },
  });

  res.json({ success: true, message: 'Product updated', data: product });
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Protected (Admin)
const remove = async (req, res) => {
  const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  // Check if product is in any active orders
  const activeOrderItem = await prisma.orderItem.findFirst({
    where: {
      productId: req.params.id,
      order: { status: { in: ['PENDING', 'SHIPPED'] } },
    },
  });

  if (activeOrderItem) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete product with active (pending/shipped) orders',
    });
  }

  await prisma.product.delete({ where: { id: req.params.id } });

  res.json({ success: true, message: 'Product deleted' });
};

module.exports = { getAll, getById, create, update, remove };
