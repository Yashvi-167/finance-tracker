import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, AlertTriangle, Package } from 'lucide-react';
import * as productsApi from '../api/products';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const CATEGORIES = ['Electronics', 'Clothing', 'Food & Beverage', 'Health & Beauty', 'Home & Garden', 'Sports', 'Toys', 'Books', 'Automotive', 'Other'];

const initialForm = { name: '', category: '', price: '', costPrice: '', shippingCost: '', quantity: '', lowStockThreshold: '10', description: '' };

const Inventory = () => {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productsApi.getAll({ search, category: categoryFilter });
      setProducts(res.data.data);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openAddModal = () => {
    setEditProduct(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      costPrice: product.costPrice,
      shippingCost: product.shippingCost || '',
      quantity: product.quantity,
      lowStockThreshold: product.lowStockThreshold,
      description: product.description || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.price || !form.costPrice) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      if (editProduct) {
        await productsApi.update(editProduct.id, form);
        toast.success('Product updated!');
      } else {
        await productsApi.create(form);
        toast.success('Product added!');
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await productsApi.remove(id);
      toast.success('Product deleted');
      setDeleteConfirm(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const lowStockCount = products.filter((p) => p.isLowStock).length;

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Inventory</h1>
          <p className="text-sm text-muted mt-0.5">
            {products.length} products
            {lowStockCount > 0 && <span className="text-danger ml-2">· {lowStockCount} low stock</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button id="add-product-btn" onClick={openAddModal} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input type="text" placeholder="Search products..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="input-base pl-10" />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
          className="input-base sm:w-48 appearance-none cursor-pointer">
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="glass-card border border-border overflow-hidden">
        {loading ? <LoadingSpinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-muted uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-muted uppercase tracking-wider">Cost</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-muted uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                  {isAdmin && <th className="px-6 py-4 text-center text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-muted">
                    <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No products found</p>
                  </td></tr>
                ) : products.map((product) => (
                  <tr key={product.id} className={`table-row-hover ${product.isLowStock ? 'bg-danger/5' : ''}`}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-text-primary">{product.name}</p>
                        {product.description && <p className="text-xs text-muted mt-0.5 truncate max-w-xs">{product.description}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{product.category}</td>
                    <td className="px-6 py-4 text-right font-medium text-text-primary">${product.price?.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-muted">${product.costPrice?.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-bold text-base ${product.quantity === 0 ? 'text-danger' : product.isLowStock ? 'text-warning' : 'text-text-primary'}`}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {product.isLowStock ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium badge-lowstock">
                          <AlertTriangle className="w-3 h-3" /> Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium badge-instock">
                          In Stock
                        </span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openEditModal(product)} title="Edit"
                            className="p-1.5 rounded-lg text-muted hover:text-accent-light hover:bg-accent/10 transition-all">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteConfirm(product)} title="Delete"
                            className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editProduct ? 'Edit Product' : 'Add New Product'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Product Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-base" placeholder="e.g., iPhone 15 Pro" required />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Category *</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input-base appearance-none cursor-pointer" required>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Selling Price *</label>
              <input type="number" step="0.01" min="0" value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="input-base" placeholder="0.00" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Cost Price *</label>
              <input type="number" step="0.01" min="0" value={form.costPrice}
                onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                className="input-base" placeholder="0.00" required />

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Quantity</label>
              <input type="number" min="0" value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="input-base" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Low Stock Alert</label>
              <input type="number" min="0" value={form.lowStockThreshold}
                onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })}
                className="input-base" placeholder="10" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3} className="input-base resize-none" placeholder="Optional product description..." />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-surface-2 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? 'Saving...' : editProduct ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Product" size="sm">
        <div className="text-center">
          <div className="w-14 h-14 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-7 h-7 text-danger" />
          </div>
          <p className="text-text-primary font-medium mb-1">Delete "{deleteConfirm?.name}"?</p>
          <p className="text-sm text-muted mb-6">This action cannot be undone.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setDeleteConfirm(null)} className="px-5 py-2 rounded-lg text-sm font-medium bg-surface-2 text-text-secondary hover:bg-border transition-colors">
              Cancel
            </button>
            <button onClick={() => handleDelete(deleteConfirm.id)} className="px-5 py-2 rounded-lg text-sm font-medium bg-danger text-white hover:bg-red-600 transition-colors">
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Inventory;
