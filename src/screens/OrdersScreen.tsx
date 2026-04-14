import React from 'react';
import { Bell, MapPin, ReceiptText, PlusCircle, Home, Package, Truck, Menu } from 'lucide-react';
import { useNavigation } from '../components/NavigationProvider';

export default function OrdersScreen() {
  const { navigate } = useNavigation();

  const orders = [
    { id: '#ORD-9921', date: '20 Oct 2023', weight: '420 kg', customer: 'Rajesh Sharma', destination: 'Mumbai, MH', status: 'Processing' },
    { id: '#ORD-9844', date: '19 Oct 2023', weight: '1,200 kg', customer: 'Priya Patel', destination: 'Bengaluru, KA', status: 'Pending' },
    { id: '#ORD-9730', date: '18 Oct 2023', weight: '85 kg', customer: 'Amit Verma', destination: 'New Delhi, DL', status: 'Completed' },
    { id: '#ORD-9611', date: '17 Oct 2023', weight: '2,450 kg', customer: 'Suresh Kumar', destination: 'Hyderabad, TS', status: 'Processing' },
  ];

  return (
    <div className="min-h-screen bg-app-background pb-32">
      {/* Top Bar */}
      <header className="fixed top-0 z-40 w-full bg-white/80 backdrop-blur-md px-6 h-16 flex justify-between items-center border-b border-outline-variant/10">
        <div className="text-xl font-black text-primary italic tracking-tight">LogiFlow</div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-surface-container-low transition-colors text-outline">
            <Bell size={20} />
          </button>
          <div className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant/20">
            <img 
              src="https://picsum.photos/seed/manager/100/100" 
              alt="Profile" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-2">Orders Management</h1>
          <p className="text-on-surface-variant font-medium">Track and process your logistics operations across India.</p>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-surface-container-lowest p-8 rounded-xl kinetic-shadow border-l-4 border-primary">
            <span className="text-xs font-bold uppercase tracking-widest text-outline mb-2 block">Total Active</span>
            <div className="text-4xl font-black text-primary">1,284</div>
          </div>
          <div className="bg-surface-container-lowest p-8 rounded-xl kinetic-shadow border-l-4 border-secondary">
            <span className="text-xs font-bold uppercase tracking-widest text-outline mb-2 block">Requires Attention</span>
            <div className="text-4xl font-black text-secondary">12</div>
          </div>
          <div className="bg-surface-container-lowest p-8 rounded-xl kinetic-shadow border-l-4 border-surface-tint">
            <span className="text-xs font-bold uppercase tracking-widest text-outline mb-2 block">Completed Today</span>
            <div className="text-4xl font-black text-surface-tint">432</div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-surface-container-low rounded-2xl p-1 overflow-hidden">
          <div className="bg-surface-container-lowest rounded-xl overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface-container-high/50 border-b border-outline-variant/10">
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-wider text-outline">Order Details</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-wider text-outline">Customer</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-wider text-outline">Destination</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-wider text-outline">Status</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-wider text-outline text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-app-background transition-colors group">
                    <td className="px-8 py-6">
                      <span className="font-bold text-primary">{order.id}</span>
                      <span className="block text-xs text-on-surface-variant mt-1">{order.date} • {order.weight}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-medium text-on-surface">{order.customer}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-surface-tint" />
                        <span className="font-semibold text-on-surface">{order.destination}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter ${
                        order.status === 'Processing' ? 'bg-surface-container-high text-primary-container' :
                        order.status === 'Pending' ? 'bg-secondary-fixed text-secondary' :
                        'bg-primary/10 text-primary'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end items-center gap-4">
                        <button 
                          onClick={() => navigate('receipt', 'push')}
                          className="text-outline hover:text-primary transition-colors" 
                          title="Print Receipt"
                        >
                          <ReceiptText size={20} />
                        </button>
                        <button 
                          onClick={() => navigate('inventory', 'push')}
                          className="text-xs font-bold text-primary underline decoration-2 underline-offset-4 hover:text-primary-container transition-colors"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* FAB */}
      <button 
        onClick={() => navigate('inventory', 'slide_up')}
        className="fixed bottom-24 right-8 z-50 flex items-center gap-3 bg-primary text-white px-6 py-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all group"
      >
        <PlusCircle size={24} />
        <span className="font-bold tracking-tight">ADD ORDER</span>
      </button>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-white/80 backdrop-blur-md rounded-t-3xl border-t border-outline-variant/10 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
        <button className="flex flex-col items-center justify-center text-outline px-5 py-2 hover:text-primary transition-all">
          <Home size={24} />
          <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Home</span>
        </button>
        <button className="flex flex-col items-center justify-center bg-primary-fixed text-primary rounded-2xl px-5 py-2 scale-95 transition-all">
          <Package size={24} />
          <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Orders</span>
        </button>
        <button className="flex flex-col items-center justify-center text-outline px-5 py-2 hover:text-primary transition-all">
          <Truck size={24} />
          <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Shipments</span>
        </button>
        <button className="flex flex-col items-center justify-center text-outline px-5 py-2 hover:text-primary transition-all">
          <Menu size={24} />
          <span className="text-[10px] font-bold uppercase tracking-wider mt-1">More</span>
        </button>
      </nav>
    </div>
  );
}
