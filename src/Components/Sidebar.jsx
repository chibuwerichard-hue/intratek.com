import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦', section: 'Operations' },
  { id: 'pos', label: 'Point of Sale', icon: '⊞', section: 'Operations' },
  { id: 'inventory', label: 'Inventory', icon: '▤', section: 'Operations' },
  { id: 'sales', label: 'Sales Reports', icon: '◈', section: 'Intelligence' },
  { id: 'analytics', label: 'Analytics', icon: '◉', section: 'Intelligence' },
  { id: 'forecast', label: 'Forecasting', icon: '◎', section: 'Intelligence' },
  { id: 'receipts', label: 'Receipts', icon: '▣', section: 'Intelligence' },
  { id: 'assistant', label: 'AI Assistant', icon: '✦', section: 'Intelligence' },
  { id: 'users', label: 'User Management', icon: '👥', section: 'System' },
  { id: 'settings', label: 'Settings', icon: '◌', section: 'System' },
];

export default function Sidebar({ allowedViews = [] }) {
  const { activeView, setActiveView, lowStockProducts } = useStore();
  const { user } = useAuth();

  // ✅ Filter nav items based on role
  const visibleItems = navItems.filter(item => allowedViews.includes(item.id));

  const sections = ['Operations', 'Intelligence', 'System'];

  // ✅ Get initials from full name
  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <aside style={{
      width: '230px', minWidth: '230px', background: '#0d1f0e',
      display: 'flex', flexDirection: 'column', height: '100vh',
      position: 'sticky', top: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg, #2d7a35, #1a5c21)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🛒</div>
          <div>
            <div style={{ color: '#fff', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '14px', letterSpacing: '-0.3px' }}>FreshMart</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>Retail OS v2</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {sections.map(section => {
          const sectionItems = visibleItems.filter(item => item.section === section);
          if (sectionItems.length === 0) return null;
          return (
            <div key={section}>
              <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '8px 10px 6px', marginTop: '4px' }}>{section}</div>
              {sectionItems.map(item => (
                <NavItem key={item.id} item={item}
                  active={activeView === item.id}
                  onClick={() => setActiveView(item.id)}
                  badge={item.id === 'inventory' && lowStockProducts.length > 0 ? lowStockProducts.length : null} />
              ))}
            </div>
          );
        })}
      </nav>

      {/* ✅ Real user info at bottom */}
      <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #2d7a35, #1a5c21)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#fff' }}>
            {initials}
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}>{user?.fullName}</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>
              <span style={{
                background: user?.role === 'ADMIN' ? '#c53030' : user?.role === 'SUPERVISOR' ? '#975a16' : '#276749',
                color: '#fff', padding: '1px 6px', borderRadius: '8px', fontSize: '9px', fontWeight: 700,
              }}>{user?.role}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ item, active, onClick, badge }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
      padding: '9px 10px', borderRadius: '7px', border: 'none',
      background: active ? 'rgba(45,122,53,0.35)' : 'transparent',
      color: active ? '#6dcc77' : 'rgba(255,255,255,0.5)',
      cursor: 'pointer', fontSize: '13px', fontWeight: active ? 600 : 400,
      marginBottom: '1px', transition: 'all 0.15s', textAlign: 'left',
      fontFamily: "'DM Sans', sans-serif",
    }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; } }}
    >
      <span style={{ fontSize: '14px', width: '18px', textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
      <span style={{ flex: 1 }}>{item.label}</span>
      {badge && (
        <span style={{ background: '#e53e3e', color: '#fff', borderRadius: '10px', padding: '1px 6px', fontSize: '10px', fontWeight: 700 }}>{badge}</span>
      )}
      {active && <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#6dcc77', flexShrink: 0 }} />}
    </button>
  );
}
