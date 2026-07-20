import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, ShoppingBag } from 'lucide-react';
import * as customersApi from '../api/customers';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const CustomerDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const res = await customersApi.getOrders(id);
        setData(res.data.data);
      } catch (err) {
        toast.error('Failed to load customer details');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomerData();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="p-6 text-center text-muted">Customer not found</div>;

  const { customer, orders, totalSpent } = data;

  return (
    <div className="p-6 animate-fade-in">
      <Link to="/customers" className="inline-flex items-center gap-2 text-sm text-muted hover:text-text-primary transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Customers
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 border border-border lg:col-span-2 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-glow flex-shrink-0">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h1 className="text-2xl font-bold text-text-primary leading-none">{customer.name}</h1>
              <p className="text-sm text-muted mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Customer since {new Date(customer.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
              {customer.email && (
                <div className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-muted" /> {customer.email}</div>
              )}
              {customer.phone && (
                <div className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-muted" /> {customer.phone}</div>
              )}
              {customer.address && (
                <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-muted" /> {customer.address}</div>
              )}
            </div>
          </div>
        </div>

        <div className="glass-card p-6 border border-border flex flex-col justify-center">
          <p className="text-sm font-medium text-muted mb-1 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" /> Total Spent
          </p>
          <p className="text-3xl font-bold text-success">₹{totalSpent.toFixed(2)}</p>
          <p className="text-xs text-muted mt-2">{orders.length} total orders</p>
        </div>
      </div>

      <h2 className="text-lg font-bold text-text-primary mb-4">Order History</h2>
      <div className="glass-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Order #', 'Date', 'Items', 'Total', 'Status'].map((h) => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted">No orders yet</td></tr>
              ) : orders.map((order) => (
                <tr key={order.id} className="table-row-hover">
                  <td className="px-6 py-4 font-medium text-accent-light">{order.orderNumber}</td>
                  <td className="px-6 py-4 text-text-secondary">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-text-secondary">
                    {order.items.map((i) => `${i.product?.name} (${i.quantity})`).join(', ')}
                  </td>
                  <td className="px-6 py-4 font-bold text-text-primary">₹{order.totalAmount.toFixed(2)}</td>
                  <td className="px-6 py-4"><Badge value={order.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;
