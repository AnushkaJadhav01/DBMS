import React, { useState, useEffect } from 'react';
import { Home, Package, Truck, Users, Send, CreditCard, Menu, X, LogOut, Settings, Bell, Edit3, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '../components/NavigationProvider';
import { Screen } from '../types';

interface NavigationItem {
  id: Screen;
  label: string;
  icon: any;
}

const navItems: NavigationItem[] = [
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'inventory', label: 'Inventory', icon: Truck },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'suppliers', label: 'Suppliers', icon: Send },
  { id: 'shipments', label: 'Shipments', icon: Home },
  { id: 'payments', label: 'Payments', icon: CreditCard },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { currentScreen, navigate } = useNavigation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminAvatar, setAdminAvatar] = useState('https://api.dicebear.com/7.x/avataaars/svg?seed=Admin');
  const [newAvatarUrl, setNewAvatarUrl] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
     try {
        const res = await fetch('/api/config/admin_avatar_url');
        const data = await res.json();
        if (data.value) {
           setAdminAvatar(data.value);
           setNewAvatarUrl(data.value);
        }
     } catch (e) {}
  };

  const handleUpdateAvatar = async () => {
     try {
        await fetch('/api/config/admin_avatar_url', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ value: newAvatarUrl })
        });
        setAdminAvatar(newAvatarUrl);
        setIsAdminModalOpen(false);
     } catch (e) {}
  };

  return (
    <div className="flex min-h-screen bg-app-background scroll-smooth">
      {/* desktop sidebar */}
      <aside className="hidden lg:flex w-72 bg-[#001a41] flex-col sticky top-0 h-screen z-50 shadow-2xl">
        <div className="p-10 border-b border-white/5">
          <div className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
               <Truck className="text-white" size={24} />
            </div>
            LogiFlow
          </div>
        </div>

        <nav className="flex-1 p-8 space-y-3 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id, 'none')}
                className={`w-full flex items-center gap-5 px-6 py-4 rounded-2xl font-black text-sm transition-all group relative ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && (
                   <motion.div 
                     layoutId="sidebar-active"
                     className="absolute left-0 w-1.5 h-8 bg-white rounded-r-full"
                   />
                )}
                <Icon size={22} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-white transition-colors'} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-8 border-t border-white/5 space-y-6">
           <div 
             onClick={() => setIsAdminModalOpen(true)}
             className="bg-white/5 p-5 rounded-3xl flex items-center gap-4 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-blue-500 shadow-lg relative">
                <img src={adminAvatar} alt="Admin" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                   <Edit3 size={14} className="text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-white leading-none">System Admin</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Super User Account</p>
              </div>
           </div>
           <button className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-2xl font-black text-xs text-red-400 hover:bg-red-400/10 transition-all border border-red-400/20">
             <LogOut size={16} /> SIGN OUT OF SESSION
           </button>
        </div>
      </aside>

      <AnimatePresence>
        {isAdminModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-on-app-background/60 backdrop-blur-md" 
               onClick={() => setIsAdminModalOpen(false)} 
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-premium p-10 overflow-hidden"
             >
                <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
                <h2 className="text-3xl font-black text-on-surface tracking-tighter mb-2">Edit System Profile</h2>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-8">Update Global Admin Parameters</p>
                
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Profile Avatar URL</label>
                      <input 
                        type="text" 
                        value={newAvatarUrl}
                        onChange={(e) => setNewAvatarUrl(e.target.value)}
                        placeholder="Paste direct image link..."
                        className="w-full px-6 py-4 bg-slate-50 border border-outline rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                      />
                   </div>
                   
                   <div className="flex gap-4 pt-4">
                      <button 
                        onClick={handleUpdateAvatar}
                        className="flex-1 bg-primary text-white py-4 rounded-xl font-black text-xs shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                         <Save size={16} /> APPLY CHANGES
                      </button>
                      <button 
                        onClick={() => setIsAdminModalOpen(false)}
                        className="px-6 py-4 bg-slate-50 text-slate-400 rounded-xl font-black text-xs hover:bg-slate-100 transition-all"
                      >
                         CANCEL
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-outline-variant/10 px-6 h-16 flex justify-between items-center no-print">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-outline">
          <Menu size={24} />
        </button>
        <div className="font-black text-primary italic text-xl">LogiFlow</div>
        <button className="p-2 -mr-2 text-outline">
          <Bell size={24} />
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 lg:p-0">
           {children}
        </div>
      </main>

      {/* mobile sidebar drawer */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] no-print">
          <div className="absolute inset-0 bg-on-app-background/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl flex flex-col pt-safe-top"
          >
            <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center">
              <div className="text-xl font-black text-primary italic">LogiFlow</div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-outline">
                <X size={24} />
              </button>
            </div>
            <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = currentScreen === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(item.id, 'none');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 px-5 py-5 rounded-2xl font-black text-sm transition-all ${
                      isActive ? 'bg-primary text-white shadow-lg' : 'text-outline'
                    }`}
                  >
                    <Icon size={24} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
            <div className="p-8 border-t border-outline-variant/10">
               <button className="w-full bg-error/5 text-error py-4 rounded-xl font-black text-sm">LOG OUT</button>
            </div>
          </motion.aside>
        </div>
      )}

      {/* Mobile Bottom Nav (Sync with Sidebar) */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-4 pb-6 pt-3 bg-white/90 backdrop-blur-xl rounded-t-3xl border-t border-outline-variant/20 shadow-[0_-10px_40px_rgba(0,0,0,0.06)] no-print">
        {navItems.slice(0, 4).map((item) => {
          const isActive = currentScreen === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id, 'none')}
              className={`flex flex-col items-center justify-center px-5 py-2 transition-all ${
                isActive ? 'text-primary scale-110' : 'text-outline/60'
              }`}
            >
              <Icon size={isActive ? 28 : 24} className={isActive ? 'stroke-[2.5px]' : ''} />
              <span className={`text-[10px] font-black uppercase tracking-widest mt-1 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                {item.label.slice(0, 4)}
              </span>
            </button>
          );
        })}
        <button onClick={() => setIsSidebarOpen(true)} className="flex flex-col items-center justify-center px-5 py-2 text-outline/60">
           <Menu size={24} />
           <span className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-0">More</span>
        </button>
      </nav>
    </div>
  );
}
