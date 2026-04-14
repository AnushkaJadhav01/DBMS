import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Edit3, Trash2, PlusCircle, Globe, Truck } from 'lucide-react';
import CRUDModal, { Field } from '../components/CRUDModal';

export default function SuppliersScreen() {
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const resp = await fetch(`http://localhost:5000/api/suppliers?search=${searchTerm}`);
      const result = await resp.json();
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (payload: any) => {
    const url = editingItem 
      ? `http://localhost:5000/api/suppliers/${editingItem.Supplier_ID}`
      : 'http://localhost:5000/api/suppliers';
    const method = editingItem ? 'PUT' : 'POST';

    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      fetchData();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;
    try {
      await fetch(`http://localhost:5000/api/suppliers/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const fields: Field[] = [
    { name: 'Supplier_ID', label: 'Supplier Hub ID (Unique)', type: 'text', required: true },
    { name: 'Phone_No', label: 'Contact phone', type: 'text', required: true },
    { name: 'Area', label: 'Operational Region', type: 'text', required: true },
    { name: 'Image_URL', label: 'Company Image URL (Optional)', type: 'text', required: false },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <header className="flex justify-between items-end mb-12">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.25em] mb-2">
            <Globe size={14} /> Global Supply Chain
          </div>
          <h1 className="text-5xl font-black text-on-surface tracking-tighter">Suppliers</h1>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
        >
          <PlusCircle size={18} /> Register Supplier
        </button>
      </header>

      <div className="mb-10 max-w-md">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
          <input 
            type="text"
            placeholder="Search hub by ID or region..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-outline rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchData()}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {data.map((item) => (
          <div key={item.Supplier_ID} className="group bg-white rounded-2xl p-6 shadow-sm border border-outline-variant hover:shadow-premium transition-all duration-300 relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-100 shadow-sm flex-shrink-0 bg-blue-50 flex items-center justify-center">
                 <img src={item.Image_URL || `https://api.dicebear.com/7.x/initials/svg?seed=${item.Supplier_ID}&backgroundColor=3b82f6`} alt="Supplier" className="w-full h-full object-cover" />
              </div>
              <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                <button 
                   onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                   className="p-2.5 bg-white text-on-surface-variant border border-outline rounded-xl hover:bg-primary-container/20 hover:text-primary transition-all shadow-sm"
                >
                  <Edit3 size={16} />
                </button>
                <button 
                   onClick={() => handleDelete(item.Supplier_ID)}
                   className="p-2.5 bg-white text-on-surface-variant border border-outline rounded-xl hover:bg-error/5 hover:text-error transition-all shadow-sm"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
               <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 leading-none">Strategic Partner</p>
                  <h3 className="text-xl font-black text-on-surface tracking-tight group-hover:text-primary transition-colors">{item.Supplier_ID}</h3>
               </div>
               
               <div className="flex flex-col gap-2.5 pt-4 border-t border-outline-variant/10">
                  <div className="flex items-center gap-2.5 text-xs font-bold text-on-surface-variant">
                     <Phone size={14} className="text-blue-400" />
                     <span className="tabular-nums">{item.Phone_No}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-bold text-on-surface-variant">
                     <MapPin size={14} className="text-slate-400" />
                     <span className="tracking-tight">{item.Area} Regional Hub</span>
                  </div>
               </div>
            </div>
          </div>
        ))}
        {data.length === 0 && !isLoading && (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-outline-variant/50">
             <Truck size={48} className="mx-auto text-outline/30 mb-4" />
             <p className="text-on-surface-variant font-medium">No suppliers associated with this search.</p>
          </div>
        )}
      </div>

      <CRUDModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        title={editingItem ? 'Update Partner Profile' : 'Register New Partner'}
        fields={fields}
        initialData={editingItem}
      />
    </div>
  );
}
