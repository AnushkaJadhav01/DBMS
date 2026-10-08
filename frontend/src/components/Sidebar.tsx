import React, { useState, useEffect } from 'react';
import { APP_CONFIG } from '../config';
import * as Icons from 'lucide-react';
import { Command, LogIn, LogOut, ShieldCheck } from 'lucide-react';
import AuthModal from './AuthModal';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export default function Sidebar({ currentTab, setCurrentTab }: SidebarProps) {
  const [user, setUser] = useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  const tabs = Object.keys(APP_CONFIG).filter(k => k !== 'dashboard');

  return (
    <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0 shadow-2xl z-20 text-slate-100">
      <div className="p-6 flex items-center gap-4 border-b border-slate-800">
        <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30 font-black">
          <Command size={22} />
        </div>
        <div>
          <h2 className="font-black text-xl text-white tracking-tight leading-tight">ColdChain</h2>
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest leading-tight mt-0.5">OSMS Predictive ML</p>
        </div>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-1.5 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2 ml-2">ML Platform Menu</p>
        
        {tabs.map(tab => {
          const conf = APP_CONFIG[tab];
          const Icon = (Icons as any)[conf.icon] || Icons.Box;
          const isActive = currentTab === tab;

          let label = conf.entityName;
          if (tab === 'landing') label = 'Product Home';
          else if (tab === 'predict') label = 'Demand Prediction';
          else if (tab === 'history') label = 'My History';
          else if (tab === 'admin') label = 'Admin Analytics';
          else if (tab === 'about') label = 'About & Docs';

          return (
            <button
              key={tab}
              onClick={() => setCurrentTab(tab)}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold transition-all text-xs group ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* User Account Footer Card */}
      <div className="p-4 border-t border-slate-800">
        {user ? (
          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/30">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-white truncate max-w-[110px]">{user.full_name}</p>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">{user.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAuthModalOpen(true)}
            className="w-full py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <LogIn size={16} /> Sign In / Register
          </button>
        )}
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onUserLoggedIn={(u) => setUser(u)}
      />
    </div>
  );
}
