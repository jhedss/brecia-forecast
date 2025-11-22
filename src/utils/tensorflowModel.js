import * as tf from "@tensorflow/tfjs";

// Training data: [currentInventory, avgSalesPerWeek, daysToReplenish]
// Labels: 1 = reorder needed, 0 = no reorder needed
const trainingData = tf.tensor2d([
  [20, 50, 3],  // High inventory, moderate sales, short lead time -> no reorder
  [5, 30, 5],   // Low inventory, moderate sales, medium lead time -> reorder
  [15, 40, 4],  // Medium inventory, moderate sales, medium lead time -> no reorder
  [8, 60, 2],   // Low inventory, high sales, short lead time -> reorder
  [25, 20, 7],  // High inventory, low sales, long lead time -> no reorder
  [3, 45, 6],   // Very low inventory, high sales, long lead time -> reorder
  [12, 35, 3],  // Medium inventory, moderate sales, short lead time -> no reorder
  [6, 55, 4],   // Low inventory, high sales, medium lead time -> reorder
  [18, 25, 5],  // Medium-high inventory, low sales, medium lead time -> no reorder
  [4, 50, 5],   // Very low inventory, high sales, medium lead time -> reorder
]);

const outputData = tf.tensor2d([
  [0], // no reorder
  [1], // reorder
  [0], // no reorder
  [1], // reorder
  [0], // no reorder
  [1], // reorder
  [0], // no reorder
  [1], // reorder
  [0], // no reorder
  [1], // reorder
]);

let trainedModel = null;
let isTraining = false;

// Create and train the model
export const trainModel = async () => {
  if (trainedModel) {
    return trainedModel;
  }

  if (isTraining) {
    // Wait for training to complete
    while (isTraining) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return trainedModel;
  }

  isTraining = true;

  try {
    // 1. Create model
    const model = tf.sequential();
    model.add(
      tf.layers.dense({ 
        inputShape: [3], 
        units: 8, 
        activation: "relu" 
      })
    );
    model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));

    // 2. Compile model
    model.compile({
      optimizer: "adam",
      loss: "binaryCrossentropy",
      metrics: ["accuracy"],
    });

    // 3. Train model
    await model.fit(trainingData, outputData, {
      epochs: 200,
      shuffle: true,
      verbose: 0, // Set to 1 to see training progress
    });

    trainedModel = model;
    isTraining = false;
    return model;
  } catch (error) {
    isTraining = false;
    console.error("Error training model:", error);
    throw error;
  }
};

// Predict if a product needs reordering
export const predictReorder = async (product) => {
  const { currentInventory, avgSalesPerWeek, daysToReplenish } = product;

  // Ensure model is trained
  const model = await trainModel();

  // Normalize inputs (optional but can help with prediction accuracy)
  // Using the product data as-is for simplicity
  const input = tf.tensor2d([[currentInventory, avgSalesPerWeek, daysToReplenish]]);
  
  try {
    const result = model.predict(input);
    const prediction = (await result.data())[0];
    
    // Clean up tensors
    input.dispose();
    result.dispose();
    
    // Return prediction (0-1 scale, >0.5 means reorder needed)
    return prediction;
  } catch (error) {
    console.error("Error making prediction:", error);
    // Fallback to simple calculation if model fails
    const dailySales = avgSalesPerWeek / 7;
    const salesDuringLeadTime = dailySales * daysToReplenish;
    const reorderPoint = salesDuringLeadTime * 1.2;
    return currentInventory <= reorderPoint ? 0.8 : 0.2;
  }
};

// Calculate reorder status using TensorFlow.js prediction
export const calculateReorderStatusWithTF = async (product) => {
  const { currentInventory, avgSalesPerWeek, daysToReplenish } = product;
  
  // Get prediction from TensorFlow model
  const prediction = await predictReorder(product);
  const needsReorder = prediction > 0.5;
  
  // Calculate additional metrics
  const dailySales = avgSalesPerWeek / 7;
  const daysUntilStockout = currentInventory / dailySales;
  
  // Calculate suggested reorder quantity
  const salesDuringLeadTime = dailySales * daysToReplenish;
  const suggestedReorderQty = Math.ceil((avgSalesPerWeek * 4) + salesDuringLeadTime);
  
  // Calculate reorder point based on lead time and sales
  const safetyFactor = 1.2;
  const reorderPoint = Math.ceil(salesDuringLeadTime * safetyFactor);
  
  // Determine priority based on prediction confidence and days until stockout
  let priority = 'low';
  if (needsReorder) {
    if (daysUntilStockout < daysToReplenish) {
      priority = 'critical';
    } else if (daysUntilStockout < daysToReplenish * 1.5) {
      priority = 'high';
    } else if (prediction > 0.7) {
      priority = 'high';
    } else {
      priority = 'medium';
    }
  }
  
  return {
    needsReorder,
    prediction: Math.round(prediction * 100) / 100, // Round to 2 decimal places
    reorderPoint,
    daysUntilStockout: Math.ceil(daysUntilStockout * 10) / 10,
    suggestedReorderQty,
    priority
  };
};

