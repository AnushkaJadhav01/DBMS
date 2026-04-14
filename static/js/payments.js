const Payments = (() => {
  const tbody = document.getElementById('tbody-payments');
  let _cache = [];

  async function load() {
    const data = await App.fetchAPI('/api/payments');
    _cache = data;
    render(data);
  }

  function render(data) {
    tbody.innerHTML = data.map(p => `
      <tr>
        <td>#${p.Payment_ID}</td>
        <td>${p.Order_ID}</td>
        <td>₹${Number(p.Amount || 0).toLocaleString('en-IN')}</td>
        <td>${p.Mode || p.Payment_Mode || '—'}</td>
        <td>${p.Date || p.Payment_Date ? new Date(p.Date || p.Payment_Date).toLocaleDateString('en-IN') : '—'}</td>
        <td>${p.Status || '—'}</td>
        <td>
          <button class="btn btn-sm" onclick="Receipt.print('${p.Payment_ID}')">Print</button>
          <button class="btn btn-sm" onclick="Payments.openAdd('${p.Payment_ID}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="Payments.del('${p.Payment_ID}')">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  function filter() {
    const q = document.getElementById('search-payments').value.toLowerCase();
    const statusFilter = document.getElementById('filter-payment-status').value.toLowerCase();
    
    const filtered = _cache.filter(p => {
      const matchSearch = String(p.Payment_ID).toLowerCase().includes(q) || 
                          String(p.Order_ID).toLowerCase().includes(q) ||
                          (p.Mode || p.Payment_Mode || '').toLowerCase().includes(q);
      const matchStatus = statusFilter === '' || (p.Status || '').toLowerCase() === statusFilter;
      return matchSearch && matchStatus;
    });
    render(filtered);
  }

  function openAdd(id = null) {
    const isEdit = !!id;
    let pm = { Payment_ID: '', Order_ID: '', Amount: '', Payment_Mode: '', Date: '', Status: '' };
    
    if (isEdit) {
      const found = _cache.find(x => String(x.Payment_ID) === String(id));
      if (found) {
        let formattedDate = '';
        const d_val = found.Date || found.Payment_Date;
        if (d_val) {
          const d = new Date(d_val);
          if (!isNaN(d)) formattedDate = d.toISOString().split('T')[0];
        }
        pm = {
          Payment_ID: found.Payment_ID,
          Order_ID: found.Order_ID || '',
          Amount: found.Amount || '',
          Payment_Mode: found.Mode || found.Payment_Mode || '',
          Date: formattedDate,
          Status: found.Status || 'Completed'
        };
      }
    }

    const html = `
      <form onsubmit="Payments.save(event, ${isEdit}, '${id}')" class="crud-form">
        <label>Payment ID (Auto if blank)</label>
        <input type="text" id="pm-id" value="${pm.Payment_ID}" ${isEdit ? 'readonly' : 'required'} />
        
        <label>Order ID</label>
        <input type="text" id="pm-order" value="${pm.Order_ID}" required />
        
        <label>Amount</label>
        <input type="number" id="pm-amount" value="${pm.Amount}" required />
        
        <label>Payment Mode</label>
        <select id="pm-mode" required>
          <option value="Cash" ${pm.Payment_Mode === 'Cash' ? 'selected' : ''}>Cash</option>
          <option value="Card" ${pm.Payment_Mode === 'Card' ? 'selected' : ''}>Card</option>
          <option value="UPI" ${pm.Payment_Mode === 'UPI' ? 'selected' : ''}>UPI</option>
          <option value="Bank Transfer" ${pm.Payment_Mode === 'Bank Transfer' ? 'selected' : ''}>Bank Transfer</option>
          <option value="${pm.Payment_Mode}" ${!['Cash','Card','UPI','Bank Transfer'].includes(pm.Payment_Mode) && pm.Payment_Mode ? 'selected' : ''} style="display:none;">${pm.Payment_Mode}</option>
        </select>
        
        <label>Date</label>
        <input type="date" id="pm-date" value="${pm.Date}" />
        
        <label>Status</label>
        <select id="pm-status">
          <option value="Pending" ${pm.Status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Completed" ${pm.Status === 'Completed' || pm.Status==='' ? 'selected' : ''}>Completed</option>
          <option value="Failed" ${pm.Status === 'Failed' ? 'selected' : ''}>Failed</option>
        </select>
        
        <div class="modal-actions">
          <button type="button" class="btn" onclick="App.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Payment</button>
        </div>
      </form>
    `;
    App.openModal(isEdit ? 'Edit Payment' : 'Add Payment', html);
  }

  async function save(e, isEdit, oldId) {
    e.preventDefault();
    const payload = {
      Payment_ID: document.getElementById('pm-id').value,
      Order_ID: document.getElementById('pm-order').value,
      Amount: document.getElementById('pm-amount').value,
      Payment_Mode: document.getElementById('pm-mode').value,
      Payment_Date: document.getElementById('pm-date').value,
      Status: document.getElementById('pm-status').value
    };

    try {
      if (isEdit) {
        await App.fetchAPI(`/api/payments/${oldId}`, { method: 'PUT', body: JSON.stringify(payload) });
        App.toast('Payment updated successfully');
      } else {
        await App.fetchAPI('/api/payments', { method: 'POST', body: JSON.stringify(payload) });
        App.toast('Payment added successfully');
      }
      App.closeModal();
      load();
    } catch (err) {
      // Error handled in App.fetchAPI
    }
  }

  async function del(id) {
    if (!confirm(`Are you sure you want to delete Payment #${id}?`)) return;
    try {
      await App.fetchAPI(`/api/payments/${id}`, { method: 'DELETE' });
      App.toast('Payment deleted');
      load();
    } catch (err) {}
  }

  return { load, openAdd, save, del, filter };
})();