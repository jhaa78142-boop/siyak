import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import PendingApproval from "../pages/auth/PendingApproval";

export default function ProtectedRoute({ role, children }) {
  const { firebaseUser, profile, loading, refreshProfile } = useAuth();
  const location = useLocation();

  if (loading) return null; // splash/router fallback already covers first paint

  // Not signed in at all -> send to login.
  if (firebaseUser === null) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!profile) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <section className="max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm" role="alert">
          <h1 className="text-lg font-semibold text-slate-900">Account status unavailable</h1>
          <p className="mt-2 text-sm text-slate-600">We could not verify your account with the MediMind service. Clinical information is blocked until authorization is available.</p>
          <button type="button" onClick={refreshProfile} className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Retry</button>
        </section>
      </main>
    );
  }

  const userRole = (profile.role || "").toLowerCase();
  const targetRole = (role || "").toLowerCase();

  if (userRole && userRole !== targetRole) {
    return <Navigate to={`/${userRole}`} replace />;
  }

  if (targetRole === "doctor") {
    const verification = profile.doctorProfile?.verification;
    const accountStatus = String(profile.status || "").toLowerCase();
    const verificationStatus = String(verification?.status || "").toLowerCase();
    if (accountStatus === "suspended" || verificationStatus === "suspended") {
      return <PendingApproval status="suspended" />;
    }
    if (!["approved", "verified"].includes(verificationStatus)
        || !["approved", "active"].includes(accountStatus)) {
      return <PendingApproval status={verificationStatus} reason={verification?.rejectionReason} />;
    }
  } else if (["suspended", "disabled"].includes(String(profile.status || "").toLowerCase())) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <p className="rounded-xl bg-white p-6 text-slate-700" role="alert">This account is suspended.</p>
      </main>
    );
  }

  return children;
}
