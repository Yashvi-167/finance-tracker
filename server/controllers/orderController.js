const prisma = require('../config/db');

// Generate next order number like ORD-001
const generateOrderNumber = async () => {
  const count = await prisma.order.count();
  return `ORD-${String(count + 1).padStart(4, '0')}`;
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Protected
const getAll = async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;

  const where = {};
  if (status && status !== 'ALL') {
    where.status = status;
  }
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: 'insensitive' } },
      { customer: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        items: {
          include: { product: { select: { name: true, costPrice: true, shippingCost: true } } },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  res.json({
    success: true,
    data: orders,
    pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
  });
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Protected
const getById = async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      customer: true,
      items: {
        include: { product: { select: { id: true, name: true, category: true, costPrice: true, shippingCost: true } } },
      },
    },
  });

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  res.json({ success: true, data: order });
};

// @desc    Create order
// @route   POST /api/orders
// @access  Protected
const create = async (req, res) => {
  const { customerId, items, notes } = req.body;

  if (!customerId || !items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Customer and at least one item are required' });
  }

  // Verify customer exists
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) {
    return res.status(404).json({ success: false, message: 'Customer not found' });
  }

  // Validate all products and check stock
  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

  if (products.length !== productIds.length) {
    return res.status(400).json({ success: false, message: 'One or more products not found' });
  }

  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

  for (const item of items) {
    const product = productMap[item.productId];
    if (product.quantity < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for "${product.name}". Available: ${product.quantity}`,
      });
    }
  }

  // Calculate total
  const totalAmount = items.reduce((sum, item) => {
    const product = productMap[item.productId];
    return sum + (item.unitPrice || product.price) * item.quantity;
  }, 0);

  const orderNumber = await generateOrderNumber();

  // Create order and deduct stock in a transaction
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        customerId,
        totalAmount,
        notes,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: parseInt(item.quantity),
            unitPrice: parseFloat(item.unitPrice || productMap[item.productId].price),
          })),
        },
      },
      include: {
        customer: true,
        items: { include: { product: { select: { name: true } } } },
      },
    });

    // Deduct stock
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { quantity: { decrement: parseInt(item.quantity) } },
      });
    }

    return newOrder;
  });

  res.status(201).json({ success: true, message: 'Order created', data: order });
};

// @desc    Update order (status/notes/items)
// @route   PUT /api/orders/:id
// @access  Protected
const update = async (req, res) => {
  const { status, notes, items } = req.body;

  const existing = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: true },
  });
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  // If items are provided, we need to completely rebuild the order items and adjust stock
  if (items && Array.isArray(items)) {
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    if (products.length !== productIds.length) {
      return res.status(400).json({ success: false, message: 'One or more products not found' });
    }
    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

    // Calculate new total
    const totalAmount = items.reduce((sum, item) => {
      const product = productMap[item.productId];
      return sum + (item.unitPrice || product.price) * item.quantity;
    }, 0);

    const order = await prisma.$transaction(async (tx) => {
      // Restore stock for old items if order wasn't cancelled or delivered
      if (existing.status !== 'CANCELLED' && existing.status !== 'DELIVERED') {
        for (const oldItem of existing.items) {
          await tx.product.update({
            where: { id: oldItem.productId },
            data: { quantity: { increment: oldItem.quantity } },
          });
        }
      }

      // Delete old items
      await tx.orderItem.deleteMany({ where: { orderId: req.params.id } });

      // Deduct stock for new items (if new status is not cancelled)
      const finalStatus = status || existing.status;
      if (finalStatus !== 'CANCELLED' && finalStatus !== 'DELIVERED') {
        for (const item of items) {
          const p = await tx.product.findUnique({ where: { id: item.productId } });
          if (p.quantity < item.quantity) {
            throw new Error(`Insufficient stock for "${p.name}". Available: ${p.quantity}`);
          }
          await tx.product.update({
            where: { id: item.productId },
            data: { quantity: { decrement: parseInt(item.quantity) } },
          });
        }
      }

      // Create new items and update order
      return tx.order.update({
        where: { id: req.params.id },
        data: {
          ...(status && { status }),
          ...(notes !== undefined && { notes }),
          totalAmount,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: parseInt(item.quantity),
              unitPrice: parseFloat(item.unitPrice || productMap[item.productId].price),
            })),
          },
        },
        include: {
          customer: { select: { name: true } },
          items: { include: { product: { select: { name: true } } } },
        },
      });
    });

    return res.json({ success: true, message: 'Order updated', data: order });
  }

  // If no items provided, just update status/notes
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: {
      ...(status && { status }),
      ...(notes !== undefined && { notes }),
    },
    include: {
      customer: { select: { name: true } },
      items: { include: { product: { select: { name: true } } } },
    },
  });

  res.json({ success: true, message: 'Order updated', data: order });
};

// @desc    Delete order (restores stock if not delivered)
// @route   DELETE /api/orders/:id
// @access  Protected (Admin)
const remove = async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: true },
  });

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  await prisma.$transaction(async (tx) => {
    // Restore stock if not delivered
    if (order.status !== 'DELIVERED') {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { increment: item.quantity } },
        });
      }
    }

    await tx.order.delete({ where: { id: req.params.id } });
  });

  res.json({ success: true, message: 'Order deleted and stock restored' });
};

// @desc    Get invoice data for PDF
// @route   GET /api/orders/:id/invoice
// @access  Protected
const getInvoice = async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      customer: true,
      items: {
        include: { product: { select: { name: true, category: true } } },
      },
    },
  });

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  res.json({ success: true, data: order });
};

module.exports = { getAll, getById, create, update, remove, getInvoice };
