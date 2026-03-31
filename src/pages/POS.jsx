import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Badge, Btn, fmt } from '../Components/UI';

const CATEGORIES = ['All', 'Dairy', 'Bakery', 'Produce', 'Beverages', 'Frozen', 'Meat', 'Pantry', 'Snacks'];

export default function POS() {
  const { products, cart, addToCart, updateCartQty, clearCart, checkout } = useStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [payMethod, setPayMethod] = useState('Card');
  const [lastReceipt, setLastReceipt] = useState(null);
  const [discount, setDiscount] = useState(0);

  const filtered = products.filter(p =>
    (category === 'All' || p.category === category) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discountAmt = subtotal * (discount / 100);
  const tax = (subtotal - discountAmt) * 0.08;
  const total = subtotal - discountAmt + tax;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const txn = checkout(payMethod);
    setLastReceipt(txn);
  };

  if (lastReceipt) {
    return <ReceiptView receipt={lastReceipt} onNew={() => setLastReceipt(null)} />;
  }

  return (
    <div style={{ display: 'flex', flex: 1, height: '100%', overflow: 'hidden', background: '#f7faf7' }}>
      {/* Products panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '20px', gap: '14px' }}>
        {/* Search & filter */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '14px' }}>🔍</span>
            <input
              placeholder="Search products or scan barcode..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px 10px 36px',
                border: '1px solid #d1d5db', borderRadius: '9px', fontSize: '13px',
                outline: 'none', background: '#fff', boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} style={{
              padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
              border: `1px solid ${category === cat ? '#2d7a35' : '#d1d5db'}`,
              background: category === cat ? '#2d7a35' : '#fff',
              color: category === cat ? '#fff' : '#4a5568',
              cursor: 'pointer', transition: 'all 0.15s',
            }}>{cat}</button>
          ))}
        </div>

        {/* Product grid */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
            {filtered.map(p => (
              <ProductTile key={p.id} product={p} onAdd={() => addToCart(p.id)} />
            ))}
          </div>
        </div>
      </div>

      {/* Cart panel */}
      <div style={{
        width: '340px', flexShrink: 0, background: '#fff',
        borderLeft: '1px solid #e8f0e9', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid #e8f0e9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '14px', color: '#0d1f0e' }}>Current order</div>
          {cart.length > 0 && <button onClick={clearCart} style={{ fontSize: '11px', color: '#c53030', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Clear all</button>}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af', fontSize: '13px' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🛒</div>
              Tap a product to add it to the order
            </div>
          ) : cart.map(item => (
            <div key={item.productId} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px', borderRadius: '8px', marginBottom: '4px',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#f7faf7'}
              onMouseLeave={e => e.currentTarget.style.background = ''}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a202c' }}>{item.name}</div>
                <div style={{ fontSize: '11px', color: '#6b7c6e' }}>{fmt(item.price)} each</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <QtyBtn onClick={() => updateCartQty(item.productId, -1)}>−</QtyBtn>
                <span style={{ fontSize: '13px', fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>{item.qty}</span>
                <QtyBtn onClick={() => updateCartQty(item.productId, 1)}>+</QtyBtn>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, minWidth: '52px', textAlign: 'right', color: '#1a202c' }}>{fmt(item.price * item.qty)}</div>
            </div>
          ))}
        </div>

        {/* Cart footer */}
        <div style={{ padding: '14px 18px', borderTop: '1px solid #e8f0e9' }}>
          {/* Discount */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', color: '#6b7c6e', flex: 1 }}>Discount %</span>
            <input type="number" min="0" max="100" value={discount}
              onChange={e => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
              style={{ width: '60px', padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px', textAlign: 'center' }} />
          </div>
          <TotalRow label="Subtotal" value={fmt(subtotal)} />
          {discount > 0 && <TotalRow label={`Discount (${discount}%)`} value={`-${fmt(discountAmt)}`} color="#c53030" />}
          <TotalRow label="Tax (8%)" value={fmt(tax)} />
          <div style={{ borderTop: '1px solid #e8f0e9', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: '16px' }}>Total</span>
            <span style={{ fontWeight: 700, fontSize: '18px', color: '#0d1f0e' }}>{fmt(total)}</span>
          </div>

          {/* Payment methods */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', margin: '12px 0' }}>
            {['Cash', 'Card', 'Mobile Pay', 'Voucher'].map(m => (
              <button key={m} onClick={() => setPayMethod(m)} style={{
                padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                border: `1px solid ${payMethod === m ? '#2d7a35' : '#d1d5db'}`,
                background: payMethod === m ? '#e6f4e8' : '#fff',
                color: payMethod === m ? '#1a6b23' : '#4a5568',
                transition: 'all 0.15s',
              }}>{m}</button>
            ))}
          </div>

          <button onClick={handleCheckout} disabled={cart.length === 0} style={{
            width: '100%', padding: '13px', background: cart.length === 0 ? '#d1d5db' : '#2d7a35',
            color: '#fff', border: 'none', borderRadius: '9px', fontSize: '14px', fontWeight: 700,
            cursor: cart.length === 0 ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            Process {payMethod} — {fmt(total)}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductTile({ product, onAdd }) {
  const isLow = product.quantity <= product.reorderAt;
  return (
    <div onClick={onAdd} style={{
      background: '#fff', border: '1px solid #e8f0e9', borderRadius: '10px',
      padding: '14px 12px', cursor: 'pointer', transition: 'all 0.15s',
      position: 'relative',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#2d7a35'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(45,122,53,0.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8f0e9'; e.currentTarget.style.boxShadow = 'none'; }}>
      <div style={{ fontSize: '11px', color: '#6b7c6e', marginBottom: '4px' }}>{product.category}</div>
      <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a202c', marginBottom: '6px', lineHeight: 1.3 }}>{product.name}</div>
      <div style={{ fontSize: '16px', fontWeight: 700, color: '#2d7a35' }}>{fmt(product.salePrice)}</div>
      <div style={{ fontSize: '11px', color: isLow ? '#c53030' : '#6b7c6e', marginTop: '4px' }}>
        {isLow ? '⚠ Low: ' : 'Stock: '}{product.quantity}
      </div>
    </div>
  );
}

function QtyBtn({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '24px', height: '24px', borderRadius: '6px',
      border: '1px solid #d1d5db', background: '#fff',
      cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, color: '#2d3748',
    }}>{children}</button>
  );
}

function TotalRow({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px', color: color || '#6b7c6e' }}>
      <span>{label}</span><span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function ReceiptView({ receipt, onNew }) {
  const now = new Date(receipt.timestamp);

  const handlePrint = () => {
    const printContent = document.getElementById('receipt-print-area').innerHTML;
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${receipt.id}</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; max-width: 380px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px dashed #ccc; padding-bottom: 14px; margin-bottom: 14px; }
            .store-name { font-size: 22px; font-weight: bold; }
            .item { display: flex; justify-content: space-between; margin-bottom: 6px; }
            .item-detail { font-size: 11px; color: #666; }
            .totals { border-top: 2px dashed #ccc; padding-top: 10px; margin-top: 10px; }
            .total-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px; }
            .grand-total { display: flex; justify-content: space-between; font-weight: bold; font-size: 16px; border-top: 1px solid #ccc; padding-top: 8px; margin-top: 8px; }
            .footer { text-align: center; margin-top: 18px; border-top: 2px dashed #ccc; padding-top: 14px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="store-name">FreshMart</div>
            <div>123 Main Street • Springfield</div>
            <div>${now.toLocaleDateString()} ${now.toLocaleTimeString()}</div>
            <div>Receipt #${receipt.id}</div>
          </div>
          ${receipt.items.map(item => `
            <div class="item">
              <span>${item.name}</span>
              <span>${fmt(item.price * item.qty)}</span>
            </div>
            <div class="item-detail">${item.qty} × ${fmt(item.price)}</div>
          `).join('')}
          <div class="totals">
            <div class="total-row"><span>Subtotal</span><span>${fmt(receipt.subtotal)}</span></div>
            <div class="total-row"><span>Tax (8%)</span><span>${fmt(receipt.tax)}</span></div>
            ${receipt.discount > 0 ? `<div class="total-row"><span>Discount</span><span>-${fmt(receipt.discount)}</span></div>` : ''}
            <div class="grand-total"><span>TOTAL</span><span>${fmt(receipt.total)}</span></div>
            <div class="total-row"><span>Payment</span><span>${receipt.paymentMethod}</span></div>
          </div>
          <div class="footer">Thank you for shopping at FreshMart!</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
  };

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '30px', background: '#f7faf7', overflowY: 'auto' }}>
      <div style={{ maxWidth: '400px', width: '100%' }}>
        <div id="receipt-print-area" style={{
          background: '#fff', border: '1px solid #e8f0e9', borderRadius: '14px',
          padding: '28px 24px', fontFamily: "'DM Mono', monospace",
        }}>
          <div style={{ textAlign: 'center', paddingBottom: '18px', borderBottom: '2px dashed #e8f0e9' }}>
            <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: "'DM Sans', sans-serif", color: '#0d1f0e' }}>FreshMart</div>
            <div style={{ fontSize: '12px', color: '#6b7c6e', marginTop: '4px' }}>123 Main Street • Springfield</div>
            <div style={{ fontSize: '12px', color: '#6b7c6e' }}>{now.toLocaleDateString()} {now.toLocaleTimeString()}</div>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px', letterSpacing: '1px' }}>Receipt #{receipt.id}</div>
          </div>

          <div style={{ padding: '14px 0' }}>
            {receipt.items.map((item, i) => (
              <div key={i} style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ fontWeight: 600 }}>{item.name}</span>
                  <span style={{ fontWeight: 600 }}>{fmt(item.price * item.qty)}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>{item.qty} × {fmt(item.price)}</div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '2px dashed #e8f0e9', paddingTop: '12px' }}>
            <ReceiptRow label="Subtotal" val={fmt(receipt.subtotal)} />
            <ReceiptRow label="Tax (8%)" val={fmt(receipt.tax)} />
            {receipt.discount > 0 && <ReceiptRow label="Discount" val={`-${fmt(receipt.discount)}`} />}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '16px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e8f0e9' }}>
              <span>TOTAL</span><span>{fmt(receipt.total)}</span>
            </div>
            <ReceiptRow label="Payment" val={receipt.paymentMethod} />
          </div>

          <div style={{ textAlign: 'center', marginTop: '18px', paddingTop: '14px', borderTop: '2px dashed #e8f0e9', fontSize: '12px', color: '#9ca3af' }}>
            Thank you for shopping at FreshMart!
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px', justifyContent: 'center' }}>
          <button onClick={onNew} style={{
            padding: '10px 20px', background: '#2d7a35', color: '#fff',
            border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer'
          }}>🛒 New Sale</button>
          <button onClick={handlePrint} style={{
            padding: '10px 20px', background: '#fff', color: '#2d7a35',
            border: '1px solid #2d7a35', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer'
          }}>🖨️ Print Receipt</button>
        </div>
      </div>
    </div>
  );
}

function ReceiptRow({ label, val }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7c6e', marginBottom: '4px' }}>
      <span>{label}</span><span>{val}</span>
    </div>
  );
}
