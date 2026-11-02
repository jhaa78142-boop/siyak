import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ThemeProvider } from "./lib/ThemeContext";
import { I18nProvider } from "./lib/I18nContext";
import { ToastProvider } from "./components/Toast";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import ProtectedRoute from "./lib/ProtectedRoute";

// Eager: the very first thing a visitor sees, so no loading flash on entry.
import Splash from "./pages/Splash";
import Welcome from "./pages/Welcome";

// Everything else loads on demand — keeps the initial dev/prod bundle small
// so the landing page doesn't wait on 40+ dashboard screens it isn't using.
const NotFound = lazy(() => import("./pages/NotFound"));
const Error500 = lazy(() => import("./pages/Error500"));
const Login = lazy(() => import("./pages/auth/Login"));
const Signup = lazy(() => import("./pages/auth/Signup"));
const PatientRegister = lazy(() => import("./pages/auth/PatientRegister"));
const DoctorRegister = lazy(() => import("./pages/auth/DoctorRegister"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const AdminAccess = lazy(() => import("./pages/auth/AdminAccess"));

const DashboardLayout = lazy(() => import("./layouts/DashboardLayout"));
import { patientNav, doctorNav, adminNav } from "./lib/nav";
import { currentPatient, currentDoctor, currentAdmin } from "./lib/mockData";

const PatientHome = lazy(() => import("./pages/patient/PatientHome"));
const AIChat = lazy(() => import("./pages/patient/AIChat"));
const SymptomChecker = lazy(() => import("./pages/patient/SymptomChecker"));
const ReportAnalyzer = lazy(() => import("./pages/patient/ReportAnalyzer"));
const MedicineChecker = lazy(() => import("./pages/patient/MedicineChecker"));
const Appointments = lazy(() => import("./pages/patient/Appointments"));
const MedicineReminder = lazy(() => import("./pages/patient/MedicineReminder"));
const HealthScore = lazy(() => import("./pages/patient/HealthScore"));
const Timeline = lazy(() => import("./pages/patient/Timeline"));
const VoiceAssistant = lazy(() => import("./pages/patient/VoiceAssistant"));
const Education = lazy(() => import("./pages/patient/Education"));
const PatientProfile = lazy(() => import("./pages/patient/PatientProfile"));
const PatientSettings = lazy(() => import("./pages/patient/PatientSettings"));
const PatientFeedback = lazy(() => import("./pages/patient/PatientFeedback"));
const NearbyHospitals = lazy(() => import("./pages/patient/NearbyHospitals"));
const ConsentManagement = lazy(() => import("./pages/patient/ConsentManagement"));

const DoctorHome = lazy(() => import("./pages/doctor/DoctorHome"));
const DoctorPatients = lazy(() => import("./pages/doctor/DoctorPatients"));
const DoctorAppointments = lazy(() => import("./pages/doctor/DoctorAppointments"));
const Consultations = lazy(() => import("./pages/doctor/Consultations"));
const DoctorAvailability = lazy(() => import("./pages/doctor/DoctorAvailability"));
const AISummary = lazy(() => import("./pages/doctor/AISummary"));
const Prescription = lazy(() => import("./pages/doctor/Prescription"));
const FollowUps = lazy(() => import("./pages/doctor/FollowUps"));
const DrugInteractions = lazy(() => import("./pages/doctor/DrugInteractions"));
const HealthRecords = lazy(() => import("./pages/doctor/HealthRecords"));
const DoctorEducation = lazy(() => import("./pages/doctor/DoctorEducation"));
const DoctorProfile = lazy(() => import("./pages/doctor/DoctorProfile"));
const DoctorSettings = lazy(() => import("./pages/doctor/DoctorSettings"));

const AdminHome = lazy(() => import("./pages/admin/AdminHome"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const DoctorVerification = lazy(() => import("./pages/admin/DoctorVerification"));
const AdminAppointments = lazy(() => import("./pages/admin/AdminAppointments"));
const ReportsAnalytics = lazy(() => import("./pages/admin/ReportsAnalytics"));
const AIQuality = lazy(() => import("./pages/admin/AIQuality"));
const EarlyWarning = lazy(() => import("./pages/admin/EarlyWarning"));
const KnowledgeBase = lazy(() => import("./pages/admin/KnowledgeBase"));
const Feedback = lazy(() => import("./pages/admin/Feedback"));
const SystemSettings = lazy(() => import("./pages/admin/SystemSettings"));
const AuditLog = lazy(() => import("./pages/admin/AuditLog"));

// Wraps DashboardLayout with live profile data (falls back to mock data
// if the backend/auth isn't reachable yet, so local dev never blanks out).
function PatientDashboardShell(props) {
  const { profile } = useAuth();
  const userName = profile?.fullName || profile?.name || currentPatient.name;
  const user = { name: userName, sub: "Patient", avatarUrl: profile?.avatarUrl };
  return <DashboardLayout role="patient" items={patientNav} user={user} {...props} />;
}

function DoctorDashboardShell(props) {
  const { profile } = useAuth();
  const userName = profile?.fullName || profile?.name || currentDoctor.name;
  const user = {
    name: userName,
    sub: profile?.doctorProfile?.specialization || currentDoctor.specialization,
    avatarUrl: profile?.avatarUrl,
  };
  return <DashboardLayout role="doctor" items={doctorNav} user={user} {...props} />;
}

function AdminDashboardShell(props) {
  const { profile } = useAuth();
  const userName = profile?.fullName || profile?.name || currentAdmin.name;
  const user = {
    name: userName,
    sub: profile?.adminProfile?.title || currentAdmin.role,
    avatarUrl: profile?.avatarUrl,
  };
  return <DashboardLayout role="admin" items={adminNav} user={user} {...props} />;
}

// Minimal, near-instant fallback — this only ever shows for the split
// beyond Splash/Welcome, so it should never compete visually with either.
function RouteFallback() {
  return <div className="fixed inset-0 bg-[#070B14]" aria-hidden="true" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <I18nProvider>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
          <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/welcome" element={<Welcome />} />
            
            {/* Standard and spec public auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Patient routes per login.txt */}
            <Route path="/patient/login" element={<Login defaultRole="PATIENT" />} />
            <Route path="/patient/register" element={<PatientRegister />} />
            <Route path="/register/patient" element={<PatientRegister />} />
            <Route path="/patient/forgot-password" element={<ForgotPassword defaultRole="PATIENT" />} />

            {/* Doctor routes per login.txt */}
            <Route path="/doctor/login" element={<Login defaultRole="DOCTOR" />} />
            <Route path="/doctor/register" element={<DoctorRegister />} />
            <Route path="/register/doctor" element={<DoctorRegister />} />
            <Route path="/doctor/forgot-password" element={<ForgotPassword defaultRole="DOCTOR" />} />

            {/* Admin routes per login.txt */}
            <Route path="/admin/login" element={<Login defaultRole="ADMIN" />} />
            <Route path="/admin/register" element={<AdminAccess />} />

            {/* Dashboard aliases */}
            <Route path="/patient/dashboard/*" element={<Navigate to="/patient" replace />} />
            <Route path="/doctor/dashboard/*" element={<Navigate to="/doctor" replace />} />
            <Route path="/admin/dashboard/*" element={<Navigate to="/admin" replace />} />

            <Route path="/patient" element={<ProtectedRoute role="patient"><PatientDashboardShell /></ProtectedRoute>}>
              <Route index element={<PatientHome />} />
              <Route path="ai-chat" element={<AIChat />} />
              <Route path="symptom-checker" element={<SymptomChecker />} />
              <Route path="report-analyzer" element={<ReportAnalyzer />} />
              <Route path="medicine-checker" element={<MedicineChecker />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="reminders" element={<MedicineReminder />} />
              <Route path="health-score" element={<HealthScore />} />
              <Route path="timeline" element={<Timeline />} />
              <Route path="voice-assistant" element={<VoiceAssistant />} />
              <Route path="education" element={<Education />} />
              <Route path="nearby-hospitals" element={<NearbyHospitals />} />
              <Route path="consents" element={<ConsentManagement />} />
              <Route path="profile" element={<PatientProfile />} />
              <Route path="settings" element={<PatientSettings />} />
              <Route path="feedback" element={<PatientFeedback />} />
            </Route>

            <Route path="/doctor" element={<ProtectedRoute role="doctor"><DoctorDashboardShell /></ProtectedRoute>}>
              <Route index element={<DoctorHome />} />
              <Route path="patients" element={<DoctorPatients />} />
              <Route path="appointments" element={<DoctorAppointments />} />
              <Route path="consultations" element={<Consultations />} />
              <Route path="availability" element={<DoctorAvailability />} />
              <Route path="ai-summary" element={<AISummary />} />
              <Route path="prescription" element={<Prescription />} />
              <Route path="follow-ups" element={<FollowUps />} />
              <Route path="drug-interactions" element={<DrugInteractions />} />
              <Route path="health-records" element={<HealthRecords />} />
              <Route path="education" element={<DoctorEducation />} />
              <Route path="profile" element={<DoctorProfile />} />
              <Route path="settings" element={<DoctorSettings />} />
            </Route>

            <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboardShell /></ProtectedRoute>}>
              <Route index element={<AdminHome />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="verification" element={<DoctorVerification />} />
              <Route path="appointments" element={<AdminAppointments />} />
              <Route path="analytics" element={<ReportsAnalytics />} />
              <Route path="ai-quality" element={<AIQuality />} />
              <Route path="early-warning" element={<EarlyWarning />} />
              <Route path="knowledge-base" element={<KnowledgeBase />} />
              <Route path="feedback" element={<Feedback />} />
              <Route path="settings" element={<SystemSettings />} />
              <Route path="audit-log" element={<AuditLog />} />
            </Route>

            <Route path="/PATIENT/*" element={<Navigate to="/patient" replace />} />
            <Route path="/DOCTOR/*" element={<Navigate to="/doctor" replace />} />
            <Route path="/ADMIN/*" element={<Navigate to="/admin" replace />} />

            <Route path="/500" element={<Error500 />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </I18nProvider>
    </BrowserRouter>
  );
}
