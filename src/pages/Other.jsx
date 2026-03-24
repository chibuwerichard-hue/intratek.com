import { Card, Btn, Input, Select } from '../components/UI';

export function Settings() {
  return (
    <div style={{ padding: '24px', flex: 1, overflowY: 'auto', background: '#f7faf7' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Card title="Store information">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Input label="Store name" defaultValue="FreshMart Superstore" />
            <Input label="Address" defaultValue="123 Main Street, Springfield" />
            <Input label="Phone" defaultValue="+1 555 000 1234" />
            <Input label="Email" defaultValue="manager@freshmart.com" />
            <Input label="Tax rate (%)" type="number" defaultValue="8" />
          </div>
          <div style={{ marginTop: '14px' }}>
            <Btn variant="primary">Save changes</Btn>
          </div>
        </Card>
        <Card title="Receipt settings">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Input label="Receipt footer message" defaultValue="Thank you for shopping at FreshMart!" />
            <Input label="Return policy text" defaultValue="Returns accepted within 30 days with receipt." />
            <Select label="Default currency">
              <option>USD ($)</option>
              <option>EUR (€)</option>
              <option>GBP (£)</option>
            </Select>
          </div>
          <div style={{ marginTop: '14px' }}>
            <Btn variant="primary">Save changes</Btn>
          </div>
        </Card>
        <Card title="User roles">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e8f0e9' }}>
                {['User', 'Role', 'Access level'].map(h => <th key={h} style={{ padding: '8px', textAlign: 'left', fontSize: '10px', fontWeight: 700, color: '#6b7c6e', textTransform: 'uppercase' }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Maria Garcia', role: 'Store Manager', access: 'Full access' },
                { name: 'John Smith', role: 'Cashier', access: 'POS only' },
                { name: 'Emma Davis', role: 'Analyst', access: 'Analytics, reports' },
              ].map(u => (
                <tr key={u.name} style={{ borderBottom: '1px solid #f0f5f0' }}>
                  <td style={{ padding: '10px 8px', fontWeight: 600 }}>{u.name}</td>
                  <td style={{ padding: '10px 8px', color: '#4a5568' }}>{u.role}</td>
                  <td style={{ padding: '10px 8px', color: '#1a6b23', fontWeight: 500 }}>{u.access}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: '12px' }}><Btn>+ Add user</Btn></div>
        </Card>
        <Card title="Integrations">
          {[
            { name: 'Barcode scanner', status: 'Connected', color: '#f0fff4', text: '#276749' },
            { name: 'Email service', status: 'Not configured', color: '#fffbeb', text: '#975a16' },
            { name: 'Accounting export', status: 'CSV export ready', color: '#f0fff4', text: '#276749' },
            { name: 'Supplier API', status: 'Not connected', color: '#fffbeb', text: '#975a16' },
          ].map(i => (
            <div key={i.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f5f0', fontSize: '13px' }}>
              <span style={{ fontWeight: 600 }}>{i.name}</span>
              <span style={{ background: i.color, color: i.text, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>{i.status}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

export function Receipts() {
  return (
    <div style={{ padding: '24px', flex: 1, overflowY: 'auto', background: '#f7faf7' }}>
      <div style={{ maxWidth: '460px', margin: '0 auto' }}>
        <div style={{ background: '#fff', border: '1px solid #e8f0e9', borderRadius: '14px', padding: '28px 26px', fontFamily: "'DM Mono', monospace" }}>
          <div style={{ textAlign: 'center', paddingBottom: '20px', borderBottom: '2px dashed #e8f0e9' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: "'DM Sans', sans-serif", color: '#0d1f0e' }}>FreshMart</div>
            <div style={{ fontSize: '12px', color: '#6b7c6e', marginTop: '4px' }}>123 Main Street · Springfield</div>
            <div style={{ fontSize: '12px', color: '#6b7c6e' }}>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px', letterSpacing: '1px' }}>RCP-2025-00247</div>
          </div>
          <div style={{ padding: '16px 0' }}>
            {[
              { name: 'Whole Milk 2L', qty: 2, price: 1.75 },
              { name: 'Sourdough Bread', qty: 1, price: 4.99 },
              { name: 'Organic Eggs 12pk', qty: 1, price: 5.49 },
              { name: 'Cheddar Cheese 400g', qty: 1, price: 6.29 },
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ fontWeight: 600 }}>{item.name}</span>
                  <span style={{ fontWeight: 600 }}>${(item.price * item.qty).toFixed(2)}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>{item.qty} × ${item.price.toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '2px dashed #e8f0e9', paddingTop: '12px' }}>
            {[['Subtotal', '$20.26'], ['Tax (8%)', '$1.62'], ['Discount', '-$0.00']].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7c6e', marginBottom: '4px' }}>
                <span>{l}</span><span>{v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '18px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e8f0e9' }}>
              <span>TOTAL</span><span>$21.88</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7c6e', marginTop: '6px' }}>
              <span>Payment</span><span>Card ••4821</span>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#9ca3af', borderTop: '2px dashed #e8f0e9', paddingTop: '16px' }}>
            Thank you for shopping at FreshMart!<br />
            Returns accepted within 30 days with receipt.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px', justifyContent: 'center' }}>
          <Btn variant="primary" onClick={() => window.print()}>Print receipt</Btn>
          <Btn>Download PDF</Btn>
          <Btn>Email receipt</Btn>
        </div>
      </div>
    </div>
  );
}
