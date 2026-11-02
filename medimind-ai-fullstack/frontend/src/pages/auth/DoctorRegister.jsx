import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Stethoscope, ArrowLeft, ArrowRight, AlertTriangle, Loader2, ShieldCheck } from "lucide-react";
import AuthShell from "./AuthShell";
import heroVideo from "../../assets/media/login-hero.mp4";
import { useToast } from "../../components/Toast";
import { registerWithEmail } from "../../lib/firebase";
import { api } from "../../lib/api";

function friendlyFirebaseError(err) {
  const code = err?.code || "";
  if (code.includes("email-already-in-use")) return "That email is already registered — try logging in instead.";
  if (code.includes("weak-password")) return "Password should be at least 6 characters.";
  if (code.includes("invalid-email")) return "Enter a valid email address.";
  return err?.message || "Couldn't submit your registration. Please try again.";
}

export default function DoctorRegister() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "", username: "", email: "", password: "", confirmPassword: "", phone: "",
    licenseNumber: "", registrationAuthority: "", qualifications: "", languages: "",
    specialization: "", experienceYears: "", consultationFee: "", hospital: "", bio: ""
  });

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.specialization) return setError("Please select a specialization.");
    if (form.password.length < 6) return setError("Password should be at least 6 characters.");
    if (form.password !== form.confirmPassword) return setError("Passwords don't match.");
    if (!form.username.trim()) return setError("Username is required.");

    setSubmitting(true);
    try {
      // 1. Create Firebase User
      const { user } = await registerWithEmail(form.email, form.password, form.fullName);
      
      // 2. Create MongoDB Doctor Profile
      await api.post("/auth/doctor/register", {
        firebaseUid: user.uid,
        email: form.email,
        username: form.username,
        fullName: form.fullName,
        phone: form.phone,
        specialization: form.specialization,
        hospital: form.hospital,
        licenseNumber: form.licenseNumber,
        registrationAuthority: form.registrationAuthority,
        qualifications: form.qualifications.split(",").map((value) => value.trim()).filter(Boolean),
        languages: form.languages.split(",").map((value) => value.trim()).filter(Boolean),
        experienceYears: form.experienceYears ? Number(form.experienceYears) : undefined,
        consultationFee: form.consultationFee ? Number(form.consultationFee) : undefined,
        bio: form.bio
      });
      
      toast("Submitted for admin verification — you'll be notified once approved", { tone: "info" });
      navigate("/doctor/login");
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || friendlyFirebaseError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      mediaType="video"
      mediaSrc={heroVideo}
      shellClassName="login-premium-shell doctor-registration-shell"
      quote={"I registered, uploaded my reports, and had an AI-backed summary ready before my first appointment."}
      author={"Rahul Sharma, Patient"}
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="patient-registration-content"
      >
        <Link to="/welcome" className="patient-auth-back">
          <ArrowLeft size={15} /> Back
        </Link>

        <span className="patient-auth-eyebrow doctor-auth-eyebrow">
          <Stethoscope size={13} /> Doctor Registration
        </span>
        <h1 className="patient-auth-title">Bring your care, <span>closer to patients.</span></h1>
        <p className="patient-auth-description">Create your clinical profile and submit your credentials for secure administrator verification.</p>

        <div className="patient-registration-note doctor-registration-note">
          <ShieldCheck size={18} />
          <span><strong>Clinical access stays protected.</strong> Your doctor account requires administrator verification before patient data is available.</span>
        </div>

        <form onSubmit={submit} className="patient-registration-form doctor-registration-form">
          
          <div className="patient-form-section">
            <div className="patient-form-section-heading"><span className="patient-form-step">01</span><div><h3>Account details</h3><p>Use the contact details you want associated with this profile.</p></div></div>
            <Field label="Full Name *" placeholder="Dr. Anjali Verma" required value={form.fullName} onChange={update("fullName")} />
            <Field label="Username *" placeholder="dranjali123" required value={form.username} onChange={update("username")} />
            <Field label="Email Address *" placeholder="doctor@hospital.com" type="email" required value={form.email} onChange={update("email")} />
            <Field label="Phone Number" placeholder="+91 98765 43210" value={form.phone} onChange={update("phone")} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Password *" placeholder="Min 6 chars" type="password" required value={form.password} onChange={update("password")} />
              <Field label="Confirm Password *" placeholder="Re-enter" type="password" required value={form.confirmPassword} onChange={update("confirmPassword")} />
            </div>
          </div>

          <div className="patient-form-section">
            <div className="patient-form-section-heading"><span className="patient-form-step">02</span><div><h3>Professional credentials</h3><p>These details are reviewed before your clinical account is approved.</p></div></div>
            <Field label="Medical License Number *" placeholder="MCI-2024-XXXXX" required value={form.licenseNumber} onChange={update("licenseNumber")} />
            <Field label="Issuing Authority *" placeholder="State Medical Council" required value={form.registrationAuthority} onChange={update("registrationAuthority")} />
            <Field label="Qualifications" placeholder="MBBS, MD (comma separated)" value={form.qualifications} onChange={update("qualifications")} />
            <div>
              <label className="text-xs font-semibold tracking-wide text-slate-500">SPECIALIZATION *</label>
              <select
                required
                value={form.specialization}
                onChange={update("specialization")}
                className="mt-1.5 w-full border border-slate-200 rounded-xl px-3.5 py-3 text-sm outline-none focus:border-indigo-500 bg-white"
              >
                <option value="">Select Specialization *</option>
                <option>Cardiology</option>
                <option>Dermatology</option>
                <option>General Physician</option>
                <option>Orthopedics</option>
                <option>Pediatrics</option>
                <option>Neurology</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Experience (Years)" type="number" placeholder="10" value={form.experienceYears} onChange={update("experienceYears")} />
              <Field label="Consultation Fee (₹)" type="number" placeholder="1000" value={form.consultationFee} onChange={update("consultationFee")} />
            </div>
            <Field label="Current Hospital/Clinic" placeholder="City Medical Center" value={form.hospital} onChange={update("hospital")} />
            <Field label="Languages" placeholder="Hindi, English (comma separated)" value={form.languages} onChange={update("languages")} />
            <div>
              <label className="text-xs font-semibold tracking-wide text-slate-500">Short Bio</label>
              <textarea
                placeholder="Briefly describe your experience and expertise..."
                value={form.bio}
                onChange={update("bio")}
                rows={3}
                className="mt-1.5 w-full border border-slate-200 rounded-xl px-3.5 py-3 text-sm outline-none focus:border-indigo-500 transition-colors resize-none"
              />
            </div>
          </div>

          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 text-amber-700 text-[12.5px] rounded-xl px-3.5 py-3">
            <AlertTriangle size={15} className="shrink-0 mt-0.5" />
            Your account requires admin verification before access is granted.
          </div>

          {error && <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3.5 py-2.5">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-blue-700 text-white font-semibold text-sm py-3.5 rounded-xl shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 transition-shadow disabled:opacity-70 mt-4"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {submitting ? "Submitting..." : "Submit for Verification"}
          </button>
          <p className="patient-registration-security"><ShieldCheck size={15} /> Your identity is authenticated securely. Never enter patient information in this registration form.</p>
        </form>
        <p className="patient-registration-login">Already registered? <Link to="/doctor/login">Sign in to your doctor account <ArrowRight size={13} /></Link></p>
      </motion.div>
    </AuthShell>
  );
}

function Field({ label, placeholder, type = "text", required, value, onChange }) {
  return (
    <div>
      <label className="text-xs font-semibold tracking-wide text-slate-500">{label}</label>
      <input
        required={required}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="mt-1.5 w-full border border-slate-200 rounded-xl px-3.5 py-3 text-sm outline-none focus:border-indigo-500 transition-colors"
      />
    </div>
  );
}
