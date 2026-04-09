import React from 'react';
import { Bell, PlusCircle, Search, Edit3, Trash2, Snowflake, Thermometer, LayoutDashboard, Truck, Package, Settings } from 'lucide-react';
import { useNavigation } from '../components/NavigationProvider';

export default function ColdChainScreen() {
  const { navigate } = useNavigation();

  const inventory = [
    { name: 'Covishield Vials', sku: 'VAC-COV-442', category: 'Vaccines', quantity: '1,200', unit: 'vials', status: 'At 4°C', color: 'primary', img: 'https://picsum.photos/seed/vaccine/400/300' },
    { name: 'Amul Gold Milk', sku: 'DRY-MIL-001', category: 'Dairy Items', quantity: '45', unit: 'crates', status: 'Restock Needed', color: 'secondary', img: 'https://picsum.photos/seed/milk/400/300' },
    { name: 'Nagpur Oranges', sku: 'FRU-ORG-882', category: 'Fruits', quantity: '120', unit: 'crates', status: 'In Transit', color: 'primary', img: 'https://picsum.photos/seed/orange/400/300' },
    { name: 'Shimla Capsicum', sku: 'VEG-CAP-119', category: 'Vegetables', quantity: '850', unit: 'kg', status: 'In Stock', color: 'primary', img: 'https://picsum.photos/seed/capsicum/400/300' },
  ];

  return (
    <div className="min-h-screen bg-app-background pb-32">
      {/* Top Bar */}
      <header className="bg-app-background w-full px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-fixed">
            <img 
              src="https://picsum.photos/seed/manager2/100/100" 
              alt="Profile" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-primary font-bold text-lg tracking-tight">Namaste, ColdChain Manager</h1>
        </div>
        <button className="text-primary transition-transform active:scale-95">
          <Bell size={24} />
        </button>
      </header>

      <main className="px-6 py-4 space-y-8 max-w-7xl mx-auto">
        {/* Search & Header */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-primary tracking-tight">Cold Inventory</h2>
            <button className="bg-primary text-white px-5 py-2.5 rounded-full font-bold flex items-center gap-2 text-sm shadow-lg shadow-primary/30 active:scale-95 transition-all">
              <PlusCircle size={18} /> Add New Item
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={20} />
            <input 
              className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border-none rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant" 
              placeholder="Search vaccines, dairy, produce..." 
              type="text"
            />
          </div>
        </section>

        {/* Product Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {inventory.map((item) => (
            <div key={item.sku} className="group relative bg-surface-container-lowest rounded-xl overflow-hidden flex flex-col shadow-sm transition-all duration-300 border border-outline-variant/10">
              {item.color === 'secondary' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary z-10" />}
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={item.img} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4">
                  <span className={`${item.color === 'secondary' ? 'bg-secondary-container' : 'bg-primary'} text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-md`}>
                    {item.category}
                  </span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-on-surface">{item.name}</h3>
                    <p className="text-sm text-outline">SKU: {item.sku}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-2xl font-black ${item.color === 'secondary' ? 'text-secondary' : 'text-primary'}`}>
                      {item.quantity} <span className="text-xs font-normal text-outline">{item.unit}</span>
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-tighter ${item.status === 'Restock Needed' ? 'text-secondary' : 'text-green-600'}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button className="flex-1 bg-primary text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-transform">
                    <Edit3 size={18} /> Edit Item
                  </button>
                  <button className="w-14 h-12 bg-error-container text-error border border-error/10 font-bold rounded-xl flex items-center justify-center active:scale-95 transition-transform">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Quick Stats */}
        <section className="space-y-4 pb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-outline">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/10">
              <Snowflake className="text-primary mb-2" size={24} />
              <p className="text-3xl font-black text-on-surface">2,500+</p>
              <p className="text-[10px] font-bold uppercase text-outline">Cold Items</p>
            </div>
            <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/10">
              <Thermometer className="text-secondary mb-2" size={24} />
              <p className="text-3xl font-black text-secondary">03</p>
              <p className="text-[10px] font-bold uppercase text-outline">Temp Alerts</p>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-white/80 backdrop-blur-md z-50 rounded-t-3xl shadow-[0_-4px_24px_rgba(0,0,0,0.06)] border-t border-outline-variant/10">
        <button 
          onClick={() => navigate('orders', 'none')}
          className="flex flex-col items-center justify-center text-outline px-5 py-2 hover:text-primary transition-all"
        >
          <LayoutDashboard size={24} />
          <span className="text-[10px] font-medium uppercase tracking-widest mt-1">Dashboard</span>
        </button>
        <button 
          onClick={() => navigate('orders', 'none')}
          className="flex flex-col items-center justify-center text-outline px-5 py-2 hover:text-primary transition-all"
        >
          <Truck size={24} />
          <span className="text-[10px] font-medium uppercase tracking-widest mt-1">Fleets</span>
        </button>
        <button className="flex flex-col items-center justify-center bg-primary text-white rounded-2xl px-5 py-2 active:scale-95 transition-all">
          <Package size={24} />
          <span className="text-[10px] font-medium uppercase tracking-widest mt-1">Inventory</span>
        </button>
        <button className="flex flex-col items-center justify-center text-outline px-5 py-2 hover:text-primary transition-all">
          <Settings size={24} />
          <span className="text-[10px] font-medium uppercase tracking-widest mt-1">Config</span>
        </button>
      </nav>
    </div>
  );
}
