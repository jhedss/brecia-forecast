import React, { useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import "./App.css";
import { fetchProducts } from "./services/productApi";

export default function InventoryPredictor() {
  const [products, setProducts] = useState([]);
  const [model, setModel] = useState(null);
  const [isTraining, setIsTraining] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictions, setPredictions] = useState({});
  const [stats, setStats] = useState({ 
    total: 0, 
    reorder: 0, 
    noReorder: 0, 
    critical: 0, 
    highPriority: 0 
  });
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const trainingData = tf.tensor2d([
    [20, 50, 3],
    [5, 30, 5],
    [15, 40, 4],
    [8, 60, 2],
  ]);

  const outputData = tf.tensor2d([[0], [1], [0], [1]]);

  useEffect(() => {
    const loadProducts = async () => {
      const fetchedProducts = await fetchProducts(100);

      // Remove duplicate products by name
      const uniqueProductsMap = new Map();
      for (const prod of fetchedProducts) {
        if (!uniqueProductsMap.has(prod.name)) {
          uniqueProductsMap.set(prod.name, prod);
        }
      }
      const uniqueProducts = Array.from(uniqueProductsMap.values());

      // Add new custom product
      const newProduct = {
        id: uniqueProducts.length + 1,
        name: "New Product X",
        currentInventory: 20,
        avgSalesPerWeek: 10,
        daysToReplenish: 5,
      };

      const updatedProducts = uniqueProducts.map((prod, index) => ({
        ...prod,
        isCritical: index % 10 === 0,
        isHighPriority: index % 7 === 0,
      }));

      updatedProducts.push(newProduct);

      setProducts(updatedProducts);

      const reorderCount = Object.values(predictions).filter(
        pred => pred.prediction === 'Reorder'
      ).length;
      const criticalCount = updatedProducts.filter(p => p.isCritical).length;
      const highPriorityCount = updatedProducts.filter(p => p.isHighPriority).length;

      setStats({
        total: updatedProducts.length,
        reorder: reorderCount,
        noReorder: updatedProducts.length - reorderCount,
        critical: criticalCount,
        highPriority: highPriorityCount,
      });
    };
    loadProducts();
  }, [predictions]);

  const trainModel = async () => {
    setIsTraining(true);
    try {
      const newModel = tf.sequential();
      
      newModel.add(
        tf.layers.dense({ 
          inputShape: [3],
          units: 8,
          activation: "relu"
        })
      );
      
      newModel.add(
        tf.layers.dense({ 
          units: 1,
          activation: "sigmoid"
        })
      );

      newModel.compile({
        optimizer: "adam",
        loss: "binaryCrossentropy",
        metrics: ["accuracy"],
      });

      await newModel.fit(trainingData, outputData, {
        epochs: 200,
        shuffle: true,
      });

      setModel(newModel);
    } catch (error) {
      console.error("Error training model:", error);
      alert("Error training model. Check console for details.");
    } finally {
      setIsTraining(false);
    }
  };

  const predictAll = async () => {
    if (!model) {
      alert("Please train the model first!");
      return;
    }

    setIsPredicting(true);
    const newPredictions = {};
    let reorderCount = 0;
    let noReorderCount = 0;

    try {
      for (const product of products) {
        const productData = tf.tensor2d([[
          product.currentInventory,
          product.avgSalesPerWeek,
          product.daysToReplenish
        ]]);
        
        const result = model.predict(productData);
        const predictionValue = (await result.data())[0];
        
        productData.dispose();
        result.dispose();

        const shouldReorder = predictionValue > 0.5;
        
        newPredictions[product.id] = {
          prediction: shouldReorder ? "Reorder" : "No Reorder",
          confidence: (predictionValue * 100).toFixed(1)
        };

        if (shouldReorder) {
          reorderCount++;
        } else {
          noReorderCount++;
        }
      }

      setPredictions(newPredictions);
      setStats({
        total: products.length,
        reorder: reorderCount,
        noReorder: noReorderCount,
        critical: stats.critical,
        highPriority: stats.highPriority
      });
    } catch (error) {
      console.error("Error making predictions:", error);
      alert("Error making predictions. Check console for details.");
    } finally {
      setIsPredicting(false);
    }
  };

  const filteredSortedProducts = products
    .filter(product => {
      if (!filterStatus) return true;
      
      if (filterStatus === 'low') {
        return !(predictions[product.id]?.prediction === 'Reorder' || 
                 product.isCritical || 
                 product.isHighPriority);
      }
      if (filterStatus === 'reorder') {
        return predictions[product.id]?.prediction === 'Reorder';
      }
      if (filterStatus === 'critical') {
        return product.isCritical;
      }
      if (filterStatus === 'high') {
        return product.isHighPriority;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'inventory') {
        return a.currentInventory - b.currentInventory;
      } else if (sortBy === 'sales') {
        return a.avgSalesPerWeek - b.avgSalesPerWeek;
      } else if (sortBy === 'replenish') {
        return a.daysToReplenish - b.daysToReplenish;
      }
      return 0;
    });

  return (
    <div className="app">
      <header className="header">
        <h1>Inventory Forecast Dashboard</h1>
        <p>Manage your inventory with reorder predictions</p>
      </header>

      <div className="dashboard-container">
        {stats.total > 0 && (
          <section className="summary-section">
            <div className="summary-boxes">
              <div className="summary-box neutral-gray">
                <div className="summary-number">{stats.total}</div>
                <div className="summary-label">Total Products</div>
              </div>
              <div className="summary-box reorder-orange">
                <div className="summary-number">{stats.reorder}</div>
                <div className="summary-label">Need Reorder</div>
              </div>
              <div className="summary-box critical-red">
                <div className="summary-number">{stats.critical || 0}</div>
                <div className="summary-label">Critical</div>
              </div>
              <div className="summary-box highpriority-yellow">
                <div className="summary-number">{stats.highPriority || 0}</div>
                <div className="summary-label">High Priority</div>
              </div>
            </div>
          </section>
        )}

        <section className="controls-section">
          <div className="actions-row">
            <div className="model-status-wrapper">
              <div className={`model-status-badge ${model ? "ready" : "not-trained"}`}>
                {model ? "Model Ready" : "Model Not Trained"}
              </div>
            </div>
            <div className="action-buttons">
              <button
                className="btn btn-primary"
                onClick={trainModel}
                disabled={isTraining || isPredicting}
              >
                {isTraining ? "Training..." : "Train Model"}
              </button>
              <button
                className="btn btn-secondary"
                onClick={predictAll}
                disabled={!model || isPredicting || isTraining}
              >
                {isPredicting ? "Analyzing..." : "Analyze All Products"}
              </button>
            </div>
          </div>

          <div className="filters-row">
            <div className="dropdown-group">
              <label htmlFor="filterStatus" className="dropdown-label">Filter by Status:</label>
              <select 
                id="filterStatus" 
                className="dropdown-select" 
                onChange={(e) => setFilterStatus(e.target.value)} 
                value={filterStatus}
              >
                <option value="">All</option>
                <option value="low">Low Priority</option>
                <option value="reorder">Need Reorder</option>
                <option value="critical">Critical</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            <div className="dropdown-group">
              <label htmlFor="sortBy" className="dropdown-label">Sort by:</label>
              <select 
                id="sortBy" 
                className="dropdown-select" 
                onChange={(e) => setSortBy(e.target.value)} 
                value={sortBy}
              >
                <option value="name">Product Name</option>
                <option value="inventory">Current Inventory</option>
                <option value="sales">Avg Sales Per Week</option>
                <option value="replenish">Days to Replenish</option>
              </select>
            </div>
          </div>
        </section>
      </div>

      {stats.total > 0 && (
        <section className="products-section">
          <h2 className="products-list-title">
            {filterStatus === 'low' ? 'Low Priority Products' :
             filterStatus === 'reorder' ? 'Need Reorder Products' :
             filterStatus === 'critical' ? 'Critical Products' :
             filterStatus === 'high' ? 'High Priority Products' :
             'All Products'} ({filteredSortedProducts.length})
          </h2>
          <div className="products-list">
            {filteredSortedProducts.map((product) => {
              const prediction = predictions[product.id];
              const status = prediction ? prediction.prediction : 'Not predicted';
              const statusColorClass = status === 'Reorder' ? 'reorder' :
                product.isCritical ? 'critical' :
                product.isHighPriority ? 'highpriority' :
                'healthy';
              
              const statusText = status === 'Reorder' ? 'Need Reorder' :
                product.isCritical ? 'Critical' :
                product.isHighPriority ? 'High Priority' :
                'Healthy';

              return (
                <div key={product.id} className="product-card">
                  <div className="product-name">{product.name.toUpperCase()}</div>
                  <div className="product-info">
                    <div className="product-info-item">
                      <span className="product-info-label">Current Inventory</span>
                      <span className="product-info-value">{product.currentInventory}</span>
                    </div>
                    <div className="product-info-item">
                      <span className="product-info-label">Avg Sales Per Week</span>
                      <span className="product-info-value">{product.avgSalesPerWeek}</span>
                    </div>
                    <div className="product-info-item">
                      <span className="product-info-label">Days to Replenish</span>
                      <span className="product-info-value">{product.daysToReplenish}</span>
                    </div>
                  </div>
                  <div className={`product-status ${statusColorClass}`}>
                    {statusText}
                    {prediction && <span className="confidence">({prediction.confidence}%)</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
