import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Receipt } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as expensesApi from '../api/expenses';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const CATEGORIES = ['RENT', 'MARKETING', 'STOCK', 'UTILITIES', 'SALARIES', 'OTHER'];
const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#a855f7', '#64748b'];

const initialForm = { title: '', amount: '', category: 'OTHER', date: new Date().toISOString().split('T')[0], notes: '' };

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [expRes, sumRes] = await Promise.all([
        expensesApi.getAll({ category: categoryFilter || undefined, startDate: startDate || undefined, endDate: endDate || undefined }),
        expensesApi.getSummary(),
      ]);
      setExpenses(expRes.data.data);
      setSummary(sumRes.data.data);
    } catch {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, startDate, endDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAddModal = () => {
    setEditExpense(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEditModal = (expense) => {
    setEditExpense(expense);
    setForm({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: new Date(expense.date).toISOString().split('T')[0],
      notes: expense.notes || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount || !form.category) {
      toast.error('Title, amount and category are required');
      return;
    }
    setSaving(true);
    try {
      if (editExpense) {
        await expensesApi.update(editExpense.id, form);
        toast.success('Expense updated!');
      } else {
        await expensesApi.create(form);
        toast.success('Expense added!');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await expensesApi.remove(id);
      toast.success('Expense deleted');
      setDeleteConfirm(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Expenses</h1>
          <p className="text-sm text-muted mt-0.5">
            Total: <span className="text-danger font-semibold">₹{summary?.total?.toFixed(2) || '0.00'}</span>
          </p>
        </div>
        <button id="add-expense-btn" onClick={openAddModal} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Pie Chart */}
        <div className="glass-card p-6 border border-border">
          <h3 className="font-semibold text-text-primary mb-4">By Category</h3>
          {summary?.byCategory?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={summary.byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%"
                  outerRadius={80} paddingAngle={3} labelLine={false}>
                  {summary.byCategory.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`₹${v.toFixed(2)}`, '']} contentStyle={{ background: '#1a1d2e', border: '1px solid #2d3148', borderRadius: '8px', color: '#e2e8f0' }} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted">No data yet</div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="glass-card p-6 border border-border xl:col-span-2">
          <h3 className="font-semibold text-text-primary mb-4">Category Breakdown</h3>
          <div className="space-y-3">
            {summary?.byCategory?.map((cat, i) => {
              const pct = summary.total > 0 ? (cat.value / summary.total) * 100 : 0;
              return (
                <div key={cat.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-secondary">{cat.name}</span>
                    <span className="font-medium text-text-primary">₹{cat.value.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-surface-2 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  </div>
                </div>
              );
            }) || <p className="text-muted text-sm">No expenses this year</p>}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
          className="input-base sm:w-44 appearance-none cursor-pointer">
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-base sm:w-40" />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-base sm:w-40" />
        {(categoryFilter || startDate || endDate) && (
          <button onClick={() => { setCategoryFilter(''); setStartDate(''); setEndDate(''); }}
            className="px-4 py-2 rounded-lg text-sm bg-surface-2 text-text-secondary hover:bg-border transition-colors">
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="glass-card border border-border overflow-hidden">
        {loading ? <LoadingSpinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Title', 'Category', 'Amount', 'Date', 'Notes', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {expenses.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-muted">
                    <Receipt className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No expenses found</p>
                  </td></tr>
                ) : expenses.map((expense) => (
                  <tr key={expense.id} className="table-row-hover">
                    <td className="px-6 py-4 font-medium text-text-primary">{expense.title}</td>
                    <td className="px-6 py-4"><Badge value={expense.category} type="category" /></td>
                    <td className="px-6 py-4 font-bold text-danger">₹{expense.amount?.toFixed(2)}</td>
                    <td className="px-6 py-4 text-text-secondary text-xs">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-muted text-xs max-w-xs truncate">{expense.notes || '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEditModal(expense)} className="p-1.5 rounded-lg text-muted hover:text-accent-light hover:bg-accent/10 transition-all">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirm(expense)} className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editExpense ? 'Edit Expense' : 'Add Expense'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-base" placeholder="e.g., Monthly rent payment" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Amount *</label>
              <input type="number" step="0.01" min="0" value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="input-base" placeholder="0.00" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Category *</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input-base appearance-none cursor-pointer">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-base" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2} className="input-base resize-none" placeholder="Optional notes..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm text-text-secondary hover:bg-surface-2 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? 'Saving...' : editExpense ? 'Update' : 'Add Expense'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Expense" size="sm">
        <div className="text-center">
          <p className="text-text-primary font-medium mb-1">Delete "{deleteConfirm?.title}"?</p>
          <p className="text-sm text-muted mb-6">Amount: ₹{deleteConfirm?.amount?.toFixed(2)}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setDeleteConfirm(null)} className="px-5 py-2 rounded-lg text-sm bg-surface-2 text-text-secondary hover:bg-border">Cancel</button>
            <button onClick={() => handleDelete(deleteConfirm.id)} className="px-5 py-2 rounded-lg text-sm bg-danger text-white hover:bg-red-600 transition-colors">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Expenses;
