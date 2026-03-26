import { StoreProvider, useStore } from './context/StoreContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './Components/Sidebar';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Inventory from './pages/Inventory';
import Analytics from './pages/Analytics';
import Forecast from './pages/Forecast';
import Sales from './pages/Sales';
import Assistant from './pages/Assistant';
import { Settings, Receipts } from './pages/Other';
import Login from './Components/Login';
import UserManagement from './Components/UserManagement';

const PAGE_CONFIG = {
  dashboard: { title: 'Executive Dashboard', subtitle: 'Live overview of store performance' },
  pos: { title: 'Point of Sale', subtitle: 'Process transactions and manage orders' },
  inventory: { title: 'Inventory Management', subtitle: 'Track products, stock levels and expiry' },
  sales: { title: 'Sales Reports', subtitle: 'Transaction history and revenue breakdown' },
  analytics: { title: 'Financial Analytics', subtitle: 'Profit analysis, margins and loss detection' },
  forecast: { title: 'Demand Forecasting', subtitle: 'AI-powered predictions and replenishment' },
  receipts: { title: 'Receipts', subtitle: 'View and print transaction receipts' },
  assistant: { title: 'AI Business Assistant', subtitle: 'Ask questions about your store data' },
  settings: { title: 'Settings', subtitle: 'Store configuration and user management' },
  users: { title: 'User Management', subtitle: 'Manage staff accounts and access levels' },
};

const ROLE_ACCESS = {
  ADMIN: ['dashboard', 'pos', 'inventory', 'sales', 'analytics', 'forecast', 'receipts', 'assistant', 'settings', 'users'],
  SUPERVISOR: ['pos', 'inventory', 'receipts', 'users'],
  TELLER: ['pos', 'receipts'],
};

function AppContent() {
  const { activeView } = useStore();
  const { user, logout } = useAuth();

  const allowedViews = ROLE_ACCESS[user?.role] || [];
  const currentView = allowedViews.includes(activeView) ? activeView : allowedViews[0];
  const page = PAGE_CONFIG[currentView] || PAGE_CONFIG.dashboard;

  const views = {
    dashboard: <Dashboard />,
    pos: <POS />,
    inventory: <Inventory />,
    sales: <Sales />,
    analytics: <Analytics />,
    forecast: <Forecast />,
    receipts: <Receipts />,
    assistant: <Assistant />,
    settings: <Settings />,
    users: <UserManagement />,
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f7faf7' }}>
      <Sidebar allowedViews={allowedViews} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar with user info and logout */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          borderBottom: '1px solid #e8f0e9',
          background: '#fff',
          minHeight: '56px'
        }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#0d1f0e' }}>{page.title}</div>
            <div style={{ fontSize: '12px', color: '#6b7c6e' }}>{page.subtitle}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a202c' }}>{user?.fullName}</div>
              <span style={{
                background: user?.role === 'ADMIN' ? '#fff5f5' : user?.role === 'SUPERVISOR' ? '#fffbeb' : '#f0fff4',
                color: user?.role === 'ADMIN' ? '#c53030' : user?.role === 'SUPERVISOR' ? '#975a16' : '#276749',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '10px',
                fontWeight: 700,
              }}>
                {user?.role}
              </span>
            </div>
            <button
              onClick={logout}
              style={{
                padding: '8px 16px',
                background: '#fff5f5',
                color: '#c53030',
                border: '1px solid #fc8181',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}>
              🚪 Logout
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {views[currentView] || <POS />}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

function AppInner() {
  const { user } = useAuth();
  if (!user) return <Login />;
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
