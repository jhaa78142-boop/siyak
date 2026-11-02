import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, KeyRound, ShieldCheck } from "lucide-react";
import AuthShell from "./AuthShell";
import loginHero from "../../assets/media/login-hero.mp4";

export default function AdminAccess() {
  return (
    <AuthShell mediaType="video" mediaSrc={loginHero} shellClassName="login-premium-shell doctor-registration-shell">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="patient-registration-content"
      >
        <Link to="/welcome" className="patient-auth-back">
          <ArrowLeft size={15} /> Back
        </Link>
        <span className="patient-auth-eyebrow admin-auth-eyebrow">
          <ShieldCheck size={13} /> Restricted administrator access
        </span>
        <h1 className="patient-auth-title">Trusted access, <span>by invitation.</span></h1>
        <p className="patient-auth-description">
          Administrator accounts are provisioned by system operations. Public registration is disabled to protect patient and platform data.
        </p>

        <section className="admin-access-card" aria-labelledby="admin-access-title">
          <div className="admin-access-icon"><KeyRound size={22} /></div>
          <div>
            <h2 id="admin-access-title">Need administrator access?</h2>
            <p>Contact your MediMind system owner to request an account. Once your credentials are issued, sign in through the secure Admin Portal.</p>
          </div>
          <Link to="/admin/login" className="admin-access-link">Go to Admin sign in <ArrowRight size={15} /></Link>
        </section>

        <p className="patient-registration-security admin-access-security">
          <ShieldCheck size={15} /> Admin access is never created through patient or doctor registration.
        </p>
      </motion.div>
    </AuthShell>
  );
}
