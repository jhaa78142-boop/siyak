import { forwardRef, useId, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, Check, AlertCircle } from "lucide-react";
import { easePremium } from "./motion";

export const PremiumInput = forwardRef(function PremiumInput(
  { label, error, hint, icon: Icon, className = "", id, placeholder, ...props },
  ref
) {
  const autoId = useId();
  const inputId = id || autoId;
  const [focused, setFocused] = useState(false);
  const filled = (props.value ?? props.defaultValue ?? "").toString().length > 0;

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className={[
            "absolute left-3.5 transition-all duration-300 pointer-events-none z-[1]",
            Icon ? "left-10" : "left-3.5",
            focused || filled
              ? "top-1.5 text-[10px] font-semibold tracking-wide uppercase text-[var(--mm-accent-deep)]"
              : "top-1/2 -translate-y-1/2 text-sm text-[var(--mm-muted)]",
          ].join(" ")}
        >
          {label}
        </label>
      )}
      <div
        className={[
          "relative flex items-center rounded-xl border bg-[var(--mm-surface)] transition-all duration-300",
          error
            ? "border-rose-400 shadow-[0_0_0_4px_rgba(244,63,94,0.1)]"
            : focused
              ? "border-[var(--mm-accent)] shadow-[0_0_0_4px_var(--mm-accent-soft)]"
              : "border-[var(--mm-border)]",
        ].join(" ")}
      >
        {Icon && <Icon size={15} className="absolute left-3.5 text-[var(--mm-muted)]" />}
        <input
          ref={ref}
          id={inputId}
          className={[
            "w-full bg-transparent outline-none text-sm text-[var(--mm-ink)] px-3.5 py-3.5",
            Icon ? "pl-10" : "",
            label ? "pt-5 pb-2" : "",
          ].join(" ")}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          aria-invalid={!!error}
          placeholder={focused ? placeholder : undefined}
          {...props}
        />
      </div>
      <AnimatePresence>
        {(error || hint) && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-1.5 text-xs flex items-center gap-1 ${error ? "text-rose-600" : "text-[var(--mm-muted)]"}`}
          >
            {error && <AlertCircle size={12} />}
            {error || hint}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});

export function SearchField({ value, onChange, placeholder = "Search…", className = "", onFocus }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border border-[var(--mm-border)] bg-[rgba(15,23,42,0.04)] dark:bg-white/5 px-3.5 py-2.5 focus-within:border-[var(--mm-accent)] focus-within:shadow-[0_0_0_4px_var(--mm-accent-soft)] transition-all ${className}`}
    >
      <Search size={14} className="text-[var(--mm-muted)] shrink-0" />
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-sm text-[var(--mm-ink)] placeholder:text-[var(--mm-muted)]"
      />
    </div>
  );
}

export function Select({ label, value, onChange, options = [], className = "" }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className={`relative ${className}`}>
      {label && <p className="text-xs font-semibold text-[var(--mm-muted)] mb-1.5">{label}</p>}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 rounded-xl border border-[var(--mm-border)] bg-[var(--mm-surface)] px-3.5 py-3 text-sm text-[var(--mm-ink)] focus-visible:ring-2 focus-visible:ring-[var(--mm-accent)]"
      >
        <span>{selected?.label || "Select…"}</span>
        <ChevronDown size={15} className={`text-[var(--mm-muted)] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <button type="button" className="fixed inset-0 z-40" aria-label="Close" onClick={() => setOpen(false)} />
            <motion.ul
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.2, ease: easePremium }}
              className="absolute z-50 mt-1.5 w-full rounded-xl border border-[var(--mm-border)] bg-[var(--mm-surface)] shadow-premium overflow-hidden py-1 max-h-56 overflow-y-auto"
            >
              {options.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm hover:bg-[rgba(15,23,42,0.04)] dark:hover:bg-white/5 text-left"
                    onClick={() => {
                      onChange?.(opt.value);
                      setOpen(false);
                    }}
                  >
                    {opt.label}
                    {opt.value === value && <Check size={14} className="text-[var(--mm-accent)]" />}
                  </button>
                </li>
              ))}
            </motion.ul>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
