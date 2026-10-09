import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Toast() {
  const { toast, removeToast } = useAuth();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        removeToast();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!toast) return null;

  const bgStyles = {
    success: 'bg-white border-emerald-300 text-slate-800 shadow-2xl',
    error: 'bg-white border-rose-300 text-slate-800 shadow-2xl',
    info: 'bg-white border-indigo-300 text-slate-800 shadow-2xl'
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-600 shrink-0" />
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-fade-in max-w-sm w-full">
      <div className={`flex items-center gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md ${bgStyles[toast.type] || bgStyles.info}`}>
        {icons[toast.type] || icons.info}
        <p className="text-sm font-semibold leading-snug flex-1 text-slate-900">{toast.message}</p>
        <button
          onClick={removeToast}
          className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          aria-label="Close Toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
