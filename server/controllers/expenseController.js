const prisma = require('../config/db');
const { startOfMonth, endOfMonth } = require('../utils/dateHelpers');

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Protected
const getAll = async (req, res) => {
  const { category, startDate, endDate } = req.query;

  const where = {};
  if (category && category !== 'ALL') {
    where.category = category;
  }
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }

  const expenses = await prisma.expense.findMany({
    where,
    orderBy: { date: 'desc' },
  });

  res.json({ success: true, data: expenses });
};

// @desc    Get expense by ID
// @route   GET /api/expenses/:id
// @access  Protected
const getById = async (req, res) => {
  const expense = await prisma.expense.findUnique({ where: { id: req.params.id } });
  if (!expense) {
    return res.status(404).json({ success: false, message: 'Expense not found' });
  }
  res.json({ success: true, data: expense });
};

// @desc    Create expense
// @route   POST /api/expenses
// @access  Protected
const create = async (req, res) => {
  const { title, amount, category, date, notes } = req.body;

  if (!title || amount == null || !category) {
    return res.status(400).json({ success: false, message: 'Title, amount and category are required' });
  }

  const validCategories = ['RENT', 'MARKETING', 'STOCK', 'UTILITIES', 'SALARIES', 'OTHER'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({ success: false, message: 'Invalid category' });
  }

  const expense = await prisma.expense.create({
    data: {
      title,
      amount: parseFloat(amount),
      category,
      date: date ? new Date(date) : new Date(),
      notes,
    },
  });

  res.status(201).json({ success: true, message: 'Expense created', data: expense });
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Protected
const update = async (req, res) => {
  const { title, amount, category, date, notes } = req.body;

  const existing = await prisma.expense.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Expense not found' });
  }

  const expense = await prisma.expense.update({
    where: { id: req.params.id },
    data: {
      ...(title && { title }),
      ...(amount != null && { amount: parseFloat(amount) }),
      ...(category && { category }),
      ...(date && { date: new Date(date) }),
      ...(notes !== undefined && { notes }),
    },
  });

  res.json({ success: true, message: 'Expense updated', data: expense });
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Protected
const remove = async (req, res) => {
  const existing = await prisma.expense.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Expense not found' });
  }

  await prisma.expense.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Expense deleted' });
};

// @desc    Get monthly expense summary by category for current year
// @route   GET /api/expenses/summary
// @access  Protected
const getSummary = async (req, res) => {
  const year = new Date().getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31, 23, 59, 59);

  const expenses = await prisma.expense.findMany({
    where: { date: { gte: startOfYear, lte: endOfYear } },
    select: { amount: true, category: true, date: true },
  });

  // Group by category
  const byCategory = {};
  for (const expense of expenses) {
    if (!byCategory[expense.category]) {
      byCategory[expense.category] = 0;
    }
    byCategory[expense.category] += expense.amount;
  }

  const categoryData = Object.entries(byCategory).map(([name, value]) => ({ name, value }));

  // Group by month
  const byMonth = {};
  for (const expense of expenses) {
    const month = new Date(expense.date).getMonth();
    if (!byMonth[month]) byMonth[month] = 0;
    byMonth[month] += expense.amount;
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyData = months.map((name, i) => ({ name, amount: byMonth[i] || 0 }));

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  res.json({
    success: true,
    data: { byCategory: categoryData, byMonth: monthlyData, total: totalExpenses },
  });
};

module.exports = { getAll, getById, create, update, remove, getSummary };
