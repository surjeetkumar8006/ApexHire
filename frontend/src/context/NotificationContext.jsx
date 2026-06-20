import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 4.5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} color="var(--success)" />;
      case 'error':
        return <AlertCircle size={20} color="var(--danger)" />;
      case 'warning':
        return <AlertTriangle size={20} color="var(--warning)" />;
      default:
        return <Info size={20} color="var(--primary)" />;
    }
  };

  return (
    <NotificationContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
              <div style={{ marginTop: '2px' }}>{getIcon(toast.type)}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)', lineHeight: '1.4' }}>
                  {toast.message}
                </p>
              </div>
              <button 
                onClick={() => removeToast(toast.id)} 
                style={{ cursor: 'pointer', opacity: 0.7, padding: '2px', display: 'flex', alignItems: 'center' }}
                onMouseEnter={(e) => e.target.style.opacity = 1}
                onMouseLeave={(e) => e.target.style.opacity = 0.7}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
