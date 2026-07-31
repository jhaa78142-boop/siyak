import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";
import { trackEvent } from "../lib/tracking";
import FormField from "./FormField";
import { productCategories, companyInfo } from "../data/products";
import { DURATION, EASE } from "../lib/motion";

export default function QuoteDrawer({ open, onClose }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", product: "General enquiry", message: "" });
  const [status, setStatus] = useState({ loading: false, success: false, error: "" });
  const [botField, setBotField] = useState("");

  const productOptions = [
    "General enquiry",
    ...productCategories.map((product) => product.name),
  ];

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const isValidPhone = (value) => /^\+?[0-9\s\-().]{7,20}$/.test(value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.product.trim() || !form.message.trim()) {
      setStatus({ loading: false, success: false, error: "Please complete all required fields." });
      return;
    }
    if (!isValidEmail(form.email)) {
      setStatus({ loading: false, success: false, error: "Please enter a valid email address." });
      return;
    }
    if (!isValidPhone(form.phone)) {
      setStatus({ loading: false, success: false, error: "Please enter a valid phone number." });
      return;
    }
    if (botField) {
      return;
    }

    setStatus({ loading: true, success: false, error: "" });
    const endpoint = import.meta.env.VITE_FORM_ENDPOINT;

    if (!endpoint) {
      window.location.href = `mailto:${companyInfo.emails[0]}?subject=${encodeURIComponent(`Quote request from ${form.name}`)}&body=${encodeURIComponent(`Name: ${form.name}\nPhone: ${form.phone}\nProduct: ${form.product}\nMessage: ${form.message}`)}`;
      setStatus({ loading: false, success: true, error: "" });
      trackEvent("form_submit", { source: "quote_drawer" });
      return;
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, _subject: `Quote request from ${form.name}`, _redirect: window.location.href }),
      });
      if (!response.ok) throw new Error("Failed to submit form.");
      setStatus({ loading: false, success: true, error: "" });
      trackEvent("form_submit", { source: "quote_drawer" });
    } catch (error) {
      setStatus({ loading: false, success: false, error: "Unable to send your request right now. Please try again later." });
    }
  };

  const inputCls = "w-full border border-teal-pale bg-white px-4 py-3 text-sm text-deep outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 rounded-md";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: DURATION.fast, ease: EASE.enter }}
            className="w-full max-w-xl clip-corner bg-paper shadow-elevated border border-teal-pale overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-teal-pale px-6 py-5 bg-white">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-teal font-semibold">Request a Quote</p>
                <h2 className="font-display text-xl text-deep mt-2">Quick enquiry form</h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close quote form"
                className="text-deep hover:text-teal transition-colors w-11 h-11 flex items-center justify-center"
              >
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-paper">
              {/* Honeypot */}
              <input
                type="text"
                name="fullname"
                value={botField}
                onChange={(e) => setBotField(e.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField label="Name" required>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="Company or contact name"
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
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
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
                <FormField label="Product" required>
                  <select
                    name="product"
                    value={form.product}
                    onChange={handleChange}
                    className={inputCls}
                  >
                    {productOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </FormField>
              </div>
              <FormField label="Message" required>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={4}
                  className={`${inputCls} resize-none`}
                  placeholder="Share your grade, quantity, delivery country or timeline."
                />
              </FormField>
              {status.error && <div className="text-sm text-[var(--color-amber)]">{status.error}</div>}
              {status.success && <div className="text-sm text-teal">Request sent successfully.</div>}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={status.loading}
                  className="inline-flex items-center gap-2 clip-corner bg-teal px-5 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-teal-light disabled:cursor-not-allowed disabled:opacity-60 min-h-[44px]"
                >
                  {status.loading ? "Sending…" : "Send Request"}
                  <Send size={16} />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-sm text-steel-dark underline hover:text-teal"
                >
                  Close
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
