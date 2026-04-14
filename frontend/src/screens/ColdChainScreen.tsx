import React, { useState, useEffect } from 'react';
import { Search, PlusCircle, Trash2, Edit3, Snowflake, Thermometer, Box, Info, MapPin, Package, ShieldCheck, Filter } from 'lucide-react';
import CRUDModal, { Field } from '../components/CRUDModal';

export default function ColdChainScreen() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [search, setSearch] = useState('');

  const fields: Field[] = [
    { name: 'Product_ID', label: 'Product SKU', type: 'text', required: true },
    { name: 'Product_name', label: 'Item Name', type: 'text', required: true },
    { name: 'Supplier_ID', label: 'Primary Supplier', type: 'text', required: true },
    { name: 'Stock', label: 'Current Inventory', type: 'number', required: true },
    { name: 'Check_price', label: 'Unit Price (₹)', type: 'number', required: true },
    { name: 'Temperature_required', label: 'Required Temperature (°C)', type: 'number', required: true },
    { name: 'Image_URL', label: 'Manual Image URL (Optional)', type: 'text', required: false },
  ];

  useEffect(() => {
    fetchInventory();
  }, [search]);

  const fetchInventory = async () => {
    try {
      const url = search ? `/api/products?search=${encodeURIComponent(search)}` : '/api/products';
      const res = await fetch(url);
      if (res.ok) setInventory(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleSave = async (formData: any) => {
    const url = editingItem ? `/api/products/${editingItem.Product_ID}` : '/api/products';
    const method = editingItem ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (!res.ok) {
       const err = await res.json();
       throw new Error(err.error || 'Failed to update inventory');
    }
    fetchInventory();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Scrap product ${id} from inventory?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) fetchInventory();
    } catch(e) {}
  };

  return (
    <div className="p-8 space-y-10 animate-in fade-in zoom-in-95 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-primary tracking-tighter leading-none">Smart Inventory</h1>
          <p className="text-on-surface-variant font-bold text-lg flex items-center gap-2">
             <Snowflake className="text-secondary" size={22} /> Cold-Chain Integrity Monitoring
          </p>
        </div>
        <button 
           onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
           className="bg-primary text-white px-10 py-5 rounded-[2rem] font-black text-sm shadow-2xl shadow-primary/30 hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center gap-3"
        >
          <PlusCircle size={22} /> REGISTER PRODUCT
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center">
         <div className="relative flex-1">
           <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary" size={24} />
           <input 
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="w-full pl-16 pr-8 py-5 bg-white border border-outline-variant/20 rounded-3xl shadow-sm focus:ring-4 focus:ring-primary/10 transition-all font-bold text-on-surface" 
             placeholder="Search by SKU, Name or Origin..." 
             type="text"
           />
         </div>
         <button className="h-16 px-8 bg-white border border-outline-variant/20 rounded-3xl shadow-sm flex items-center gap-3 font-black text-primary hover:bg-surface-container-low transition-all">
            <Filter size={20} /> Advanced Filters
         </button>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20">
        {inventory.map((item) => {
          const isDeepFreeze = item.Temperature_required < -10;
          const isChilled = item.Temperature_required >= -10 && item.Temperature_required <= 8;
          const tag = isDeepFreeze ? 'Deep Freeze' : isChilled ? 'Cold Vault' : 'Ambient Store';
          const isLow = item.Stock < 30;

          // Image logic: Manual URL > Realistic Stock > Fallback
          const imgSrc = item.Image_URL || `https://images.unsplash.com/photo-${getPhotoId(item.Product_name)}?auto=format&fit=crop&q=80&w=800`;

          return (
          <div key={item.Product_ID} className="group bg-white rounded-2xl overflow-hidden flex flex-col shadow-sm border border-outline-variant hover:shadow-premium transition-all duration-300">
            <div className="h-56 overflow-hidden relative">
              <img 
                src={imgSrc} 
                alt={item.Product_name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <div className="absolute top-4 left-4">
                <span className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur-md ${isDeepFreeze ? 'bg-primary' : 'bg-secondary'}`}>
                  {tag}
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                 <p className="text-[10px] font-bold tracking-widest opacity-80 uppercase mb-1">SKU: {item.Product_ID}</p>
                 <h3 className="text-2xl font-black tracking-tight leading-none drop-shadow-md">{item.Product_name}</h3>
              </div>
            </div>

            <div className="p-6 flex flex-col flex-1 bg-surface">
              <div className="grid grid-cols-2 gap-4 mb-6">
                 <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Stock Level</p>
                    <p className={`text-2xl font-black tracking-tighter ${isLow ? 'text-error' : 'text-primary'}`}>
                       {item.Stock} <span className="text-xs font-bold text-on-surface-variant ml-1">UNITS</span>
                    </p>
                 </div>
                 <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Unit Price</p>
                    <p className="text-2xl font-black text-on-surface tracking-tighter tabular-nums">₹{item.Check_price}</p>
                 </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-bold text-on-surface-variant mb-8 px-4 py-3 bg-primary-container/20 rounded-xl border border-primary/5">
                 <Thermometer size={16} className="text-primary" />
                 <span className="tracking-tight">Target: {item.Temperature_required}°C Control</span>
              </div>

              <div className="flex gap-3 mt-auto">
                <button 
                  onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                  className="flex-1 bg-white hover:bg-surface-container-low text-on-surface border border-outline font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Edit3 size={16} className="text-primary" /> Modify
                </button>
                <button 
                  onClick={() => handleDelete(item.Product_ID)}
                  className="p-3 bg-white hover:bg-error/5 text-error border border-outline rounded-xl transition-all shadow-sm"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        )})}
      </section>

      <CRUDModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        title={editingItem ? 'Modify Asset Profile' : 'Register New Asset'}
        fields={fields}
        initialData={editingItem}
      />
    </div>
  );
}

// Utility to get professional stock photos
function getPhotoId(name: string) {
  const n = name.toLowerCase();
  if (n.includes('butter')) return '1589985273974-bc76ec397500';
  if (n.includes('milk')) return '1550583760-704c9a3dcc03';
  if (n.includes('fruit')) return '1610832958506-aa56338406cd';
  if (n.includes('vaccine')) return '1584036561536-f967f1295321';
  if (n.includes('meat')) return '1607623273571-707831e61914';
  if (n.includes('fish') || n.includes('sea')) return '1519708227418-c8fd9a32b7a2';
  if (n.includes('veg')) return '1566385101042-1a000c12b83b';
  if (n.includes('medicine')) return '1584308666782-bb304497a8a9';
  if (n.includes('dairy')) return '1628088062854-d1870b4553ad';
  if (n.includes('ice cream')) return '1501443662994-72bd9f29bf5c';
  
  return '1586528116311-ad8dd3c8310d'; // Default warehouse
}
