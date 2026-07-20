import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a1d2e',
              color: '#e2e8f0',
              border: '1px solid #2d3148',
              borderRadius: '8px',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#1a1d2e' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#1a1d2e' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
