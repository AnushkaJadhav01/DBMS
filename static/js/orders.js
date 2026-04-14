const Orders = (() => {
  const tbody = document.getElementById('tbody-orders');
  let _cache = [];

  async function load() {
    const data = await App.fetchAPI('/api/orders');
    _cache = data;
    render(data);
  }

  function render(data) {
    tbody.innerHTML = data.map(o => `
      <tr>
        <td>#${o.Order_ID}</td>
        <td>${o.Product_ID || '—'}</td>
        <td>${o.Supplier_ID || '—'}</td>
        <td>${o.Tracking_No || '—'}</td>
        <td>${o.Order_Date ? new Date(o.Order_Date).toLocaleDateString('en-IN') : '—'}</td>
        <td>
          <button class="btn btn-sm" onclick="Orders.openAdd('${o.Order_ID}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="Orders.del('${o.Order_ID}')">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  function filter() {
    const q = document.getElementById('search-orders').value.toLowerCase();
    const filtered = _cache.filter(o => 
      String(o.Order_ID).toLowerCase().includes(q) || 
      (o.Product_ID || '').toLowerCase().includes(q) ||
      (o.Supplier_ID || '').toLowerCase().includes(q) ||
      (o.Tracking_No || '').toLowerCase().includes(q)
    );
    render(filtered);
  }

  function openAdd(id = null) {
    const isEdit = !!id;
    let o = { Order_ID: '', Product_ID: '', Supplier_ID: '', Tracking_No: '', Order_Date: '' };
    
    if (isEdit) {
      const found = _cache.find(x => String(x.Order_ID) === String(id));
      if (found) {
        // Date formatting for input type="date" requires YYYY-MM-DD
        let formattedDate = '';
        if (found.Order_Date) {
          const d = new Date(found.Order_Date);
          if (!isNaN(d)) formattedDate = d.toISOString().split('T')[0];
        }
        o = {
          Order_ID: found.Order_ID,
          Product_ID: found.Product_ID || '',
          Supplier_ID: found.Supplier_ID || '',
          Tracking_No: found.Tracking_No || '',
          Order_Date: formattedDate
        };
      }
    }

    const html = `
      <form onsubmit="Orders.save(event, ${isEdit}, '${id}')" class="crud-form">
        <label>Order ID (Auto if blank)</label>
        <input type="text" id="o-id" value="${o.Order_ID}" ${isEdit ? 'readonly' : 'required'} />
        
        <label>Product ID</label>
        <input type="text" id="o-prod" value="${o.Product_ID}" required />
        
        <label>Supplier ID</label>
        <input type="text" id="o-supp" value="${o.Supplier_ID}" required />
        
        <label>Tracking No</label>
        <input type="text" id="o-track" value="${o.Tracking_No}" />
        
        <label>Order Date</label>
        <input type="date" id="o-date" value="${o.Order_Date}" />
        
        <div class="modal-actions">
          <button type="button" class="btn" onclick="App.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Order</button>
        </div>
      </form>
    `;
    App.openModal(isEdit ? 'Edit Order' : 'Add Order', html);
  }

  async function save(e, isEdit, oldId) {
    e.preventDefault();
    const payload = {
      Order_ID: document.getElementById('o-id').value,
      Product_ID: document.getElementById('o-prod').value,
      Supplier_ID: document.getElementById('o-supp').value,
      Tracking_No: document.getElementById('o-track').value,
      Order_Date: document.getElementById('o-date').value
    };

    try {
      if (isEdit) {
        await App.fetchAPI(`/api/orders/${oldId}`, { method: 'PUT', body: JSON.stringify(payload) });
        App.toast('Order updated successfully');
      } else {
        await App.fetchAPI('/api/orders', { method: 'POST', body: JSON.stringify(payload) });
        App.toast('Order added successfully');
      }
      App.closeModal();
      load();
    } catch (err) {
      // Error handled in App.fetchAPI
    }
  }

  async function del(id) {
    if (!confirm(`Are you sure you want to delete Order #${id}?`)) return;
    try {
      await App.fetchAPI(`/api/orders/${id}`, { method: 'DELETE' });
      App.toast('Order deleted');
      load();
    } catch (err) {}
  }

  return { load, openAdd, save, del, filter };
})();