import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Users, ArrowUpRight, ShoppingBag } from 'lucide-react';
import * as customersApi from '../api/customers';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const initialForm = { name: '', email: '', phone: '', address: '' };

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await customersApi.getAll({ search });
      setCustomers(res.data.data);
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const openAddModal = () => {
    setEditCustomer(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEditModal = (customer) => {
    setEditCustomer(customer);
    setForm({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      toast.error('Customer name is required');
      return;
    }
    setSaving(true);
    try {
      if (editCustomer) {
        await customersApi.update(editCustomer.id, form);
        toast.success('Customer updated!');
      } else {
        await customersApi.create(form);
        toast.success('Customer added!');
      }
      setModalOpen(false);
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await customersApi.remove(id);
      toast.success('Customer deleted');
      setDeleteConfirm(null);
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Customers</h1>
          <p className="text-sm text-muted mt-0.5">{customers.length} total customers</p>
        </div>
        <button onClick={openAddModal} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      <div className="flex mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input type="text" placeholder="Search by name, email, or phone..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="input-base pl-10" />
        </div>
      </div>

      <div className="glass-card border border-border overflow-hidden">
        {loading ? <LoadingSpinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Name', 'Contact', 'Orders', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {customers.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-muted">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No customers found</p>
                  </td></tr>
                ) : customers.map((customer) => (
                  <tr key={customer.id} className="table-row-hover">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <Link to={`/customers/${customer.id}`} className="font-medium text-text-primary hover:text-accent-light transition-colors">
                            {customer.name}
                          </Link>
                          {customer.address && <p className="text-xs text-muted mt-0.5 truncate max-w-[200px]">{customer.address}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {customer.email && <p className="text-text-secondary">{customer.email}</p>}
                      {customer.phone && <p className="text-text-secondary">{customer.phone}</p>}
                      {!customer.email && !customer.phone && <span className="text-muted italic">No contact info</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-2 text-text-secondary text-xs font-medium">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        {customer._count?.orders || 0} orders
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary text-xs">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link to={`/customers/${customer.id}`} title="View Details"
                          className="p-1.5 rounded-lg text-muted hover:text-accent-light hover:bg-accent/10 transition-all">
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                        <button onClick={() => openEditModal(customer)} title="Edit"
                          className="p-1.5 rounded-lg text-muted hover:text-accent-light hover:bg-accent/10 transition-all">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirm(customer)} title="Delete"
                          className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-all">
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editCustomer ? 'Edit Customer' : 'Add Customer'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Full Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-base" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-base" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Phone</label>
              <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-base" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Address</label>
            <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
              rows={2} className="input-base resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm bg-surface-2 text-text-secondary hover:bg-border transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? 'Saving...' : editCustomer ? 'Update' : 'Add Customer'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Customer" size="sm">
        <div className="text-center">
          <p className="text-text-primary font-medium mb-1">Delete "{deleteConfirm?.name}"?</p>
          <p className="text-sm text-muted mb-6">Cannot delete customers with existing orders.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setDeleteConfirm(null)} className="px-5 py-2 rounded-lg text-sm bg-surface-2 text-text-secondary hover:bg-border">Cancel</button>
            <button onClick={() => handleDelete(deleteConfirm.id)} className="px-5 py-2 rounded-lg text-sm bg-danger text-white hover:bg-red-600 transition-colors">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Customers;
