#!/usr/bin/env node
const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');

function randint(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateProducts(count = 120) {
  const bases = [
    'Runner Pro', 'Street Sneak', 'Trail Blazer', 'Court Classic', 'Urban Flex',
    'Sprint X', 'Comfy Walk', 'SlipOn Lite', 'Retro High', 'Sky Runner',
    'GripMax', 'CloudStep', 'Marathon Elite', 'City Low', 'ActiveSport'
  ];
  const products = [];
  for (let i = 0; i < count; i++) {
    const name = bases[i % bases.length] + ' ' + (100 + i);
    products.push({
      id: `p-${i + 1}`,
      name,
      currentInventory: randint(0, 199),
      avgSalesPerWeek: randint(1, 20),
      daysToReplenish: randint(3, 21)
    });
  }
  return products;
}

async function main() {
  try {
    const products = generateProducts(120);

    // Build dataset
    const xs = [];
    const ys = [];
    for (const p of products) {
      const { currentInventory, avgSalesPerWeek, daysToReplenish } = p;
      const dailySales = Math.max(0.1, avgSalesPerWeek / 7);
      const daysOfCover = currentInventory / dailySales;
      const label = daysOfCover < daysToReplenish * 1.1 ? 1 : 0;
      xs.push([currentInventory, avgSalesPerWeek, daysToReplenish]);
      ys.push([label]);
    }

    const xsTensor = tf.tensor2d(xs);
    const ysTensor = tf.tensor2d(ys);
    const maxValues = tf.max(xsTensor, 0);
    const normalizedXs = xsTensor.div(maxValues);

    const model = tf.sequential();
    model.add(tf.layers.dense({ inputShape: [3], units: 16, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 8, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

    model.compile({ optimizer: 'adam', loss: 'binaryCrossentropy', metrics: ['accuracy'] });

    const epochs = parseInt(process.env.EPOCHS || process.env.REACT_APP_EPOCHS || '200', 10);
    console.log(`Training model for ${epochs} epochs (this runs in Node)`);
    await model.fit(normalizedXs, ysTensor, { epochs, shuffle: true, verbose: 1 });

    // Predict
    const predictions = [];
    for (const p of products) {
      const input = tf.tensor2d([[p.currentInventory, p.avgSalesPerWeek, p.daysToReplenish]]);
      const normalized = input.div(maxValues);
      const out = model.predict(normalized);
      const v = (await out.data())[0];
      const pred = v > 0.5 ? 'Reorder' : 'No Reorder';
      predictions.push({
        id: p.id,
        name: p.name,
        currentInventory: p.currentInventory,
        avgSalesPerWeek: p.avgSalesPerWeek,
        daysToReplenish: p.daysToReplenish,
        prediction: pred,
        confidence: (v * 100).toFixed(1)
      });
      input.dispose();
      normalized.dispose();
      if (out && out.dispose) out.dispose();
    }

    // Print JSON to stdout
    console.log('--- Predictions JSON ---');
    console.log(JSON.stringify(predictions, null, 2));

    // Save CSV
    const header = ['id','name','currentInventory','avgSalesPerWeek','daysToReplenish','prediction','confidence'];
    const rows = [header.join(',')];
    for (const r of predictions) {
      const safeName = `"${r.name.replace(/"/g, '""')}"`;
      rows.push([r.id, safeName, r.currentInventory, r.avgSalesPerWeek, r.daysToReplenish, r.prediction, r.confidence].join(','));
    }
    const csv = rows.join('\n');
    const outPath = 'predictions.csv';
    fs.writeFileSync(outPath, csv, 'utf8');
    console.log(`Wrote predictions CSV to ${outPath}`);

    // cleanup
    xsTensor.dispose();
    ysTensor.dispose();
    normalizedXs.dispose();
    if (maxValues) maxValues.dispose();

    process.exit(0);
  } catch (err) {
    console.error('Error in prediction script:', err);
    process.exit(2);
  }
}

main();
