const Dashboard = (() => {

  async function load() {
    const stats = await App.fetchAPI('/api/dashboard/stats');

    document.getElementById('stat-orders').textContent = stats.total_orders ?? 0;
    document.getElementById('stat-revenue').textContent = '₹' + (stats.total_revenue ?? 0);
    document.getElementById('stat-active-shipments').textContent = stats.active_shipments ?? 0;
    document.getElementById('stat-suppliers').textContent = stats.total_suppliers ?? 0;
  }

  return { load };
})();