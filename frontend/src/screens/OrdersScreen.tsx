import React, { useState, useEffect } from 'react';
import { Search, ReceiptText, PlusCircle, PackageSearch, User, Edit3, Trash2, Calendar, MapPin, Globe } from 'lucide-react';
import { useNavigation } from '../components/NavigationProvider';
import CRUDModal, { Field } from '../components/CRUDModal';

export default function OrdersScreen() {
  const { navigate } = useNavigation();
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const resp = await fetch(`http://localhost:5000/api/orders?search=${searchTerm}`);
      const data = await resp.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    const url = editingOrder 
      ? `http://localhost:5000/api/orders/${editingOrder.Order_ID}`
      : 'http://localhost:5000/api/orders';
    const method = editingOrder ? 'PUT' : 'POST';

    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      fetchOrders();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Authenticate deletion of this order manifest?')) return;
    try {
      await fetch(`http://localhost:5000/api/orders/${id}`, { method: 'DELETE' });
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const fields: Field[] = [
    { name: 'Product_ID', label: 'Asset Reference (Product)', type: 'text', required: true },
    { name: 'Supplier_ID', label: 'Fulfillment Node (Supplier)', type: 'text', required: true },
    { name: 'Tracking_No', label: 'Carrier Tracking Number', type: 'text', required: false },
    { name: 'Order_Date', label: 'Manifest Date', type: 'date', required: true },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <header className="flex justify-between items-end mb-12">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.25em] mb-2">
            <Globe size={14} /> Global Supply Chain
          </div>
          <h1 className="text-5xl font-black text-on-surface tracking-tighter">Order Manifests</h1>
        </div>
        <button 
          onClick={() => { setEditingOrder(null); setIsModalOpen(true); }}
          className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
        >
          <PlusCircle size={18} /> New Manifest
        </button>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-outline-variant overflow-hidden">
        <div className="p-6 border-b border-outline-variant bg-surface-container-lowest">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
            <input 
              type="text"
              placeholder="Filter manifests by ID or Tracking..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-outline rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-10 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Manifest & Date</th>
                <th className="px-10 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Asset Logic</th>
                <th className="px-10 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Fulfillment</th>
                <th className="px-10 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Transit Ref</th>
                <th className="px-10 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant text-right pr-16">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {orders.map((order) => {
                 const photoId = getFulfillmentPhoto(order.Product_name || order.Product_ID);
                 const productImg = order.Image_URL || `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&q=80&w=400`;
                 return (
                 <tr key={order.Order_ID} className="group hover:bg-slate-50 transition-all duration-300">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-outline shadow-sm group-hover:scale-105 transition-transform flex-shrink-0 bg-white">
                         <img src={productImg} alt="Product" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="font-black text-xl text-on-surface tracking-tighter">ORD-{order.Order_ID}</span>
                        <span className="block text-[10px] font-bold tracking-widest text-on-surface-variant mt-1 uppercase">
                          {order.Order_Date ? new Date(order.Order_Date).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'}) : 'PENDING'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex flex-col gap-1.5">
                       <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-primary">
                             <PackageSearch size={16} />
                          </div>
                          <span className="text-sm font-bold text-on-surface truncate max-w-[120px]">{order.Product_ID}</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex flex-col gap-1.5">
                       <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500">
                             <User size={16} />
                          </div>
                          <span className="text-sm font-bold text-on-surface">{order.Supplier_ID}</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3">
                       <div className={`w-1.5 h-8 rounded-full ${order.Tracking_No ? 'bg-blue-400' : 'bg-slate-200'}`} />
                       <div>
                          <p className={`text-xs font-bold tracking-tight ${order.Tracking_No ? 'text-on-surface' : 'text-on-surface-variant/40 italic'}`}>
                             {order.Tracking_No || 'UNASSIGNED'}
                          </p>
                          <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mt-0.5">Reference</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right pr-12">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                      <button 
                        onClick={() => navigate('receipt', 'push', { oid: order.Order_ID })}
                        className="p-2.5 bg-white text-on-surface-variant border border-outline rounded-xl hover:bg-primary/5 hover:text-primary transition-all shadow-sm"
                        title="View Manifest"
                      >
                        <ReceiptText size={18} />
                      </button>
                      <button 
                        onClick={() => { setEditingOrder(order); setIsModalOpen(true); }}
                        className="p-2.5 bg-white text-on-surface-variant border border-outline rounded-xl hover:bg-primary/5 hover:text-primary transition-all shadow-sm"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(order.Order_ID)}
                        className="p-2.5 bg-white text-on-surface-variant border border-outline rounded-xl hover:bg-error/5 hover:text-error transition-all shadow-sm"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
          {orders.length === 0 && !isLoading && (
            <div className="py-20 text-center">
              <p className="text-on-surface-variant font-medium">No order manifests matched your criteria.</p>
            </div>
          )}
        </div>
      </div>

      <CRUDModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        title={editingOrder ? 'Modify Order Manifest' : 'Initiate New Manifest'}
        fields={fields}
        initialData={editingOrder}
      />
    </div>
  );
}

// Fulfillment Stock Photos
function getFulfillmentPhoto(name: string) {
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
  
  return '1616401784845-180882e07173'; // Default boxes
}
