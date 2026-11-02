import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search, CornerDownLeft, ArrowUpRight, Home, Star, ShieldCheck,
  Clock, BookOpen, Users, HeartPulse, Cpu, Mail, Phone, MapPin,
  Menu as FeaturesIcon, UserCheck, Sparkles, RotateCcw, Sun,
} from "lucide-react";
import AIPulse from "./AIPulse";

const fadeIn = {
  hidden: { opacity: 0 },
  show: (i = 0) => ({
    opacity: 1,
    transition: { delay: i * 0.05, duration: 0.25, ease: "easeOut" },
  }),
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.96, y: -8 },
  show: (i = 0) => ({
    opacity: 1, scale: 1, y: 0,
    transition: { delay: i * 0.04, duration: 0.28, ease: [0.16, 1, 0.3, 1] },
  }),
};

const sectionItems = [
  { label: "Hero", anchor: "#hero", icon: Home, kind: "section" },
  { label: "Features", anchor: "#modules", icon: FeaturesIcon, kind: "section" },
  { label: "For You", anchor: "#roles", icon: Users, kind: "section" },
  { label: "How It Works", anchor: "#how", icon: BookOpen, kind: "section" },
  { label: "Reviews", anchor: "#testimonials", icon: Star, kind: "section" },
  { label: "Contact", anchor: "#contact", icon: Mail, kind: "section" },
];

const pageItems = [
  { label: "Welcome", to: "/", icon: Home, role: null, kind: "page" },
  { label: "Login", to: "/login", icon: UserCheck, role: null, kind: "page" },
  { label: "Signup", to: "/signup", icon: Sparkles, role: null, kind: "page" },
  { label: "Patient Home", to: "/patient", icon: HeartPulse, role: "patient", kind: "page" },
  { label: "Doctor Home", to: "/doctor", icon: ShieldCheck, role: "doctor", kind: "page" },
  { label: "Admin Home", to: "/admin", icon: Cpu, role: "admin", kind: "page" },
  { label: "404 Demo", to: "/not-found-demo", icon: Clock, role: null, kind: "page" },
  { label: "500 Demo", to: "/error-500-demo", icon: Clock, role: null, kind: "page" },
];

const actionItems = [
  { label: "Toggle theme demo", icon: Sun, kind: "action", id: "toggle-theme" },
  { label: "Contact support", icon: Phone, kind: "action", id: "contact-support" },
  { label: "Reset scroll", icon: RotateCcw, kind: "action", id: "reset-scroll" },
];

const roleBadge = {
  patient: { label: "PATIENT", tone: "bg-teal-50 text-teal-600 border-teal-200" },
  doctor: { label: "DOCTOR", tone: "bg-blue-50 text-blue-600 border-blue-200" },
  admin: { label: "ADMIN", tone: "bg-violet-50 text-violet-600 border-violet-200" },
};

export function CommandPalette({ open: controlledOpen, onClose: controlledClose }) {
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? controlledOpen : internalOpen;

  const close = useCallback(() => {
    if (isControlled) {
      controlledClose?.();
    } else {
      setInternalOpen(false);
    }
  }, [isControlled, controlledClose]);

  const toggleOpen = useCallback(() => {
    if (isControlled) {
      if (!open) {
        controlledClose?.();
      }
    } else {
      setInternalOpen((v) => !v);
    }
  }, [isControlled, open, controlledClose]);

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const lastFocusableRef = useRef(null);
  const navigate = useNavigate();

  const flatItems = useMemo(() => {
    const sectionHeader = { label: "Jump to section", kind: "header", id: "hdr-section" };
    const pageHeader = { label: "Go to page", kind: "header", id: "hdr-page" };
    const actionHeader = { label: "Quick actions", kind: "header", id: "hdr-action" };
    return [
      sectionHeader,
      ...sectionItems,
      pageHeader,
      ...pageItems,
      actionHeader,
      ...actionItems,
    ];
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return flatItems;
    const q = query.toLowerCase();
    const result = [];
    let sectionHeaderIncluded = false;
    let pageHeaderIncluded = false;
    let actionHeaderIncluded = false;

    for (const item of flatItems) {
      if (item.kind === "header") {
        result.push(item);
        if (item.id === "hdr-section") sectionHeaderIncluded = true;
        if (item.id === "hdr-page") pageHeaderIncluded = true;
        if (item.id === "hdr-action") actionHeaderIncluded = true;
        continue;
      }
      if (item.label.toLowerCase().includes(q)) {
        result.push(item);
      }
    }

    const final = [];
    let pendingHeader = null;
    for (const item of result) {
      if (item.kind === "header") {
        pendingHeader = item;
      } else {
        if (pendingHeader) {
          final.push(pendingHeader);
          pendingHeader = null;
        }
        final.push(item);
      }
    }
    return final;
  }, [flatItems, query]);

  const selectableIndices = useMemo(
    () => filtered.reduce((acc, it, idx) => (it.kind !== "header" ? [...acc, idx] : acc), []),
    [filtered]
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  useEffect(() => {
    if (open) {
      setQuery("");
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;
      if (modKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggleOpen();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleOpen]);

  const focusFirstSelectable = useCallback(() => {
    const items = containerRef.current?.querySelectorAll("[data-selectable]");
    items?.[0]?.focus();
  }, []);

  const focusLastSelectable = useCallback(() => {
    const items = containerRef.current?.querySelectorAll("[data-selectable]");
    items?.[items.length - 1]?.focus();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      const items = containerRef.current?.querySelectorAll("[data-selectable]");
      if (!items || items.length === 0) {
        e.preventDefault();
        return;
      }
      if (e.shiftKey) {
        if (document.activeElement === items[0]) {
          e.preventDefault();
          items[items.length - 1].focus();
        }
      } else {
        if (document.activeElement === items[items.length - 1]) {
          e.preventDefault();
          items[0].focus();
        }
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (selectableIndices.length === 0) return;
      const currentPos = selectableIndices.indexOf(activeIndex);
      const next = currentPos === -1
        ? selectableIndices[0]
        : selectableIndices[(currentPos + 1) % selectableIndices.length];
      setActiveIndex(next);
      const items = containerRef.current?.querySelectorAll("[data-selectable]");
      const posInSelectable = selectableIndices.indexOf(next);
      items?.[posInSelectable]?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (selectableIndices.length === 0) return;
      const currentPos = selectableIndices.indexOf(activeIndex);
      const prev = currentPos === -1
        ? selectableIndices[selectableIndices.length - 1]
        : selectableIndices[(currentPos - 1 + selectableIndices.length) % selectableIndices.length];
      setActiveIndex(prev);
      const items = containerRef.current?.querySelectorAll("[data-selectable]");
      const posInSelectable = selectableIndices.indexOf(prev);
      items?.[posInSelectable]?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      e.preventDefault();
      selectItem(filtered[activeIndex]);
    } else if (e.key === "Escape") {
      close();
    }
  };

  const selectItem = (item) => {
    if (!item || item.kind === "header") return;
    if (item.kind === "section") {
      const el = document.querySelector(item.anchor);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      close();
    } else if (item.kind === "page") {
      navigate(item.to);
      close();
    } else if (item.kind === "action") {
      if (item.id === "toggle-theme") {
        console.log("[CommandPalette] Quick action: Toggle theme demo");
      } else if (item.id === "contact-support") {
        console.log("[CommandPalette] Quick action: Contact support");
      } else if (item.id === "reset-scroll") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        console.log("[CommandPalette] Quick action: Reset scroll");
      }
      close();
    }
  };

  const onItemMouseEnter = (flatIdx) => {
    setActiveIndex(flatIdx);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100]"
          initial="hidden"
          animate="show"
          exit="hidden"
          variants={fadeIn}
        >
          <motion.div
            className="absolute inset-0 glass-dark"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <div
            ref={containerRef}
            className="absolute left-1/2 w-[95%] max-w-xl top-[10%] -translate-x-1/2"
            onKeyDown={handleKeyDown}
          >
            <motion.div
              variants={scaleIn}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="relative rounded-3xl overflow-hidden"
              style={{
                background: "rgba(255, 255, 255, 0.80)",
                backdropFilter: "blur(28px) saturate(180%)",
                WebkitBackdropFilter: "blur(28px) saturate(180%)",
                boxShadow: "0 40px 100px -30px rgba(15, 23, 42, 0.35), 0 20px 50px -20px rgba(15, 23, 42, 0.25)",
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none rounded-3xl"
                style={{
                  padding: "1.5px",
                  borderRadius: "inherit",
                  background: "linear-gradient(135deg, rgba(14,165,165,0.55), rgba(34,211,238,0.35), rgba(59,91,255,0.3), rgba(124,58,237,0.5))",
                  WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMaskComposite: "xor",
                  maskComposite: "exclude",
                }}
              />

              <div className="relative flex items-center gap-3 px-5 py-4 border-b border-slate-200/70">
                <AIPulse state="idle" size={28} tone="cyan" />
                <Search size={17} className="text-slate-400 shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search pages, features, or jump to section..."
                  className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-slate-400 text-ink font-medium"
                  data-selectable
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      focusFirstSelectable();
                    }
                  }}
                />
                <div className="flex items-center gap-2 shrink-0">
                  <kbd className="text-[10px] font-mono text-slate-400 border border-slate-200 rounded-md px-1.5 py-1 bg-white/70">
                    esc
                  </kbd>
                  <span className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-slate-400">
                    <kbd className="border border-slate-200 rounded px-1 py-0.5 bg-white/70">↑↓</kbd>
                    <span>navigate</span>
                  </span>
                </div>
              </div>

              <div className="relative max-h-[55vh] overflow-y-auto py-3 scrollbar-none">
                {filtered.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-10 font-mono text-xs uppercase tracking-wider">
                    No matches for "{query}"
                  </p>
                )}
                {filtered.map((item, idx) => {
                  if (item.kind === "header") {
                    return (
                      <motion.div
                        key={item.id}
                        variants={fadeUp}
                        className="px-5 pt-4 pb-2 flex items-center gap-3"
                      >
                        <span className="text-[10.5px] font-mono uppercase tracking-[0.18em] font-semibold text-slate-400">
                          {item.label}
                        </span>
                        <div className="flex-1 h-px bg-gradient-to-r from-slate-200/80 via-slate-200/40 to-transparent" />
                      </motion.div>
                    );
                  }

                  const Icon = item.icon;
                  const active = idx === activeIndex;
                  const badge = item.role ? roleBadge[item.role] : null;
                  const itemKey = `${item.kind}-${item.label}-${item.anchor || item.to || item.id}`;

                  return (
                    <motion.button
                      key={itemKey}
                      ref={idx === filtered.length - 1 ? lastFocusableRef : undefined}
                      data-selectable
                      onMouseEnter={() => onItemMouseEnter(idx)}
                      onClick={() => selectItem(item)}
                      onFocus={() => onItemMouseEnter(idx)}
                      className={`w-full relative flex items-center gap-3.5 px-5 py-2.5 text-[13.5px] font-medium text-left transition-colors ${
                        active ? "text-slate-900" : "text-slate-600"
                      }`}
                      variants={fadeUp}
                    >
                      {active && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-r from-teal-50 via-cyan-50 to-violet-50" />
                          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-teal-500 via-cyan-500 to-violet-500 rounded-r-full" />
                        </>
                      )}
                      <div className={`relative shrink-0 h-8 w-8 rounded-xl flex items-center justify-center ${
                        active
                          ? "bg-white shadow-sm text-teal-600"
                          : "bg-slate-100/80 text-slate-500"
                      }`}>
                        {Icon && <Icon size={15} strokeWidth={2} />}
                      </div>
                      <span className="relative flex-1 truncate">{item.label}</span>
                      {badge && (
                        <span className={`relative text-[9.5px] font-mono uppercase tracking-[0.12em] font-semibold px-2 py-0.5 rounded-full border ${badge.tone}`}>
                          {badge.label}
                        </span>
                      )}
                      {active && (
                        <span className="relative shrink-0 flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                          <kbd className="border border-slate-200 rounded px-1 py-0.5 bg-white">↵</kbd>
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <div className="relative px-5 py-2.5 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <ArrowUpRight size={12} />
                  press <kbd className="border border-slate-200 rounded px-1 py-0.5 bg-white/60 mx-0.5">⌘K</kbd> anywhere
                </span>
                <span>MediMind AI · Command Center</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CommandPalette;
