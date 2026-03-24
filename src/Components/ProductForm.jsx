import { useState } from "react";
import api from "../api/axiosConfig";

export default function ProductForm({ onAddProduct }) {
  const [formData, setFormData] = useState({
    name: "", purchasePrice: "", salePrice: "", quantity: "",
  });
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit() {
    // Validation
    if (!formData.name || !formData.purchasePrice || !formData.salePrice || !formData.quantity) {
      alert("Please fill in all fields."); return;
    }
    if (Number(formData.purchasePrice) <= 0 || Number(formData.salePrice) <= 0 || Number(formData.quantity) <= 0) {
      alert("Prices and quantity must be greater than zero."); return;
    }

    const newProduct = {
      name: formData.name,
      purchasePrice: Number(formData.purchasePrice),
      salePrice: Number(formData.salePrice),
      quantity: Number(formData.quantity),
    };

    setLoading(true);
    try {
      // ✅ Save directly to Spring Boot database
      const response = await api.post('/products', newProduct);
      alert("✅ Product saved to database!");
      if (onAddProduct) onAddProduct(response.data);
      handleClear();
    } catch (error) {
      alert("❌ Failed to save product. Is Spring Boot running?");
      console.error(error);
    }
    setLoading(false);
  }

  function handleClear() {
    setFormData({ name: "", purchasePrice: "", salePrice: "", quantity: "" });
  }

  return (
    <div className="card form-card">
      <h2 className="card-title"><span>➕</span> Add New Product</h2>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="name">Product Name</label>
          <input id="name" type="text" name="name"
            value={formData.name} onChange={handleChange}
            placeholder="e.g. Orange Juice" />
        </div>
        <div className="form-group">
          <label htmlFor="purchasePrice">Purchase Price ($)</label>
          <input id="purchasePrice" type="number" name="purchasePrice"
            value={formData.purchasePrice} onChange={handleChange}
            placeholder="e.g. 1.50" min="0" step="0.01" />
        </div>
        <div className="form-group">
          <label htmlFor="salePrice">Sale Price ($)</label>
          <input id="salePrice" type="number" name="salePrice"
            value={formData.salePrice} onChange={handleChange}
            placeholder="e.g. 2.99" min="0" step="0.01" />
        </div>
        <div className="form-group">
          <label htmlFor="quantity">Quantity</label>
          <input id="quantity" type="number" name="quantity"
            value={formData.quantity} onChange={handleChange}
            placeholder="e.g. 10" min="1" />
        </div>
      </div>
      <div className="form-buttons">
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "✅ Add Product"}
        </button>
        <button className="btn btn-secondary" onClick={handleClear}>
          🗑️ Clear Form
        </button>
      </div>
    </div>
  );
}