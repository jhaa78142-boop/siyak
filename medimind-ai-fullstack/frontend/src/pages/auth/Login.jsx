import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Eye, EyeOff, Fingerprint,
  Lock, User, Wifi,
  Loader2, Stethoscope, Users, ShieldCheck, AlertCircle
} from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import AuthShell from "./AuthShell";
import Button from "../../components/Button";
import loginHero from "../../assets/media/login-hero.mp4";
import { loginWithEmail, loginWithGoogle, logout as firebaseLogout } from "../../lib/firebase";
import { api } from "../../lib/api";
import { useToast } from "../../components/Toast";

/* ─── helpers ─── */
function firebaseAuthErrorMessage(err) {
  const code = err?.code || "";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) {
    return "Invalid username or password.";
  }
  if (code.includes("too-many-requests")) return "Too many attempts — please wait a moment and try again.";
  if (code.includes("network-request-failed")) return "Network error — check your connection and try again.";
  return err?.message || "Couldn't sign you in. Please try again.";
}

const roles = [
  { id: "PATIENT", label: "Patient", icon: Users, descriptor: "Personal healthcare workspace" },
  { id: "DOCTOR", label: "Doctor", icon: Stethoscope, descriptor: "Clinical practitioner portal" },
  { id: "ADMIN", label: "Admin", icon: ShieldCheck, descriptor: "System administration console" },
];

function ErrorText({ children }) {
  return <p className="login-error text-xs text-rose-500 mt-1.5 flex items-center gap-1" role="alert"><AlertCircle size={13} className="shrink-0" /> {children}</p>;
}

function PasswordToggle({ visible, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="login-password-toggle absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={visible ? "off" : "on"}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

function SystemStatus({ patient = false }) {
  return (
    <div className="login-system-status text-[11px] font-mono tracking-widest uppercase flex items-center gap-3 text-slate-500 mb-6" aria-label="MediMind system status">
      <span className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.5)] animate-pulse" />
        {patient ? "Patient portal" : "All systems operational"}
      </span>
      <span className="w-px h-3 bg-slate-200" />
      <span className="flex items-center gap-1.5">
        {patient ? <ShieldCheck size={13} /> : <Wifi size={13} />}
        {patient ? "Firebase sign-in" : "Private relay active"}
      </span>
    </div>
  );
}

/* ─── Login Page ─── */
export default function Login({ defaultRole }) {
  const navigate = useNavigate();
  const location = useLocation();
  const reducedMotion = useReducedMotion();
  const { toast } = useToast();

  // Detect role from route or prop
  const getInitialRole = () => {
    if (defaultRole) return defaultRole;
    if (location.pathname.includes("admin")) return "ADMIN";
    if (location.pathname.includes("doctor")) return "DOCTOR";
    return "PATIENT";
  };

  const [role, setRole] = useState(getInitialRole);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [capsLock, setCapsLock] = useState(false);

  useEffect(() => {
    setRole(getInitialRole());
    setErrors({});
  }, [location.pathname]);

  const clearError = (field) => setErrors((current) => ({ ...current, [field]: undefined }));

  /* ─── Validation ─── */
  const validate = () => {
    const next = {};
    if (!username.trim()) next.username = "Enter your username.";
    if (!password) next.password = "Enter your password.";
    return next;
  };

  /* ─── Account Status Verification ─── */
  function checkAccountStatus(profile) {
    if (profile.status === "ACTIVE" || profile.status === "APPROVED") return null;
    if (profile.status === "PENDING") return "Your doctor account is waiting for Admin approval.";
    if (profile.status === "REJECTED") return "Your doctor account has been rejected by the Admin.";
    if (profile.status === "SUSPENDED") return "Your doctor account has been suspended.";
    return `Your account status is ${profile.status}. Access is restricted.`;
  }

  /* ─── Google Login ─── */
  const handleGoogleLogin = async () => {
    setStatus("loading");
    setErrors({});
    try {
      await loginWithGoogle();

      // Call /auth/google-sync to find/link the existing MongoDB account
      const syncRes = await api.post("/auth/google-sync");
      const profile = syncRes.data;

      // Role check
      if (profile.role !== role) {
        await firebaseLogout();
        if (role === "ADMIN") {
          throw new Error("This Google account is not registered as an Admin.");
        }
        throw new Error(`This account is registered as a ${profile.role}, not ${role}.`);
      }

      // Status check (PENDING, APPROVED, REJECTED, SUSPENDED)
      const statusMsg = checkAccountStatus(profile);
      if (statusMsg) {
        await firebaseLogout();
        throw new Error(statusMsg);
      }

      setStatus("success");
      toast(`Welcome back, ${profile.fullName || "User"}!`, { tone: "success" });
      setTimeout(() => navigate(`/${role.toLowerCase()}`), 450);
    } catch (err) {
      setStatus("idle");
      try { await firebaseLogout(); } catch {}
      setErrors({ global: err?.message || "This Google email is not registered. Please create an account first." });
    }
  };

  /* ─── Username + Password Login ─── */
  const submit = async (event) => {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;
    setStatus("loading");

    try {
      // Step 1: Look up username/email in MongoDB to get registered email & role
      let emailToAuth = "";
      try {
        const lookupRes = await api.post("/auth/lookup-username", { username: username.trim() });
        const { email, role: userRole } = lookupRes.data;

        // Role verification
        if (userRole !== role) {
          setStatus("idle");
          setErrors({ username: `This account is registered as a ${userRole}, not ${role}.` });
          return;
        }
        emailToAuth = email;
      } catch (lookupErr) {
        setStatus("idle");
        if (lookupErr?.statusCode === 404) {
          setErrors({ username: "Username not found." });
        } else {
          setErrors({ global: lookupErr?.message || "Failed to locate user account." });
        }
        return;
      }

      // Step 2: Authenticate with Firebase Email/Password
      try {
        await loginWithEmail(emailToAuth, password);
      } catch (authErr) {
        setStatus("idle");
        setErrors({ password: firebaseAuthErrorMessage(authErr) });
        return;
      }

      // Step 3: Fetch verified profile from backend
      const { data: profile } = await api.get("/auth/me");

      // Step 4: Check account approval status
      const statusMsg = checkAccountStatus(profile);
      if (statusMsg) {
        await firebaseLogout();
        setStatus("idle");
        setErrors({ global: statusMsg });
        return;
      }

      setStatus("success");
      toast(`Welcome back, ${profile.fullName || "User"}!`, { tone: "success" });
      setTimeout(() => navigate(`/${role.toLowerCase()}`), 450);
    } catch (err) {
      setStatus("idle");
      try { await firebaseLogout(); } catch {}
      setErrors({ global: err?.message || "Sign in failed. Please try again." });
    }
  };

  /* ─── Forgot Password Navigation ─── */
  const handleForgotPassword = () => {
    if (role === "ADMIN") {
      setErrors({ global: "Admin password reset is managed separately. Contact the system administrator." });
      return;
    }
    navigate(`/${role.toLowerCase()}/forgot-password`);
  };

  const isRoleLocked = Boolean(defaultRole || location.pathname.includes("admin") || location.pathname.includes("doctor") || location.pathname.includes("patient"));

  return (
    <AuthShell mediaType="video" mediaSrc={loginHero} shellClassName={`login-premium-shell ${role === "PATIENT" ? "patient-auth-experience" : "professional-auth-experience"}`}>
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="login-page-content w-full max-w-md mx-auto pt-8 pb-12"
      >
        <SystemStatus patient={role === "PATIENT"} />
        <header className="mb-6">
          <div className="text-[10px] font-bold tracking-[0.2em] text-teal-600 mb-2 uppercase flex items-center gap-2">
            <span className="w-5 h-px bg-teal-400" /> {role === "PATIENT" ? "A CALMER WAY TO CARE FOR YOU" : "SECURE IDENTITY VERIFICATION"}
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-semibold text-ink tracking-tight mb-2">
            {role === "ADMIN" ? "Admin Portal" : role === "DOCTOR" ? "Doctor Login" : "Welcome back"}
            <span className="text-teal-500">.</span>
          </h2>
          <p className="text-slate-500 text-sm">
            {role === "ADMIN"
              ? "Access the system configuration, analytics, and doctor approval portal."
              : role === "DOCTOR"
              ? "Enter your clinical workspace to manage appointments and records."
              : "Continue to your private health profile and AI assistant."}
          </p>
        </header>

        {/* Role Selector (only show when on general /login route) */}
        {!isRoleLocked && (
          <section className="mb-6" aria-labelledby="account-type-label">
            <div className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="text-teal-500 font-mono">01</span>
              <span id="account-type-label">Choose your access</span>
            </div>
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100" role="radiogroup">
              {roles.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={role === id}
                  onClick={() => { setRole(id); setErrors({}); }}
                  className={`relative flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 ${
                    role === id
                      ? "bg-white text-teal-700 shadow-sm border border-slate-200/50"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
                  }`}
                >
                  <Icon size={16} className={role === id ? "text-teal-600" : "text-slate-400"} />
                  {label}
                  {role === id && <motion.div layoutId="role-indicator" className="absolute -bottom-1 w-8 h-1 bg-teal-500 rounded-t-full" />}
                </button>
              ))}
            </div>
          </section>
        )}

        <form onSubmit={submit} noValidate className="space-y-4 relative auth-sign-in-card">
          {errors.global && (
            <div className="bg-rose-50 text-rose-600 border border-rose-200 text-sm px-4 py-3 rounded-xl flex items-start gap-2.5">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{errors.global}</span>
            </div>
          )}

          {/* Username field */}
          <div>
            <label htmlFor="login-username" className="text-xs font-semibold tracking-wide text-slate-600 mb-1.5 block">
              Username
            </label>
            <div className="relative">
              <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); clearError("username"); }}
                placeholder="Enter your username"
                autoComplete="username"
                className={`w-full bg-white border ${
                  errors.username ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-teal-500"
                } rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all`}
              />
            </div>
            {errors.username && <ErrorText>{errors.username}</ErrorText>}
          </div>

          {/* Password field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="text-xs font-semibold tracking-wide text-slate-600">
                Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
                placeholder="Enter your password"
                onKeyUp={(e) => setCapsLock(e.getModifierState("CapsLock"))}
                autoComplete="current-password"
                className={`w-full bg-white border ${
                  errors.password ? "border-rose-300 focus:border-rose-500" : "border-slate-200 focus:border-teal-500"
                } rounded-xl pl-10 pr-10 py-3 text-sm outline-none transition-all`}
              />
              <PasswordToggle visible={showPassword} onClick={() => setShowPassword((v) => !v)} label="Toggle password" />
            </div>
            {capsLock && <p className="text-xs text-amber-600 mt-1">Caps Lock is on.</p>}
            {errors.password && <ErrorText>{errors.password}</ErrorText>}
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-teal-500 focus:ring-teal-500"
              />
              Keep me signed in
            </label>
            <span className="text-[11px] text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
              <Fingerprint size={12} /> Secure Device
            </span>
          </div>

          <Button
            type="submit"
            size="lg"
            fullWidth
            disabled={status === "loading"}
            className="mt-4 bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/20 py-3.5 text-[15px]"
          >
            {status === "loading" ? (
              <Loader2 size={18} className="animate-spin mx-auto" />
            ) : (
              `Sign In as ${role.charAt(0) + role.slice(1).toLowerCase()}`
            )}
          </Button>

          {/* Google Sign In */}
          <div className="relative flex items-center py-3">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="shrink-0 px-4 text-xs text-slate-400 uppercase tracking-wider font-medium">Or</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>
          
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={status === "loading"}
            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 font-medium text-sm py-3 rounded-xl hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
              <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
            </svg>
            Continue with Google
          </button>
        </form>

        {/* Footer Links */}
        <div className={`mt-8 text-center text-xs text-slate-500 space-y-2 ${role === "PATIENT" ? "patient-sign-in-footer" : ""}`}>
          {role === "PATIENT" && (
            <p>
              New patient?{" "}
              <Link to="/patient/register" className="text-teal-600 font-semibold hover:text-teal-700 hover:underline">
                Create a patient account
              </Link>
            </p>
          )}
          {role === "DOCTOR" && (
            <p>
              Are you a doctor?{" "}
              <Link to="/doctor/register" className="text-teal-600 font-semibold hover:text-teal-700 hover:underline">
                Register clinical profile
              </Link>
            </p>
          )}
          {role === "ADMIN" && (
            <p className="text-slate-400">
              Admin access is restricted.{" "}
              <Link to="/admin/register" className="text-teal-600 font-semibold hover:text-teal-700 hover:underline">
                How to request access
              </Link>
            </p>
          )}
        </div>
      </motion.div>
    </AuthShell>
  );
}
