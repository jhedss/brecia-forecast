// Reorder prediction logic
// A product needs reordering if:
// currentInventory <= (avgSalesPerWeek / 7) * daysToReplenish * safetyFactor

export const calculateReorderStatus = (product) => {
  const { currentInventory, avgSalesPerWeek, daysToReplenish } = product;
  
  // Calculate daily sales rate
  const dailySales = avgSalesPerWeek / 7;
  
  // Calculate how many units will be sold during lead time
  const salesDuringLeadTime = dailySales * daysToReplenish;
  
  // Add safety factor (20% buffer) to account for variability
  const safetyFactor = 1.2;
  const reorderPoint = salesDuringLeadTime * safetyFactor;
  
  // Determine if reorder is needed
  const needsReorder = currentInventory <= reorderPoint;
  
  // Calculate days until stockout (if no reorder)
  const daysUntilStockout = currentInventory / dailySales;
  
  // Calculate suggested reorder quantity (enough for 4 weeks + lead time)
  const suggestedReorderQty = Math.ceil((avgSalesPerWeek * 4) + salesDuringLeadTime);
  
  // Priority levels
  let priority = 'low';
  if (needsReorder) {
    if (daysUntilStockout < daysToReplenish) {
      priority = 'critical';
    } else if (daysUntilStockout < daysToReplenish * 1.5) {
      priority = 'high';
    } else {
      priority = 'medium';
    }
  }
  
  return {
    needsReorder,
    reorderPoint: Math.ceil(reorderPoint),
    daysUntilStockout: Math.ceil(daysUntilStockout * 10) / 10,
    suggestedReorderQty,
    priority
  };
};

