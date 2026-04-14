import React, { useState, useEffect } from 'react';
import { Search, PlusCircle, Edit3, Trash2, X, RefreshCw } from 'lucide-react';
import { EntityConfig, EntityColumn } from '../config';

interface EntityScreenProps {
  key?: React.Key;
  config: EntityConfig;
}

export default function EntityScreen({ config }: EntityScreenProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [formData, setFormData] = useState<any>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = search ? `${config.endpoint}?search=${encodeURIComponent(search)}` : config.endpoint;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [config.endpoint, search]);

  const openAdd = () => {
    setEditingId(null);
    const initial: any = {};
    config.columns.forEach(c => {
      initial[c.key] = '';
    });
    setFormData(initial);
    setShowModal(true);
  };

  const openEdit = (row: any) => {
    setEditingId(row[config.idField]);
    const initial: any = {};
    config.columns.forEach(c => {
      initial[c.key] = row[c.key] || '';
    });
    setFormData(initial);
    setShowModal(true);
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm(`Delete ${config.entityName} ${id}?`)) return;
    try {
      const res = await fetch(`${config.endpoint}/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
      else alert('Failed to delete item.');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${config.endpoint}/${editingId}` : config.endpoint;
      
      const payload: any = { ...formData };
      
      // Auto-increment fields are hidden in form, so if we're creating, we might want to delete it from payload
      // if it's empty, but let's let MySQL handle it. The backend strictly consumes exactly what it needs.

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowModal(false);
        fetchData();
      } else {
        const err = await res.json();
        alert(`Failed to save: ${err.error || 'Unknown error'}`);
      }
    } catch (e) {
      console.error(e);
      alert('Network error');
    }
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-surface p-8 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-on-surface mb-1">
            {config.entityName}s
          </h1>
          <p className="text-outline text-sm">
            Manage your {config.entityName.toLowerCase()}s within the database.
          </p>
        </div>
        <button 
          onClick={openAdd}
          className="bg-primary text-white px-6 py-3 rounded-full shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:shadow-primary/30 transition-all font-bold flex items-center gap-2"
        >
          <PlusCircle size={20} /> Add {config.entityName}
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl kinetic-shadow mb-6 border border-outline-variant/10">
        <div className="relative w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant" size={18} />
          <input 
            type="text" 
            placeholder="Search records..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-lowest pl-12 pr-4 py-2.5 rounded-xl text-sm outline-none border border-outline-variant/20 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <button onClick={fetchData} className="p-2 text-outline hover:text-primary transition-colors" title="Refresh">
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl kinetic-shadow overflow-hidden border border-outline-variant/10 flex-1">
        <div className="overflow-x-auto h-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/10">
                {config.columns.map(col => (
                  <th key={col.key} className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-outline">
                    {col.label}
                  </th>
                ))}
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-outline text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={config.columns.length + 1} className="py-12 text-center text-outline font-medium">
                    No {config.entityName.toLowerCase()}s found.
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => (
                  <tr key={row[config.idField] || idx} className="hover:bg-surface-container-lowest/50 transition-colors">
                    {config.columns.map(col => (
                      <td key={col.key} className="px-6 py-5 text-sm text-on-surface font-medium whitespace-nowrap truncate">
                        {row[col.key] || '-'}
                      </td>
                    ))}
                    <td className="px-6 py-5 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => openEdit(row)} className="text-secondary hover:text-secondary-container transition-colors bg-secondary/10 p-2 rounded-lg">
                          <Edit3 size={18} />
                        </button>
                        <button onClick={() => handleDelete(row[config.idField])} className="text-error hover:text-red-700 transition-colors bg-error/10 p-2 rounded-lg">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-app-background/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-outline-variant/20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-lowest">
              <h3 className="text-xl font-black text-on-surface tracking-tight">
                {editingId ? 'Edit' : 'Add'} {config.entityName}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-outline hover:text-error transition-colors p-2 -mr-2">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-5">
              <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-5">
                {config.columns.map(col => {
                  if (col.hiddenInForm && !editingId) return null; // hide auto-increment on create
                  // On edit, auto increment / IDs are usually read-only
                  const isReadOnly = editingId && col.key === config.idField;

                  return (
                    <div key={col.key}>
                      <label className="block text-xs font-bold uppercase tracking-widest text-outline mb-2">
                        {col.label} {col.required && <span className="text-error">*</span>}
                      </label>
                      
                      {col.type === 'select' ? (
                        <select
                          required={col.required}
                          disabled={isReadOnly}
                          value={formData[col.key]}
                          onChange={e => setFormData({...formData, [col.key]: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 bg-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium disabled:opacity-50"
                        >
                          <option value="">Select...</option>
                          {col.options?.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text'}
                          required={col.required}
                          disabled={isReadOnly}
                          value={formData[col.key]}
                          onChange={e => setFormData({...formData, [col.key]: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 bg-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium disabled:opacity-50 text-sm"
                          placeholder={`Enter ${col.label.toLowerCase()}`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3.5 font-bold text-outline hover:bg-surface-container transition-colors rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-primary text-white py-3.5 font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all border border-transparent">
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
