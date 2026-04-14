const Receipt = (() => {

  async function print(paymentId) {
    try {
      const p = await App.fetchAPI(`/api/payments/${paymentId}`);

      let order = null;
      try {
        if (p.Order_ID) {
          order = await App.fetchAPI(`/api/orders/${p.Order_ID}`);
        }
      } catch {}

      const win = window.open('', '_blank', 'width=700,height=800');

      if (!win) {
        App.toast('Enable popups', 'error');
        return;
      }

      win.document.write(buildHTML(p, order));
      win.document.close();

      setTimeout(() => win.print(), 300);

    } catch {
      App.toast('Error loading receipt', 'error');
    }
  }

  function buildHTML(p, order) {

    const date = p.Date
      ? new Date(p.Date).toLocaleDateString('en-IN')
      : '—';

    return `
<html>
<head>
<title>Receipt</title>
<style>
body { font-family: Arial; padding: 40px; }
h2 { color:#4f46e5 }
.row { display:flex; justify-content:space-between; margin:10px 0 }
.amount { font-size:28px; font-weight:bold; margin-top:20px }
</style>
</head>
<body>

<h2>ColdChain Receipt</h2>

<div class="row"><span>ID</span><span>#${p.Payment_ID}</span></div>
<div class="row"><span>Order</span><span>#${p.Order_ID}</span></div>
<div class="row"><span>Mode</span><span>${p.Mode || '—'}</span></div>
<div class="row"><span>Date</span><span>${date}</span></div>

${order ? `<div class="row"><span>Product</span><span>${order.Product_ID}</span></div>` : ''}

<div class="amount">₹${Number(p.Amount || 0).toLocaleString('en-IN')}</div>

</body>
</html>
`;
  }

  return { print };
})();