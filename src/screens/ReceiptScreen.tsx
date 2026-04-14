import React from 'react';
import { ArrowLeft, Bell, CheckCircle2, Snowflake, Droplets, ShieldCheck, Printer, Download, LayoutDashboard, Truck, Package, UserCircle } from 'lucide-react';
import { useNavigation } from '../components/NavigationProvider';

export default function ReceiptScreen() {
  const { navigate } = useNavigation();

  return (
    <div className="min-h-screen bg-surface text-on-app-background pb-32">
      {/* Top Bar */}
      <header className="bg-app-background w-full px-6 py-4 border-b border-outline-variant/10 no-print">
        <div className="flex justify-between items-center w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('orders', 'push_back')}
              className="text-primary p-1 hover:bg-primary/5 rounded-full transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-black text-primary tracking-tight">LogiFlow</h1>
          </div>
          <div className="flex items-center gap-4">
            <Bell className="text-primary" size={24} />
            <div className="w-8 h-8 rounded-full bg-primary-fixed overflow-hidden">
              <img 
                src="https://picsum.photos/seed/manager3/100/100" 
                alt="Profile" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-8 pb-24 print-padding">
        {/* Success Banner */}
        <div className="mb-8 text-center no-print">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-container/10 rounded-full mb-4">
            <CheckCircle2 className="text-primary" size={32} />
          </div>
          <h2 className="text-2xl font-extrabold text-primary tracking-tight">Payment Successful</h2>
          <p className="text-on-surface-variant text-sm mt-1">Receipt for Rahul Verma • LogiFlow Bharat</p>
        </div>

        {/* Receipt Card */}
        <div className="bg-surface-container-lowest rounded-xl shadow-xl overflow-hidden border border-outline-variant/30 relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-primary"></div>
          <div className="p-8">
            {/* Receipt Header */}
            <div className="flex justify-between items-start mb-10 pb-6 border-b border-outline-variant/20">
              <div>
                <h3 className="text-lg font-black text-primary mb-1">LOGIFLOW BHARAT</h3>
                <p className="text-[10px] font-medium uppercase tracking-widest text-outline mb-1">Order Reference</p>
                <p className="text-lg font-extrabold text-on-app-background">#ORD-IND-9921</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-medium uppercase tracking-widest text-outline mb-1">Date</p>
                <p className="text-sm font-bold text-on-app-background">24 Oct, 2023</p>
                <p className="text-[10px] text-on-surface-variant mt-1">GSTIN: 07AAACL1234F1Z5</p>
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="bg-surface-container-low rounded-xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Billed To</p>
                <p className="text-base font-bold text-on-app-background leading-tight">Rahul Verma</p>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">G-12, Cyber City, Gurgaon, Haryana 122002</p>
              </div>
              <div className="bg-surface-container-low rounded-xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Shipment From</p>
                <p className="text-base font-bold text-on-app-background leading-tight">LogiFlow Mumbai Hub</p>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">Warehouse 4B, JNPT Port, Navi Mumbai, Maharashtra</p>
              </div>
            </div>

            {/* Itemized List */}
            <div className="space-y-6 mb-10">
              <div className="flex justify-between items-end border-b border-outline-variant/30 pb-2">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary">Itemized Breakdown</h3>
                <p className="text-[10px] font-medium text-outline uppercase tracking-widest">Amount (INR)</p>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="bg-primary-fixed p-1.5 rounded-lg text-primary">
                      <Snowflake size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-app-background">Vaccine Batch (Temp-Controlled)</p>
                      <p className="text-[10px] text-on-surface-variant">250kg • 2°C to 8°C Monitored • Batch #VAC-901</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-on-app-background">7,500.00</p>
                </div>
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="bg-primary-fixed p-1.5 rounded-lg text-primary">
                      <Droplets size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-app-background">Milk Crates (A2 Farm Fresh)</p>
                      <p className="text-[10px] text-on-surface-variant">250kg • Insulated Transit • 50 Units</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-on-app-background">4,950.00</p>
                </div>
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="bg-primary-fixed p-1.5 rounded-lg text-primary">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-app-background">LogiFlow Protection</p>
                      <p className="text-[10px] text-on-surface-variant">Standard Transit Insurance + Cold-Chain Warranty</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-on-app-background">850.00</p>
                </div>
              </div>
            </div>

            {/* Tax Breakdown */}
            <div className="pt-6 border-t border-dashed border-outline-variant/30 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Taxable Subtotal</span>
                <span className="font-medium text-on-app-background">₹ 13,300.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant italic">CGST (9%)</span>
                <span className="font-medium text-on-app-background">₹ 1,197.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant italic">SGST (9%)</span>
                <span className="font-medium text-on-app-background">₹ 1,197.00</span>
              </div>
            </div>

            {/* Total */}
            <div className="mt-8 p-6 bg-primary rounded-2xl flex justify-between items-center shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-primary/60">Total Amount Paid</p>
                <h4 className="text-2xl font-black text-on-primary">₹ 15,694.00</h4>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-primary/60">Payment Mode</p>
                <p className="text-sm font-bold text-on-primary">Net Banking</p>
              </div>
            </div>
          </div>

          {/* Footer Graphic */}
          <div className="p-8 bg-surface-container-low/50 border-t border-outline-variant/10">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-32 h-32 bg-white p-2 rounded-lg shadow-inner flex items-center justify-center border border-outline-variant/20">
                <img 
                  src="https://picsum.photos/seed/qr/200/200" 
                  alt="QR Code" 
                  className="w-full h-full opacity-90"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <p className="text-xs font-bold text-on-app-background mb-1">Digitally Signed & Verified</p>
                <p className="text-[10px] text-on-surface-variant leading-relaxed">This receipt is electronically generated and requires no physical signature. Scan the QR code to verify shipment authenticity and temperature log history on the LogiFlow blockchain.</p>
                <p className="text-[9px] font-medium text-primary mt-3 uppercase tracking-wider">LogiFlow Technologies Private Limited • India</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-4 no-print">
          <button 
            className="w-full bg-primary hover:bg-primary-container text-white font-bold py-4 rounded-full flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md" 
            onClick={() => window.print()}
          >
            <Printer size={20} />
            Print Receipt
          </button>
          <button className="w-full text-primary font-bold py-2 flex items-center justify-center gap-2 hover:bg-primary/5 rounded-full transition-all border border-transparent hover:border-primary/20">
            <Download size={20} />
            Download PDF
          </button>
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-white/90 backdrop-blur-md z-50 rounded-t-3xl shadow-[0_-4px_24px_rgba(0,0,0,0.06)] border-t border-slate-100 no-print">
        <button 
          onClick={() => navigate('orders', 'none')}
          className="flex flex-col items-center justify-center text-outline px-5 py-2 hover:text-primary transition-all"
        >
          <LayoutDashboard size={24} />
          <span className="text-[10px] font-medium uppercase tracking-widest">Dashboard</span>
        </button>
        <button 
          onClick={() => navigate('orders', 'none')}
          className="flex flex-col items-center justify-center text-primary px-5 py-2"
        >
          <Truck size={24} className="fill-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest border-b-2 border-primary">Orders</span>
        </button>
        <button 
          onClick={() => navigate('inventory', 'none')}
          className="flex flex-col items-center justify-center text-outline px-5 py-2 hover:text-primary transition-all"
        >
          <Package size={24} />
          <span className="text-[10px] font-medium uppercase tracking-widest">Inventory</span>
        </button>
        <button className="flex flex-col items-center justify-center text-outline px-5 py-2 hover:text-primary transition-all">
          <UserCircle size={24} />
          <span className="text-[10px] font-medium uppercase tracking-widest">Profile</span>
        </button>
      </nav>
    </div>
  );
}
