const Products = (() => {
  const tbody = document.getElementById('tbody-products');
  let _cache = [];

  async function load() {
    const data = await App.fetchAPI('/api/products');
    _cache = data;
    render(data);
  }

  function render(data) {
    tbody.innerHTML = data.map(p => `
      <tr>
        <td>#${p.Product_ID}</td>
        <td>${p.Product_name || p.Product_Name || '—'}</td>
        <td>₹${Number(p.Check_price || p.Price || 0)}</td>
        <td>${p.Supplier_ID || '—'}</td>
        <td>${p.Stock ?? 0}</td>
        <td>
          <button class="btn btn-sm" onclick="Products.openAdd('${p.Product_ID}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="Products.del('${p.Product_ID}')">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  function filter() {
    const q = document.getElementById('search-products').value.toLowerCase();
    const filtered = _cache.filter(p => 
      (p.Product_name || '').toLowerCase().includes(q) || 
      String(p.Product_ID).toLowerCase().includes(q)
    );
    render(filtered);
  }

  function openAdd(id = null) {
    const isEdit = !!id;
    let p = { Product_ID: '', Product_Name: '', Price: '', Supplier_ID: '', Stock: '', Temperature_required: '' };
    
    if (isEdit) {
      const found = _cache.find(x => String(x.Product_ID) === String(id));
      if (found) {
        p = {
          Product_ID: found.Product_ID,
          Product_Name: found.Product_name || found.Product_Name || '',
          Price: found.Check_price || found.Price || '',
          Supplier_ID: found.Supplier_ID || '',
          Stock: found.Stock || '',
          Temperature_required: found.Temperature_required || ''
        };
      }
    }

    const html = `
      <form onsubmit="Products.save(event, ${isEdit}, '${id}')" class="crud-form">
        <label>Product ID</label>
        <input type="text" id="p-id" value="${p.Product_ID}" ${isEdit ? 'readonly' : 'required'} />
        
        <label>Product Name</label>
        <input type="text" id="p-name" value="${p.Product_Name}" required />
        
        <label>Price</label>
        <input type="number" id="p-price" value="${p.Price}" required />
        
        <label>Supplier ID</label>
        <input type="text" id="p-supp" value="${p.Supplier_ID}" required />
        
        <label>Stock</label>
        <input type="number" id="p-stock" value="${p.Stock}" />
        
        <label>Temperature Required</label>
        <input type="number" id="p-temp" value="${p.Temperature_required}" />
        
        <div class="modal-actions">
          <button type="button" class="btn" onclick="App.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Product</button>
        </div>
      </form>
    `;
    App.openModal(isEdit ? 'Edit Product' : 'Add Product', html);
  }

  async function save(e, isEdit, oldId) {
    e.preventDefault();
    const payload = {
      Product_ID: document.getElementById('p-id').value,
      Product_Name: document.getElementById('p-name').value,
      Price: document.getElementById('p-price').value,
      Supplier_ID: document.getElementById('p-supp').value,
      Stock: document.getElementById('p-stock').value,
      Temperature_required: document.getElementById('p-temp').value
    };

    try {
      if (isEdit) {
        await App.fetchAPI(`/api/products/${oldId}`, { method: 'PUT', body: JSON.stringify(payload) });
        App.toast('Product updated successfully');
      } else {
        await App.fetchAPI('/api/products', { method: 'POST', body: JSON.stringify(payload) });
        App.toast('Product added successfully');
      }
      App.closeModal();
      load();
    } catch (err) {
      // Error handled in App.fetchAPI
    }
  }

  async function del(id) {
    if (!confirm(`Are you sure you want to delete Product #${id}?`)) return;
    try {
      await App.fetchAPI(`/api/products/${id}`, { method: 'DELETE' });
      App.toast('Product deleted');
      load();
    } catch (err) {}
  }

  return { load, openAdd, save, del, filter };
})();