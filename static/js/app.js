/* ============================================================
   app.js — Global Logic for OSMS
   SPA Navigation, Toasts, Modals, and Fetch Utilities
   ============================================================ */

const App = (() => {
  const overlay = document.getElementById('crud-overlay');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');

  /* Global init */
  window.addEventListener('DOMContentLoaded', () => {
    // Set current date in top bar
    const dateEl = document.getElementById('top-date');
    if (dateEl) {
      dateEl.textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
      });
    }

    // Sidebar navigation events
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.getAttribute('data-section');
        navigateTo(section);
      });
    });

    // Default load: Dashboard
    navigateTo('dashboard');
  });

  /* Modern SPA Navigation */
  function navigateTo(sectionId) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Hide all sections
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    // Show target section
    const target = document.getElementById('section-' + sectionId);
    if (target) target.classList.add('active');

    // Update Sidebar items
    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.getAttribute('data-section') === sectionId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update Topbar Title
    const titleEl = document.getElementById('page-title');
    const subEl = document.getElementById('page-sub');
    if (titleEl) {
      const titles = {
        'dashboard': 'Dashboard',
        'products':  'Product Inventory',
        'suppliers': 'Vendor Management',
        'orders':    'Order Tracking',
        'shipments': 'Logistics & Shipments',
        'customers': 'Customer Directory',
        'payments':  'Financial Transactions'
      };
      const subs = {
        'dashboard': 'Overview of system activity',
        'products':  'Manage items and stock pricing',
        'suppliers': 'Maintain supplier contact data',
        'orders':    'Monitor pending and track orders',
        'shipments': 'Real-time transit status',
        'customers': 'Client information database',
        'payments':  'Track revenue and generate bills'
      };
      titleEl.textContent = titles[sectionId] || 'OSMS Panel';
      if (subEl) subEl.textContent = subs[sectionId] || '';
    }

    // Module Specific Refresh
    if (sectionId === 'dashboard') Dashboard.load();
    if (sectionId === 'products')  Products.load();
    if (sectionId === 'suppliers') Suppliers.load();
    if (sectionId === 'orders')    Orders.load();
    if (sectionId === 'shipments') Shipments.load();
    if (sectionId === 'customers') Customers.load();
    if (sectionId === 'payments')  Payments.load();
  }

  /* Global Fetch Wrapper */
  async function fetchAPI(url, options = {}) {
    try {
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server Error');
      return data;
    } catch (err) {
      toast(err.message, 'error');
      throw err;
    }
  }

  /* Toast Notification */
  function toast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = msg;
    container.appendChild(t);

    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateX(20px)';
      setTimeout(() => t.remove(), 300);
    }, 3000);
  }

  /* Modal Helpers */
  function openModal(title, html) {
    modalTitle.textContent = title;
    modalBody.innerHTML = html;
    overlay.classList.remove('hidden');
  }

  function closeModal(e) {
    if (e && e.target !== overlay && !e.target.classList.contains('modal-close-btn')) return;
    overlay.classList.add('hidden');
    modalBody.innerHTML = '';
  }

  return { navigateTo, fetchAPI, toast, openModal, closeModal };
})();

// Global alias for easy calling
const navigateTo = App.navigateTo;
const toast = App.toast;
