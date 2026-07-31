import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Send, CheckCircle2, User } from "lucide-react";
import PageHero from "../components/PageHero";
import FormField from "../components/FormField";
import Reveal from "../components/Reveal";
import { companyInfo } from "../data/products";
import SEO from "../components/SEO";
import { OrganizationLd, BreadcrumbLd, WebPageLd } from "../components/JsonLd";
import { trackEvent } from "../lib/tracking";
import { absoluteUrl } from "../lib/site";
import { EASE, DURATION } from "../lib/motion";

const initialForm = { name: "", email: "", phone: "", product: "", message: "" };

const validateForm = (form) => {
  const errors = {};
  if (!form.name.trim()) errors.name = "Please enter your name.";
  if (!form.email.trim()) {
    errors.email = "Please enter your email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (!form.phone.trim()) {
    errors.phone = "Please enter your phone number.";
  } else if (!/^\+?[0-9\s\-().]{7,20}$/.test(form.phone)) {
    errors.phone = "Please enter a valid phone number.";
  }
  if (!form.product.trim()) errors.product = "Please tell us what product you are enquiring about.";
  if (!form.message.trim()) errors.message = "Please tell us about your requirement.";
  return errors;
};

export default function Contact() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ loading: false, success: false, message: "" });
  const [honeypot, setHoneypot] = useState("");

  // Pre-fill Product Interest from URL query param, e.g. /contact?product=Flanges
  useEffect(() => {
    const productParam = searchParams.get("product");
    if (productParam) {
      setForm((current) => ({ ...current, product: decodeURIComponent(productParam) }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (honeypot) return;
    const validation = validateForm(form);
    if (Object.keys(validation).length) {
      setErrors(validation);
      setStatus({ loading: false, success: false, message: "Please review the highlighted fields." });
      return;
    }

    setStatus({ loading: true, success: false, message: "" });
    const endpoint = import.meta.env.VITE_FORM_ENDPOINT;
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      product: form.product,
      message: form.message,
    };

    if (!endpoint) {
      const subject = encodeURIComponent(`Quote request from ${form.name}`);
      const body = encodeURIComponent(
        `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nProduct Interest: ${form.product}\n\nMessage:\n${form.message}`
      );
      window.location.href = `mailto:${companyInfo.emails[0]}?subject=${subject}&body=${body}`;
      setStatus({ loading: false, success: true, message: "Your email client should now open with the enquiry." });
      trackEvent("form_submit", { source: "contact_page", method: "mailto_fallback" });
      return;
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, _subject: `Quote request from ${form.name}`, _replyto: form.email }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Submission failed.");
      }
      setStatus({ loading: false, success: true, message: "Your enquiry has been sent successfully." });
      setForm(initialForm);
      trackEvent("form_submit", { source: "contact_page", method: "form_endpoint" });
    } catch (error) {
      setStatus({ loading: false, success: false, message: "Unable to send your enquiry right now. Please try again later." });
    }
  };

  return (
    <>
      <SEO
        title="Contact Us"
        description="Contact Siyak Steel International — Founded by Mr. Narpat Siyak, ISO 9001:2015 certified exporter. Get a quote for pipes, flanges, fittings and more."
        keywords="contact siyak steel, steel exporter enquiry, industrial piping quote, Mumbai steel supplier, Narpat Siyak"
      />
      <OrganizationLd />
      <WebPageLd
        url={absoluteUrl("/contact")}
        title="Contact Us"
        description="Contact Siyak Steel International — ISO 9001:2015 certified exporter. Get a quote for pipes, flanges, fittings and more."
      />
      <BreadcrumbLd
        items={[
          { name: "Home", url: absoluteUrl("/") },
          { name: "Contact", url: absoluteUrl("/contact") },
        ]}
      />
      <PageHero eyebrow="Get In Touch" title="Let's talk about your requirement" crumb="Contact" />

      <section className="bg-paper py-16">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[1fr_1.2fr] gap-10">
          {/* Contact details */}
          <Reveal direction="right">
            <div className="space-y-6">
              <div className="bg-white border border-teal-pale rounded-lg p-7 flex gap-4">
                <MapPin size={22} className="text-teal shrink-0" />
                <div>
                  <h3 className="font-display uppercase text-sm tracking-wide text-deep">Head Office</h3>
                  <p className="mt-1.5 text-sm text-steel-dark leading-relaxed">{companyInfo.address}</p>
                </div>
              </div>
              <div className="bg-white border border-teal-pale rounded-lg p-7 flex gap-4">
                <User size={22} className="text-teal shrink-0" aria-hidden="true" />
                <div>
                  <h3 className="font-display uppercase text-sm tracking-wide text-deep">Contact Person</h3>
                  <p className="mt-1.5 text-sm text-steel-dark">{companyInfo.contactPerson}</p>
                </div>
              </div>
              <div className="bg-white border border-teal-pale rounded-lg p-7 flex gap-4">
                <Phone size={22} className="text-teal shrink-0" />
                <div>
                  <h3 className="font-display uppercase text-sm tracking-wide text-deep">Phone</h3>
                  <div className="mt-1.5 flex flex-col gap-1">
                    {companyInfo.phones.map((p) => (
                      <a key={p} href={`tel:${p.replace(/\s/g, "")}`} className="text-sm text-steel-dark hover:text-teal transition-colors">
                        {p}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-white border border-teal-pale rounded-lg p-7 flex gap-4">
                <Mail size={22} className="text-teal shrink-0" />
                <div>
                  <h3 className="font-display uppercase text-sm tracking-wide text-deep">Email</h3>
                  <div className="mt-1.5 flex flex-col gap-1">
                    {companyInfo.emails.map((e) => (
                      <a key={e} href={`mailto:${e}`} className="text-sm text-steel-dark hover:text-teal transition-colors">
                        {e}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Real embedded map of the business address */}
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-teal-pale">
                <iframe
                  title="Siyak Steel International location map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3773.433281742666!2d72.8287446!3d18.9564628!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7cf216d65ca2d%3A0x73286d50f6b2c0bf!2sSIYAK%20STEEL%20INTERNATIONAL!5e0!3m2!1sen!2sin!4v1783086802509!5m2!1sen!2sin"
                  className="absolute inset-0 h-full w-full border-0"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(companyInfo.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-teal hover:text-teal-light transition-colors"
              >
                <MapPin size={15} /> Get Directions
              </a>
            </div>
          </Reveal>

          {/* Form */}
          <Reveal direction="left">
            <div className="bg-white border border-teal-pale rounded-lg p-8 sm:p-10">
              {status.success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: DURATION.base, ease: EASE.enter }}
                  className="text-center py-12"
                >
                  <CheckCircle2 size={48} className="text-teal mx-auto mb-4" />
                  <h3 className="font-display uppercase text-xl text-deep">Enquiry submitted</h3>
                  <p className="mt-2 text-steel-dark text-sm max-w-sm mx-auto">
                    {status.message}
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus({ loading: false, success: false, message: "" })}
                    className="mt-6 text-sm font-semibold text-teal hover:text-teal-light transition-colors"
                  >
                    Send another enquiry
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <h2 className="font-display uppercase text-2xl text-deep mb-2">Send an Enquiry</h2>
                  <input
                    type="text"
                    name="fullname"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <FormField label="Full Name" error={errors.name}>
                        <input
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          className={`mt-2 w-full bg-paper border rounded-md px-4 py-3 text-sm text-deep outline-none transition-colors ${errors.name ? "border-[var(--color-amber)]" : "border-teal-pale focus:border-teal"}`}
                          placeholder="Your name"
                        />
                      </FormField>
                    </div>
                    <div>
                      <FormField label="Phone" error={errors.phone}>
                        <input
                          type="tel"
                          inputMode="tel"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          className={`mt-2 w-full bg-paper border rounded-md px-4 py-3 text-sm text-deep outline-none transition-colors ${errors.phone ? "border-[var(--color-amber)]" : "border-teal-pale focus:border-teal"}`}
                          placeholder="+91"
                          autoComplete="tel"
                        />
                      </FormField>
                    </div>
                  </div>
                  <FormField label="Email" error={errors.email}>
                    <input
                      required
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className={`mt-2 w-full bg-paper border rounded-md px-4 py-3 text-sm text-deep outline-none transition-colors ${errors.email ? "border-[var(--color-amber)]" : "border-teal-pale focus:border-teal"}`}
                      placeholder="you@company.com"
                    />
                  </FormField>
                  <FormField label="Product Interest" error={errors.product}>
                    <input
                      name="product"
                      inputMode="text"
                      value={form.product}
                      onChange={handleChange}
                      className={`mt-2 w-full bg-paper border rounded-md px-4 py-3 text-sm text-deep outline-none transition-colors ${errors.product ? "border-[var(--color-amber)]" : "border-teal-pale focus:border-teal"}`}
                      placeholder="e.g. Flanges, Pipes & Tubes"
                    />
                  </FormField>
                  <FormField label="Message" error={errors.message}>
                    <textarea
                      required
                      rows={5}
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      className={`mt-2 w-full bg-paper border rounded-md px-4 py-3 text-sm text-deep outline-none transition-colors resize-none ${errors.message ? "border-[var(--color-amber)]" : "border-teal-pale focus:border-teal"}`}
                      placeholder="Tell us about your requirement — grades, sizes, quantities..."
                    />
                  </FormField>
                  {status.message && !status.success && (
                    <div className="text-sm text-[var(--color-amber)]">{status.message}</div>
                  )}
                  <button
                    type="submit"
                    disabled={status.loading}
                    className="group inline-flex items-center gap-2 bg-teal hover:bg-teal-light text-white font-display uppercase text-sm tracking-wide px-7 py-3.5 rounded-sm clip-corner transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {status.loading ? "Sending..." : "Send Enquiry"}
                    <Send size={15} className="transition-transform group-hover:translate-x-1" />
                  </button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
