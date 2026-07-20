import { useLocation } from 'react-router-dom';
import { Bell, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const pageTitles = {
  '/': 'Dashboard',
  '/orders': 'Orders',
  '/inventory': 'Inventory',
  '/expenses': 'Expenses',
  '/customers': 'Customers',
  '/sales': 'Sales Report',
};

const Navbar = ({ lowStockCount = 0 }) => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  const title = pageTitles[location.pathname] ||
    (location.pathname.startsWith('/customers/') ? 'Customer Details' : 'BizManager');

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
      <div>
        <h2 className="text-xl font-bold text-text-primary">{title}</h2>
        <p className="text-xs text-muted">{dateStr}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            id="notification-bell"
            className="p-2 rounded-lg bg-surface-2 text-text-secondary hover:text-text-primary hover:bg-border transition-all duration-200"
          >
            <Bell className="w-5 h-5" />
            {lowStockCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white text-xs rounded-full flex items-center justify-center font-bold">
                {lowStockCount > 9 ? '9+' : lowStockCount}
              </span>
            )}
          </button>
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-text-primary leading-none">{user?.name}</p>
            <span className={`text-xs font-medium ${isAdmin ? 'text-accent-light' : 'text-muted'}`}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
