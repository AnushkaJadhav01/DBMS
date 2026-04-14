const Customers = (() => {
  const tbody = document.getElementById('tbody-customers');
  let _cache = [];

  async function load() {
    const data = await App.fetchAPI('/api/customers');
    _cache = data;
    render(data);
  }

  function render(data) {
    tbody.innerHTML = data.map(c => `
      <tr>
        <td>#${c.Customer_ID}</td>
        <td>${c.Name || c.Customer_Name || '—'}</td>
        <td>${c.Phone || c.Phone_No || '—'}</td>
        <td>${c.City || '—'}</td>
        <td>
          <button class="btn btn-sm" onclick="Customers.openAdd('${c.Customer_ID}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="Customers.del('${c.Customer_ID}')">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  function filter() {
    const q = document.getElementById('search-customers').value.toLowerCase();
    const filtered = _cache.filter(c => 
      String(c.Customer_ID).toLowerCase().includes(q) || 
      (c.Name || c.Customer_Name || '').toLowerCase().includes(q) ||
      (c.Phone || c.Phone_No || '').toLowerCase().includes(q) ||
      (c.City || '').toLowerCase().includes(q)
    );
    render(filtered);
  }

  function openAdd(id = null) {
    const isEdit = !!id;
    let c = { Customer_ID: '', Customer_Name: '', Phone_No: '', City: '' };
    
    if (isEdit) {
      const found = _cache.find(x => String(x.Customer_ID) === String(id));
      if (found) {
        c = {
          Customer_ID: found.Customer_ID,
          Customer_Name: found.Customer_Name || found.Name || '',
          Phone_No: found.Phone_No || found.Phone || '',
          City: found.City || ''
        };
      }
    }

    const html = `
      <form onsubmit="Customers.save(event, ${isEdit}, '${id}')" class="crud-form">
        <label>Customer ID</label>
        <input type="text" id="c-id" value="${c.Customer_ID}" ${isEdit ? 'readonly' : 'required'} />
        
        <label>Name</label>
        <input type="text" id="c-name" value="${c.Customer_Name}" required />
        
        <label>Phone No</label>
        <input type="text" id="c-phone" value="${c.Phone_No}" />
        
        <label>City</label>
        <input type="text" id="c-city" value="${c.City}" />
        
        <div class="modal-actions">
          <button type="button" class="btn" onclick="App.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Customer</button>
        </div>
      </form>
    `;
    App.openModal(isEdit ? 'Edit Customer' : 'Add Customer', html);
  }

  async function save(e, isEdit, oldId) {
    e.preventDefault();
    const payload = {
      Customer_ID: document.getElementById('c-id').value,
      Customer_Name: document.getElementById('c-name').value,
      Phone_No: document.getElementById('c-phone').value,
      City: document.getElementById('c-city').value
    };

    try {
      if (isEdit) {
        await App.fetchAPI(`/api/customers/${oldId}`, { method: 'PUT', body: JSON.stringify(payload) });
        App.toast('Customer updated successfully');
      } else {
        await App.fetchAPI('/api/customers', { method: 'POST', body: JSON.stringify(payload) });
        App.toast('Customer added successfully');
      }
      App.closeModal();
      load();
    } catch (err) {
      // Error handled in App.fetchAPI
    }
  }

  async function del(id) {
    if (!confirm(`Are you sure you want to delete Customer #${id}?`)) return;
    try {
      await App.fetchAPI(`/api/customers/${id}`, { method: 'DELETE' });
      App.toast('Customer deleted');
      load();
    } catch (err) {}
  }

  return { load, openAdd, save, del, filter };
})();