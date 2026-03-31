import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../api/axiosConfig';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeView, setActiveView] = useState('dashboard');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      setProducts(res.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Failed to load products. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const addProduct = useCallback(async (product) => {
    try {
      const res = await api.post('/products', product);
      setProducts(prev => [...prev, res.data]);
      return { success: true, data: res.data };
    } catch (err) {
      console.error('Failed to add product:', err);
      return { success: false, error: 'Failed to add product' };
    }
  }, []);

  const updateProduct = useCallback(async (id, updates) => {
    try {
      const res = await api.put(`/products/${id}`, updates);
      setProducts(prev => prev.map(p => p.id === id ? res.data : p));
      return { success: true };
    } catch (err) {
      console.error('Failed to update product:', err);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      return { success: false };
    }
  }, []);

  const deleteProduct = useCallback(async (id) => {
    try {
      await api.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Failed to delete product:', err);
      return { success: false, error: 'Failed to delete product' };
    }
  }, []);

  const addToCart = useCallback((productId) => {
    setCart(prev => {
      const existing = prev.find(c => c.productId === productId);
      const product = products.find(p => p.id === productId);
      if (!product) return prev;
      if (existing) {
        return prev.map(c => c.productId === productId ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, {
        productId,
        name: product.name,
        price: product.salePrice,
        cost: product.purchasePrice,
        qty: 1,
      }];
    });
  }, [products]);

  const updateCartQty = useCallback((productId, delta) => {
    setCart(prev => {
      const updated = prev.map(c =>
        c.productId === productId ? { ...c, qty: c.qty + delta } : c
      );
      return updated.filter(c => c.qty > 0);
    });
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  // ✅ FIXED: checkout is now synchronous - no async/await issues
  const checkout = useCallback((paymentMethod) => {
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const tax = subtotal * 0.08;
    const txn = {
      id: `TXN-${Date.now()}`,
      timestamp: new Date().toISOString(),
      items: [...cart],
      subtotal,
      tax,
      discount: 0,
      total: subtotal + tax,
      paymentMethod,
    };

    // ✅ Update stock locally immediately
    setProducts(prev => prev.map(p => {
      const cartItem = cart.find(c => c.productId === p.id);
      if (cartItem) {
        const newQty = Math.max(0, p.quantity - cartItem.qty);
        // Update in backend silently
        api.put(`/products/${p.id}`, { ...p, quantity: newQty }).catch(console.error);
        return { ...p, quantity: newQty };
      }
      return p;
    }));

    // ✅ Save transaction to local state
    setTransactions(prev => [txn, ...prev]);
    setCart([]);
    return txn;
  }, [cart]);

  const lowStockProducts = products.filter(p => p.quantity <= 5);
  const today = new Date().toDateString();
  const todayTransactions = transactions.filter(
    t => new Date(t.timestamp).toDateString() === today
  );
  const todayRevenue = todayTransactions.reduce((s, t) => s + t.total, 0);
  const todayProfit = todayTransactions.reduce((s, t) =>
    s + t.items.reduce((ss, i) => ss + (i.price - i.cost) * i.qty, 0), 0
  );

  return (
    <StoreContext.Provider value={{
      products,
      transactions,
      cart,
      activeView,
      setActiveView,
      loading,
      error,
      fetchProducts,
      addProduct,
      updateProduct,
      deleteProduct,
      addToCart,
      updateCartQty,
      clearCart,
      checkout,
      lowStockProducts,
      todayRevenue,
      todayProfit,
      todayTransactions,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
