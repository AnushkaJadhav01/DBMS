import React, { useState, useEffect } from 'react';
import { Search, PlusCircle, Trash2, Edit3, Truck, Calendar, Hash, Layers, Package } from 'lucide-react';
import CRUDModal, { Field } from '../components/CRUDModal';

export default function ShipmentsScreen() {
  const [data, setData] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [search, setSearch] = useState('');

  const fields: Field[] = [
    { name: 'Order_ID', label: 'Order ID (Linked)', type: 'number', required: true },
    { name: 'Shipment_Date', label: 'Dispatch Date', type: 'date', required: true },
    { name: 'Quantity', label: 'Quantity', type: 'number', required: true },
    { name: 'Tracking_Number', label: 'Tracking Number', type: 'text', required: true },
    { name: 'Image_URL', label: 'Vehicle/Cargo Image URL (Optional)', type: 'text', required: false },
  ];

  useEffect(() => {
    fetchData();
  }, [search]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/shipments?search=${encodeURIComponent(search)}`);
      if (res.ok) setData(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleSave = async (formData: any) => {
    const url = editingItem ? `/api/shipments/${editingItem.Shipment_ID}` : '/api/shipments';
    const method = editingItem ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (!res.ok) {
       const err = await res.json();
       throw new Error(err.error || 'Failed to save shipment');
    }
    fetchData();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Cancel this shipment dispatch?')) return;
    try {
      const res = await fetch(`/api/shipments/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-primary tracking-tight">Active Shipments</h1>
          <p className="text-on-surface-variant font-medium mt-1">Live transit monitoring and logistical waybills.</p>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center gap-2"
        >
          <PlusCircle size={20} /> INITIATE SHIPMENT
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] p-2 kinetic-shadow border border-outline-variant/10">
        <div className="overflow-x-auto rounded-[2rem]">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/10">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-outline">Tracking & ID</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-outline">Dispatch Details</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-outline">Linked Order</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-outline">Volume</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-outline text-right pr-12">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {data.map((item) => {
                 const isHeavy = item.Quantity > 100;
                 const truckId = isHeavy ? '1519003722824-190d4403e38d' : '1580674285054-bed31e145f59';
                 const vehicleImg = item.Image_URL || `https://images.unsplash.com/photo-${truckId}?auto=format&fit=crop&q=80&w=400`;
                 
                 return (
                 <tr key={item.Shipment_ID} className="group hover:bg-slate-50/80 transition-all duration-300">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                       <div className="w-20 h-14 rounded-xl overflow-hidden border border-outline shadow-sm group-hover:scale-105 transition-transform flex-shrink-0 bg-surface-container">
                          <img src={vehicleImg} alt="Vehicle" className="w-full h-full object-cover" />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-on-surface tracking-tight">{item.Tracking_Number}</p>
                          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-0.5">Manifest #{item.Shipment_ID}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                     <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
                           <Calendar size={14} className="text-primary" />
                           {new Date(item.Shipment_Date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                        </div>
                        <p className="text-[9px] font-bold text-green-600 uppercase tracking-widest pl-5">Transit Verified</p>
                     </div>
                  </td>
                  <td className="px-10 py-6">
                     <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 font-bold px-3 py-1.5 rounded-lg text-[10px] tracking-tight border border-blue-100/50">
                        <Package size={12} /> ID-{item.Order_ID}
                     </div>
                  </td>
                  <td className="px-10 py-6">
                     <span className="bg-white border border-outline px-3 py-1.5 rounded-xl text-[10px] font-bold text-on-surface flex items-center gap-2 w-fit shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                        <span className="tracking-widest">{item.Quantity} UNITS</span>
                     </span>
                  </td>
                  <td className="px-10 py-6 text-right pr-16">
                     <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                        <button 
                          onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                          className="p-2.5 bg-white text-on-surface-variant border border-outline rounded-xl hover:bg-primary-container/20 hover:text-primary transition-all shadow-sm"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                  onClick={() => handleDelete(item.Shipment_ID)}
                  className="p-3 bg-white hover:bg-error/5 text-error border border-outline rounded-xl transition-all shadow-sm"
                >
                  <Trash2 size={16} />
                </button>
                     </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>

      <CRUDModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        fields={fields}
        initialData={editingItem}
        title={editingItem ? 'Edit Shipment' : 'Initiate New Shipment'}
      />
    </div>
  );
}
