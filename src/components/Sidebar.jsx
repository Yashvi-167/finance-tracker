import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Package, Receipt,
  Users, TrendingUp, LogOut, ChevronRight, AlertTriangle,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/inventory', icon: Package, label: 'Inventory' },
  { to: '/expenses', icon: Receipt, label: 'Expenses' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/sales', icon: TrendingUp, label: 'Sales Report' },
];

const Sidebar = ({ lowStockCount = 0 }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-surface border-r border-border flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center shadow-glow-sm">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg gradient-text leading-none">BizManager</h1>
            <p className="text-xs text-muted mt-0.5">Business Suite</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
              ${isActive
                ? 'nav-link-active'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-accent-light' : 'text-muted group-hover:text-text-secondary'}`} />
                <span className="flex-1">{label}</span>
                {label === 'Inventory' && lowStockCount > 0 && (
                  <span className="flex items-center gap-1 bg-danger/20 text-danger text-xs px-1.5 py-0.5 rounded-full border border-danger/30">
                    <AlertTriangle className="w-3 h-3" />
                    {lowStockCount}
                  </span>
                )}
                {isActive && <ChevronRight className="w-4 h-4 text-accent-light" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-muted truncate">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium
            ${isAdmin
              ? 'bg-accent/10 text-accent-light border-accent/30'
              : 'bg-surface-2 text-text-secondary border-border'
            }`}>
            {user?.role || 'Staff'}
          </span>
          <button
            id="logout-btn"
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-danger transition-colors px-2 py-1 rounded hover:bg-danger/10"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
