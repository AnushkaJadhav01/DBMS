const Shipments = (() => {
  const tbody = document.getElementById('tbody-shipments');
  let _cache = [];

  async function load() {
    const data = await App.fetchAPI('/api/shipments');
    _cache = data;
    render(data);
  }

  function render(data) {
    tbody.innerHTML = data.map(s => `
      <tr>
        <td>#${s.Shipment_ID}</td>
        <td>${s.Order_ID}</td>
        <td>${s.Quantity ?? 0}</td>
        <td>${s.Shipment_Date ? new Date(s.Shipment_Date).toLocaleDateString('en-IN') : '—'}</td>
        <td>${s.Tracking_Number || '—'}</td>
        <td>
          <button class="btn btn-sm" onclick="Shipments.openAdd('${s.Shipment_ID}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="Shipments.del('${s.Shipment_ID}')">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  function filter() {
    const q = document.getElementById('search-shipments').value.toLowerCase();
    const filtered = _cache.filter(s => 
      String(s.Shipment_ID).toLowerCase().includes(q) || 
      String(s.Order_ID).toLowerCase().includes(q) ||
      (s.Tracking_Number || '').toLowerCase().includes(q)
    );
    render(filtered);
  }

  function openAdd(id = null) {
    const isEdit = !!id;
    let s = { Shipment_ID: '', Order_ID: '', Quantity: '', Shipment_Date: '', Tracking_Number: '' };
    
    if (isEdit) {
      const found = _cache.find(x => String(x.Shipment_ID) === String(id));
      if (found) {
        let formattedDate = '';
        if (found.Shipment_Date) {
          const d = new Date(found.Shipment_Date);
          if (!isNaN(d)) formattedDate = d.toISOString().split('T')[0];
        }
        s = {
          Shipment_ID: found.Shipment_ID,
          Order_ID: found.Order_ID || '',
          Quantity: found.Quantity || '',
          Shipment_Date: formattedDate,
          Tracking_Number: found.Tracking_Number || ''
        };
      }
    }

    const html = `
      <form onsubmit="Shipments.save(event, ${isEdit}, '${id}')" class="crud-form">
        <label>Shipment ID (Auto if blank)</label>
        <input type="text" id="sh-id" value="${s.Shipment_ID}" ${isEdit ? 'readonly' : 'required'} />
        
        <label>Order ID</label>
        <input type="text" id="sh-order" value="${s.Order_ID}" required />
        
        <label>Quantity</label>
        <input type="number" id="sh-qty" value="${s.Quantity}" />
        
        <label>Shipment Date</label>
        <input type="date" id="sh-date" value="${s.Shipment_Date}" />
        
        <label>Tracking Number</label>
        <input type="text" id="sh-track" value="${s.Tracking_Number}" />
        
        <div class="modal-actions">
          <button type="button" class="btn" onclick="App.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Shipment</button>
        </div>
      </form>
    `;
    App.openModal(isEdit ? 'Edit Shipment' : 'Add Shipment', html);
  }

  async function save(e, isEdit, oldId) {
    e.preventDefault();
    const payload = {
      Shipment_ID: document.getElementById('sh-id').value,
      Order_ID: document.getElementById('sh-order').value,
      Quantity: document.getElementById('sh-qty').value,
      Shipment_Date: document.getElementById('sh-date').value,
      Tracking_Number: document.getElementById('sh-track').value
    };

    try {
      if (isEdit) {
        await App.fetchAPI(`/api/shipments/${oldId}`, { method: 'PUT', body: JSON.stringify(payload) });
        App.toast('Shipment updated successfully');
      } else {
        await App.fetchAPI('/api/shipments', { method: 'POST', body: JSON.stringify(payload) });
        App.toast('Shipment added successfully');
      }
      App.closeModal();
      load();
    } catch (err) {
      // Error handled in App.fetchAPI
    }
  }

  async function del(id) {
    if (!confirm(`Are you sure you want to delete Shipment #${id}?`)) return;
    try {
      await App.fetchAPI(`/api/shipments/${id}`, { method: 'DELETE' });
      App.toast('Shipment deleted');
      load();
    } catch (err) {}
  }

  return { load, openAdd, save, del, filter };
})();