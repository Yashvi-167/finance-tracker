const prisma = require('../config/db');

// @desc    Get sales report (monthly for current year)
// @route   GET /api/sales/report
// @access  Protected
const getReport = async (req, res) => {
  const year = parseInt(req.query.year) || new Date().getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31, 23, 59, 59);

  const [orders, expenses] = await Promise.all([
    prisma.order.findMany({
      where: {
        status: { not: 'CANCELLED' },
        createdAt: { gte: startOfYear, lte: endOfYear },
      },
      select: { totalAmount: true, createdAt: true },
    }),
    prisma.expense.findMany({
      where: { date: { gte: startOfYear, lte: endOfYear } },
      select: { amount: true, date: true },
    }),
  ]);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Monthly sales
  const monthlySales = Array(12).fill(0);
  for (const order of orders) {
    const month = new Date(order.createdAt).getMonth();
    monthlySales[month] += order.totalAmount;
  }

  // Monthly expenses
  const monthlyExpenses = Array(12).fill(0);
  for (const expense of expenses) {
    const month = new Date(expense.date).getMonth();
    monthlyExpenses[month] += expense.amount;
  }

  const monthlyData = months.map((name, i) => ({
    name,
    sales: monthlySales[i],
    expenses: monthlyExpenses[i],
    profit: monthlySales[i] - monthlyExpenses[i],
  }));

  // Top 5 products by revenue
  const orderItems = await prisma.orderItem.findMany({
    where: {
      order: {
        status: { not: 'CANCELLED' },
        createdAt: { gte: startOfYear, lte: endOfYear },
      },
    },
    include: { product: { select: { name: true, category: true } } },
  });

  const productRevenue = {};
  for (const item of orderItems) {
    const key = item.productId;
    if (!productRevenue[key]) {
      productRevenue[key] = { name: item.product.name, category: item.product.category, revenue: 0, units: 0 };
    }
    productRevenue[key].revenue += item.unitPrice * item.quantity;
    productRevenue[key].units += item.quantity;
  }

  const topProducts = Object.values(productRevenue)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const totalRevenue = monthlySales.reduce((s, v) => s + v, 0);
  const totalExpensesYear = monthlyExpenses.reduce((s, v) => s + v, 0);
  const totalProfit = totalRevenue - totalExpensesYear;

  const bestMonthIdx = monthlySales.indexOf(Math.max(...monthlySales));
  const bestMonth = months[bestMonthIdx];

  res.json({
    success: true,
    data: {
      monthlyData,
      topProducts,
      summary: { totalRevenue, totalExpenses: totalExpensesYear, totalProfit, bestMonth, year },
    },
  });
};

module.exports = { getReport };
