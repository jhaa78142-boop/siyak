import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, Key, Lock, ArrowLeft, ArrowRight, 
  CheckCircle2, AlertCircle, Loader2, ShieldCheck, Stethoscope, User
} from "lucide-react";
import AuthShell from "./AuthShell";
import Button from "../../components/Button";
import loginHero from "../../assets/media/login-hero.mp4";
import { api } from "../../lib/api";
import { useToast } from "../../components/Toast";

export default function ForgotPassword({ defaultRole }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Determine role based on prop or route pathname
  const initialRole = defaultRole || (location.pathname.includes("doctor") ? "DOCTOR" : "PATIENT");
  const [role, setRole] = useState(initialRole);

  // Steps: 1 = Email input, 2 = Enter OTP + New Password, 3 = Success
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid registered email address.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/forgot-password/send-otp", { email: cleanEmail });
      toast("6-digit OTP sent to your email!", { tone: "success" });
      setStep(2);
    } catch (err) {
      setError(err?.message || "Failed to send OTP. Please check your email and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e?.preventDefault();
    setError("");

    if (!otp.trim() || otp.trim().length !== 6) {
      setError("Please enter the 6-digit OTP sent to your email.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/forgot-password/reset", {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword,
      });

      toast("Password reset successfully!", { tone: "success" });
      setStep(3);
    } catch (err) {
      setError(err?.message || "Invalid or expired OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loginRoute = role === "DOCTOR" ? "/doctor/login" : "/patient/login";

  return (
    <AuthShell mediaType="video" mediaSrc={loginHero} shellClassName="login-premium-shell">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="login-page-content w-full max-w-md mx-auto pt-8 pb-12"
      >
        <Link
          to={loginRoute}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-ink transition-colors mb-6"
        >
          <ArrowLeft size={15} /> Back to {role === "DOCTOR" ? "Doctor" : "Patient"} Login
        </Link>

        {/* Role Pill */}
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full uppercase tracking-wider">
            {role === "DOCTOR" ? <Stethoscope size={13} /> : <User size={13} />}
            {role} ACCOUNT RECOVERY
          </span>
        </div>

        <header className="mb-6">
          <h1 className="text-3xl font-display font-semibold text-ink tracking-tight mb-2">
            Reset Password<span className="text-teal-500">.</span>
          </h1>
          <p className="text-slate-500 text-sm">
            {step === 1 && "Enter your registered Gmail address to receive a 6-digit verification code."}
            {step === 2 && `Enter the 6-digit OTP sent to ${email} and choose your new password.`}
            {step === 3 && "Your password has been securely updated. You can now log in."}
          </p>
        </header>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm px-4 py-3 rounded-xl mb-6 flex items-start gap-2.5">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form
              key="step-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleSendOtp}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-semibold tracking-wide text-slate-600 mb-1.5 block">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-white border border-slate-200 focus:border-teal-500 rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  fullWidth
                  disabled={loading}
                  className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/20 py-3.5"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" /> Sending OTP...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Send Verification Code <ArrowRight size={16} />
                    </span>
                  )}
                </Button>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-xs text-slate-500 flex items-start gap-2 mt-4">
                <ShieldCheck size={16} className="text-teal-600 shrink-0 mt-0.5" />
                <span>
                  The OTP is valid for 5 minutes and will only be sent to the email matching your account.
                </span>
              </div>
            </motion.form>
          )}

          {step === 2 && (
            <motion.form
              key="step-2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleResetPassword}
              className="space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold tracking-wide text-slate-600 block">
                    6-Digit OTP
                  </label>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="text-xs font-medium text-teal-600 hover:text-teal-700 hover:underline"
                  >
                    Resend code
                  </button>
                </div>
                <div className="relative">
                  <Key size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-full tracking-[0.4em] font-mono font-semibold text-center bg-white border border-slate-200 focus:border-teal-500 rounded-xl py-3 text-lg outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold tracking-wide text-slate-600 mb-1.5 block">
                  New Password
                </label>
                <div className="relative">
                  <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full bg-white border border-slate-200 focus:border-teal-500 rounded-xl pl-10 pr-10 py-3 text-sm outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold tracking-wide text-slate-600 mb-1.5 block">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full bg-white border border-slate-200 focus:border-teal-500 rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <Button
                  type="submit"
                  size="lg"
                  fullWidth
                  disabled={loading}
                  className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/20 py-3.5"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" /> Updating Password...
                    </span>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-xs text-slate-500 hover:text-ink text-center py-2"
                >
                  ← Change Email Address
                </button>
              </div>
            </motion.form>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 space-y-4"
            >
              <div className="w-16 h-16 bg-teal-50 border border-teal-200 rounded-full flex items-center justify-center mx-auto text-teal-600">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="text-xl font-display font-semibold text-ink">Password Reset Successfully</h2>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                Your password has been updated in Firebase Authentication. You can now login with your username and new password.
              </p>
              <div className="pt-4">
                <Button
                  type="button"
                  size="lg"
                  fullWidth
                  onClick={() => navigate(loginRoute)}
                  className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/20 py-3.5"
                >
                  Go to Login
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AuthShell>
  );
}
