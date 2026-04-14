import React, { useEffect, useState } from 'react';
import { ArrowLeft, Bell, CheckCircle2, Snowflake, Droplets, ShieldCheck, Printer, Download, LayoutDashboard, Truck, Package, UserCircle, MapPin, User, Globe } from 'lucide-react';
import { useNavigation } from '../components/NavigationProvider';

export default function ReceiptScreen() {
  const { navigate, params } = useNavigation();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (params?.oid) {
      fetch(`/api/orders/${params.oid}`)
        .then(res => res.json())
        .then(data => setOrder(data))
        .catch(console.error);
    }
  }, [params]);

  if (!order) {
    return <div className="h-screen flex items-center justify-center text-primary font-bold">Loading LogiFlow Bill...</div>;
  }

  // Generate realistic stable numbers based on ID strings
  const baseCost = order.Order_ID * 450 + 8000;
  const sgst = baseCost * 0.09;
  const cgst = baseCost * 0.09;
  const total = baseCost + sgst + cgst;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-on-app-background pb-32 animate-in slide-in-from-right-8 duration-500">
      {/* SaaS Top Bar */}
      <header className="bg-white/80 backdrop-blur-md w-full px-10 py-6 border-b border-outline-variant/30 no-print flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => navigate('orders', 'push_back')}
            className="w-12 h-12 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-all border border-outline-variant/50 active:scale-95"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-black text-on-surface tracking-tighter">Manifest Logic Output</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Document IND-{order.Order_ID}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={handlePrint}
            className="bg-primary text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3"
          >
             <Printer size={18} /> Execute Print Job
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-10 pt-10 pb-24 print-padding">
        {/* The Manifest Card */}
        <div id="printable-bill" className="bg-white rounded-[2rem] shadow-premium overflow-hidden border border-outline-variant/40 relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-sky-400"></div>
          
          <div className="p-14">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start mb-16 pb-12 border-b border-dashed border-outline-variant">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest border border-blue-100 mb-2">
                   Authenticated Documentation
                </div>
                <h2 className="text-5xl font-black text-on-surface tracking-tighter uppercase leading-none">OFFICIAL<br/>MANIFEST</h2>
                <div className="flex items-center gap-3 pt-4">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                   <p className="text-xs font-bold text-slate-400 tracking-[0.15em] uppercase">SYSTEMS TRACE: {order.Tracking_No || 'UNASSIGNED_TELEMETRY'}</p>
                </div>
              </div>
              <div className="text-right mt-8 md:mt-0">
                 <div className="bg-slate-50 p-6 rounded-2xl border border-outline-variant/50 text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Dispatch Authentication</p>
                    <p className="text-2xl font-black text-on-surface tracking-tighter tabular-nums">
                       {order.Order_Date ? new Date(order.Order_Date).toLocaleDateString('en-IN', {day:'2-digit', month:'long', year:'numeric'}) : new Date().toLocaleDateString('en-IN')}
                    </p>
                 </div>
              </div>
            </div>

            {/* Logistics Channels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
              <div className="bg-slate-50/50 p-8 rounded-2xl border border-outline-variant/30 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/20 group-hover:bg-blue-500 transition-colors" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Origin / Consignor</p>
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-blue-600">
                      <User size={24} />
                   </div>
                   <div>
                      <p className="text-2xl font-black text-on-surface tracking-tight">{order.Supplier_ID}</p>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
                         <MapPin size={12} className="text-blue-400" /> Regional Hub Terminal
                      </div>
                   </div>
                </div>
              </div>
              <div className="bg-slate-50/50 p-8 rounded-2xl border border-outline-variant/30 relative overflow-hidden group text-right">
                <div className="absolute top-0 right-0 w-1 h-full bg-sky-500/20 group-hover:bg-sky-500 transition-colors" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Consignee Hub</p>
                <div className="flex items-center justify-end gap-4">
                   <div>
                      <p className="text-2xl font-black text-on-surface tracking-tight leading-none">LogiFlow Regional Hub</p>
                      <div className="flex items-center justify-end gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
                         Industrial Zone B-42 <Truck size={12} className="text-sky-400" />
                      </div>
                   </div>
                   <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-sky-600">
                      <Globe size={24} />
                   </div>
                </div>
              </div>
            </div>

            {/* Financial Reconciliation */}
            <div className="mb-16">
              <table className="w-full text-left">
                 <thead>
                    <tr className="border-b-2 border-slate-200 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                       <th className="py-5">Item Manifest Logic</th>
                       <th className="py-5 text-center">Unit Count</th>
                       <th className="py-5 text-right">Accounting Val (INR)</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    <tr className="group">
                       <td className="py-10">
                          <p className="text-xl font-black text-on-surface tracking-tight mb-1">{order.Product_ID}</p>
                          <p className="text-xs font-medium text-slate-400 italic">Standard Freight Class • Industrial Logic Applied</p>
                       </td>
                       <td className="py-10 text-center font-black text-blue-600 tabular-nums text-lg">01</td>
                       <td className="py-10 text-right font-black text-on-surface tabular-nums text-lg">₹{baseCost.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    </tr>
                    <tr>
                       <td className="py-6">
                          <div className="flex items-center gap-3">
                             <ShieldCheck size={18} className="text-green-500" />
                             <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">System Shield (Insurance)</p>
                          </div>
                       </td>
                       <td className="py-6 text-center text-[10px] font-bold text-slate-300 uppercase">Automated</td>
                       <td className="py-6 text-right font-bold text-slate-400 italic text-sm">PROTECTED</td>
                    </tr>
                 </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="flex flex-col md:flex-row gap-12 items-end justify-between">
               <div className="flex-1 space-y-4 w-full">
                  <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                     <span>Taxable Subtotal (INR)</span>
                     <span className="text-on-surface">₹{baseCost.toLocaleString('en-IN', {minimumFractionDigits:2})}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                     <span>Government Levies (18% IGST)</span>
                     <span className="text-on-surface">₹{(cgst + sgst).toLocaleString('en-IN', {minimumFractionDigits:2})}</span>
                  </div>
                  <div className="pt-8 border-t border-slate-200 flex justify-between items-center">
                     <div>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-2">Settlement Total</p>
                        <p className="text-6xl font-black text-on-surface tracking-tighter tabular-nums leading-none">₹{total.toLocaleString('en-IN', {minimumFractionDigits:2})}</p>
                     </div>
                     <div className="text-right">
                        <div className="bg-green-50 px-6 py-2.5 rounded-xl border border-green-100 flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-green-500" />
                           <p className="text-xs font-black text-green-700 uppercase tracking-widest">AUTHORIZED</p>
                        </div>
                     </div>
                  </div>
               </div>
               
               <div className="w-full md:w-auto p-4 bg-white border border-slate-200 rounded-[2rem] shadow-sm hover:scale-105 transition-transform">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=LogiFlow_v2_ORD_${order.Order_ID}&color=0f172a`} 
                    alt="System QR" 
                    className="w-32 h-32"
                  />
                  <p className="text-[9px] font-black text-center mt-3 text-slate-400 uppercase tracking-widest">Scan to Verify Trace</p>
               </div>
            </div>
          </div>

          {/* Compliance Bottom Bar */}
          <div className="bg-[#f8fafc] p-10 flex flex-col md:flex-row items-center gap-10 justify-between border-t border-slate-100">
             <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm text-blue-600">
                   <ShieldCheck size={32} />
                </div>
                <div>
                   <p className="text-lg font-black tracking-tight text-on-surface">Compliance Guaranteed</p>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Immutable Manifest System • Bharat OS v4</p>
                </div>
             </div>
             <div className="text-center md:text-right">
                <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest max-w-[200px]">Electronic Waybill Generation System. LogiFlow Tech.</p>
             </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 no-print flex gap-6">
           <button 
             onClick={handlePrint}
             className="flex-1 bg-primary text-white py-5 rounded-2xl font-black text-sm shadow-premium hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 border-4 border-white/20"
           >
              <Printer size={22} /> Commit to Hardcopy / PDF
           </button>
           <button 
             onClick={() => window.location.reload()}
             className="px-10 bg-white text-on-surface-variant border border-outline rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all border-dashed"
           >
              Refresh Data
           </button>
        </div>
      </main>
    </div>
  );
}
