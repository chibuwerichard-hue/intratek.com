import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../api/axiosConfig';

const StoreContext = createContext(null);

const initialTransactions = Array.from({ length: 50 }, (_, i) => {
  const days = Math.floor(Math.random() * 30);
  const d = new Date();
  d.setDate(d.getDate() - days);
  const items = [
    { productId: 'P001', name: 'Whole Milk 2L', qty: Math.ceil(Math.random() * 3), price: 1.75, cost: 1.10 },
    { productId: 'P002', name: 'Sourdough Bread', qty: 1, price: 4.99, cost: 2.10 },
  ].slice(0, Math.ceil(Math.random() * 2) + 1);
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  return {
    id: `TXN-${String(i + 1).padStart(4, '0')}`,
    timestamp: d.toISOString(),
    items,
    subtotal,
    tax: subtotal * 0.08,
    discount: 0,
    total: subtotal * 1.08,
    paymentMethod: ['Cash', 'Card', 'Mobile Pay'][Math.floor(Math.random() * 3)],
  };
});

export function StoreProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [cart, setCart] = useState([]);
  const [activeView, setActiveView] = useState('dashboard');

  // ✅ Fetch products from Spring Boot on load
  useEffect(() => {
    api.get('/products')
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch products:', err);
        setLoading(false);
      });
  }, []);

  const addProduct = useCallback(async (product) => {
    try {
      const res = await api.post('/products', product);
      setProducts(prev => [...prev, res.data]);
    } catch (err) {
      console.error('Failed to add product:', err);
    }
  }, []);

  const updateProduct = useCallback((id, updates) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deleteProduct = useCallback(async (id) => {
    try {
      await api.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  }, []);

  const addToCart = useCallback((productId) => {
    setCart(prev => {
      const existing = prev.find(c => c.productId === productId);
      const product = products.find(p => p.id === productId);
      if (existing) return prev.map(c => c.productId === productId ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { productId, name: product.name, price: product.salePrice, cost: product.purchasePrice, qty: 1 }];
    });
  }, [products]);

  const updateCartQty = useCallback((productId, delta) => {
    setCart(prev => {
      const updated = prev.map(c => c.productId === productId ? { ...c, qty: c.qty + delta } : c);
      return updated.filter(c => c.qty > 0);
    });
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const checkout = useCallback((paymentMethod) => {
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const tax = subtotal * 0.08;
    const txn = {
      id: `TXN-${String(transactions.length + 1).padStart(4, '0')}`,
      timestamp: new Date().toISOString(),
      items: cart,
      subtotal,
      tax,
      discount: 0,
      total: subtotal + tax,
      paymentMethod,
    };
    setTransactions(prev => [txn, ...prev]);
    // Reduce stock locally
    cart.forEach(ci => {
      setProducts(prev => prev.map(p => p.id === ci.productId
        ? { ...p, quantity: Math.max(0, p.quantity - ci.qty) } : p));
    });
    setCart([]);
    return txn;
  }, [cart, transactions.length]);

  const lowStockProducts = products.filter(p => p.quantity <= p.reorderAt);
  const today = new Date().toDateString();
  const todayTransactions = transactions.filter(t => new Date(t.timestamp).toDateString() === today);
  const todayRevenue = todayTransactions.reduce((s, t) => s + t.total, 0);
  const todayProfit = todayTransactions.reduce((s, t) =>
    s + t.items.reduce((ss, i) => ss + (i.price - i.cost) * i.qty, 0), 0);

  return (
    <StoreContext.Provider value={{
      products, transactions, cart, activeView, setActiveView, loading,
      addProduct, updateProduct, deleteProduct,
      addToCart, updateCartQty, clearCart, checkout,
      lowStockProducts, todayRevenue, todayProfit, todayTransactions,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);