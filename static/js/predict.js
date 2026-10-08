/* ============================================================
   predict.js — Product Demand Prediction SPA View Helper
   ============================================================ */

const Predict = (() => {
  async function load() {
    const section = document.getElementById('section-predict');
    if (!section) return;

    // Load metrics
    try {
      const metrics = await App.fetchAPI('/api/ml/metrics');
      renderMetrics(metrics);
    } catch (e) {
      console.warn("Could not load ML metrics:", e);
    }

    // Load products dropdown
    try {
      const products = await App.fetchAPI('/api/products');
      const sel = document.getElementById('predict-product-id');
      if (sel && Array.isArray(products)) {
        sel.innerHTML = products.map(p => 
          `<option value="${p.Product_ID}" data-stock="${p.Stock || 0}" data-price="${p.Check_price || 0}" data-cat="${p.Category || 'Vaccines'}">${p.Product_name} (${p.Product_ID})</option>`
        ).join('');
        
        sel.addEventListener('change', onProductChange);
        if (products.length > 0) onProductChange();
      }
    } catch (e) {
      console.warn("Could not load products for predict view:", e);
    }
  }

  function onProductChange() {
    const sel = document.getElementById('predict-product-id');
    if (!sel || !sel.options[sel.selectedIndex]) return;
    const opt = sel.options[sel.selectedIndex];
    
    const stockIn = document.getElementById('predict-stock');
    const priceIn = document.getElementById('predict-price');
    const catIn = document.getElementById('predict-category');

    if (stockIn) stockIn.value = opt.getAttribute('data-stock') || 0;
    if (priceIn) priceIn.value = opt.getAttribute('data-price') || 0;
    if (catIn) catIn.value = opt.getAttribute('data-cat') || 'Vaccines';
  }

  async function submitForm(e) {
    if (e) e.preventDefault();
    const pid = document.getElementById('predict-product-id')?.value;
    const stock = Number(document.getElementById('predict-stock')?.value || 0);
    const price = Number(document.getElementById('predict-price')?.value || 0);
    const category = document.getElementById('predict-category')?.value || 'Vaccines';

    try {
      const result = await App.fetchAPI('/api/predict-demand', {
        method: 'POST',
        body: JSON.stringify({
          product_id: pid,
          current_stock: stock,
          price: price,
          category: category
        })
      });

      const resBox = document.getElementById('predict-result-box');
      if (resBox) {
        resBox.innerHTML = `
          <div class="prediction-card">
            <span class="prediction-label">EXPECTED DEMAND</span>
            <div class="prediction-value">${result.prediction} <span class="prediction-unit">units</span></div>
            <div class="prediction-model">Model: <strong>${result.model}</strong></div>
          </div>
        `;
      }
      App.toast(`Demand predicted: ${result.prediction} units`, 'success');
    } catch (err) {
      App.toast(err.message, 'error');
    }
  }

  function renderMetrics(m) {
    const el = document.getElementById('predict-metrics-box');
    if (!el || !m) return;
    el.innerHTML = `
      <div class="metrics-grid">
        <div class="metric-item"><span class="m-label">MAE</span><span class="m-val">${m.mae}</span></div>
        <div class="metric-item"><span class="m-label">RMSE</span><span class="m-val">${m.rmse}</span></div>
        <div class="metric-item"><span class="m-label">R² Score</span><span class="m-val highlight">${m.r2_score}</span></div>
        <div class="metric-item"><span class="m-label">Records</span><span class="m-val">${m.train_records} / ${m.test_records}</span></div>
      </div>
    `;
  }

  return { load, submitForm };
})();
