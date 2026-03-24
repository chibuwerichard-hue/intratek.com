// =============================================
// components/ProductTable.jsx
// This component displays all added products
// in a table with calculated columns.
// =============================================

// 'products' = the list of products from App.jsx
// 'onDeleteProduct' = function to call when Delete is clicked
export default function ProductTable({ products, onDeleteProduct }) {
  // Helper function to format a number as currency: e.g. 3.5 → "$3.50"
  function formatCurrency(amount) {
    return "$" + amount.toFixed(2);
  }

  return (
    <div className="card table-card">
      <h2 className="card-title">
        <span>📋</span> Products List
        <span className="badge">{products.length} item{products.length !== 1 ? "s" : ""}</span>
      </h2>

      {/* The table scrolls horizontally on small screens */}
      <div className="table-wrapper">
        <table className="products-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Product Name</th>
              <th>Purchase Price</th>
              <th>Sale Price</th>
              <th>Quantity</th>
              <th>Total Purchase Cost</th>
              <th>Total Sales Value</th>
              <th>Profit</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {/* Loop through each product and display a row */}
            {products.map((product, index) => {
              // --- Calculate the derived values for each row ---

              // Total Purchase Cost = Purchase Price × Quantity
              const totalPurchaseCost = product.purchasePrice * product.quantity;

              // Total Sales Value = Sale Price × Quantity
              const totalSalesValue = product.salePrice * product.quantity;

              // Profit = Total Sales Value − Total Purchase Cost
              const profit = totalSalesValue - totalPurchaseCost;

              // Is this product profitable?
              const isProfitable = profit >= 0;

              return (
                <tr key={product.id} className="table-row">
                  {/* Row number — index starts at 0 so we add 1 */}
                  <td className="row-number">{index + 1}</td>
                  <td className="product-name">{product.name}</td>
                  <td>{formatCurrency(product.purchasePrice)}</td>
                  <td>{formatCurrency(product.salePrice)}</td>
                  <td>{product.quantity}</td>
                  <td>{formatCurrency(totalPurchaseCost)}</td>
                  <td>{formatCurrency(totalSalesValue)}</td>

                  {/* Profit cell gets a special color based on positive/negative */}
                  <td className={isProfitable ? "profit-positive" : "profit-negative"}>
                    {isProfitable ? "▲ " : "▼ "}
                    {formatCurrency(profit)}
                  </td>

                  {/* Delete button calls onDeleteProduct with this product's ID */}
                  <td>
                    <button
                      className="btn btn-delete"
                      onClick={() => onDeleteProduct(product.id)}
                      title="Remove this product"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
