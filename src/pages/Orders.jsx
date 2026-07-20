import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, Download, ShoppingCart, ChevronDown } from 'lucide-react';
import * as ordersApi from '../api/orders';
import * as customersApi from '../api/customers';
import * as productsApi from '../api/products';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import { generateInvoicePDF } from '../utils/pdf';
import toast from 'react-hot-toast';

const STATUSES = ['ALL', 'PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const Orders = () => {
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [createModal, setCreateModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);

  // For create/edit order form
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [step, setStep] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [orderItems, setOrderItems] = useState([{ productId: '', quantity: 1, unitPrice: 0 }]);
  const [orderNotes, setOrderNotes] = useState('');
  const [orderShipping, setOrderShipping] = useState(0);
  const [saving, setSaving] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (search) params.search = search;
      const res = await ordersApi.getAll(params);
      setOrders(res.data.data);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const openCreateModal = async () => {
    setEditingOrder(null);
    setStep(1);
    setSelectedCustomer('');
    setOrderItems([{ productId: '', quantity: 1, unitPrice: 0 }]);
    setOrderNotes('');
    setOrderShipping(0);
    setCreateModal(true);

    try {
      const [custRes, prodRes] = await Promise.all([
        customersApi.getAll(),
        productsApi.getAll(),
      ]);
      setCustomers(custRes.data.data);
      setProducts(prodRes.data.data);
    } catch {
      toast.error('Failed to load customers/products');
    }
  };

  const openEditModal = async (order) => {
    setEditingOrder(order.id);
    setStep(1);
    setSelectedCustomer(order.customerId || order.customer?.id);
    setOrderItems(order.items.map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice })));
    setOrderNotes(order.notes || '');
    setOrderShipping(order.shippingCost || 0);
    setCreateModal(true);

    try {
      const [custRes, prodRes] = await Promise.all([
        customersApi.getAll(),
        productsApi.getAll(),
      ]);
      setCustomers(custRes.data.data);
      setProducts(prodRes.data.data);
    } catch {
      toast.error('Failed to load customers/products');
    }
  };

  const addItem = () => setOrderItems([...orderItems, { productId: '', quantity: 1, unitPrice: 0 }]);

  const removeItem = (idx) => setOrderItems(orderItems.filter((_, i) => i !== idx));

  const updateItem = (idx, field, value) => {
    const updated = [...orderItems];
    updated[idx][field] = value;
    if (field === 'productId') {
      const p = products.find((p) => p.id === value);
      if (p) updated[idx].unitPrice = p.price;
    }
    setOrderItems(updated);
  };

  const orderTotal = orderItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  const handleSaveOrder = async () => {
    if (!selectedCustomer) { toast.error('Select a customer'); return; }
    if (orderItems.some((i) => !i.productId || i.quantity < 1)) {
      toast.error('All items must have a product and quantity'); return;
    }
    setSaving(true);
    try {
      const payload = {
        customerId: selectedCustomer,
        items: orderItems.map((i) => ({ productId: i.productId, quantity: parseInt(i.quantity), unitPrice: parseFloat(i.unitPrice) })),
        notes: orderNotes,
        shippingCost: parseFloat(orderShipping || 0),
      };
      
      if (editingOrder) {
        await ordersApi.update(editingOrder, payload);
        toast.success('Order updated!');
      } else {
        await ordersApi.create(payload);
        toast.success('Order created!');
      }
      setCreateModal(false);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save order');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await ordersApi.update(id, { status });
      toast.success('Status updated');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleDelete = async (id) => {
    try {
      await ordersApi.remove(id);
      toast.success('Order deleted and stock restored');
      setDeleteConfirm(null);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleDownloadInvoice = async (order) => {
    try {
      const res = await ordersApi.getInvoice(order.id);
      generateInvoicePDF(res.data.data);
      toast.success('Invoice downloaded!');
    } catch {
      toast.error('Failed to generate invoice');
    }
  };

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Orders</h1>
          <p className="text-sm text-muted mt-0.5">{orders.length} orders</p>
        </div>
        <button id="create-order-btn" onClick={openCreateModal} className="btn-primary">
          <Plus className="w-4 h-4" /> Create Order
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input type="text" placeholder="Search by order # or customer..."
            value={search} onChange={(e) => setSearch(e.target.value)} className="input-base pl-10" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === s
                ? 'bg-accent text-white'
                : 'bg-surface-2 text-text-secondary hover:bg-border'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card border border-border overflow-hidden">
        {loading ? <LoadingSpinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Order #', 'Customer', 'Items', 'Total', 'Profit', 'Status', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-12 text-center text-muted">
                    <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No orders found</p>
                  </td></tr>
                ) : orders.map((order) => (
                  <tr key={order.id} className="table-row-hover">
                    <td className="px-6 py-4 font-medium text-accent-light">{order.orderNumber}</td>
                    <td className="px-6 py-4 text-text-primary font-medium">{order.customer?.name}</td>
                    <td className="px-6 py-4 text-text-secondary">{order.items?.length} item(s)</td>
                    <td className="px-6 py-4 font-bold text-text-primary">₹{order.totalAmount?.toFixed(2)}</td>
                    {(() => {
                      const cost = order.items?.reduce((sum, item) => {
                        const costPrice = item.product?.costPrice || 0;
                        return sum + (costPrice * item.quantity);
                      }, 0) || 0;
                      const shipping = order.shippingCost || 0;
                      const profit = (order.totalAmount || 0) - cost - shipping;
                      return (
                        <td className={`px-6 py-4 font-bold ${profit >= 0 ? 'text-success' : 'text-danger'}`}>
                          ₹{profit.toFixed(2)}
                        </td>
                      );
                    })()}
                    <td className="px-6 py-4">
                      <select value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        className="text-xs px-2 py-1 rounded-lg bg-surface-2 border border-border text-text-secondary cursor-pointer hover:border-accent transition-colors focus:outline-none">
                        {['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-text-secondary text-xs">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDownloadInvoice(order)} title="Download Invoice"
                          className="p-1.5 rounded-lg text-muted hover:text-accent-light hover:bg-accent/10 transition-all">
                          <Download className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <>
                            <button onClick={() => openEditModal(order)} title="Edit Order"
                              className="p-1.5 rounded-lg text-muted hover:text-accent-light hover:bg-accent/10 transition-all">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteConfirm(order)} title="Delete Order"
                              className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-all">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Order Modal */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title={editingOrder ? "Edit Order" : "Create New Order"} size="lg">
        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                ${step >= s ? 'bg-accent text-white' : 'bg-surface-2 text-muted'}`}>{s}</div>
              {s < 3 && <div className={`h-px flex-1 w-12 transition-colors ${step > s ? 'bg-accent' : 'bg-border'}`} />}
            </div>
          ))}
          <span className="text-xs text-muted ml-2">
            {step === 1 ? 'Select Customer' : step === 2 ? 'Add Products' : 'Review & Confirm'}
          </span>
        </div>

        {/* Step 1: Customer */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input type="text" placeholder="Search customer..."
                value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} className="input-base pl-10" />
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1.5">
              {filteredCustomers.map((c) => (
                <button key={c.id} onClick={() => setSelectedCustomer(c.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left
                    ${selectedCustomer === c.id ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50 hover:bg-surface-2'}`}>
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-bold flex-shrink-0">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-text-primary text-sm">{c.name}</p>
                    <p className="text-xs text-muted">{c.phone || c.email || 'No contact info'}</p>
                  </div>
                  {selectedCustomer === c.id && <div className="ml-auto w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>}
                </button>
              ))}
              {filteredCustomers.length === 0 && <p className="text-center text-muted py-4">No customers found</p>}
            </div>
            <div className="flex justify-end">
              <button onClick={() => step === 1 && selectedCustomer && setStep(2)} disabled={!selectedCustomer}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">Next: Add Products</button>
            </div>
          </div>
        )}

        {/* Step 2: Products */}
        {step === 2 && (
          <div className="space-y-4">
            {orderItems.map((item, idx) => (
              <div key={idx} className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="text-xs text-muted mb-1 block">Product</label>
                  <select value={item.productId} onChange={(e) => updateItem(idx, 'productId', e.target.value)}
                    className="input-base appearance-none cursor-pointer">
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                        {p.name} (Stock: {p.quantity}) — ₹{p.price}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-20">
                  <label className="text-xs text-muted mb-1 block">Qty</label>
                  <input type="number" min="1" value={item.quantity}
                    onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value))}
                    className="input-base text-center" />
                </div>
                <div className="w-24">
                  <label className="text-xs text-muted mb-1 block">Unit Price</label>
                  <input type="number" step="0.01" value={item.unitPrice}
                    onChange={(e) => updateItem(idx, 'unitPrice', parseFloat(e.target.value))}
                    className="input-base" />
                </div>
                {orderItems.length > 1 && (
                  <button onClick={() => removeItem(idx)}
                    className="p-2 rounded-lg text-danger hover:bg-danger/10 transition-colors mb-0.5">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button onClick={addItem} className="text-sm text-accent-light hover:text-accent flex items-center gap-1 transition-colors">
              <Plus className="w-4 h-4" /> Add another item
            </button>
            <div>
              <label className="text-xs text-muted mb-1 block">Notes (optional)</label>
              <textarea value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)}
                rows={2} className="input-base resize-none" placeholder="Add order notes..." />
            </div>
            <div>
              <label className="text-xs text-muted mb-1 block">Shipping Charge (₹)</label>
              <input type="number" step="0.01" min="0" value={orderShipping}
                onChange={(e) => setOrderShipping(e.target.value)}
                className="input-base" placeholder="0.00" />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <p className="font-bold text-text-primary">Total: <span className="text-success text-lg">₹{orderTotal.toFixed(2)}</span></p>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="px-4 py-2 rounded-lg text-sm bg-surface-2 text-text-secondary hover:bg-border transition-colors">Back</button>
                <button onClick={() => setStep(3)} className="btn-primary">Review Order</button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="glass-card p-4 border border-border space-y-2">
              <p className="text-xs text-muted uppercase tracking-wider mb-3">Customer</p>
              <p className="font-medium text-text-primary">
                {customers.find((c) => c.id === selectedCustomer)?.name}
              </p>
            </div>
            <div className="glass-card p-4 border border-border">
              <p className="text-xs text-muted uppercase tracking-wider mb-3">Items</p>
              <div className="space-y-2">
                {orderItems.map((item, idx) => {
                  const prod = products.find((p) => p.id === item.productId);
                  return (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-text-primary">{prod?.name} × {item.quantity}</span>
                      <span className="font-medium text-text-primary">₹{(item.quantity * item.unitPrice).toFixed(2)}</span>
                    </div>
                  );
                })}
                <div className="border-t border-border pt-2 space-y-1">
                  <div className="flex justify-between text-sm text-text-secondary">
                    <span>Subtotal</span>
                    <span>₹{orderTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-text-secondary">
                    <span>Shipping</span>
                    <span>₹{parseFloat(orderShipping || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-text-primary pt-1 border-t border-border">
                    <span>Grand Total</span>
                    <span className="text-success text-lg">₹{(orderTotal + parseFloat(orderShipping || 0)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setStep(2)} className="px-4 py-2 rounded-lg text-sm bg-surface-2 text-text-secondary hover:bg-border transition-colors">Back</button>
              <button onClick={handleSaveOrder} disabled={saving} className="btn-primary disabled:opacity-60">
                {saving ? 'Saving...' : (editingOrder ? 'Save Changes' : 'Confirm Order')}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Order" size="sm">
        <div className="text-center">
          <div className="w-14 h-14 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-7 h-7 text-warning" />
          </div>
          <p className="text-text-primary font-medium mb-1">Delete order "{deleteConfirm?.orderNumber}"?</p>
          <p className="text-sm text-muted mb-6">Stock will be restored for non-delivered orders.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setDeleteConfirm(null)} className="px-5 py-2 rounded-lg text-sm bg-surface-2 text-text-secondary hover:bg-border">Cancel</button>
            <button onClick={() => handleDelete(deleteConfirm.id)} className="px-5 py-2 rounded-lg text-sm bg-danger text-white hover:bg-red-600 transition-colors">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Orders;
