import { useStore } from '../context/StoreContext';
import { MetricCard, Card, Alert, Badge, fmt, fmtPct } from '../Components/UI';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const CATEGORY_COLORS = {
  Dairy: '#2d7a35', Produce: '#48bb78', Bakery: '#f6ad55',
  Beverages: '#63b3ed', Frozen: '#9f7aea', Meat: '#fc8181',
  Pantry: '#f6e05e', Snacks: '#a0aec0', Other: '#cbd5e0',
};

export default function Dashboard() {
  const { products, transactions, lowStockProducts, todayRevenue, todayProfit, todayTransactions } = useStore();

  // ✅ Real expiring products
  const expiringProducts = products.filter(p => {
    const days = (new Date(p.expiry) - new Date()) / (1000 * 60 * 60 * 24);
    return days <= 7 && days >= 0;
  });

  // ✅ Real weekly revenue & profit from transactions
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayTxns = transactions.filter(t => new Date(t.timestamp).toDateString() === d.toDateString());
    const revenue = dayTxns.reduce((s, t) => s + t.total, 0);
    const profit = dayTxns.reduce((s, t) => s + t.items.reduce((ss, item) => ss + (item.price - (item.cost || 0)) * item.qty, 0), 0);
    return { day: dayName, revenue: parseFloat(revenue.toFixed(2)), profit: parseFloat(profit.toFixed(2)) };
  });

  // ✅ Real category breakdown from products
  const categoryMap = {};
  products.forEach(p => {
    const cat = p.category || 'Other';
    if (!categoryMap[cat]) categoryMap[cat] = 0;
    categoryMap[cat] += (p.salePrice || 0) * (p.quantity || 0);
  });
  const totalCatValue = Object.values(categoryMap).reduce((s, v) => s + v, 0);
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value: totalCatValue > 0 ? parseFloat(((value / totalCatValue) * 100).toFixed(1)) : 0,
    color: CATEGORY_COLORS[name] || '#a0aec0',
  })).sort((a, b) => b.value - a.value);

  // ✅ Real top products from transactions
  const productSales = {};
  transactions.forEach(t => {
    t.items.forEach(item => {
      if (!productSales[item.name]) productSales[item.name] = { name: item.name, sold: 0, revenue: 0, profit: 0 };
      productSales[item.name].sold += item.qty;
      productSales[item.name].revenue += item.price * item.qty;
      productSales[item.name].profit += (item.price - (item.cost || 0)) * item.qty;
    });
  });
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // ✅ Real KPI calculations
  const totalRevenue = transactions.reduce((s, t) => s + t.total, 0);
  const totalProfit = transactions.reduce((s, t) =>
    s + t.items.reduce((ss, i) => ss + (i.price - (i.cost || 0)) * i.qty, 0), 0);
  const netMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0.0';
  const inventoryValue = products.reduce((s, p) => s + (p.purchasePrice || 0) * (p.quantity || 0), 0);

  // ✅ Real payment method breakdown
  const paymentMethods = ['Cash', 'Card', 'Mobile Pay', 'Voucher'];
  const paymentCounts = {};
  todayTransactions.forEach(t => {
    paymentCounts[t.paymentMethod] = (paymentCounts[t.paymentMethod] || 0) + 1;
  });
  const totalTxns = todayTransactions.length || 1;
  const avgBasket = todayTransactions.length > 0 ? todayRevenue / todayTransactions.length : 0;

  return (
    <div style={{ padding: '24px', overflowY: 'auto', flex: 1, background: '#f7faf7' }}>

      {/* Alerts */}
      {lowStockProducts.length > 0 && (
        <Alert type="warning">
          <strong>{lowStockProducts.length} products below reorder threshold:</strong>{' '}
          {lowStockProducts.slice(0, 3).map(p => p.name).join(', ')}{lowStockProducts.length > 3 ? ` and ${lowStockProducts.length - 3} more` : ''}.
        </Alert>
      )}
      {expiringProducts.length > 0 && (
        <Alert type="danger">
          <strong>{expiringProducts.length} products expiring within 7 days:</strong>{' '}
          {expiringProducts.slice(0, 2).map(p => p.name).join(', ')}. Consider markdowns to clear stock.
        </Alert>
      )}

      {/* ✅ Real KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
        <MetricCard label="Revenue today" value={fmt(todayRevenue)} change={`${todayTransactions.length} transactions`} changeType="up" icon="💰" accent="#2d7a35" />
        <MetricCard label="Total revenue" value={fmt(totalRevenue)} change={`${transactions.length} total transactions`} changeType="up" icon="📈" accent="#48bb78" />
        <MetricCard label="Net profit margin" value={`${netMargin}%`} change={`Total profit: ${fmt(totalProfit)}`} changeType="up" icon="📊" accent="#f6ad55" />
        <MetricCard label="Inventory value" value={fmt(inventoryValue)} change={`${products.length} products`} changeType="up" icon="📦" accent="#63b3ed" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

        {/* ✅ Real weekly chart */}
        <Card title="Weekly revenue & profit">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={last7Days} barSize={18}>
              <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip formatter={(v, n) => [fmt(v), n]} />
              <Bar dataKey="revenue" fill="#2d7a35" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" fill="#a8d5b0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
            <LegendDot color="#2d7a35" label="Revenue" />
            <LegendDot color="#a8d5b0" label="Profit" />
          </div>
        </Card>

        {/* ✅ Real category pie */}
        <Card title="Inventory value by category">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <PieChart width={160} height={160}>
              <Pie data={categoryData} cx={75} cy={75} innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={2}>
                {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
            </PieChart>
            <div style={{ flex: 1 }}>
              {categoryData.slice(0, 6).map(c => (
                <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '7px', fontSize: '12px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: c.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, color: '#4a5568' }}>{c.name}</span>
                  <span style={{ fontWeight: 600, color: '#1a202c' }}>{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* ✅ Real top products */}
      <Card title="Top products — all time" style={{ marginBottom: '16px' }}>
        {topProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#9ca3af', fontSize: '13px' }}>
            No transactions yet. Start making sales in POS! 🛒
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e8f0e9' }}>
                  {['#', 'Product', 'Units Sold', 'Revenue', 'Profit', 'Margin'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: '#6b7c6e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => {
                  const margin = p.revenue > 0 ? ((p.profit / p.revenue) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #f0f5f0' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f7faf7'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td style={{ padding: '10px 12px', color: '#6b7c6e', fontWeight: 600 }}>{i + 1}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1a202c' }}>{p.name}</td>
                      <td style={{ padding: '10px 12px', color: '#2d3748' }}>{p.sold}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>{fmt(p.revenue)}</td>
                      <td style={{ padding: '10px 12px', color: '#1a6b23', fontWeight: 600 }}>{fmt(p.profit)}</td>
                      <td style={{ padding: '10px 12px' }}>{margin}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>

        {/* ✅ Real inventory health */}
        <Card title="Inventory health">
          <div style={{ fontSize: '36px', fontWeight: 700, color: '#0d1f0e', fontFamily: "'DM Sans', sans-serif" }}>
            {products.length > 0 ? `${(((products.length - lowStockProducts.length) / products.length) * 100).toFixed(0)}%` : '0%'}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7c6e', marginBottom: '12px' }}>Products at healthy stock levels</div>
          <div style={{ height: '8px', borderRadius: '4px', background: '#e8f0e9', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${products.length > 0 ? ((products.length - lowStockProducts.length) / products.length) * 100 : 0}%`, background: 'linear-gradient(90deg, #2d7a35, #48bb78)', borderRadius: '4px' }} />
          </div>
          <div style={{ fontSize: '11px', color: '#c53030', marginTop: '6px', fontWeight: 600 }}>
            {lowStockProducts.length} products need restocking
          </div>
        </Card>

        {/* ✅ Real loss indicators */}
        <Card title="Stock indicators">
          {[
            { label: 'Total products', val: products.length, color: 'green' },
            { label: 'Low stock items', val: lowStockProducts.length, color: lowStockProducts.length > 0 ? 'amber' : 'green' },
            { label: 'Expiring soon', val: expiringProducts.length, color: expiringProducts.length > 0 ? 'red' : 'green' },
            { label: 'Total inventory value', val: fmt(inventoryValue), color: 'green' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #f0f5f0', fontSize: '13px' }}>
              <span style={{ color: '#4a5568' }}>{item.label}</span>
              <Badge color={item.color}>{item.val}</Badge>
            </div>
          ))}
        </Card>

        {/* ✅ Real today's transactions */}
        <Card title="Today's transactions">
          <div style={{ fontSize: '36px', fontWeight: 700, color: '#0d1f0e', fontFamily: "'DM Sans', sans-serif" }}>
            {todayTransactions.length}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7c6e', marginBottom: '12px' }}>
            Avg basket: {fmt(avgBasket)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {paymentMethods.map(m => {
              const count = paymentCounts[m] || 0;
              const pct = Math.round((count / totalTxns) * 100);
              return (
                <div key={m} style={{ fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ color: '#6b7c6e' }}>{m}</span>
                    <span style={{ fontWeight: 600 }}>{pct}%</span>
                  </div>
                  <div style={{ height: '4px', borderRadius: '2px', background: '#e8f0e9' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: '#2d7a35', borderRadius: '2px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6b7c6e' }}>
      <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: color }} />
      {label}
    </div>
  );
}

