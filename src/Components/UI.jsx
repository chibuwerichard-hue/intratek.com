// Metric KPI card
export function MetricCard({ label, value, change, changeType, icon, accent }) {
  const up = changeType === 'up';
  const down = changeType === 'down';
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e8f0e9',
      borderRadius: '12px',
      padding: '18px 20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {accent && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: accent, borderRadius: '12px 12px 0 0' }} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: '12px', color: '#6b7c6e', fontWeight: 500, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
        {icon && <span style={{ fontSize: '18px', opacity: 0.6 }}>{icon}</span>}
      </div>
      <div style={{ fontSize: '26px', fontWeight: 700, color: '#0d1f0e', fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.5px' }}>{value}</div>
      {change && (
        <div style={{ fontSize: '12px', marginTop: '6px', color: up ? '#1a6b23' : down ? '#c53030' : '#6b7c6e', fontWeight: 500 }}>
          {up ? '↑' : down ? '↓' : '→'} {change}
        </div>
      )}
    </div>
  );
}

// Status badge
export function Badge({ children, color = 'green' }) {
  const colors = {
    green: { bg: '#e6f4e8', text: '#1a6b23', border: '#b7debb' },
    red: { bg: '#fde8e8', text: '#c53030', border: '#f5b8b8' },
    amber: { bg: '#fef3e2', text: '#975a16', border: '#f6d860' },
    blue: { bg: '#e6f0fb', text: '#1a56a0', border: '#b5d0f5' },
    gray: { bg: '#f0f2f0', text: '#4a5568', border: '#d1d5db' },
  };
  const c = colors[color] || colors.gray;
  return (
    <span style={{
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

// Alert banner
export function Alert({ type = 'info', children }) {
  const styles = {
    warning: { bg: '#fffbeb', border: '#f6d860', text: '#975a16', icon: '⚠' },
    danger: { bg: '#fff5f5', border: '#fc8181', text: '#c53030', icon: '⊗' },
    info: { bg: '#ebf8ff', border: '#90cdf4', text: '#2a69ac', icon: 'ℹ' },
    success: { bg: '#f0fff4', border: '#9ae6b4', text: '#276749', icon: '✓' },
  };
  const s = styles[type];
  return (
    <div style={{
      background: s.bg, border: `1px solid ${s.border}`, borderRadius: '8px',
      padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: '10px',
      fontSize: '13px', color: s.text, marginBottom: '10px',
    }}>
      <span style={{ flexShrink: 0, marginTop: '1px' }}>{s.icon}</span>
      <span>{children}</span>
    </div>
  );
}

// Card wrapper
export function Card({ children, title, action, style = {} }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e8f0e9', borderRadius: '12px',
      padding: '20px 22px', ...style,
    }}>
      {title && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</div>
          {action && action}
        </div>
      )}
      {children}
    </div>
  );
}

// Page header
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div style={{
      background: '#fff', borderBottom: '1px solid #e8f0e9',
      padding: '16px 28px', display: 'flex', alignItems: 'center',
      gap: '16px', flexShrink: 0,
    }}>
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#0d1f0e', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{title}</h1>
        {subtitle && <div style={{ fontSize: '12px', color: '#6b7c6e', marginTop: '2px' }}>{subtitle}</div>}
      </div>
      {actions && <div style={{ display: 'flex', gap: '8px' }}>{actions}</div>}
    </div>
  );
}

// Button
export function Btn({ children, onClick, variant = 'default', size = 'md', disabled = false, style = {} }) {
  const variants = {
    primary: { bg: '#2d7a35', color: '#fff', border: '#2d7a35', hover: '#1e5c25' },
    danger: { bg: '#e53e3e', color: '#fff', border: '#e53e3e', hover: '#c53030' },
    default: { bg: '#fff', color: '#2d3748', border: '#d1d5db', hover: '#f7fafc' },
    ghost: { bg: 'transparent', color: '#4a5568', border: 'transparent', hover: '#f7fafc' },
  };
  const sizes = { sm: '6px 12px', md: '9px 18px', lg: '12px 24px' };
  const v = variants[variant];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: sizes[size], background: disabled ? '#e2e8f0' : v.bg,
      color: disabled ? '#a0aec0' : v.color,
      border: `1px solid ${disabled ? '#e2e8f0' : v.border}`,
      borderRadius: '8px', cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: size === 'sm' ? '12px' : '13px', fontWeight: 600,
      fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s',
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      ...style,
    }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = v.hover; }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = v.bg; }}
    >
      {children}
    </button>
  );
}

// Input
export function Input({ label, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {label && <label style={{ fontSize: '11px', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>}
      <input {...props} style={{
        padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px',
        fontSize: '13px', color: '#1a202c', background: '#fff', outline: 'none',
        fontFamily: "'DM Sans', sans-serif",
        transition: 'border-color 0.15s',
        ...props.style,
      }}
        onFocus={e => e.target.style.borderColor = '#2d7a35'}
        onBlur={e => e.target.style.borderColor = '#d1d5db'}
      />
    </div>
  );
}

// Select
export function Select({ label, children, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {label && <label style={{ fontSize: '11px', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>}
      <select {...props} style={{
        padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px',
        fontSize: '13px', color: '#1a202c', background: '#fff', outline: 'none',
        fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
        ...props.style,
      }}>
        {children}
      </select>
    </div>
  );
}

export function fmt(n) { return '$' + Number(n).toFixed(2); }
export function fmtPct(n) { return Number(n).toFixed(1) + '%'; }
