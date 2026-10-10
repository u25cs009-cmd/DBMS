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

  const typeConfig = {
    success: {
      border: 'border-l-4 border-l-emerald-600',
      bgProgress: 'bg-emerald-600',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
      tag: 'सफल'
    },
    error: {
      border: 'border-l-4 border-l-rose-600',
      bgProgress: 'bg-rose-600',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
      tag: 'त्रुटि'
    },
    info: {
      border: 'border-l-4 border-l-orange-600',
      bgProgress: 'bg-orange-600',
      icon: <Info className="w-5 h-5 text-orange-600 shrink-0" />,
      tag: 'सूचना'
    }
  };

  const current = typeConfig[toast.type] || typeConfig.info;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-slide-up max-w-sm w-full px-3">
      <div className={`relative overflow-hidden flex items-center gap-3 p-4 rounded-2xl bg-white border border-stone-200/80 shadow-warm-xl backdrop-blur-md ${current.border}`}>
        {current.icon}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-stone-900 leading-snug">{toast.message}</p>
        </div>
        <button
          onClick={removeToast}
          className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          aria-label="Close Toast"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Animated 4s progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-stone-100 overflow-hidden">
          <div
            className={`h-full ${current.bgProgress}`}
            style={{
              animation: 'toastProgress 4s linear forwards'
            }}
          />
        </div>
      </div>
      <style>{`
        @keyframes toastProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
