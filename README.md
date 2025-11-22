# Forecast — Shoes Inventory Reorder Predictor

Student-friendly demo using React + TensorFlow.js

What it is
- A React app that trains a simple TensorFlow.js model in the browser to predict whether a shoe SKU should be reordered.
- Product data is generated locally (150 shoe SKUs by default).

Quick start
1. Install dependencies

```powershell
npm install
```

2. Start the app (normal)

```powershell
npm start
```

3. Developer demo (faster training)

This runs the dev server while setting a small epoch count (Windows):

```powershell
npm run dev-demo
```

Usage
- Open `http://localhost:3000`.
- Click **Train Model** (training runs in the browser using the current epoch setting).
- Click **Predict All Products** once training completes to generate reorder suggestions.

Train & Predict
- Use **Train & Predict** to train the model and immediately run predictions for all products (convenience shortcut).

Persistence (save/load model)
- After training, click **Save Model** to persist the trained model to your browser's IndexedDB. The app will also save normalization values it used so predictions remain consistent.
- Use **Load Saved Model** to load the model from IndexedDB (useful to avoid retraining between page reloads).
- Use **Remove Saved Model** to delete the saved model and normalization data from IndexedDB/localStorage.

Custom epochs
- The training epoch count can be controlled with the `REACT_APP_EPOCHS` environment variable.
- Example (Windows PowerShell):

```powershell
set "REACT_APP_EPOCHS=50" ; npm start
```

Notes & tips
- Training runs in the browser; reduce epochs for faster iteration during development.
- To persist a model long-term or export, you can call `model.save('downloads://...')` or add server-side storage.

Files of interest
- `src/App.js` — main UI, TF.js training/prediction logic, persistence buttons
- `src/services/productApi.js` — mock product generator (shoes theme)

Next steps I can do for you
- Add `model.save('indexeddb://...')` persistence improvements (versioning, UI feedback)
- Add product images/placeholders for nicer UI
- Add a one-click script to train + predict programmatically
