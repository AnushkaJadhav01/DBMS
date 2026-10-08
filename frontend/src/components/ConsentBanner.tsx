import React, { useState, useEffect } from 'react';
import { Shield, Check, X } from 'lucide-react';

export default function ConsentBanner() {
  const [accepted, setAccepted] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem('coldchain_cookie_consent');
    if (!consent) {
      setAccepted(false);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('coldchain_cookie_consent', 'true');
    setAccepted(true);
  };

  if (accepted) return null;

  return (
    <div className="fixed bottom-6 right-6 max-w-md bg-slate-900/95 backdrop-blur-md text-white p-5 rounded-2xl border border-slate-700/50 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
          <Shield size={20} />
        </div>
        <div className="flex-1 text-sm">
          <h4 className="font-bold text-slate-100 text-base mb-1">Privacy & Data Consent Notice</h4>
          <p className="text-slate-300 leading-relaxed text-xs">
            We store only essential log data for prediction history tracking and platform performance analytics. We never store sensitive personal identification or payment details.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleAccept}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/20"
            >
              <Check size={14} /> Accept & Continue
            </button>
            <button
              onClick={() => setAccepted(true)}
              className="px-3 py-2 text-slate-400 hover:text-white text-xs font-semibold"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
