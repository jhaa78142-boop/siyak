import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, ArrowLeft, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { useToast } from "../../components/Toast";
import { registerWithEmail } from "../../lib/firebase";
import { api } from "../../lib/api";
import AuthShell from "./AuthShell";
import loginHero from "../../assets/media/login-hero.mp4";

function friendlyFirebaseError(err) {
  const code = err?.code || "";
  if (code.includes("email-already-in-use")) return "That email is already registered — try logging in instead.";
  if (code.includes("weak-password")) return "Password should be at least 6 characters.";
  if (code.includes("invalid-email")) return "Enter a valid email address.";
  return err?.message || "Couldn't create your account. Please try again.";
}

export default function PatientRegister() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const [form, setForm] = useState({
    fullName: "", username: "", email: "", password: "", confirmPassword: "", phone: "",
    dateOfBirth: "", gender: "", bloodGroup: "",
    height_cm: "", weight_kg: "", allergies: "", chronicConditions: "", currentMedications: "",
    emergencyContactName: "", emergencyContactNumber: "", emergencyContactRelationship: ""
  });

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) return setError("Password should be at least 6 characters.");
    if (form.password !== form.confirmPassword) return setError("Passwords don't match.");
    if (!form.username.trim()) return setError("Username is required.");

    setSubmitting(true);
    try {
      // 1. Create Firebase User
      const { user } = await registerWithEmail(form.email, form.password, form.fullName);

      // 2. Create MongoDB User Profile
      await api.post("/auth/patient/register", {
        firebaseUid: user.uid,
        email: form.email,
        username: form.username,
        fullName: form.fullName,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth).toISOString() : undefined,
        gender: form.gender,
        bloodGroup: form.bloodGroup,
        height_cm: form.height_cm ? Number(form.height_cm) : undefined,
        weight_kg: form.weight_kg ? Number(form.weight_kg) : undefined,
        allergies: form.allergies ? form.allergies.split(",").map(i => i.trim()) : [],
        chronicConditions: form.chronicConditions ? form.chronicConditions.split(",").map(i => i.trim()) : [],
        currentMedications: form.currentMedications ? form.currentMedications.split(",").map(i => i.trim()) : [],
        emergencyContact: {
          name: form.emergencyContactName,
          number: form.emergencyContactNumber,
          relationship: form.emergencyContactRelationship
        }
      });

      toast("Patient account created successfully!", { tone: "success" });
      navigate("/patient");
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || friendlyFirebaseError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell mediaType="video" mediaSrc={loginHero} shellClassName="login-premium-shell patient-registration-shell">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="patient-registration-content"
      >
        <Link to="/welcome" className="patient-auth-back">
          <ArrowLeft size={15} /> Back
        </Link>

        <span className="patient-auth-eyebrow">
          <User size={13} /> Patient Registration
        </span>
        <h1 className="patient-auth-title">Your health, <span>all in one place.</span></h1>
        <p className="patient-auth-description">Create your private patient account to manage appointments, reports, and health details in one calm, connected space.</p>

        <div className="patient-registration-note">
          <ShieldCheck size={18} />
          <span><strong>Start with the essentials.</strong> Health profile details are optional and can be added later.</span>
        </div>

        <form onSubmit={submit} className="patient-registration-form">
          {/* PERSONAL DETAILS */}
          <div className="patient-form-section">
            <div className="patient-form-section-heading"><span className="patient-form-step">01</span><div><h3>Personal details</h3><p>Set up the details used to access your account.</p></div></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Full Name *" placeholder="John Doe" required value={form.fullName} onChange={update("fullName")} />
              <Field label="Username *" placeholder="johndoe123" required value={form.username} onChange={update("username")} />
              <Field label="Email Address *" placeholder="you@example.com" type="email" required value={form.email} onChange={update("email")} />
              <Field label="Phone Number" placeholder="+91 98765 43210" value={form.phone} onChange={update("phone")} />
              <Field label="Password *" placeholder="Min 6 chars" type={show ? "text" : "password"} required toggle onToggle={() => setShow((s) => !s)} shown={show} value={form.password} onChange={update("password")} />
              <Field label="Confirm Password *" placeholder="Re-enter password" type={show ? "text" : "password"} required value={form.confirmPassword} onChange={update("confirmPassword")} />
              <Field label="Date of Birth" type="date" value={form.dateOfBirth} onChange={update("dateOfBirth")} />

              <div>
                <label className="text-xs font-semibold tracking-wide text-slate-500">Gender</label>
                <select value={form.gender} onChange={update("gender")} className="mt-1.5 w-full border border-slate-200 rounded-xl px-3.5 py-3 text-sm outline-none focus:border-teal-500 bg-white">
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <Field label="Blood Group" placeholder="O+" value={form.bloodGroup} onChange={update("bloodGroup")} />
            </div>
          </div>

          {/* HEALTH PROFILE */}
          <div className="patient-form-section">
            <div className="patient-form-section-heading"><span className="patient-form-step">02</span><div><h3>Health profile <span>Optional</span></h3><p>Add what you’re comfortable sharing. You can update this later.</p></div></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Height (cm)" type="number" placeholder="175" value={form.height_cm} onChange={update("height_cm")} />
              <Field label="Weight (kg)" type="number" placeholder="70" value={form.weight_kg} onChange={update("weight_kg")} />
              <Field label="Allergies (comma separated)" placeholder="Peanuts, Penicillin" value={form.allergies} onChange={update("allergies")} />
              <Field label="Existing Medical Conditions" placeholder="Asthma, Diabetes" value={form.chronicConditions} onChange={update("chronicConditions")} />
              <Field label="Current Medications" placeholder="Metformin, Inhaler" value={form.currentMedications} onChange={update("currentMedications")} />
            </div>
          </div>

          {/* EMERGENCY CONTACT */}
          <div className="patient-form-section">
            <div className="patient-form-section-heading"><span className="patient-form-step">03</span><div><h3>Emergency contact <span>Optional</span></h3><p>A person we can reference if you choose to add one.</p></div></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Contact Name" placeholder="Jane Doe" value={form.emergencyContactName} onChange={update("emergencyContactName")} />
              <Field label="Contact Number" placeholder="+91 90000 00000" value={form.emergencyContactNumber} onChange={update("emergencyContactNumber")} />
              <Field label="Relationship" placeholder="Spouse" value={form.emergencyContactRelationship} onChange={update("emergencyContactRelationship")} />
            </div>
          </div>

          {error && <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3.5 py-2.5">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold text-sm py-3.5 rounded-xl shadow-lg shadow-teal-600/25 hover:shadow-teal-600/35 transition-shadow disabled:opacity-70 mt-8"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {submitting ? "Creating account..." : "Complete Registration"}
          </button>

          <p className="patient-registration-security">
            <ShieldCheck size={15} /> Your sign-in is handled by Firebase Authentication. Only enter health information you choose to provide.
          </p>
        </form>
        <p className="patient-registration-login">Already have an account? <Link to="/patient/login">Sign in to your patient account <ArrowRight size={13} /></Link></p>
      </motion.div>
    </AuthShell>
  );
}

function Field({ label, placeholder, type = "text", required, toggle, onToggle, shown, value, onChange }) {
  return (
    <div>
      <label className="text-xs font-semibold tracking-wide text-slate-500">{label}</label>
      <div className="mt-1.5 relative">
        <input
          required={required}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full border border-slate-200 rounded-xl px-3.5 py-3 text-sm outline-none focus:border-teal-500 transition-colors"
        />
        {toggle && (
          <button type="button" onClick={onToggle} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
            {shown ? "Hide" : "Show"}
          </button>
        )}
      </div>
    </div>
  );
}
