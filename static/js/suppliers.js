const Suppliers = (() => {
  const tbody = document.getElementById('tbody-suppliers');
  let _cache = [];

  async function load() {
    const data = await App.fetchAPI('/api/suppliers');
    _cache = data;
    render(data);
  }

  function render(data) {
    tbody.innerHTML = data.map(s => `
      <tr>
        <td>#${s.Supplier_ID}</td>
        <td>${s.Phone_No || '—'}</td>
        <td>${s.Area || '—'}</td>
        <td>
          <button class="btn btn-sm" onclick="Suppliers.openAdd('${s.Supplier_ID}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="Suppliers.del('${s.Supplier_ID}')">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  function filter() {
    const q = document.getElementById('search-suppliers').value.toLowerCase();
    const filtered = _cache.filter(s => 
      String(s.Supplier_ID).toLowerCase().includes(q) || 
      (s.Area || '').toLowerCase().includes(q) ||
      (s.Phone_No || '').toLowerCase().includes(q)
    );
    render(filtered);
  }

  function openAdd(id = null) {
    const isEdit = !!id;
    let s = { Supplier_ID: '', Phone_No: '', Area: '' };
    
    if (isEdit) {
      const found = _cache.find(x => String(x.Supplier_ID) === String(id));
      if (found) {
        s = {
          Supplier_ID: found.Supplier_ID,
          Phone_No: found.Phone_No || '',
          Area: found.Area || ''
        };
      }
    }

    const html = `
      <form onsubmit="Suppliers.save(event, ${isEdit}, '${id}')" class="crud-form">
        <label>Supplier ID</label>
        <input type="text" id="s-id" value="${s.Supplier_ID}" ${isEdit ? 'readonly' : 'required'} />
        
        <label>Phone No</label>
        <input type="text" id="s-phone" value="${s.Phone_No}" required />
        
        <label>Area</label>
        <input type="text" id="s-area" value="${s.Area}" required />
        
        <div class="modal-actions">
          <button type="button" class="btn" onclick="App.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Supplier</button>
        </div>
      </form>
    `;
    App.openModal(isEdit ? 'Edit Supplier' : 'Add Supplier', html);
  }

  async function save(e, isEdit, oldId) {
    e.preventDefault();
    const payload = {
      Supplier_ID: document.getElementById('s-id').value,
      Phone_No: document.getElementById('s-phone').value,
      Area: document.getElementById('s-area').value
    };

    try {
      if (isEdit) {
        await App.fetchAPI(`/api/suppliers/${oldId}`, { method: 'PUT', body: JSON.stringify(payload) });
        App.toast('Supplier updated successfully');
      } else {
        await App.fetchAPI('/api/suppliers', { method: 'POST', body: JSON.stringify(payload) });
        App.toast('Supplier added successfully');
      }
      App.closeModal();
      load();
    } catch (err) {
      // Error handled in App.fetchAPI
    }
  }

  async function del(id) {
    if (!confirm(`Are you sure you want to delete Supplier #${id}?`)) return;
    try {
      await App.fetchAPI(`/api/suppliers/${id}`, { method: 'DELETE' });
      App.toast('Supplier deleted');
      load();
    } catch (err) {}
  }

  return { load, openAdd, save, del, filter };
})();