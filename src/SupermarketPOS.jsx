import { useState, useEffect } from "react";

// The URL of your Spring Boot backend
const API_URL = "http://192.168.13.70:8080/api/products";

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f0f4f8",
    fontFamily: "'Georgia', serif",
    padding: "32px 16px",
  },
  container: { maxWidth: "860px", margin: "0 auto" },
  header: {
    background: "#1a3c5e",
    color: "#f5c842",
    borderRadius: "12px 12px 0 0",
    padding: "24px 32px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  headerTitle: { fontSize: "1.7rem", fontWeight: "bold", margin: 0 },
  headerSub: { fontSize: "0.85rem", opacity: 0.75, margin: "4px 0 0" },
  formCard: {
    background: "#ffffff",
    padding: "28px 32px",
    borderLeft: "1px solid #dde3ea",
    borderRight: "1px solid #dde3ea",
  },
  sectionTitle: {
    fontSize: "1rem", fontWeight: "bold", color: "#1a3c5e",
    marginBottom: "16px", borderBottom: "2px solid #f5c842",
    paddingBottom: "6px", display: "inline-block",
  },
  formGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: "16px", marginBottom: "20px",
  },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: {
    fontSize: "0.8rem", fontWeight: "bold", color: "#4a5568",
    textTransform: "uppercase", letterSpacing: "0.06em",
  },
  input: {
    padding: "10px 14px", border: "1.5px solid #cbd5e0",
    borderRadius: "6px", fontSize: "0.95rem", background: "#f9fafb",
  },
  addButton: {
    background: "#1a3c5e", color: "#f5c842", border: "none",
    borderRadius: "8px", padding: "12px 28px", fontSize: "0.95rem",
    fontWeight: "bold", cursor: "pointer",
  },
  error: {
    color: "#e53e3e", fontSize: "0.85rem", marginTop: "10px",
    background: "#fff5f5", padding: "8px 12px", borderRadius: "6px",
    border: "1px solid #feb2b2",
  },
  success: {
    color: "#276749", fontSize: "0.85rem", marginTop: "10px",
    background: "#f0fff4", padding: "8px 12px", borderRadius: "6px",
    border: "1px solid #9ae6b4",
  },
  tableCard: {
    background: "#ffffff", padding: "28px 32px",
    borderLeft: "1px solid #dde3ea", borderRight: "1px solid #dde3ea",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" },
  th: {
    background: "#1a3c5e", color: "#f5c842", padding: "10px 14px",
    textAlign: "left", fontWeight: "bold", fontSize: "0.8rem",
    textTransform: "uppercase",
  },
  td: { padding: "10px 14px", borderBottom: "1px solid #e8ecf0", color: "#2d3748" },
  tdRight: { padding: "10px 14px", borderBottom: "1px solid #e8ecf0", textAlign: "right" },
  emptyRow: { textAlign: "center", padding: "32px", color: "#a0aec0", fontStyle: "italic" },
  deleteBtn: {
    background: "#fff0f0", color: "#e53e3e", border: "1px solid #fca5a5",
    borderRadius: "5px", padding: "4px 10px", cursor: "pointer", fontSize: "0.8rem",
  },
  summaryCard: {
    background: "#1a3c5e", color: "white", borderRadius: "0 0 12px 12px",
    padding: "20px 32px", display: "flex", gap: "32px",
    flexWrap: "wrap", justifyContent: "flex-end",
  },
  summaryItem: { textAlign: "right" },
  summaryLabel: { fontSize: "0.75rem", opacity: 0.7, textTransform: "uppercase", marginBottom: "2px" },
  summaryValue: { fontSize: "1.25rem", fontWeight: "bold", color: "#f5c842" },
};

export default function SupermarketPOS() {

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", salePrice: "", purchasePrice: "", quantity: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Load products from backend when page opens ──────────
  // useEffect runs once when the component first loads
  useEffect(() => {
    fetchProducts();
  }, []);

  // ── GET all products from Spring Boot ───────────────────
  async function fetchProducts() {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError("Could not connect to backend. Is Spring Boot running?");
    }
  }

  function handleChange(field, value) {
    setForm({ ...form, [field]: value });
    setError("");
    setSuccess("");
  }

  // ── POST new product to Spring Boot ─────────────────────
  async function handleAddProduct() {
    if (!form.name.trim()) { setError("Please enter a product name."); return; }
    if (!form.salePrice || isNaN(form.salePrice) || Number(form.salePrice) <= 0) {
      setError("Please enter a valid sale price."); return;
    }
    if (!form.purchasePrice || isNaN(form.purchasePrice) || Number(form.purchasePrice) <= 0) {
      setError("Please enter a valid purchase price."); return;
    }
    if (!form.quantity || isNaN(form.quantity) || Number(form.quantity) <= 0) {
      setError("Please enter a valid quantity."); return;
    }

    setLoading(true);
    try {
      // Send the new product to Spring Boot as JSON
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          salePrice: Number(form.salePrice),
          purchasePrice: Number(form.purchasePrice),
          quantity: Number(form.quantity),
        }),
      });

      if (response.ok) {
        setSuccess("Product added successfully!");
        setForm({ name: "", salePrice: "", purchasePrice: "", quantity: "" });
        fetchProducts(); // Refresh the list from backend
      } else {
        setError("Failed to add product. Try again.");
      }
    } catch (err) {
      setError("Could not connect to backend. Is Spring Boot running?");
    }
    setLoading(false);
  }

  // ── DELETE product from Spring Boot ─────────────────────
  async function handleDelete(id) {
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      fetchProducts(); // Refresh the list
    } catch (err) {
      setError("Could not delete product.");
    }
  }

  // ── Calculations ─────────────────────────────────────────
  const totalRevenue = products.reduce((sum, p) => sum + p.salePrice * p.quantity, 0);
  const totalCost = products.reduce((sum, p) => sum + p.purchasePrice * p.quantity, 0);
  const totalProfit = totalRevenue - totalCost;
  const money = (n) => "$" + Number(n).toFixed(2);

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <div style={styles.header}>
          <span style={{ fontSize: "2rem" }}>🛒</span>
          <div>
            <p style={styles.headerTitle}>Supermarket POS</p>
            <p style={styles.headerSub}>Connected to Spring Boot + MySQL</p>
          </div>
        </div>

        <div style={styles.formCard}>
          <span style={styles.sectionTitle}>➕ Add Product</span>
          <div style={styles.formGrid}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Product Name</label>
              <input style={styles.input} placeholder="e.g. Milk 1L"
                value={form.name} onChange={(e) => handleChange("name", e.target.value)} />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Sale Price ($)</label>
              <input style={styles.input} placeholder="e.g. 2.99" type="number"
                value={form.salePrice} onChange={(e) => handleChange("salePrice", e.target.value)} />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Purchase Price ($)</label>
              <input style={styles.input} placeholder="e.g. 1.50" type="number"
                value={form.purchasePrice} onChange={(e) => handleChange("purchasePrice", e.target.value)} />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Quantity</label>
              <input style={styles.input} placeholder="e.g. 10" type="number"
                value={form.quantity} onChange={(e) => handleChange("quantity", e.target.value)} />
            </div>
          </div>

          <button style={styles.addButton} onClick={handleAddProduct} disabled={loading}>
            {loading ? "Saving..." : "Add Product"}
          </button>

          {error && <p style={styles.error}>⚠️ {error}</p>}
          {success && <p style={styles.success}>✅ {success}</p>}
        </div>

        <div style={styles.tableCard}>
          <span style={styles.sectionTitle}>📦 Product List</span>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Name</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Sale Price</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Purchase Price</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Qty</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Subtotal</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Profit/Item</th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan={8} style={styles.emptyRow}>No products yet. Add one above!</td></tr>
              ) : (
                products.map((product, index) => {
                  const subtotal = product.salePrice * product.quantity;
                  const profitPerItem = product.salePrice - product.purchasePrice;
                  return (
                    <tr key={product.id} style={{ background: index % 2 === 0 ? "#f9fafb" : "white" }}>
                      <td style={styles.td}>{index + 1}</td>
                      <td style={styles.td}><strong>{product.name}</strong></td>
                      <td style={styles.tdRight}>{money(product.salePrice)}</td>
                      <td style={styles.tdRight}>{money(product.purchasePrice)}</td>
                      <td style={styles.tdRight}>{product.quantity}</td>
                      <td style={styles.tdRight}>{money(subtotal)}</td>
                      <td style={{ ...styles.tdRight, color: profitPerItem >= 0 ? "#276749" : "#c53030", fontWeight: "bold" }}>
                        {money(profitPerItem)}
                      </td>
                      <td style={styles.td}>
                        <button style={styles.deleteBtn} onClick={() => handleDelete(product.id)}>Delete</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.summaryItem}>
            <p style={styles.summaryLabel}>Total Cost</p>
            <p style={styles.summaryValue}>{money(totalCost)}</p>
          </div>
          <div style={styles.summaryItem}>
            <p style={styles.summaryLabel}>Total Revenue</p>
            <p style={styles.summaryValue}>{money(totalRevenue)}</p>
          </div>
          <div style={styles.summaryItem}>
            <p style={styles.summaryLabel}>Net Profit</p>
            <p style={{ fontSize: "1.25rem", fontWeight: "bold", color: totalProfit >= 0 ? "#68d391" : "#fc8181" }}>
              {money(totalProfit)}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
