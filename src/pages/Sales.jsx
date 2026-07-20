import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Award, Calendar } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import * as salesApi from '../api/sales';
import KPICard from '../components/KPICard';
import LoadingSpinner from '../components/LoadingSpinner';
import Badge from '../components/Badge';
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

const Sales = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await salesApi.getReport(year);
        setReport(res.data.data);
      } catch {
        toast.error('Failed to load sales report');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [year]);

  if (loading) return <LoadingSpinner />;

  const { monthlyData, topProducts, summary } = report;

  // Generate last 5 years for dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="p-6 animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Sales Report</h1>
          <p className="text-sm text-muted mt-0.5">Comprehensive financial overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-muted" />
          <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}
            className="input-base w-32 appearance-none cursor-pointer">
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard title="Total Revenue" value={summary.totalRevenue} icon={DollarSign} color="success" prefix="₹" />
        <KPICard title="Total Expenses" value={summary.totalExpenses} icon={TrendingUp} color="danger" prefix="₹" />
        <KPICard title="Net Profit" value={summary.totalProfit} icon={DollarSign} color="purple" prefix="₹" />
        <KPICard title="Best Month" value={summary.bestMonth} icon={Award} color="accent" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Sales vs Expenses Area Chart */}
        <div className="glass-card p-6 border border-border">
          <h3 className="font-semibold text-text-primary mb-6">Revenue vs Expenses ({year})</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3148" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '13px', color: '#94a3b8' }} />
              <Area type="monotone" dataKey="sales" name="Revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Profit Bar Chart */}
        <div className="glass-card p-6 border border-border">
          <h3 className="font-semibold text-text-primary mb-6">Monthly Net Profit</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3148" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="profit" name="Profit" radius={[4, 4, 0, 0]}>
                {monthlyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#6366f1' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="glass-card border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="font-semibold text-text-primary">Top 5 Products by Revenue</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold text-muted uppercase tracking-wider">
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-center">Units Sold</th>
                <th className="px-6 py-4 text-right">Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {topProducts.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted">No sales data for {year}</td></tr>
              ) : topProducts.map((product, idx) => (
                <tr key={idx} className="table-row-hover">
                  <td className="px-6 py-4">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${idx === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                        idx === 1 ? 'bg-slate-300/20 text-slate-300' :
                        idx === 2 ? 'bg-orange-600/20 text-orange-500' : 'bg-surface-2 text-muted'}`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-text-primary">{product.name}</td>
                  <td className="px-6 py-4"><Badge value={product.category} type="category" /></td>
                  <td className="px-6 py-4 text-center font-medium text-text-secondary">{product.units}</td>
                  <td className="px-6 py-4 text-right font-bold text-success">₹{product.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Sales;
