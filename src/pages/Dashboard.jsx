import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign, ShoppingCart, TrendingUp, Users,
  Package, AlertTriangle, ArrowUpRight,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { getStats, getCharts } from '../api/dashboard';
import KPICard from '../components/KPICard';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 border border-border shadow-glass">
        <p className="text-xs text-muted mb-2">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }} className="text-sm font-medium">
            {entry.name}: ${entry.value?.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, chartsRes] = await Promise.all([getStats(), getCharts()]);
        setStats(statsRes.data.data);
        setCharts(chartsRes.data.data);
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard title="Total Sales" value={stats?.totalSales || 0} icon={DollarSign} color="success" prefix="$" trendLabel="All time revenue" />
        <KPICard title="Total Expenses" value={stats?.totalExpenses || 0} icon={TrendingUp} color="danger" prefix="$" trendLabel="All time costs" />
        <KPICard title="Total Orders" value={stats?.totalOrders || 0} icon={ShoppingCart} color="info" trendLabel="Across all statuses" />
        <KPICard title="Net Profit" value={stats?.profit || 0} icon={DollarSign} color="purple" prefix="$" trendLabel="Sales minus expenses" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard title="Customers" value={stats?.totalCustomers || 0} icon={Users} color="accent" trendLabel="Total registered" />
        <KPICard title="Products" value={stats?.totalProducts || 0} icon={Package} color="warning" trendLabel="In inventory" />
        <div className={`glass-card p-5 border flex items-center gap-4 ${stats?.lowStockCount > 0 ? 'border-danger/30' : 'border-border'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stats?.lowStockCount > 0 ? 'bg-danger/10' : 'bg-success/10'}`}>
            <AlertTriangle className={`w-5 h-5 ${stats?.lowStockCount > 0 ? 'text-danger' : 'text-success'}`} />
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wider">Low Stock</p>
            <p className={`text-2xl font-bold ${stats?.lowStockCount > 0 ? 'text-danger' : 'text-success'}`}>
              {stats?.lowStockCount || 0} items
            </p>
            <Link to="/inventory" className="text-xs text-accent-light hover:underline">View inventory →</Link>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Line Chart - Sales vs Expenses */}
        <div className="xl:col-span-2 glass-card p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-text-primary">Sales vs Expenses</h3>
              <p className="text-xs text-muted mt-0.5">Last 7 days overview</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={charts?.dailyChart || []} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3148" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '12px', color: '#94a3b8' }} />
              <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 3 }} name="Sales" />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2.5} dot={{ fill: '#ef4444', r: 3 }} name="Expenses" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Orders by Status */}
        <div className="glass-card p-6 border border-border">
          <div className="mb-6">
            <h3 className="text-base font-semibold text-text-primary">Orders by Status</h3>
            <p className="text-xs text-muted mt-0.5">Current distribution</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={charts?.ordersByStatus || []} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3148" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="glass-card border border-border overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h3 className="font-semibold text-text-primary">Recent Orders</h3>
            <Link to="/orders" className="text-xs text-accent-light hover:text-accent flex items-center gap-1 transition-colors">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-border">
                  <th className="px-6 py-3 text-xs font-medium text-muted uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {charts?.recentOrders?.length > 0 ? charts.recentOrders.map((order) => (
                  <tr key={order.id} className="table-row-hover">
                    <td className="px-6 py-3 font-medium text-accent-light">{order.orderNumber}</td>
                    <td className="px-6 py-3 text-text-secondary">{order.customer?.name}</td>
                    <td className="px-6 py-3 text-text-primary font-medium">${order.totalAmount?.toLocaleString()}</td>
                    <td className="px-6 py-3"><Badge value={order.status} /></td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-muted">No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="glass-card border border-border overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h3 className="font-semibold text-text-primary flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" /> Low Stock Alerts
            </h3>
            <Link to="/inventory" className="text-xs text-accent-light hover:text-accent flex items-center gap-1 transition-colors">
              Manage <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-border">
                  <th className="px-6 py-3 text-xs font-medium text-muted uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-xs font-medium text-muted uppercase tracking-wider">Threshold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {charts?.lowStockProducts?.length > 0 ? charts.lowStockProducts.map((p) => (
                  <tr key={p.id} className="table-row-hover">
                    <td className="px-6 py-3 font-medium text-text-primary">{p.name}</td>
                    <td className="px-6 py-3 text-text-secondary">{p.category}</td>
                    <td className="px-6 py-3">
                      <span className={`font-bold ${p.quantity === 0 ? 'text-danger' : 'text-warning'}`}>{p.quantity}</span>
                    </td>
                    <td className="px-6 py-3 text-muted">{p.lowStockThreshold}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-success">✓ All stock levels normal</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
