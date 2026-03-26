import { useStore } from '../context/StoreContext';
import { MetricCard, Card, Badge, fmt } from '../Components/UI';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Analytics() {
  const { products, transactions } = useStore();

  // ✅ Real KPI calculations
  const totalRevenue = transactions.reduce((s, t) => s + t.total, 0);
  const totalCost = transactions.reduce((s, t) =>
    s + t.items.reduce((ss, i) => ss + (i.cost || 0) * i.qty, 0), 0);
  const totalProfit = totalRevenue - totalCost;
  const grossMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0.0';

  // ✅ Real monthly data from transactions
  const monthlyMap = {};
  transactions.forEach(t => {
    const month = new Date(t.timestamp).toLocaleDateString('en-US', { month: 'short' });
    if (!monthlyMap[month]) monthlyMap[month] = { month, revenue: 0, cost: 0, profit: 0 };
    const txnCost = t.items.reduce((s, i) => s + (i.cost || 0) * i.qty, 0);
    monthlyMap[month].revenue += t.total;
    monthlyMap[month].cost += txnCost;
    monthlyMap[month].profit += t.total - txnCost;
  });
  const monthlyData = Object.values(monthlyMap).map(m => ({
    month: m.month,
    revenue: parseFloat(m.revenue.toFixed(2)),
    cost: parseFloat(m.cost.toFixed(2)),
    profit: parseFloat(m.profit.toFixed(2)),
  }));

  // ✅ Real category profit
  const categoryMap = {};
  transactions.forEach(t => {
    t.items.forEach(item => {
      const product = products.find(p => p.name === item.name);
      const cat = product?.category || 'Other';
      if (!categoryMap[cat]) categoryMap[cat] = 0;
      categoryMap[cat] += (item.price - (item.cost || 0)) * item.qty;
    });
  });
  const categoryProfit = Object.entries(categoryMap)
    .map(([cat, profit]) => ({ cat, profit: parseFloat(profit.toFixed(2)) }))
    .sort((a, b) => b.profit - a.profit);

  // ✅ Real product analytics from transactions
  const productMap = {};
  transactions.forEach(t => {
    t.items.forEach(item => {
      if (!productMap[item.name]) {
        productMap[item.name] = { name: item.name, sold: 0, revenue: 0, cost: 0, profit: 0 };
      }
      const itemCost = (item.cost || 0) * item.qty;
      const itemRevenue = item.price * item.qty;
      productMap[item.name].sold += item.qty;
      productMap[item.name].revenue += itemRevenue;
      productMap[item.name].cost += itemCost;
      productMap[item.name].profit += itemRevenue - itemCost;
    });
  });
  const productAnalytics = Object.values(productMap)
    .map(p => ({
      ...p,
      margin: p.revenue > 0 ? parseFloat(((p.profit / p.revenue) * 100).toFixed(1)) : 0,
      lossFlag: p.profit < 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // ✅ Real loss indicators
  const expiredValue = products
    .filter(p => p.expiry && new Date(p.expiry) < new Date())
    .reduce((s, p) => s + (p.purchasePrice || 0) * (p.quantity || 0), 0);
  const unsoldValue = products
    .filter(p => p.quantity > (p.reorderAt || 0))
    .reduce((s, p) => s + (p.purchasePrice || 0) * (p.quantity - (p.reorderAt || 0)), 0);
  const belowCostSales = transactions.reduce((s, t) =>
    s + t.items.reduce((ss, i) => {
      const loss = (i.cost || 0) > i.price ? (i.cost - i.price) * i.qty : 0;
      return ss + loss;
    }, 0), 0);

  return (
    <div style={{ padding: '24px', flex: 1, overflowY: 'auto', background: '#f7faf7' }}>

      {/* ✅ Real KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
        <MetricCard label="Total revenue" value={fmt(totalRevenue)} change={`${transactions.length} transactions`} changeType="up" icon="💰" accent="#2d7a35" />
        <MetricCard label="Total cost" value={fmt(totalCost)} change="Cost of goods sold" changeType="down" icon="📉" accent="#f6ad55" />
        <MetricCard label="Net profit" value={fmt(totalProfit)} change={totalProfit >= 0 ? 'Profitable' : 'Loss making'} changeType={totalProfit >= 0 ? 'up' : 'down'} icon="✅" accent="#48bb78" />
        <MetricCard label="Gross margin" value={`${grossMargin}%`} change="Revenue minus cost" changeType="up" icon="📊" accent="#63b3ed" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

        {/* ✅ Real monthly trend */}
        <Card title="Revenue vs profit — monthly trend">
          {monthlyData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af', fontSize: '13px' }}>
              No transactions yet. Start making sales in POS! 🛒
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2d7a35" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2d7a35" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#48bb78" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#48bb78" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f5f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v.toFixed(0)}`} />
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Area type="monotone" dataKey="revenue" stroke="#2d7a35" fill="url(#revGrad)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="profit" stroke="#48bb78" fill="url(#profGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                <LegDot color="#2d7a35" label="Revenue" />
                <LegDot color="#48bb78" label="Profit" />
              </div>
            </>
          )}
        </Card>

        {/* ✅ Real category profit */}
        <Card title="Profit by category">
          {categoryProfit.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af', fontSize: '13px' }}>
              No sales data yet 🛒
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryProfit} layout="vertical" barSize={14}>
                <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <YAxis type="category" dataKey="cat" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
                <Tooltip formatter={(v) => fmt(v)} />
                <Bar dataKey="profit" fill="#2d7a35" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* ✅ Real loss analysis */}
      <Card title="Loss & waste analysis" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '14px' }}>
          <LossCard label="Expired products" value={fmt(expiredValue)} icon="⏰" color="#fde8e8" textColor="#c53030" />
          <LossCard label="Unsold inventory" value={fmt(unsoldValue)} icon="📦" color="#fef3e2" textColor="#975a16" />
          <LossCard label="Shrinkage est." value={fmt(unsoldValue * 0.05)} icon="🔍" color="#fef3e2" textColor="#975a16" />
          <LossCard label="Below-cost sales" value={fmt(belowCostSales)} icon="✅" color="#f0fff4" textColor="#276749" />
        </div>
      </Card>

      {/* ✅ Real product analytics */}
      <Card title="Product analytics — all transactions">
        {productAnalytics.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#9ca3af', fontSize: '13px' }}>
            No transactions yet. Start making sales in POS! 🛒
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e8f0e9' }}>
                  {['Product', 'Units Sold', 'Revenue', 'Cost', 'Profit', 'Margin', 'Loss Flag'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: '#6b7c6e', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {productAnalytics.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f0f5f0' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f7faf7'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1a202c' }}>{p.name}</td>
                    <td style={{ padding: '10px 12px' }}>{p.sold}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{fmt(p.revenue)}</td>
                    <td style={{ padding: '10px 12px', color: '#6b7c6e' }}>{fmt(p.cost)}</td>
                    <td style={{ padding: '10px 12px', color: p.profit >= 0 ? '#1a6b23' : '#c53030', fontWeight: 700 }}>{fmt(p.profit)}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ color: p.margin >= 50 ? '#1a6b23' : p.margin < 30 ? '#c53030' : '#975a16', fontWeight: 600 }}>{p.margin}%</span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <Badge color={p.lossFlag ? 'red' : 'green'}>{p.lossFlag ? '⚠ Watch' : '✅ OK'}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function LegDot({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6b7c6e' }}>
      <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: color }} />
      {label}
    </div>
  );
}

function LossCard({ label, value, icon, color, textColor }) {
  return (
    <div style={{ background: color, borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{ fontSize: '22px' }}>{icon}</span>
      <div>
        <div style={{ fontSize: '11px', color: textColor, fontWeight: 600, opacity: 0.8 }}>{label}</div>
        <div style={{ fontSize: '20px', fontWeight: 700, color: textColor, fontFamily: "'DM Sans', sans-serif" }}>{value}</div>
      </div>
    </div>
  );
}

