import { useState, useEffect } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Inventory from './pages/Inventory';
import Expenses from './pages/Expenses';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Sales from './pages/Sales';
import { getStats } from './api/dashboard';
import { useAuth } from './context/AuthContext';

// Layout wrapper for authenticated pages
const AppLayout = () => {
  const { isAuthenticated } = useAuth();
  const [lowStockCount, setLowStockCount] = useState(0);

  // Poll for low stock count (simple implementation)
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchLowStock = async () => {
      try {
        const { data } = await getStats();
        setLowStockCount(data.data.lowStockCount);
      } catch (e) {
        // Ignore error in background polling
      }
    };
    fetchLowStock();
    // Refresh every 5 mins
    const int = setInterval(fetchLowStock, 5 * 60 * 1000);
    return () => clearInterval(int);
  }, [isAuthenticated]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar lowStockCount={lowStockCount} />
      <div className="flex-1 flex flex-col pl-64 transition-all duration-300">
        <Navbar lowStockCount={lowStockCount} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/customers/:id" element={<CustomerDetail />} />
        <Route path="/sales" element={<Sales />} />
      </Route>
    </Routes>
  );
}

export default App;
