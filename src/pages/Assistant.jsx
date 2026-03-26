import { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Card } from '../Components/UI';

const QUICK_PROMPTS = [
  "What were the best selling products this week?",
  "Which items are causing losses?",
  "Show products with low inventory",
  "What is today's total profit?",
  "Predict next month's demand",
  "Which categories are most profitable?",
  "What should I reorder today?",
  "Which products are expiring soon?",
];

export default function Assistant() {
  const { products, transactions, todayRevenue, todayProfit, lowStockProducts } = useStore();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your FreshMart AI business assistant. I have full access to your inventory, sales data, and analytics. Ask me anything about your store operations, profits, or stock levels.",
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const msgsEndRef = useRef(null);

  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const buildContext = () => {
    const expiringProducts = products.filter(p => {
      const days = (new Date(p.expiry) - new Date()) / (1000 * 60 * 60 * 24);
      return days <= 7;
    });

    return `You are an AI business assistant for FreshMart Superstore. You have access to the following real-time business data:

INVENTORY (${products.length} products):
${products.slice(0, 10).map(p => `- ${p.name} (${p.category}): ${p.quantity} units in stock, buy $${p.buyPrice}, sell $${p.sellPrice}, margin ${(((p.sellPrice-p.buyPrice)/p.sellPrice)*100).toFixed(1)}%, reorder at ${p.reorderAt}, expires ${p.expiry}`).join('\n')}

LOW STOCK ALERTS (${lowStockProducts.length} products):
${lowStockProducts.map(p => `- ${p.name}: only ${p.quantity} units (threshold: ${p.reorderAt})`).join('\n') || 'None'}

EXPIRING SOON (${expiringProducts.length} products):
${expiringProducts.map(p => `- ${p.name}: expires ${p.expiry}`).join('\n') || 'None'}

TODAY'S PERFORMANCE:
- Revenue: $${todayRevenue.toFixed(2)}
- Transactions: ${transactions.filter(t => new Date(t.timestamp).toDateString() === new Date().toDateString()).length}
- Estimated profit: $${todayProfit.toFixed(2)}

MONTHLY KPIs:
- Total revenue: $91,340
- Net profit: $22,520
- Gross margin: 24.7%
- Stock turnover: 8.4x

TOP SELLING PRODUCTS THIS MONTH:
1. Bananas 1kg - 445 units, $284 profit
2. Whole Milk 2L - 312 units, $203 profit
3. Organic Eggs 12pk - 224 units, $513 profit
4. Sourdough Bread - 189 units, $546 profit

LOSS INDICATORS:
- Expired product losses: $340
- Unsold inventory estimate: $2,100
- Shrinkage estimate: $180

Respond concisely and practically. Use bullet points for lists. Provide specific actionable recommendations where relevant. Format numbers with dollar signs and percentages clearly.`;
  };

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput('');

    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: buildContext(),
          messages: newMessages.slice(1).map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();
      const reply = data.content?.[0]?.text || 'Sorry, I could not get a response. Please try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I\'m having trouble connecting to the AI service. In the meantime, here\'s what I can tell you from your data: You have ' + lowStockProducts.length + ' low-stock items that need reordering, and today\'s estimated revenue is $' + todayRevenue.toFixed(2) + '.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flex: 1, gap: '16px', padding: '20px', background: '#f7faf7', overflow: 'hidden' }}>
      {/* Chat panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: '12px', border: '1px solid #e8f0e9', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e8f0e9', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #2d7a35, #48bb78)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>✦</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', color: '#0d1f0e' }}>AI Business Assistant</div>
            <div style={{ fontSize: '11px', color: '#6b7c6e' }}>Powered by Claude · Connected to live store data</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#1a6b23' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2d7a35' }} />
            Live data
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '80%', padding: '11px 14px', borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                background: msg.role === 'user' ? '#2d7a35' : '#f7faf7',
                color: msg.role === 'user' ? '#fff' : '#1a202c',
                fontSize: '13px', lineHeight: '1.6',
                border: msg.role === 'assistant' ? '1px solid #e8f0e9' : 'none',
              }}>
                {msg.content.split('\n').map((line, j) => (
                  <div key={j} style={{ marginBottom: line ? '2px' : '6px' }}>{line}</div>
                ))}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ padding: '11px 16px', borderRadius: '12px 12px 12px 4px', background: '#f7faf7', border: '1px solid #e8f0e9', display: 'flex', gap: '4px', alignItems: 'center' }}>
                {[0, 0.2, 0.4].map((delay, i) => (
                  <div key={i} style={{
                    width: '7px', height: '7px', borderRadius: '50%', background: '#2d7a35',
                    animation: 'pulse 1.4s ease-in-out infinite',
                    animationDelay: `${delay}s`,
                    opacity: 0.6,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={msgsEndRef} />
        </div>

        {/* Quick prompts */}
        <div style={{ padding: '10px 16px', borderTop: '1px solid #e8f0e9', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {QUICK_PROMPTS.slice(0, 4).map(q => (
            <button key={q} onClick={() => sendMessage(q)} style={{
              padding: '5px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 500,
              border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', color: '#4a5568',
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#2d7a35'; e.currentTarget.style.color = '#1a6b23'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#4a5568'; }}>
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #e8f0e9', display: 'flex', gap: '8px' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask about sales, inventory, profits, forecasts..."
            disabled={loading}
            style={{
              flex: 1, padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '9px',
              fontSize: '13px', outline: 'none', background: loading ? '#f9fafb' : '#fff',
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
          <button onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{
            padding: '10px 18px', background: loading || !input.trim() ? '#d1d5db' : '#2d7a35',
            color: '#fff', border: 'none', borderRadius: '9px', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
          }}>Send</button>
        </div>
      </div>

      {/* Sidebar insights */}
      <div style={{ width: '280px', flexShrink: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Card title="Live store data">
          {[
            { label: 'Today revenue', value: `$${todayRevenue.toFixed(2) || '4,872'}` },
            { label: 'Today profit', value: `$${todayProfit.toFixed(2) || '1,203'}` },
            { label: 'Low stock items', value: lowStockProducts.length, alert: lowStockProducts.length > 0 },
            { label: 'Total products', value: products.length },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f5f0', fontSize: '13px' }}>
              <span style={{ color: '#6b7c6e' }}>{item.label}</span>
              <span style={{ fontWeight: 700, color: item.alert ? '#c53030' : '#0d1f0e' }}>{item.value}</span>
            </div>
          ))}
        </Card>

        <Card title="All quick questions">
          {QUICK_PROMPTS.map(q => (
            <button key={q} onClick={() => sendMessage(q)} style={{
              display: 'block', width: '100%', padding: '8px 10px', marginBottom: '4px',
              border: '1px solid #e8f0e9', borderRadius: '7px', background: '#fff',
              cursor: 'pointer', fontSize: '12px', color: '#2d3748', textAlign: 'left',
              fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#2d7a35'; e.currentTarget.style.background = '#f0fff4'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8f0e9'; e.currentTarget.style.background = '#fff'; }}>
              {q}
            </button>
          ))}
        </Card>
      </div>
    </div>
  );
}

