import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, Mail, Phone, Building2, Award, GraduationCap, Loader2, Check, Star, Users, Shield, Download } from "lucide-react";
import SectionHeader from "../../components/SectionHeader";
import { useAuth } from "../../lib/AuthContext";
import { api } from "../../lib/api";
import { useToast } from "../../components/Toast";

const ease = [0.16, 1, 0.3, 1];

export default function DoctorProfile() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const verificationInputRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [documentUploading, setDocumentUploading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    hospital: "",
    licenseNumber: "",
    registrationAuthority: "",
    qualifications: "",
    languages: "",
    specialization: "",
    experienceYears: "",
    consultationFee: "",
    bio: "",
    avatarUrl: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName || profile.name || "",
        phone: profile.phone || "",
        hospital: profile.doctorProfile?.hospital || "",
        licenseNumber: profile.doctorProfile?.licenseNumber || "",
        registrationAuthority: profile.doctorProfile?.registrationAuthority || "",
        qualifications: (profile.doctorProfile?.qualifications || []).join(", "),
        languages: (profile.doctorProfile?.languages || []).join(", "),
        specialization: profile.doctorProfile?.specialization || "",
        experienceYears: profile.doctorProfile?.experienceYears ?? "",
        consultationFee: profile.doctorProfile?.consultationFee ?? "",
        bio: profile.doctorProfile?.bio || "",
        avatarUrl: profile.avatarUrl || "",
      });
    }
  }, [profile]);

  const handleVerificationDocument = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setDocumentUploading(true);
    try {
      await api.upload("/doctor/verification-documents", formData);
      await refreshProfile();
      toast("Verification document submitted. Admin review is required.", { tone: "info" });
    } catch (err) {
      toast(err?.message || "Verification document upload failed.", { tone: "error" });
    } finally {
      setDocumentUploading(false);
      event.target.value = "";
    }
  };

  const downloadVerificationDocument = async (document) => {
    try {
      const blob = await api.download(`/doctor/verification-documents/${document._id}`);
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = document.fileName || "verification-document";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast(err?.message || "Unable to download this private document.", { tone: "error" });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast("Image must be smaller than 2MB", { tone: "error" });
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      try {
        await api.patch("/auth/profile", { avatarUrl: base64 });
        await refreshProfile();
        setForm((prev) => ({ ...prev, avatarUrl: base64 }));
        toast("Profile picture updated!", { tone: "success" });
      } catch (err) {
        toast(err?.message || "Failed to update profile picture", { tone: "error" });
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/auth/profile", {
        fullName: form.fullName,
        phone: form.phone,
        avatarUrl: form.avatarUrl,
        doctorProfile: {
          hospital: form.hospital,
          licenseNumber: form.licenseNumber,
          registrationAuthority: form.registrationAuthority,
          qualifications: form.qualifications.split(",").map((value) => value.trim()).filter(Boolean),
          languages: form.languages.split(",").map((value) => value.trim()).filter(Boolean),
          specialization: form.specialization,
          experienceYears: form.experienceYears === "" ? undefined : Number(form.experienceYears),
          consultationFee: form.consultationFee === "" ? undefined : Number(form.consultationFee),
          bio: form.bio,
        },
      });
      await refreshProfile();
      toast("Profile saved successfully!", { tone: "success" });
    } catch (err) {
      toast(err?.message || "Failed to save profile", { tone: "error" });
    } finally {
      setSaving(false);
    }
  };

  const name = form.fullName || profile?.fullName || "Doctor";
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("");

  const inputStyle = {
    width: "100%", outline: "none", fontSize: "0.84rem",
    background: "transparent", fontFamily: "var(--font-body)",
    color: "var(--dh-ink)",
  };

  const fieldWrapper = {
    marginTop: "0.45rem",
    display: "flex", alignItems: "center", gap: "0.5rem",
    border: "1px solid var(--dh-line, rgba(59,91,255,0.1))",
    borderRadius: "0.85rem", padding: "0.75rem 0.9rem",
    background: "rgba(255,255,255,0.5)", backdropFilter: "blur(8px)",
    transition: "border-color 0.2s",
  };

  return (
    <div className="dh-dash">
      <SectionHeader
        eyebrow="Your account"
        title={<>Profile<em>.</em></>}
        description="Your public profile as seen by patients booking appointments."
      />

      <form onSubmit={handleSave} style={{ display: "grid", gridTemplateColumns: "0.38fr 0.62fr", gap: "1rem" }}>
        {/* Profile card */}
        <motion.div
          className="dh-panel"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.06, ease }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}
        >
          {/* Avatar */}
          <div style={{ position: "relative", marginBottom: "0.5rem" }}>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: "none" }} />
            {form.avatarUrl ? (
              <img src={form.avatarUrl} alt={name}
                style={{
                  height: "5.5rem", width: "5.5rem", borderRadius: "50%", objectFit: "cover",
                  border: "3px solid var(--dh-blue, #4F46E5)",
                  boxShadow: "0 8px 24px -12px rgba(79,70,229,0.5)",
                }}
              />
            ) : (
              <div style={{
                height: "5.5rem", width: "5.5rem", borderRadius: "50%",
                background: "linear-gradient(145deg, #4F46E5, #6366F1)",
                display: "grid", placeItems: "center", color: "#fff",
                fontSize: "1.35rem", fontFamily: "var(--font-display)", fontWeight: 650,
                boxShadow: "0 8px 24px -12px rgba(79,70,229,0.5)",
              }}>
                {initials}
              </div>
            )}
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              style={{
                position: "absolute", bottom: 0, right: 0,
                width: "2rem", height: "2rem", borderRadius: "50%",
                background: "#fff", border: "1px solid rgba(59,91,255,0.15)",
                display: "grid", placeItems: "center", cursor: "pointer",
                color: "#64748B", boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                transition: "background 0.2s",
              }}
            >
              {uploading ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
            </button>
          </div>

          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 650, fontSize: "1.15rem", color: "var(--dh-ink)", marginTop: "0.5rem" }}>
            {name}
          </h3>
          <p style={{ fontSize: "0.78rem", color: "var(--dh-muted)", marginTop: "0.15rem" }}>
            {form.specialization || "Doctor"}
          </p>

          {/* Stat grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.55rem", width: "100%", marginTop: "1.25rem" }}>
            {[
              { icon: Star, label: "Experience", value: `${profile?.doctorProfile?.experienceYears ?? "Not provided"} years`, color: "var(--dh-blue)" },
              { icon: Users, label: "Consultation fee", value: profile?.doctorProfile?.consultationFee == null ? "Not provided" : `₹${profile.doctorProfile.consultationFee}`, color: "var(--dh-ink)" },
            ].map((s) => (
              <div key={s.label} style={{
                padding: "0.75rem", borderRadius: "0.85rem",
                background: "rgba(79,70,229,0.04)", border: "1px solid rgba(79,70,229,0.06)",
              }}>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 650, color: s.color }}>{s.value}</p>
                <p style={{ fontSize: "0.65rem", color: "var(--dh-muted)", marginTop: "0.1rem" }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Verification badge */}
          <div style={{
            marginTop: "1rem", padding: "0.6rem 0.85rem", borderRadius: "0.75rem",
            background: profile?.doctorProfile?.verification?.status === "approved" || profile?.doctorProfile?.verification?.status === "verified" ? "rgba(16,185,129,0.06)" : "rgba(245,158,11,0.08)",
            border: "1px solid rgba(16,185,129,0.12)",
            display: "flex", alignItems: "center", gap: "0.4rem", width: "100%",
          }}>
            <Shield size={14} style={{ color: "#059669" }} />
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#059669" }}>
              Verification: {profile?.doctorProfile?.verification?.status || "pending"}
            </span>
          </div>
          <div className="mt-4 w-full text-left">
            <input ref={verificationInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={handleVerificationDocument} className="sr-only" aria-label="Upload verification document" />
            <button type="button" disabled={documentUploading} onClick={() => verificationInputRef.current?.click()} className="w-full rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 disabled:opacity-50">
              {documentUploading ? "Uploading…" : "Upload private verification document"}
            </button>
            <p className="mt-1 text-[11px] text-slate-500">PDF, PNG, JPG, or WEBP. Uploading credentials requires admin re-verification.</p>
            {(profile?.doctorProfile?.verificationDocuments || []).map((document) => (
              <div key={document._id} className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-600">
                <span className="truncate">{document.fileName} · submitted</span>
                <button type="button" onClick={() => downloadVerificationDocument(document)} aria-label={`Download verification document ${document.fileName}`} className="rounded p-1 text-indigo-700 hover:bg-indigo-50"><Download size={14} /></button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Details form */}
        <motion.div
          className="dh-panel"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12, ease }}
        >
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 650, fontSize: "1.05rem", color: "var(--dh-ink)", marginBottom: "1.15rem", letterSpacing: "-0.02em" }}>
            Professional Details
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {[
              { icon: GraduationCap, label: "Full name", key: "fullName", placeholder: "Dr. Full Name" },
              { icon: Mail, label: "Email", key: "email", disabled: true, value: profile?.email || "" },
              { icon: Phone, label: "Phone", key: "phone", placeholder: "+91 90000 00000" },
              { icon: Building2, label: "Hospital / Clinic", key: "hospital", placeholder: "Hospital name" },
              { icon: GraduationCap, label: "Specialization", key: "specialization", placeholder: "e.g. Cardiology" },
              { icon: Award, label: "Medical license", key: "licenseNumber", placeholder: "License number" },
              { icon: Award, label: "Issuing authority", key: "registrationAuthority", placeholder: "State Medical Council" },
              { icon: GraduationCap, label: "Qualifications (comma separated)", key: "qualifications", placeholder: "MBBS, MD" },
              { icon: GraduationCap, label: "Languages (comma separated)", key: "languages", placeholder: "Hindi, English" },
              { icon: Star, label: "Experience (years)", key: "experienceYears", placeholder: "Years", type: "number", min: 0, max: 80 },
              { icon: Users, label: "Consultation fee", key: "consultationFee", placeholder: "Amount in INR", type: "number", min: 0, max: 1000000 },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.key}>
                  <label style={{
                    fontFamily: "var(--font-mono)", fontSize: "0.62rem", fontWeight: 650,
                    letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--dh-muted)",
                  }}>{f.label}</label>
                  <div
                    style={{
                      ...fieldWrapper,
                      opacity: f.disabled ? 0.65 : 1,
                      background: f.disabled ? "rgba(59,91,255,0.03)" : fieldWrapper.background,
                    }}
                    onFocus={(e) => { if (!f.disabled) e.currentTarget.style.borderColor = "var(--dh-blue)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "var(--dh-line)"; }}
                  >
                    <Icon size={15} style={{ color: "#94A3B8", flexShrink: 0 }} />
                    <input
                      type={f.type || "text"}
                      min={f.min}
                      max={f.max}
                      disabled={f.disabled}
                      value={f.disabled ? f.value : (form[f.key] || "")}
                      onChange={f.disabled ? undefined : (e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      style={{
                        ...inputStyle,
                        cursor: f.disabled ? "not-allowed" : "text",
                        color: f.disabled ? "var(--dh-muted)" : inputStyle.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slate-500">Professional bio
            <textarea maxLength={2000} rows={4} value={form.bio} onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white/70 p-3 text-sm font-normal normal-case tracking-normal text-slate-800" />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="dh-cta-primary"
            style={{
              marginTop: "1.5rem", gap: "0.4rem", padding: "0.75rem 1.2rem",
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </motion.div>
      </form>
    </div>
  );
}
