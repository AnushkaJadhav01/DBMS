import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserLoggedIn: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onUserLoggedIn }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
    const body = isSignUp ? { email, password, full_name: fullName } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onUserLoggedIn(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <ShieldCheck size={26} />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">{isSignUp ? 'Create Account' : 'Welcome Back'}</h3>
            <p className="text-xs text-slate-400 font-medium">Access ColdChain demand prediction history</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr. Rajesh Kumar"
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-3.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="demo@coldchain.com"
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-3.5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-600/30 transition-all mt-4 disabled:opacity-50"
          >
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
        </div>

        <div className="mt-4 bg-slate-800/50 p-3 rounded-xl text-[11px] text-slate-400 text-center border border-slate-700/40">
          <span className="font-bold text-slate-300">Quick Test Credentials:</span> <br/>
          Admin: <code className="text-blue-400">admin@coldchain.com</code> / <code className="text-blue-400">admin123</code><br/>
          User: <code className="text-blue-400">demo@coldchain.com</code> / <code className="text-blue-400">demo123</code>
        </div>
      </div>
    </div>
  );
}
