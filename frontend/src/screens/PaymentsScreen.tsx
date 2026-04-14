import React, { useState, useEffect } from 'react';
import { Search, PlusCircle, Trash2, Edit3, CreditCard, Calendar, IndianRupee, Printer, Hash, Package, Globe, User } from 'lucide-react';
import CRUDModal, { Field } from '../components/CRUDModal';
import { useNavigation } from '../components/NavigationProvider';

export default function PaymentsScreen() {
  const { navigate } = useNavigation();
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
      const resp = await fetch(`http://localhost:5000/api/payments?search=${searchTerm}`);
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
      ? `http://localhost:5000/api/payments/${editingItem.Payment_ID}`
      : 'http://localhost:5000/api/payments';
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
    if (!confirm('Authenticate deletion of this financial record?')) return;
    try {
      await fetch(`http://localhost:5000/api/payments/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const fields: Field[] = [
    { name: 'Order_ID', label: 'Reference Order ID', type: 'number', required: true },
    { name: 'Amount', label: 'Transaction Value (₹)', type: 'number', required: true },
    { name: 'Payment_Mode', label: 'Settlement Channel', type: 'select', 
      options: [
        { value: 'Online Transfer', label: 'Online Transfer' },
        { value: 'Corporate Credit', label: 'Corporate Credit' },
        { value: 'Logistics Credit', label: 'Logistics Credit' },
        { value: 'Wire Transfer', label: 'Wire Transfer' },
        { value: 'UPI Business', label: 'UPI Business' }
      ] 
    },
    { name: 'Payment_Date', label: 'Accounting Date', type: 'date', required: true },
    { name: 'Status', label: 'Ledger Status', type: 'select', 
      options: [
        { value: 'Success', label: 'Success' },
        { value: 'Pending', label: 'Pending' },
        { value: 'Under Verification', label: 'Under Verification' },
        { value: 'Failed', label: 'Failed' },
        { value: 'Reconciled', label: 'Reconciled' }
      ]
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <header className="flex justify-between items-end mb-12">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.25em] mb-2">
            <Globe size={14} /> Corporate Treasury
          </div>
          <h1 className="text-5xl font-black text-on-surface tracking-tighter">Financial Ledger</h1>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
        >
          <PlusCircle size={18} /> record Settlement
        </button>
      </header>

      <div className="mb-10 max-w-md">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
          <input 
            type="text"
            placeholder="Search TXN ID or Order link..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-outline rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchData()}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 pb-20">
        {data.map((item) => {
          const isSuccess = item.Status === 'Success' || item.Status === 'Reconciled';
          const isPending = item.Status === 'Pending' || item.Status === 'Under Verification';
          
          return (
          <div key={item.Payment_ID} className="group bg-white rounded-xl p-8 shadow-sm border border-outline-variant hover:border-primary/50 transition-all duration-300 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
            <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${isSuccess ? 'bg-green-500' : isPending ? 'bg-amber-400' : 'bg-red-500'}`} />
            
            <div className="flex-1 flex items-center gap-8">
               <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-inner ${isSuccess ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                  <CreditCard size={28} />
               </div>
               <div>
                  <div className="flex items-center gap-4 mb-1">
                    <h3 className="text-3xl font-black text-on-surface tracking-tighter tabular-nums">
                      ₹{parseFloat(item.Amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </h3>
                    <span className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest border ${
                      isSuccess ? 'bg-green-50 text-green-700 border-green-100' : 
                      isPending ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                      'bg-red-50 text-red-700 border-red-100'
                    }`}>
                       {item.Status}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-3">
                     <span className="flex items-center gap-1"><Hash size={12} /> TXN-{item.Payment_ID}</span>
                     <span className="flex items-center gap-1 text-primary"><Package size={12} /> ORD-{item.Order_ID}</span>
                  </p>
               </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 pr-4 w-full md:w-auto">
               <div className="text-center md:text-right">
                  <p className="text-sm font-bold text-on-surface flex items-center gap-2 justify-center md:justify-end mb-0.5">
                     <Calendar size={14} className="text-blue-500" /> 
                     {new Date(item.Payment_Date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                  </p>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider italic">{item.Payment_Mode}</p>
               </div>
               
               <div className="flex gap-2">
                  <button 
                    onClick={() => navigate('receipt', 'push', { oid: item.Order_ID })}
                    className="flex-1 md:flex-none flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white px-6 py-3 rounded-lg font-bold text-[10px] tracking-widest transition-all shadow-sm border border-blue-100 uppercase"
                  >
                    <Printer size={16} /> Bill
                  </button>
                  <button 
                    onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                    className="p-3 bg-white text-on-surface-variant border border-outline rounded-lg hover:bg-slate-50 transition-all shadow-sm"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.Payment_ID)}
                    className="p-3 bg-white text-on-surface-variant border border-outline rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all shadow-sm"
                  >
                    <Trash2 size={16} />
                  </button>
               </div>
            </div>
          </div>
        );})}

        {data.length === 0 && !isLoading && (
          <div className="py-24 text-center bg-white rounded-2xl border-2 border-dashed border-outline-variant/30">
             <IndianRupee size={48} className="mx-auto text-outline/20 mb-4" />
             <p className="text-xl font-bold text-on-surface-variant tracking-tight">Financial ledger is in balance.</p>
             <p className="text-xs font-medium text-outline mt-1">Ready for next settlement period.</p>
          </div>
        )}
      </div>

      <CRUDModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        title={editingItem ? 'Reconcile Transaction' : 'Record Direct Settlement'}
        fields={fields}
        initialData={editingItem}
      />
    </div>
  );
}
