import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

export interface Field {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  options?: { value: string; label: string }[];
  required?: boolean;
}

interface CRUDModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  fields: Field[];
  initialData?: any;
  title: string;
}

export default function CRUDModal({ isOpen, onClose, onSave, fields, initialData, title }: CRUDModalProps) {
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || {});
      setError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save record.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-on-app-background/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-lowest">
          <h2 className="text-2xl font-black text-primary tracking-tight">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-container-low rounded-full transition-colors">
            <X size={24} className="text-outline" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-error-container/20 border border-error/20 p-4 rounded-xl flex gap-3 text-error items-center">
              <AlertCircle size={20} />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-[0.15em] text-outline ml-1">
                  {field.label} {field.required && <span className="text-error">*</span>}
                </label>
                
                {field.type === 'select' ? (
                  <select
                    required={field.required}
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/20 px-4 py-3.5 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-on-surface appearance-none"
                  >
                    <option value="">Select Option</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    required={field.required}
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    rows={3}
                    className="w-full bg-surface-container-low border border-outline-variant/20 px-4 py-3.5 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-on-surface placeholder:text-outline/40"
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                  />
                ) : (
                  <input
                    type={field.type}
                    required={field.required}
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant/20 px-4 py-3.5 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-on-surface placeholder:text-outline/40"
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-surface-container-high text-outline px-6 py-4 rounded-2xl font-black text-sm hover:bg-surface-container-highest transition-all"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-primary text-white px-6 py-4 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={20} />
                  SAVE CHANGES
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
