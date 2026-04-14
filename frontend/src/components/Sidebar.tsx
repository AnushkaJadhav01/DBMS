import React from 'react';
import { APP_CONFIG } from '../config';
import * as Icons from 'lucide-react';
import { Command } from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export default function Sidebar({ currentTab, setCurrentTab }: SidebarProps) {
  const tabs = Object.keys(APP_CONFIG).filter(k => k !== 'dashboard');

  return (
    <div className="w-72 bg-surface-container-lowest border-r border-outline-variant/10 flex flex-col h-full shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
      <div className="p-8 flex items-center gap-4 border-b border-outline-variant/10">
        <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
          <Command size={22} />
        </div>
        <div>
          <h2 className="font-black text-xl text-on-surface tracking-tight leading-tight">Quantex</h2>
          <p className="text-xs font-bold text-outline uppercase tracking-widest leading-tight mt-0.5">SaaS OSMS</p>
        </div>
      </div>

      <nav className="flex-1 p-6 flex flex-col gap-2 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-outline mb-2 ml-2">Main Menu</p>
        
        {tabs.map(tab => {
          const conf = APP_CONFIG[tab];
          // Dynamically grab lucide icon
          const Icon = (Icons as any)[conf.icon] || Icons.Box;
          const isActive = currentTab === tab;

          return (
            <button
              key={tab}
              onClick={() => setCurrentTab(tab)}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold transition-all text-sm group ${
                isActive 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-white' : 'text-primary opacity-60 group-hover:opacity-100'} />
              {conf.entityName}s
            </button>
          );
        })}
      </nav>

      <div className="p-6 border-t border-outline-variant/10">
        <div className="bg-surface-container-low p-4 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-fixed">
             <img src="https://picsum.photos/seed/admin2/100/100" alt="Admin" className="w-full h-full object-cover" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-on-surface">Admin User</p>
            <p className="text-[10px] uppercase font-bold text-outline">Super Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
}
