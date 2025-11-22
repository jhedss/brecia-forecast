import React from 'react';
import './ProductCard.css';

const ProductCard = ({ product, reorderInfo }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return '#FF6B6B';
      case 'high':
        return '#FFA500';
      case 'medium':
        return '#FFD93D';
      default:
        return '#2B7A78';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'critical':
        return 'Critical';
      case 'high':
        return 'High';
      case 'medium':
        return 'Medium';
      default:
        return 'Low';
    }
  };

  return (
    <div className={`product-card ${reorderInfo.needsReorder ? 'needs-reorder' : ''}`}>
      <div className="product-header">
        <h3 className="product-name">{product.name}</h3>
        {reorderInfo.needsReorder && (
          <span 
            className="priority-badge"
            style={{ backgroundColor: getPriorityColor(reorderInfo.priority) }}
          >
            {getPriorityLabel(reorderInfo.priority)}
          </span>
        )}
      </div>
      
      <div className="product-stats">
        <div className="stat-item">
          <span className="stat-label">Current Inventory:</span>
          <span className="stat-value">{product.currentInventory} units</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-label">Avg Sales Per Week:</span>
          <span className="stat-value">{product.avgSalesPerWeek} units</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-label">Days to Replenish:</span>
          <span className="stat-value">{product.daysToReplenish} days</span>
        </div>
        
        {reorderInfo.needsReorder && (
          <>
            <div className="stat-item warning">
              <span className="stat-label">Days Until Stockout:</span>
              <span className="stat-value">{reorderInfo.daysUntilStockout} days</span>
            </div>
            
            <div className="stat-item suggestion">
              <span className="stat-label">Suggested Reorder Qty:</span>
              <span className="stat-value">{reorderInfo.suggestedReorderQty} units</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-label">Reorder Point:</span>
              <span className="stat-value">{reorderInfo.reorderPoint} units</span>
            </div>
          </>
        )}
      </div>
      
      {!reorderInfo.needsReorder && (
        <div className="status-ok">
          Stock level is healthy
        </div>
      )}
    </div>
  );
};

export default ProductCard;

