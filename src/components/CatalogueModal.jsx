import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download } from "lucide-react";
import { trackEvent } from "../lib/tracking";
import FormField from "./FormField";
import { companyInfo } from "../data/products";
import { DURATION, EASE } from "../lib/motion";

/**
 * Lead-capture popup shown before the catalogue PDF downloads — same
 * pattern as the quote drawer, but short (name/email/phone only) since
 * the ask here is lower-friction: "give us your details, get the PDF".
 */
export default function CatalogueModal({ open, onClose }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [status, setStatus] = useState({ loading: false, error: "" });
  const [botField, setBotField] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const triggerDownload = () => {
    const link = document.createElement("a");
    link.href = "/catalogue.pdf";
    link.download = "";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setStatus({ loading: false, error: "Please complete all fields." });
      return;
    }
    if (!isValidEmail(form.email)) {
      setStatus({ loading: false, error: "Please enter a valid email address." });
      return;
    }
    if (botField) return;

    setStatus({ loading: true, error: "" });
    const endpoint = import.meta.env.VITE_FORM_ENDPOINT;

    try {
      if (endpoint) {
        await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            _subject: `Catalogue request from ${form.name}`,
            _redirect: window.location.href,
          }),
        });
      }
      trackEvent("catalogue_download", { source: "catalogue_modal" });
      triggerDownload();
      setStatus({ loading: false, error: "" });
      onClose();
    } catch (error) {
      // Even if the lead can't be logged, don't block the download —
      // the PDF is the promise we made when they clicked the button.
      triggerDownload();
      setStatus({ loading: false, error: "" });
      onClose();
    }
  };

  const inputCls =
    "w-full border border-teal-pale bg-white px-4 py-3 text-sm text-deep outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 rounded-md";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: DURATION.fast, ease: EASE.enter }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md clip-corner bg-paper shadow-elevated border border-teal-pale overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-teal-pale px-6 py-5 bg-white">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-teal font-semibold">Corporate Brochure</p>
                <h2 className="font-display text-xl text-deep mt-2">Download our catalogue</h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="text-deep hover:text-teal transition-colors w-11 h-11 flex items-center justify-center"
              >
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-paper">
              <input
                type="text"
                name="fullname"
                value={botField}
                onChange={(e) => setBotField(e.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />
              <p className="text-sm text-steel-dark leading-relaxed">
                Please share a few details and we'll send the PDF straight to your screen.
              </p>
              <FormField label="Name" required>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </FormField>
              <FormField label="Email" required>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="you@company.com"
                  autoComplete="email"
                />
              </FormField>
              <FormField label="Phone" required>
                <input
                  type="tel"
                  inputMode="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="+91 98765 43210"
                  autoComplete="tel"
                />
              </FormField>
              {status.error && <div className="text-sm text-[var(--color-amber)]">{status.error}</div>}
              <button
                type="submit"
                disabled={status.loading}
                className="w-full inline-flex items-center justify-center gap-2 clip-corner bg-teal px-5 py-3.5 text-sm font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-teal-light disabled:cursor-not-allowed disabled:opacity-60 min-h-[44px]"
              >
                {status.loading ? "Preparing…" : "Get the Catalogue"}
                <Download size={16} />
              </button>
              <p className="text-[11px] text-steel-dark text-center">
                We'll never share your details. Questions? Email {companyInfo.emails[0]}.
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
