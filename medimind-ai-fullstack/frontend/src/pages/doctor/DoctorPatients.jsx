import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CalendarClock, Loader2, Search, ShieldCheck, X } from "lucide-react";
import SectionHeader from "../../components/SectionHeader";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/AuthContext";

function localDate(value, timezone = "Asia/Kolkata") {
  if (!value) return "Not provided";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone,
  }).format(new Date(value));
}

export default function DoctorPatients() {
  const { profile } = useAuth();
  const timezone = profile?.doctorProfile?.availability?.timezone || "Asia/Kolkata";
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState("overview");
  const [tabData, setTabData] = useState(null);
  const [tabLoading, setTabLoading] = useState(false);
  const [tabError, setTabError] = useState("");

  const loadPatients = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/doctor/patients?q=${encodeURIComponent(query)}`);
      setPatients(data.items || []);
    } catch (requestError) {
      setError(requestError.message || "Unable to load your patients.");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const timer = setTimeout(loadPatients, 250);
    return () => clearTimeout(timer);
  }, [loadPatients]);

  const openPatient = async (patient) => {
    setSelected({ patient, appointments: [], medicalRecordAccess: "Consent required" });
    setDetailTab("overview");
    setTabData(null);
    setTabError("");
    setDetailLoading(true);
    try {
      const { data } = await api.get(`/doctor/patients/${patient._id}`);
      setSelected(data);
    } catch (requestError) {
      setError(requestError.message || "Unable to load patient access details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const openTab = async (tab) => {
    setDetailTab(tab);
    setTabData(null);
    setTabError("");
    if (["overview", "timeline"].includes(tab)) return;
    setTabLoading(true);
    try {
      const patientId = selected.patient?._id;
      if (tab === "access") {
        const { data } = await api.get(`/doctor/patients/${patientId}`);
        setSelected(data);
      } else {
        const endpoints = {
          reports: `/doctor/patients/${patientId}/shared-reports`,
          consultations: `/consultations?patientId=${patientId}&limit=100`,
          prescriptions: `/prescriptions?patientId=${patientId}&limit=100`,
          followups: `/prescriptions/follow-ups?patientId=${patientId}`,
        };
        const { data } = await api.get(endpoints[tab]);
        setTabData(data);
      }
    } catch (requestError) {
      setTabError(requestError.statusCode === 403
        ? "No active permission to view this resource. The patient must share reports explicitly."
        : requestError.message || "Unable to load this patient information.");
    } finally {
      setTabLoading(false);
    }
  };

  const tabs = [
    ["overview", "Overview"],
    ["timeline", "Timeline"],
    ["reports", "Shared reports"],
    ["consultations", "Consultations"],
    ["prescriptions", "Prescriptions"],
    ["followups", "Follow-ups"],
    ["access", "Access status"],
  ];

  return (
    <div className="dh-dash">
      <SectionHeader
        eyebrow="Authorized patient list"
        title={<>My Patients<em>.</em></>}
        description="Only patients with an appointment history with you are listed. Medical records require separate patient consent."
      />
      <label className="flex items-center gap-2 max-w-xl rounded-xl border border-slate-200 bg-white px-4 py-3">
        <Search size={16} aria-hidden="true" className="text-slate-400" />
        <span className="sr-only">Search patients</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full bg-transparent text-sm outline-none"
          placeholder="Search patients you have seen"
        />
      </label>

      {loading ? (
        <div className="flex justify-center py-16" role="status" aria-label="Loading patients">
          <Loader2 className="animate-spin text-indigo-600" />
        </div>
      ) : error ? (
        <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 p-5 text-sm text-rose-700" role="alert">
          <AlertCircle size={16} className="mr-2 inline" />{error}
          <button className="ml-3 underline" onClick={loadPatients}>Retry</button>
        </div>
      ) : patients.length === 0 ? (
        <div className="dh-panel mt-4 p-10 text-center text-sm text-slate-500">No related patients were found.</div>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {patients.map((patient) => (
            <li key={patient._id} className="dh-panel flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-800">{patient.fullName || "Not provided"}</p>
                <p className="mt-1 text-xs text-slate-500">Appointment relationship</p>
              </div>
              <button
                type="button"
                onClick={() => openPatient(patient)}
                className="shrink-0 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                aria-label={`View access details for ${patient.fullName || "patient"}`}
              >
                View
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelected(null);
        }}>
          <section
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="patient-access-title"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="patient-access-title" className="text-lg font-semibold text-slate-900">
                  {selected.patient?.fullName || "Patient"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Phone: {selected.patient?.phone || "Not provided"}
                </p>
              </div>
              <button type="button" onClick={() => setSelected(null)} aria-label="Close patient details" className="rounded-lg p-2 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 flex gap-1 overflow-x-auto border-b border-slate-200" role="tablist" aria-label="Patient detail sections">
              {tabs.map(([value, label]) => (
                <button key={value} type="button" role="tab" aria-selected={detailTab === value} onClick={() => openTab(value)} className={`whitespace-nowrap px-3 py-2 text-xs font-semibold ${detailTab === value ? "border-b-2 border-indigo-600 text-indigo-700" : "text-slate-500"}`}>
                  {label}
                </button>
              ))}
            </div>

            {detailLoading || tabLoading ? (
              <p className="py-6 text-sm text-slate-500" role="status">Loading patient information…</p>
            ) : tabError ? (
              <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800" role="alert">{tabError}</p>
            ) : detailTab === "overview" ? (
              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
                  <ShieldCheck size={16} className="mr-2 inline" />
                  Family records are not included. Report files require explicit, active patient consent.
                </div>
                <h3 className="flex items-center gap-2 font-semibold text-slate-800"><CalendarClock size={16} />Appointment metadata</h3>
                {selected.appointments?.length ? selected.appointments.slice(0, 5).map((appointment) => (
                  <p key={appointment._id} className="flex flex-wrap justify-between gap-2 border-b border-slate-100 py-2 text-sm">
                    <span>{localDate(appointment.scheduledAt, timezone)}</span><span className="text-slate-500">{appointment.mode} · {appointment.status}</span>
                  </p>
                )) : <p className="py-3 text-sm text-slate-500">No appointment metadata available.</p>}
              </div>
            ) : detailTab === "timeline" ? (
              <div className="mt-4">
                {selected.appointments?.length ? selected.appointments.map((appointment) => (
                  <div key={appointment._id} className="border-l-2 border-indigo-200 py-2 pl-4">
                    <p className="text-sm font-semibold text-slate-800">{appointment.status}</p>
                    <p className="text-xs text-slate-500">{localDate(appointment.scheduledAt, timezone)} · {appointment.mode}</p>
                  </div>
                )) : <p className="text-sm text-slate-500">No appointment events.</p>}
              </div>
            ) : detailTab === "access" ? (
              <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm">
                <p className="font-semibold text-slate-800">Report consent: {selected.medicalRecordAccess || "Consent required"}</p>
                <p className="mt-1 text-xs text-slate-500">{selected.consentExpiresAt ? `Expires ${localDate(selected.consentExpiresAt, timezone)}` : "No active report-sharing consent."}</p>
                <p className="mt-3 text-xs text-slate-500">Appointments do not grant access to medical records or family profiles. Revocation prevents future report access.</p>
              </div>
            ) : detailTab === "reports" ? (
              <div className="mt-4 space-y-3">
                {tabData?.reports?.length ? tabData.reports.map((report) => (
                  <div key={report._id} className="rounded-lg border border-slate-100 p-3">
                    <p className="text-sm font-semibold text-slate-800">{report.fileName || "Not provided"}</p>
                    <p className="mt-1 text-xs text-slate-500">{report.reportType || "Not provided"} · {localDate(report.createdAt, timezone)}</p>
                    <p className="mt-2 text-xs text-slate-600">AI draft: {report.analysis?.summary || "Not provided"}</p>
                  </div>
                )) : <p className="text-sm text-slate-500">No reports shared for this patient.</p>}
              </div>
            ) : (
              <ul className="mt-4 space-y-2">
                {(tabData?.items || tabData || []).length ? (tabData?.items || tabData).map((record) => (
                  <li key={record._id} className="rounded-lg border border-slate-100 p-3">
                    <p className="text-sm font-semibold text-slate-800">
                      {detailTab === "consultations" ? record.chiefComplaint || "Consultation" : detailTab === "prescriptions" ? (record.sourceType === "existing_upload" ? record.uploadedDocument?.fileName || "Uploaded prescription" : (record.medications || []).map((medicine) => medicine.name).join(", ") || "Prescription") : record.reason || "Follow-up"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{record.status || "Not provided"} · {localDate(record.updatedAt || record.dueDate, timezone)}</p>
                  </li>
                )) : <li className="text-sm text-slate-500">No {detailTab} on file.</li>}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
