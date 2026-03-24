import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Badge, Btn, Card, Alert, Input, Select, fmt } from '../components/UI';

const CATEGORIES = ['Dairy', 'Bakery', 'Produce', 'Beverages', 'Frozen', 'Meat', 'Pantry', 'Snacks'];

const emptyForm = {
  name: '', category: 'Dairy', purchasePrice: '', salePrice: '', quantity: '', reorderAt: '', supplier: '', expiry: '', barcode: '',
};

function getStatus(p) {
  const days = (new Date(p.expiry) - new Date()) / (1000 * 60 * 60 * 24);
  if (days <= 2) return { label: 'Expiring', color: 'red' };
  if (days <= 7) return { label: 'Exp. Soon', color: 'amber' };
  if (p.quantity <= p.reorderAt) return { label: 'Low Stock', color: 'amber' };
  if (p.quantity === 0) return { label: 'Out of Stock', color: 'red' };
  return { label: 'In Stock', color: 'green' };
}

export default function Inventory() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [sortBy, setSortBy] = useState('name');

  const filtered = products
    .filter(p => (catFilter === 'All' || p.category === catFilter) && p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'qty') return a.quantity - b.quantity;
      if (sortBy === 'margin') return (((b.salePrice - b.purchasePrice) / b.salePrice) - ((a.salePrice - a.purchasePrice) / a.salePrice));
      return 0;
    });

  const handleSubmit = () => {
    if (!form.name || !form.purchasePrice || !form.salePrice || !form.quantity) return;
    const data = {
      ...form,
      purchasePrice: parseFloat(form.purchasePrice),
      salePrice: parseFloat(form.salePrice),
      quantity: parseInt(form.quantity),
      reorderAt: parseInt(form.reorderAt) || 10,
    };
    if (editingId) { updateProduct(editingId, data); setEditingId(null); }
    else addProduct(data);
    setForm(emptyForm);
    setShowForm(false);
  };

  const handleEdit = (p) => {
    setForm({
      name: p.name,
      category: p.category || 'Dairy',
      purchasePrice: p.purchasePrice,
      salePrice: p.salePrice,
      quantity: p.quantity,
      reorderAt: p.reorderAt || '',
      supplier: p.supplier || '',
      expiry: p.expiry || '',
      barcode: p.barcode || ''
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const expiringCount = products.filter(p => (new Date(p.expiry) - new Date()) / (1000 * 60 * 60 * 24) <= 7).length;
  const lowStockCount = products.filter(p => p.quantity <= p.reorderAt).length;

  return (
    <div style={{ padding: '24px', flex: 1, overflowY: 'auto', background: '#f7faf7' }}>
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <SummaryCard label="Total products" value={products.length} icon="📦" />
        <SummaryCard label="Total stock value" value={fmt(products.reduce((s, p) => s + (p.purchasePrice || 0) * p.quantity, 0))} icon="💰" />
        <SummaryCard label="Low stock alerts" value={lowStockCount} icon="⚠" highlight={lowStockCount > 0} />
        <SummaryCard label="Expiring soon" value={expiringCount} icon="⏰" highlight={expiringCount > 0} />
      </div>

      {expiringCount > 0 && (
        <Alert type="danger">
          {expiringCount} product(s) expire within 7 days. Consider markdowns or returns to suppliers.
        </Alert>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, position: 'relative', minWidth: '200px' }}>
          <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>🔍</span>
          <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '9px 12px 9px 32px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }} />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          style={{ padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', background: '#fff' }}>
          <option>All</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', background: '#fff' }}>
          <option value="name">Sort: Name</option>
          <option value="qty">Sort: Stock level</option>
          <option value="margin">Sort: Margin</option>
        </select>
        <Btn variant="primary" onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm); }}>
          + {showForm && !editingId ? 'Cancel' : 'Add Product'}
        </Btn>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <Card title={editingId ? 'Edit product' : 'Add new product'} style={{ marginBottom: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            <Input label="Product name" placeholder="e.g. Organic Whole Milk" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Select label="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </Select>
            <Input label="Barcode" placeholder="EAN barcode" value={form.barcode} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))} />
            <Input label="Purchase price ($)" type="number" placeholder="0.00" value={form.purchasePrice} onChange={e => setForm(f => ({ ...f, purchasePrice: e.target.value }))} />
            <Input label="Sale price ($)" type="number" placeholder="0.00" value={form.salePrice} onChange={e => setForm(f => ({ ...f, salePrice: e.target.value }))} />
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '5px' }}>Margin</label>
              <div style={{ padding: '9px 12px', background: '#f0f5f0', borderRadius: '8px', fontSize: '13px', color: form.salePrice && form.purchasePrice ? '#1a6b23' : '#9ca3af', fontWeight: 600 }}>
                {form.salePrice && form.purchasePrice ? `${(((form.salePrice - form.purchasePrice) / form.salePrice) * 100).toFixed(1)}%` : '—'}
              </div>
            </div>
            <Input label="Quantity" type="number" placeholder="0" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
            <Input label="Reorder threshold" type="number" placeholder="10" value={form.reorderAt} onChange={e => setForm(f => ({ ...f, reorderAt: e.target.value }))} />
            <Input label="Supplier" placeholder="Supplier name" value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} />
            <Input label="Expiry date" type="date" value={form.expiry} onChange={e => setForm(f => ({ ...f, expiry: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <Btn variant="primary" onClick={handleSubmit}>{editingId ? 'Update product' : 'Add product'}</Btn>
            <Btn onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }}>Cancel</Btn>
          </div>
        </Card>
      )}

      {/* Products table */}
      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e8f0e9' }}>
                {['ID', 'Product', 'Category', 'Buy Price', 'Sale Price', 'Margin', 'Stock', 'Reorder At', 'Supplier', 'Expiry', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '9px 10px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: '#6b7c6e', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                // ✅ FIXED: using purchasePrice and salePrice
                const margin = p.salePrice && p.purchasePrice ? (((p.salePrice - p.purchasePrice) / p.salePrice) * 100).toFixed(1) : '0.0';
                const status = getStatus(p);
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f0f5f0' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f7faf7'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td style={{ padding: '10px', color: '#9ca3af', fontSize: '11px' }}>{p.id}</td>
                    <td style={{ padding: '10px', fontWeight: 600, color: '#1a202c', whiteSpace: 'nowrap' }}>{p.name}</td>
                    <td style={{ padding: '10px' }}><Badge color="blue">{p.category}</Badge></td>
                    <td style={{ padding: '10px', color: '#4a5568' }}>{fmt(p.purchasePrice)}</td>
                    <td style={{ padding: '10px', fontWeight: 600 }}>{fmt(p.salePrice)}</td>
                    <td style={{ padding: '10px', color: parseFloat(margin) >= 25 ? '#1a6b23' : parseFloat(margin) < 15 ? '#c53030' : '#975a16', fontWeight: 600 }}>{margin}%</td>
                    <td style={{ padding: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '40px', height: '5px', borderRadius: '3px', background: '#e8f0e9', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.min(100, (p.quantity / ((p.reorderAt || 10) * 3)) * 100)}%`, background: p.quantity <= p.reorderAt ? '#e53e3e' : '#2d7a35', borderRadius: '3px' }} />
                        </div>
                        <span style={{ fontWeight: 600 }}>{p.quantity}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px', color: '#6b7c6e' }}>{p.reorderAt}</td>
                    <td style={{ padding: '10px', color: '#4a5568', fontSize: '12px' }}>{p.supplier}</td>
                    <td style={{ padding: '10px', fontSize: '12px', color: '#4a5568' }}>{p.expiry}</td>
                    <td style={{ padding: '10px' }}><Badge color={status.color}>{status.label}</Badge></td>
                    <td style={{ padding: '10px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <ActionBtn onClick={() => handleEdit(p)}>Edit</ActionBtn>
                        <ActionBtn color="red" onClick={() => deleteProduct(p.id)}>Del</ActionBtn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: '12px', fontSize: '12px', color: '#9ca3af' }}>
          Showing {filtered.length} of {products.length} products
        </div>
      </Card>
    </div>
  );
}

function SummaryCard({ label, value, icon, highlight }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${highlight ? '#fde8e8' : '#e8f0e9'}`, borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ fontSize: '22px' }}>{icon}</div>
      <div>
        <div style={{ fontSize: '11px', color: '#6b7c6e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
        <div style={{ fontSize: '20px', fontWeight: 700, color: highlight ? '#c53030' : '#0d1f0e', fontFamily: "'DM Sans', sans-serif" }}>{value}</div>
      </div>
    </div>
  );
}

function ActionBtn({ children, onClick, color }) {
  const isRed = color === 'red';
  return (
    <button onClick={onClick} style={{
      padding: '4px 8px', borderRadius: '5px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
      border: `1px solid ${isRed ? '#fc8181' : '#d1d5db'}`,
      background: isRed ? '#fff5f5' : '#f9fafb',
      color: isRed ? '#c53030' : '#4a5568',
    }}>{children}</button>
  );
}
