import { useEffect, useRef, useState } from "react";
import { Clock, XCircle, LogOut, Loader2, UploadCloud, ShieldAlert } from "lucide-react";
import logo from "../../assets/logo.png";
import { useAuth } from "../../lib/AuthContext";
import { api } from "../../lib/api";
import { useNavigate } from "react-router-dom";

export default function PendingApproval({ status, reason }) {
  const { logout, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const suspended = status === "suspended";
  const rejected = status === "rejected";
  const [form, setForm] = useState({ licenseNumber: "", registrationAuthority: "", specialization: "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setForm({
      licenseNumber: profile?.doctorProfile?.licenseNumber || "",
      registrationAuthority: profile?.doctorProfile?.registrationAuthority || "",
      specialization: profile?.doctorProfile?.specialization || "",
    });
  }, [profile]);

  const handleSignOut = async () => {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const saveCredentials = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await api.patch("/auth/profile", { doctorProfile: form });
      await refreshProfile();
      setMessage("Credentials saved. Upload a verification document to submit or resubmit for admin review.");
    } catch (error) {
      setMessage(error.message || "Unable to update credentials.");
    } finally {
      setSaving(false);
    }
  };

  const uploadDocument = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage("");
    try {
      const body = new FormData();
      body.append("file", file);
      await api.upload("/doctor/verification-documents", body);
      await refreshProfile();
      setMessage("Document submitted privately. Your verification is pending admin review.");
    } catch (error) {
      setMessage(error.message || "Document upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <img src={logo} alt="MediMind AI" className="h-9 w-9" />
          <span className="font-display font-semibold text-[15px] text-ink">MediMind AI</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-7">
          <div className={`mx-auto mb-4 h-14 w-14 rounded-2xl flex items-center justify-center ${suspended ? "bg-rose-50 text-rose-600" : rejected ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"}`}>
            {suspended ? <ShieldAlert size={26} /> : rejected ? <XCircle size={26} /> : <Clock size={26} />}
          </div>
          <h1 className="font-display font-semibold text-xl text-ink mb-2 text-center">
            {suspended ? "Doctor access suspended" : rejected ? "Resubmit your verification" : "Verification in progress"}
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed mb-5 text-center">
            {suspended
              ? "Your clinical access is suspended. Contact an administrator for information. You cannot access patient records while suspended."
              : rejected
                ? reason || "Your credentials were not approved. Update the information below and upload corrected documentation for review."
                : "Clinical access remains unavailable until an administrator approves your credentials."}
          </p>

          {!suspended && (
            <div className="space-y-4">
              <form onSubmit={saveCredentials} className="space-y-3 rounded-xl border border-slate-100 p-4">
                <h2 className="text-sm font-semibold text-slate-800">Professional credentials</h2>
                {[
                  ["licenseNumber", "Registration number"],
                  ["registrationAuthority", "Issuing authority"],
                  ["specialization", "Specialization"],
                ].map(([key, label]) => (
                  <label key={key} className="block text-xs font-medium text-slate-600">
                    {label}
                    <input
                      required
                      value={form[key]}
                      onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </label>
                ))}
                <button disabled={saving} className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">
                  {saving ? "Saving…" : "Save credentials"}
                </button>
              </form>

              <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                <input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={uploadDocument} className="sr-only" aria-label="Select private verification document" />
                <button type="button" disabled={uploading} onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                  {uploading ? "Uploading…" : "Upload verification document"}
                </button>
                <p className="mt-2 text-xs text-slate-600">Private upload. Accepted formats: PDF, PNG, JPG, WEBP.</p>
              </div>
            </div>
          )}

          {message && <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700" role="status">{message}</p>}
          <button onClick={handleSignOut} className="mt-5 w-full inline-flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl py-2.5 transition-colors">
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
