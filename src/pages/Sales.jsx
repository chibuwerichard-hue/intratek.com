import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Card, Badge, fmt } from '../Components/UI';

export default function Sales() {
  const { transactions } = useStore();
  const [filter, setFilter] = useState('all');

  const filtered = transactions.filter(t => {
    const d = new Date(t.timestamp);
    const now = new Date();
    if (filter === 'today') return d.toDateString() === now.toDateString();
    if (filter === 'week') return (now - d) / (1000 * 60 * 60 * 24) <= 7;
    return true;
  }).slice(0, 50);

  const totalRevenue = filtered.reduce((s, t) => s + t.total, 0);
  const totalProfit = filtered.reduce((s, t) => s + t.items.reduce((ss, i) => ss + (i.price - i.cost) * i.qty, 0), 0);

  return (
    <div style={{ padding: '24px', flex: 1, overflowY: 'auto', background: '#f7faf7' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <StatCard label="Transactions shown" value={filtered.length} />
        <StatCard label="Total revenue" value={fmt(totalRevenue)} />
        <StatCard label="Total profit" value={fmt(totalProfit)} green />
        <StatCard label="Avg transaction" value={fmt(filtered.length ? totalRevenue / filtered.length : 0)} />
      </div>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Transaction log</div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['all', 'today', 'week'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                border: `1px solid ${filter === f ? '#2d7a35' : '#d1d5db'}`,
                background: filter === f ? '#2d7a35' : '#fff',
                color: filter === f ? '#fff' : '#4a5568',
              }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
            ))}
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e8f0e9' }}>
                {['Transaction ID', 'Items', 'Subtotal', 'Tax', 'Total', 'Profit', 'Payment', 'Time'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: '#6b7c6e', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => {
                const profit = t.items.reduce((s, i) => s + (i.price - i.cost) * i.qty, 0);
                const payColors = { Cash: 'gray', Card: 'blue', 'Mobile Pay': 'green' };
                return (
                  <tr key={t.id} style={{ borderBottom: '1px solid #f0f5f0' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f7faf7'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: '11px', color: '#6b7c6e' }}>{t.id}</td>
                    <td style={{ padding: '10px 12px', color: '#4a5568' }}>{t.items.length} item{t.items.length > 1 ? 's' : ''}</td>
                    <td style={{ padding: '10px 12px' }}>{fmt(t.subtotal)}</td>
                    <td style={{ padding: '10px 12px', color: '#6b7c6e' }}>{fmt(t.tax)}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 700 }}>{fmt(t.total)}</td>
                    <td style={{ padding: '10px 12px', color: '#1a6b23', fontWeight: 600 }}>{fmt(profit)}</td>
                    <td style={{ padding: '10px 12px' }}><Badge color={payColors[t.paymentMethod] || 'gray'}>{t.paymentMethod}</Badge></td>
                    <td style={{ padding: '10px 12px', color: '#6b7c6e', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {new Date(t.timestamp).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StatCard({ label, value, green }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e8f0e9', borderRadius: '10px', padding: '14px 16px' }}>
      <div style={{ fontSize: '11px', fontWeight: 600, color: '#6b7c6e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: 700, color: green ? '#1a6b23' : '#0d1f0e', fontFamily: "'DM Sans', sans-serif" }}>{value}</div>
    </div>
  );
}

