import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { modalVariants, drawerVariants, easePremium } from "./motion";
import { IconButton } from "./Controls";

function useFocusTrap(open, ref) {
  useEffect(() => {
    if (!open || !ref.current) return;
    const node = ref.current;
    const focusables = node.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    first?.focus?.();
    const onKey = (e) => {
      if (e.key !== "Tab" || focusables.length === 0) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus?.();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus?.();
      }
    };
    node.addEventListener("keydown", onKey);
    return () => node.removeEventListener("keydown", onKey);
  }, [open, ref]);
}

export function PremiumModal({ open, onClose, title, description, children, footer, size = "md" }) {
  const ref = useRef(null);
  const titleId = useId();
  useFocusTrap(open, ref);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onEsc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onEsc);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const widths = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="mm-dialog-theme fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-6">
          <motion.button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]"
            {...modalVariants.backdrop}
            onClick={onClose}
          />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={`relative w-full ${widths[size]} rounded-t-3xl sm:rounded-3xl bg-[var(--mm-surface)] border border-[var(--mm-border)] shadow-premium-lg overflow-hidden`}
            {...modalVariants.panel}
          >
            <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3">
              <div>
                <h2 id={titleId} className="font-display text-xl font-semibold tracking-tight text-[var(--mm-ink)]">
                  {title}
                </h2>
                {description && <p className="text-sm text-[var(--mm-muted)] mt-1">{description}</p>}
              </div>
              <IconButton icon={X} label="Close" onClick={onClose} />
            </div>
            <div className="px-5 pb-5 max-h-[70vh] overflow-y-auto">{children}</div>
            {footer && <div className="px-5 py-4 border-t border-[var(--mm-border)] bg-[rgba(15,23,42,0.02)] dark:bg-white/[0.02]">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export function Drawer({ open, onClose, title, children, width = "max-w-md" }) {
  const ref = useRef(null);
  useFocusTrap(open, ref);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="mm-dialog-theme fixed inset-0 z-[90]">
          <motion.button
            type="button"
            aria-label="Close drawer"
            className="absolute inset-0 bg-slate-950/55"
            {...drawerVariants.backdrop}
            onClick={onClose}
          />
          <motion.aside
            ref={ref}
            role="dialog"
            aria-modal="true"
            className={`absolute right-0 top-0 h-full w-full ${width} bg-[var(--mm-surface)] border-l border-[var(--mm-border)] shadow-premium-lg flex flex-col`}
            {...drawerVariants.panel}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.08}
            onDragEnd={(_, info) => {
              if (info.offset.x > 120) onClose?.();
            }}
          >
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[var(--mm-border)]">
              <h2 className="font-display font-semibold text-lg text-[var(--mm-ink)]">{title}</h2>
              <IconButton icon={X} label="Close" onClick={onClose} />
            </div>
            <div className="flex-1 overflow-y-auto p-5">{children}</div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export function Tooltip({ content, children, side = "top" }) {
  return (
    <span className="relative inline-flex group/tip">
      {children}
      <span
        role="tooltip"
        className={[
          "pointer-events-none absolute z-50 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[11px] font-medium",
          "bg-slate-900 text-white opacity-0 scale-95 group-hover/tip:opacity-100 group-hover/tip:scale-100 group-focus-within/tip:opacity-100",
          "transition-all duration-200 shadow-lg",
          side === "top" && "bottom-full left-1/2 -translate-x-1/2 mb-2",
          side === "bottom" && "top-full left-1/2 -translate-x-1/2 mt-2",
          side === "left" && "right-full top-1/2 -translate-y-1/2 mr-2",
          side === "right" && "left-full top-1/2 -translate-y-1/2 ml-2",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {content}
      </span>
    </span>
  );
}

export function Popover({ open, onClose, anchorRef, children, className = "" }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <button type="button" className="fixed inset-0 z-40" aria-label="Close" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.2, ease: easePremium }}
            className={`absolute right-0 top-full mt-2 z-50 min-w-[16rem] rounded-2xl border border-[var(--mm-border)] bg-[var(--mm-surface)] shadow-premium-lg p-2 ${className}`}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
