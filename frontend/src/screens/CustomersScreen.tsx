import React, { useState, useEffect } from 'react';
import { Search, User, Phone, MapPin, Edit3, Trash2, PlusCircle, Globe, Award, ShieldCheck } from 'lucide-react';
import CRUDModal, { Field } from '../components/CRUDModal';

export default function CustomersScreen() {
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
      const resp = await fetch(`http://localhost:5000/api/customers?search=${searchTerm}`);
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
      ? `http://localhost:5000/api/customers/${editingItem.Customer_ID}`
      : 'http://localhost:5000/api/customers';
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

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      await fetch(`http://localhost:5000/api/customers/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const fields: Field[] = [
    { name: 'Customer_Name', label: 'Full Legal Name', type: 'text', required: true },
    { name: 'Phone_No', label: 'Contact Phone Number', type: 'text', required: true },
    { name: 'City', label: 'Operational City', type: 'text', required: true },
  ];

  return (
    <div className="p-10 max-w-7xl mx-auto animate-in fade-in duration-700">
      <header className="flex justify-between items-end mb-16">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.3em] mb-3">
             <div className="w-8 h-1 bg-primary rounded-full" />
             Consignee Directory
          </div>
          <h1 className="text-6xl font-black text-on-surface tracking-tighter leading-none">Customer Profiles</h1>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="bg-[#001a41] text-white px-10 py-5 rounded-2xl font-black text-sm shadow-2xl shadow-blue-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 border border-white/10"
        >
          <PlusCircle size={20} /> REGISTER NEW CLIENT
        </button>
      </header>

      <div className="mb-12 max-w-lg">
        <div className="relative group">
          <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl group-focus-within:bg-primary/10 transition-all" />
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary" size={24} />
            <input 
              type="text"
              placeholder="Search by name, ID or regional hub..."
              className="w-full pl-14 pr-6 py-5 bg-white border border-outline rounded-2xl text-base font-bold text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchData()}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-24">
        {data.map((item) => (
          <div key={item.Customer_ID} className="group bg-white rounded-[2rem] p-8 shadow-premium border border-outline-variant/30 hover:border-primary/40 transition-all duration-500 relative flex flex-col">
            <div className="flex justify-between items-start mb-8">
              <div className="relative">
                 <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-xl bg-gradient-to-br from-slate-50 to-white">
                    <img src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${item.Customer_Name}&backgroundColor=f1f5f9`} alt="Customer" className="w-full h-full object-cover" />
                 </div>
                 <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-lg shadow-lg border-2 border-white">
                    <ShieldCheck size={14} />
                 </div>
              </div>
              <div className="flex gap-2">
                <button 
                   onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                   className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                >
                  <Edit3 size={18} />
                </button>
                <button 
                   onClick={() => handleDelete(item.Customer_ID)}
                   className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-error hover:text-white transition-all shadow-sm"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 space-y-6">
               <div>
                  <div className="flex items-center gap-2 mb-1.5">
                     <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Tier 1 Consignee</span>
                     <Award size={12} className="text-amber-400" />
                  </div>
                  <h3 className="text-2xl font-black text-on-surface tracking-tight group-hover:text-primary transition-colors leading-tight">
                    {item.Customer_Name}
                  </h3>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ref: #ACC-{item.Customer_ID}</p>
               </div>
               
               <div className="grid grid-cols-1 gap-4 pt-6 border-t border-slate-50">
                  <div className="flex items-center gap-4 text-sm font-bold text-on-surface">
                     <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                        <Phone size={18} />
                     </div>
                     <span className="tabular-nums">{item.Phone_No}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm font-bold text-on-surface">
                     <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <MapPin size={18} />
                     </div>
                     <span>{item.City} Logistic Zone</span>
                  </div>
               </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
               <span>System Verified</span>
               <div className="flex gap-1">
                  <div className="w-1 h-1 rounded-full bg-slate-200" />
                  <div className="w-1 h-1 rounded-full bg-slate-200" />
                  <div className="w-1 h-1 rounded-full bg-slate-200" />
               </div>
            </div>
          </div>
        ))}
        {data.length === 0 && !isLoading && (
          <div className="col-span-full py-24 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe size={40} className="text-slate-200" />
             </div>
             <p className="text-xl font-bold text-on-surface-variant tracking-tight">Accessing Database Manifest...</p>
             <p className="text-sm text-slate-400 mt-1">No customers found for this telemetry search.</p>
          </div>
        )}
      </div>

      <CRUDModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        title={editingItem ? 'Edit Consignee Profile' : 'Onboard Strategic Client'}
        fields={fields}
        initialData={editingItem}
      />
    </div>
  );
}
