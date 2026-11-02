import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { easePremium } from "./premium/motion";

const ToastContext = createContext(null);

const icons = {
  success: CheckCircle2,
  info: Info,
  warn: AlertTriangle,
  error: AlertTriangle,
};

const iconTone = {
  success: "text-emerald-500",
  info: "text-sky-500",
  warn: "text-amber-500",
  error: "text-rose-500",
};

function ToastItem({ t, onDismiss }) {
  const Icon = icons[t.tone] || icons.success;
  const duration = t.duration ?? 3200;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95, transition: { duration: 0.18 } }}
      transition={{ duration: 0.35, ease: easePremium }}
      className="glass pointer-events-auto relative overflow-hidden flex items-center gap-2.5 border border-slate-200/80 shadow-lg shadow-slate-900/10 rounded-2xl pl-4 pr-3 py-3 max-w-sm dark:border-slate-700/80"
      role="status"
    >
      <Icon size={17} className={`shrink-0 ${iconTone[t.tone] || iconTone.success}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink">{t.message}</p>
        {t.undo && (
          <button
            type="button"
            className="text-xs font-semibold text-[var(--mm-accent-deep)] mt-0.5"
            onClick={() => {
              t.undo();
              onDismiss(t.id);
            }}
          >
            Undo
          </button>
        )}
      </div>
      <button onClick={() => onDismiss(t.id)} className="text-slate-400 hover:text-ink shrink-0" aria-label="Dismiss">
        <X size={14} />
      </button>
      {duration > 0 && (
        <motion.div
          className="absolute bottom-0 left-0 h-[2px] bg-[var(--mm-accent)]"
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: duration / 1000, ease: "linear" }}
        />
      )}
    </motion.div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    (message, opts = {}) => {
      const id = Date.now() + Math.random();
      const tone = opts.tone || "success";
      const duration = opts.duration ?? 3200;
      setToasts((t) => [...t, { id, message, tone, duration, undo: opts.undo }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="fixed z-[100] bottom-5 right-5 flex flex-col gap-2.5 items-end pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastItem key={t.id} t={t} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
