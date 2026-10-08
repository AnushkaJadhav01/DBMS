import React, { useEffect, useState } from 'react';
import { History, Trash2, Calendar, Package, Tag, ArrowRight, ShieldAlert } from 'lucide-react';

export default function HistoryScreen() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = () => {
    setLoading(true);
    fetch('/api/predictions/history')
      .then(res => res.json())
      .then(data => {
        setHistory(data.history || []);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load history records');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this history record?')) return;
    try {
      const res = await fetch(`/api/predictions/history/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHistory(history.filter(item => item.history_id !== id));
      }
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 mb-2">
            <History size={14} /> User Audit Trail
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">My Prediction History</h1>
          <p className="text-xs text-slate-400 mt-1">Logged prediction transactions stored securely in DBMS.</p>
        </div>

        <button
          onClick={fetchHistory}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
        >
          Refresh Logs
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading prediction history logs...</div>
      ) : history.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 space-y-3">
          <History size={48} className="mx-auto text-slate-700" />
          <h3 className="text-base font-bold text-slate-300">No Prediction History Found</h3>
          <p className="text-xs text-slate-500">Run a demand prediction while signed in to track past inference results.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Product ID</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Unit Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Predicted Demand</th>
                  <th className="p-4">Confidence Bound</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {history.map(item => (
                  <tr key={item.history_id} className="hover:bg-slate-800/50 transition-all">
                    <td className="p-4 font-mono text-slate-400">{item.created_at}</td>
                    <td className="p-4 font-bold text-white">{item.user_name}</td>
                    <td className="p-4 font-mono font-bold text-blue-400">{item.product_id}</td>
                    <td className="p-4"><span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">{item.category}</span></td>
                    <td className="p-4">₹{item.price}</td>
                    <td className="p-4">{item.stock}</td>
                    <td className="p-4 font-black text-emerald-400 text-sm">{item.predicted_demand} units</td>
                    <td className="p-4 font-mono text-cyan-400">[{item.confidence_lower} - {item.confidence_upper}]</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(item.history_id)}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                        title="Delete entry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
