// =============================================
// components/Summary.jsx
// This component shows the grand totals at
// the bottom: total cost, sales, and profit.
// =============================================

// 'products' = the full list of products from App.jsx
export default function Summary({ products }) {
  // --- Calculate grand totals by looping through all products ---

  // reduce() is a JavaScript method that "reduces" an array to a single value.
  // Here we use it to add up all the total purchase costs.
  const grandTotalPurchaseCost = products.reduce((total, product) => {
    return total + product.purchasePrice * product.quantity;
  }, 0); // 0 is the starting value

  const grandTotalSalesValue = products.reduce((total, product) => {
    return total + product.salePrice * product.quantity;
  }, 0);

  // Grand profit = total sales − total purchase cost
  const grandTotalProfit = grandTotalSalesValue - grandTotalPurchaseCost;

  const isProfitable = grandTotalProfit >= 0;

  // Helper to format numbers as "$0.00"
  function formatCurrency(amount) {
    return "$" + amount.toFixed(2);
  }

  return (
    <div className="card summary-card">
      <h2 className="card-title">
        <span>📊</span> Summary
      </h2>

      <div className="summary-grid">
        {/* Total Purchase Cost */}
        <div className="summary-item cost">
          <div className="summary-label">💰 Total Purchase Cost</div>
          <div className="summary-value">{formatCurrency(grandTotalPurchaseCost)}</div>
          <div className="summary-sub">What you paid for all stock</div>
        </div>

        {/* Total Sales Value */}
        <div className="summary-item sales">
          <div className="summary-label">🏷️ Total Sales Value</div>
          <div className="summary-value">{formatCurrency(grandTotalSalesValue)}</div>
          <div className="summary-sub">What customers will pay</div>
        </div>

        {/* Total Profit */}
        <div className={`summary-item ${isProfitable ? "profit-good" : "profit-bad"}`}>
          <div className="summary-label">
            {isProfitable ? "📈 Total Profit" : "📉 Total Loss"}
          </div>
          <div className="summary-value">{formatCurrency(grandTotalProfit)}</div>
          <div className="summary-sub">
            {isProfitable ? "Great job! You're making money." : "Warning: You're at a loss."}
          </div>
        </div>
      </div>
    </div>
  );
}
