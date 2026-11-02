import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowRight, Check, CheckCircle2, Eye, EyeOff, Loader2, Lock, Mail, Phone, Stethoscope, User, Users, Briefcase, Sparkles, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AuthShell from "./AuthShell";
import Button from "../../components/Button";
import loginHero from "../../assets/media/login-hero.mp4";
import { registerWithEmail } from "../../lib/firebase";
import { api } from "../../lib/api";
import { useToast } from "../../components/Toast";

// NOTE: "Admin" is intentionally not offered here. Letting any visitor
// self-select an admin account from a public signup form would be a
// privilege-escalation hole — admin accounts are provisioned separately.
const roles = [{ id: "patient", label: "Patient", icon: Users }, { id: "doctor", label: "Doctor", icon: Stethoscope }];

function friendlySignupError(err) {
  const code = err?.code || "";
  if (code.includes("email-already-in-use")) return "That email is already registered — try logging in instead.";
  if (code.includes("weak-password")) return "Password should be at least 6 characters.";
  if (code.includes("invalid-email")) return "Enter a valid email address.";
  return err?.message || "Couldn't create your account. Please try again.";
}
const checks = [{ id: "length", label: "At least 8 characters", test: (value) => value.length >= 8 }, { id: "upper", label: "An uppercase letter", test: (value) => /[A-Z]/.test(value) }, { id: "number", label: "A number", test: (value) => /\d/.test(value) }, { id: "symbol", label: "A symbol", test: (value) => /[^A-Za-z0-9]/.test(value) }];
function ErrorText({ children }) { return <p className="signup-error" role="alert">{children}</p>; }
function PasswordToggle({ visible, onClick, label }) { return <button type="button" onClick={onClick} aria-label={label} className="signup-password-toggle"><AnimatePresence mode="wait" initial={false}><motion.span key={visible ? "off" : "on"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="block">{visible ? <EyeOff size={17} /> : <Eye size={17} />}</motion.span></AnimatePresence></button>; }
function SubmitContent({ status }) { return <AnimatePresence mode="wait" initial={false}><motion.span key={status} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="flex min-w-[11rem] items-center justify-center gap-2">{status === "loading" ? <><Loader2 size={16} className="animate-spin" />Creating...</> : status === "success" ? <><Check size={17} />Account ready</> : <>Create account <ArrowRight size={16} /></>}</motion.span></AnimatePresence>; }
function Strength({ password }) { const passed = checks.filter((check) => check.test(password)).length; const variety = new Set(password.toLowerCase()).size; const entropy = Math.min(100, Math.round(password.length * 4 + variety * 3 + (/[A-Z]/.test(password) ? 10 : 0) + (/\d/.test(password) ? 10 : 0) + (/[^A-Za-z0-9]/.test(password) ? 12 : 0))); const label = entropy < 35 ? "Weak" : entropy < 60 ? "Fair" : entropy < 80 ? "Good" : "Strong"; return <div className="signup-strength" aria-live="polite"><div className="signup-strength-heading"><span>Password strength</span><strong className={entropy >= 60 ? "is-good" : ""}>{password ? label : "Build a strong passphrase"}</strong></div><div className="signup-strength-track"><motion.div className={entropy >= 60 ? "is-good" : ""} animate={{ width: `${entropy}%` }} transition={{ duration: 0.2 }} /></div><ul>{checks.map((check) => <li key={check.id} className={check.test(password) ? "is-passed" : ""}>{check.test(password) ? <CheckCircle2 size={13} /> : <span />}{check.label}</li>)}</ul><span className="sr-only">{passed} of {checks.length} password requirements met.</span></div>; }

export default function Signup() {
  const navigate = useNavigate(); const reducedMotion = useReducedMotion(); const [role, setRole] = useState("patient"); const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", specialization: "", license: "", password: "", confirmPassword: "" }); const [showPassword, setShowPassword] = useState(false); const [showConfirm, setShowConfirm] = useState(false); const [terms, setTerms] = useState(false); const [errors, setErrors] = useState({}); const [status, setStatus] = useState("idle"); const [emailHint, setEmailHint] = useState("");
  const update = (field, value) => { setForm((current) => ({ ...current, [field]: value })); setErrors((current) => ({ ...current, [field]: undefined })); }; useEffect(() => { const timer = setTimeout(() => { const domain = form.email.split("@")[1]?.toLowerCase(); setEmailHint(["gmial.com", "gmai.com", "gnail.com"].includes(domain) ? "Did you mean gmail.com?" : ""); }, 350); return () => clearTimeout(timer); }, [form.email]);
  const { toast } = useToast();
  const validate = () => { const next = {}; if (!form.firstName.trim()) next.firstName = "Add your first name."; if (!form.lastName.trim()) next.lastName = "Add your last name."; if (!form.email.trim()) next.email = "Enter an email address."; else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Use an address like name@example.com."; if (role === "doctor") { if (!form.specialization.trim()) next.specialization = "Add your clinical specialization."; if (!form.license.trim()) next.license = "Add your medical license number."; } if (!form.password) next.password = "Create a password."; else if (!checks.every((check) => check.test(form.password))) next.password = "Complete the password requirements below."; if (!form.confirmPassword) next.confirmPassword = "Confirm your password."; else if (form.password !== form.confirmPassword) next.confirmPassword = "Passwords do not match. Re-enter the same password."; if (!terms) next.terms = "Accept the terms to create your account."; return next; };
  const submit = async (event) => {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;

    setStatus("loading");
    const name = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
    try {
      // Actually create the account (this used to be a fake setTimeout that
      // never called Firebase or the backend, so no account was ever made).
      await registerWithEmail(form.email, form.password, name);
      await api.post("/auth/sync", {
        role,
        name,
        phone: form.phone || undefined,
        ...(role === "doctor" ? { doctorProfile: { specialization: form.specialization, licenseNumber: form.license } } : {}),
      });
      setStatus("success");
      setTimeout(() => {
        if (role === "doctor") {
          toast("Submitted for admin verification — you'll be notified once approved", { tone: "info" });
          navigate("/login");
        } else {
          navigate("/patient");
        }
      }, 650);
    } catch (err) {
      setStatus("idle");
      setErrors((current) => ({ ...current, form: friendlySignupError(err) }));
    }
  };
  const inputClass = (field) => `signup-input ${errors[field] ? "has-error" : ""}`;
  const field = (id, label, type = "text", autoComplete = id, Icon = User, placeholder = "") => <div className="signup-field"><label htmlFor={`signup-${id}`}>{label}</label><div className="signup-input-wrap"><Icon size={17} className="signup-input-icon" aria-hidden="true" /><input id={`signup-${id}`} name={id} type={type} autoComplete={autoComplete} value={form[id]} onChange={(e) => update(id, e.target.value)} className={inputClass(id)} placeholder={placeholder} aria-invalid={Boolean(errors[id])} />{id === "email" && form.email && !errors.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && <CheckCircle2 size={17} className="signup-valid-icon" />}</div>{errors[id] && <ErrorText>{errors[id]}</ErrorText>}</div>;
  return <AuthShell mediaType="video" mediaSrc={loginHero} shellClassName="signup-premium-shell"><motion.div initial={reducedMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} className="signup-page-content"><div className="signup-mobile-kicker"><Sparkles size={14} /> Your care layer starts here</div><div className="signup-system-status"><span /> Secure onboarding <span className="signup-status-line" /> <ShieldCheck size={13} /> Privacy-first by design</div><header className="signup-header"><div className="signup-kicker"><span /> ACCOUNT ONBOARDING / 01</div><h2>Make your health more legible<span>.</span></h2><p>Create a focused MediMind space for your care journey, clinical practice, or organization.</p></header>
    <form onSubmit={submit} noValidate className="signup-form"><div className="signup-form-heading"><span>01</span><strong>Choose your workspace</strong><small>{role === "patient" ? "Personal health" : role === "doctor" ? "Clinical practice" : "Organization"}</small></div><div className="signup-role-grid" role="radiogroup" aria-label="Account type">{roles.map(({ id, label, icon: Icon }) => <button key={id} type="button" role="radio" aria-checked={role === id} onClick={() => setRole(id)} className={role === id ? "is-selected" : ""}><Icon size={17} /><span>{label}</span>{role === id && <CheckCircle2 size={15} />}</button>)}</div><div className="signup-form-heading signup-details-heading"><span>02</span><strong>Tell us about you</strong><small>Required for your secure profile</small></div><div className="signup-two-column">{field("firstName", "First name", "text", "given-name", User, "Jane")}{field("lastName", "Last name", "text", "family-name", User, "Doe")}</div>{field("email", "Email address", "email", "email", Mail, "name@example.com")}{emailHint && <button type="button" onClick={() => update("email", form.email.replace(/@.*/, "@gmail.com"))} className="signup-hint">{emailHint}</button>}{field("phone", "Phone number", "tel", "tel", Phone, "+1 555 000 0000")}<AnimatePresence initial={false}><motion.div layout={!reducedMotion} transition={{ type: "spring", stiffness: 400, damping: 30 }} className="signup-dynamic-fields">{role === "doctor" && <div className="signup-two-column">{field("specialization", "Specialization", "text", "organization-title", Briefcase, "Cardiology")}{field("license", "Medical license", "text", "organization", Briefcase, "License number")}</div>}</motion.div></AnimatePresence><div className="signup-form-heading signup-details-heading"><span>03</span><strong>Protect your account</strong><small>Use a unique passphrase</small></div><div className="signup-field"><label htmlFor="signup-password">Password</label><div className="signup-input-wrap"><Lock size={17} className="signup-input-icon" /><input id="signup-password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={form.password} onChange={(e) => update("password", e.target.value)} className={`${inputClass("password")} signup-password-input`} placeholder="Create a strong password" aria-invalid={Boolean(errors.password)} /><PasswordToggle visible={showPassword} onClick={() => setShowPassword((value) => !value)} label={showPassword ? "Hide password" : "Show password"} /></div><Strength password={form.password} />{errors.password && <ErrorText>{errors.password}</ErrorText>}</div><div className="signup-field"><label htmlFor="signup-confirmPassword">Confirm password</label><div className="signup-input-wrap"><Lock size={17} className="signup-input-icon" /><input id="signup-confirmPassword" name="confirmPassword" type={showConfirm ? "text" : "password"} autoComplete="new-password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} className={`${inputClass("confirmPassword")} signup-password-input`} placeholder="Repeat your password" aria-invalid={Boolean(errors.confirmPassword)} /><PasswordToggle visible={showConfirm} onClick={() => setShowConfirm((value) => !value)} label={showConfirm ? "Hide confirmation password" : "Show confirmation password"} /></div>{form.confirmPassword && form.password === form.confirmPassword && <p className="signup-success"><CheckCircle2 size={13} />Passwords match</p>}{errors.confirmPassword && <ErrorText>{errors.confirmPassword}</ErrorText>}</div><label className="signup-terms"><input type="checkbox" checked={terms} onChange={(e) => { setTerms(e.target.checked); setErrors((current) => ({ ...current, terms: undefined })); }} /> <span>I agree to MediMind's <button type="button">Terms</button> and <button type="button">Privacy Policy</button>.</span></label>{errors.terms && <ErrorText>{errors.terms}</ErrorText>}{errors.form && <ErrorText>{errors.form}</ErrorText>}<Button type="submit" role={role} size="lg" fullWidth disabled={status !== "idle"} className="signup-submit"><SubmitContent status={status} /></Button></form><div className="signup-trust-rail"><span><ShieldCheck size={15} /> Encrypted profile</span><span><CheckCircle2 size={15} /> No hidden fees</span><span><Lock size={15} /> Private by default</span></div><p className="signup-switch">Already part of MediMind? <button type="button" onClick={() => navigate("/login")}>Sign in <ArrowRight size={14} /></button></p><p className="signup-legal">By creating an account, you agree to MediMind AI's terms and acknowledge our privacy policy.</p></motion.div></AuthShell>;
}