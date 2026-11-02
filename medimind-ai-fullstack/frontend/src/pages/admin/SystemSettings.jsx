import { useState, useRef, useEffect } from "react";
import { Server, Mail, Bell, ShieldCheck, Database, Key, Moon, Camera, User, Phone, Loader2, Check } from "lucide-react";
import SectionHeader from "../../components/SectionHeader";
import { Toggle, SettingsRow } from "../../components/Settings";
import { useTheme } from "../../lib/ThemeContext";
import { useAuth } from "../../lib/AuthContext";
import { api } from "../../lib/api";
import { useToast } from "../../components/Toast";

export default function SystemSettings() {
  const { dark, toggleDark } = useTheme();
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    title: "",
    avatarUrl: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName || profile.name || "",
        phone: profile.phone || "",
        title: profile.adminProfile?.title || "Platform Administrator",
        avatarUrl: profile.avatarUrl || "",
      });
    }
  }, [profile]);

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
      setForm((prev) => ({ ...prev, avatarUrl: base64 }));
      try {
        await api.patch("/auth/profile", { avatarUrl: base64 });
        await refreshProfile();
        toast("Profile picture updated!", { tone: "success" });
      } catch (err) {
        toast("Failed to update profile picture", { tone: "error" });
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
        adminProfile: {
          title: form.title,
        },
      });
      await refreshProfile();
      toast("Admin profile saved!", { tone: "success" });
    } catch (err) {
      toast(err?.message || "Failed to save profile", { tone: "error" });
    } finally {
      setSaving(false);
    }
  };

  const initials = (form.fullName || "MA").split(" ").map((n) => n[0]).slice(0, 2).join("");

  return (
    <div>
      <SectionHeader eyebrow="Platform configuration" title="System Settings" description="Global toggles for authentication, notifications and integrations." />

      {/* Admin Profile Section */}
      <div className="card-shell p-6 mb-6">
        <h3 className="font-display font-semibold text-ink mb-4">Administrator Profile</h3>
        <form onSubmit={handleSave} className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            {form.avatarUrl ? (
              <img
                src={form.avatarUrl}
                alt={form.fullName}
                className="h-20 w-20 rounded-full object-cover border-2 border-violet-500 shadow-md"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-700 flex items-center justify-center text-white text-xl font-display font-semibold">
                {initials}
              </div>
            )}
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow hover:bg-slate-50 transition-colors"
              title="Change picture"
            >
              {uploading ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
            </button>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 flex-1 w-full">
            <div>
              <label className="text-xs font-semibold text-slate-500">FULL NAME</label>
              <div className="mt-1 flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-violet-500">
                <User size={14} className="text-slate-400" />
                <input
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  className="w-full outline-none text-sm bg-transparent"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500">ROLE TITLE</label>
              <div className="mt-1 flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-violet-500">
                <ShieldCheck size={14} className="text-slate-400" />
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full outline-none text-sm bg-transparent"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500">PHONE</label>
              <div className="mt-1 flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-violet-500">
                <Phone size={14} className="text-slate-400" />
                <input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full outline-none text-sm bg-transparent"
                  placeholder="+91..."
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="shrink-0 flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-700 text-white font-semibold text-xs px-5 py-3 rounded-xl shadow-md shadow-violet-600/25 hover:shadow-violet-600/35 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Save Profile
          </button>
        </form>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card-shell p-6 divide-y divide-slate-100">
          <h3 className="font-display font-semibold text-ink pb-2">Authentication</h3>
          <SettingsRow icon={ShieldCheck} title="Require doctor verification" description="New doctor accounts stay inactive until admin-approved" right={<Toggle defaultOn />} />
          <SettingsRow icon={Key} title="Enforce 2FA for admins" right={<Toggle defaultOn />} />
        </div>

        <div className="card-shell p-6 divide-y divide-slate-100">
          <h3 className="font-display font-semibold text-ink pb-2">Notifications</h3>
          <SettingsRow icon={Mail} title="SMTP email delivery" description="Gmail SMTP + Nodemailer" right={<Toggle defaultOn />} />
          <SettingsRow icon={Bell} title="Push notifications (FCM)" right={<Toggle defaultOn />} />
        </div>

        <div className="card-shell p-6 divide-y divide-slate-100">
          <h3 className="font-display font-semibold text-ink pb-2">AI & Data</h3>
          <SettingsRow icon={Database} title="Nightly knowledge base re-index" right={<Toggle defaultOn />} />
          <SettingsRow icon={Server} title="Fallback to secondary LLM provider" description="Auto-switch if primary API rate limit is hit" right={<Toggle defaultOn />} />
        </div>

        <div className="card-shell p-6 divide-y divide-slate-100">
          <h3 className="font-display font-semibold text-ink pb-2">Appearance</h3>
          <SettingsRow icon={Moon} title="Dark mode" description="Applies to the whole admin console" right={<Toggle on={dark} onChange={toggleDark} />} />
        </div>

        <div className="card-shell p-6">
          <h3 className="font-display font-semibold text-ink mb-3">API Keys</h3>
          <div className="space-y-2.5">
            {["Gemini API", "OpenFDA API", "Firebase Admin SDK"].map(k => (
              <div key={k} className="flex items-center justify-between bg-slate-50 rounded-lg px-3.5 py-2.5 text-sm">
                <span className="text-ink font-medium">{k}</span>
                <span className="font-mono text-xs text-slate-400">••••••••••42</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
