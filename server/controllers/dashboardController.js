const prisma = require('../config/db');
const { subDays, startOfDay, endOfDay, format } = require('../utils/dateHelpers');

// @desc    Get dashboard KPI stats
// @route   GET /api/dashboard/stats
// @access  Protected
const getStats = async (req, res) => {
  const [
    orders,
    expenses,
    totalCustomers,
    totalProducts,
    lowStockProducts,
  ] = await Promise.all([
    prisma.order.findMany({
      where: { status: { not: 'CANCELLED' } },
      select: { totalAmount: true },
    }),
    prisma.expense.findMany({ select: { amount: true } }),
    prisma.customer.count(),
    prisma.product.count(),
    prisma.product.count({
      where: { quantity: { lte: prisma.product.fields.lowStockThreshold } },
    }),
  ]);

  // Low stock: quantity <= lowStockThreshold (raw query needed for field comparison)
  const lowStockCount = await prisma.$queryRaw`
    SELECT COUNT(*) as count FROM products WHERE quantity <= "lowStockThreshold"
  `;

  const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const profit = totalSales - totalExpenses;
  const totalOrders = await prisma.order.count();

  res.json({
    success: true,
    data: {
      totalSales,
      totalExpenses,
      totalOrders,
      totalCustomers,
      totalProducts,
      profit,
      lowStockCount: Number(lowStockCount[0]?.count || 0),
    },
  });
};

// @desc    Get dashboard chart data
// @route   GET /api/dashboard/charts
// @access  Protected
const getCharts = async (req, res) => {
  // Last 7 days daily sales and expenses
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i);
    days.push({
      date,
      label: format(date, 'MMM dd'),
      start: startOfDay(date),
      end: endOfDay(date),
    });
  }

  const dailyData = await Promise.all(
    days.map(async ({ label, start, end }) => {
      const [dayOrders, dayExpenses] = await Promise.all([
        prisma.order.findMany({
          where: {
            status: { not: 'CANCELLED' },
            createdAt: { gte: start, lte: end },
          },
          select: { totalAmount: true },
        }),
        prisma.expense.findMany({
          where: { date: { gte: start, lte: end } },
          select: { amount: true },
        }),
      ]);

      return {
        name: label,
        sales: dayOrders.reduce((s, o) => s + o.totalAmount, 0),
        expenses: dayExpenses.reduce((s, e) => s + e.amount, 0),
      };
    })
  );

  // Orders by status
  const statusCounts = await prisma.order.groupBy({
    by: ['status'],
    _count: { _all: true },
  });

  const ordersByStatus = statusCounts.map((s) => ({
    name: s.status,
    value: s._count._all,
  }));

  // Recent orders (last 5)
  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      customer: { select: { name: true } },
      items: { select: { quantity: true } },
    },
  });

  // Low stock products
  const lowStockProducts = await prisma.$queryRaw`
    SELECT id, name, quantity, "lowStockThreshold", category
    FROM products
    WHERE quantity <= "lowStockThreshold"
    ORDER BY quantity ASC
    LIMIT 10
  `;

  res.json({
    success: true,
    data: {
      dailyChart: dailyData,
      ordersByStatus,
      recentOrders,
      lowStockProducts,
    },
  });
};

module.exports = { getStats, getCharts };
