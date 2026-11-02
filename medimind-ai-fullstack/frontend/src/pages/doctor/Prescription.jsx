import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Download, FileText, Loader2, Plus, Trash2 } from "lucide-react";
import SectionHeader from "../../components/SectionHeader";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/AuthContext";
import { exportPrescriptionPdf } from "../../lib/pdfExport";
import { isoToLocalDateTime, localDateTimeToISOString } from "../../lib/timezone";

function formatTime(value, timezone) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone,
  }).format(new Date(value));
}

function previewTime(value, timezone) {
  if (!value) return "Not provided";
  try {
    return formatTime(localDateTimeToISOString(value, timezone), timezone);
  } catch {
    return "Invalid local time for the selected timezone";
  }
}

const blankMedicine = () => ({
  id: `${Date.now()}-${Math.random()}`,
  name: "",
  strength: "",
  dosage: "",
  route: "",
  frequency: "",
  durationDays: "",
  instructions: "",
});

export default function Prescription() {
  const { profile } = useAuth();
  const timezone = profile?.doctorProfile?.availability?.timezone || "Asia/Kolkata";
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [appointmentId, setAppointmentId] = useState("");
  const [medications, setMedications] = useState([blankMedicine()]);
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [draftId, setDraftId] = useState("");
  const [amendingId, setAmendingId] = useState("");
  const [amendmentReason, setAmendmentReason] = useState("");
  const [existingFile, setExistingFile] = useState(null);
  const [uploadingExisting, setUploadingExisting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [patientResponse, appointmentResponse, prescriptionResponse] = await Promise.all([
        api.get("/doctor/patients"),
        api.get("/appointments?limit=100"),
        api.get("/prescriptions?limit=100"),
      ]);
      setPatients(patientResponse.data.items || []);
      setAppointments(appointmentResponse.data.items || []);
      setPrescriptions(prescriptionResponse.data.items || []);
    } catch (requestError) {
      setError(requestError.message || "Unable to load prescription data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const eligibleAppointments = appointments.filter((appointment) =>
    appointment.patient?._id === patientId && ["Confirmed", "InProgress", "Completed"].includes(appointment.status)
  );
  const setMedicine = (id, field, value) => {
    setMedications((current) => current.map((item) => item.id === id ? { ...item, [field]: value } : item));
  };
  const reset = () => {
    setPatientId("");
    setAppointmentId("");
    setMedications([blankMedicine()]);
    setDiagnosis("");
    setNotes("");
    setFollowUpDate("");
    setDraftId("");
    setAmendingId("");
    setAmendmentReason("");
  };
  const medicinePayload = () => medications.map(({ name, strength, dosage, route, frequency, durationDays, instructions }) => ({
    name,
    strength,
    dosage,
    route,
    frequency,
    durationDays: Number(durationDays),
    instructions,
  }));
  const saveDraft = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = {
        patientId,
        appointmentId,
        medications: medicinePayload(),
        diagnosis,
        notes,
        followUpDate: followUpDate ? localDateTimeToISOString(followUpDate, timezone) : undefined,
      };
      const response = draftId
        ? await api.patch(`/prescriptions/${draftId}`, body)
        : await api.post("/prescriptions", body);
      setDraftId(response.data._id);
      await load();
    } catch (requestError) {
      setError(requestError.message || "Unable to save prescription draft.");
    } finally {
      setSaving(false);
    }
  };

  const finalize = async () => {
    if (!draftId) {
      setError("Save the draft before finalizing.");
      return;
    }
    if (!window.confirm("Finalize this prescription? The patient will be notified and the record will be retained.")) return;
    setSaving(true);
    setError("");
    try {
      await api.patch(`/prescriptions/${draftId}/finalize`, { confirm: true });
      await load();
      const saved = prescriptions.find((item) => item._id === draftId);
      if (saved) exportPdf(saved);
      reset();
    } catch (requestError) {
      setError(requestError.message || "Unable to finalize this prescription.");
    } finally {
      setSaving(false);
    }
  };

  const selectAmendment = (prescription) => {
    setDraftId("");
    setAmendingId(prescription._id);
    setPatientId(prescription.patient?._id || prescription.patient);
    setAppointmentId(prescription.appointment?._id || prescription.appointment);
    setMedications((prescription.medications || []).map((medicine) => ({ ...medicine, id: medicine._id || blankMedicine().id, durationDays: String(medicine.durationDays || "") })));
    setDiagnosis(prescription.diagnosis || "");
    setNotes(prescription.notes || "");
    setFollowUpDate(prescription.followUpDate ? isoToLocalDateTime(prescription.followUpDate, timezone) : "");
  };

  const saveAmendment = async () => {
    if (!window.confirm("Save this amendment while retaining the previous finalized version?")) return;
    setSaving(true);
    setError("");
    try {
      await api.patch(`/prescriptions/${amendingId}/amend`, {
        confirm: true,
        reason: amendmentReason,
        medications: medicinePayload(),
        diagnosis,
        notes,
        followUpDate: followUpDate ? localDateTimeToISOString(followUpDate, timezone) : undefined,
      });
      await load();
      reset();
    } catch (requestError) {
      setError(requestError.message || "Unable to amend prescription.");
    } finally {
      setSaving(false);
    }
  };

  const uploadExisting = async (event) => {
    event.preventDefault();
    if (!existingFile || !patientId || !appointmentId) return;
    setUploadingExisting(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("patientId", patientId);
      formData.append("appointmentId", appointmentId);
      formData.append("file", existingFile);
      await api.upload("/prescriptions/uploads", formData);
      setExistingFile(null);
      await load();
    } catch (requestError) {
      setError(requestError.message || "Unable to privately upload the existing prescription.");
    } finally {
      setUploadingExisting(false);
    }
  };

  const downloadOriginal = async (prescription) => {
    try {
      const blob = await api.download(`/prescriptions/${prescription._id}/document`);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = prescription.uploadedDocument?.fileName || "prescription";
      link.click();
      URL.revokeObjectURL(url);
    } catch (requestError) {
      setError(requestError.message || "Unable to download this private prescription.");
    }
  };

  const exportPdf = (prescription) => {
    const patientName = prescription.patient?.fullName
      || patients.find((patient) => patient._id === String(prescription.patient))?.fullName
      || "Not provided";
    exportPrescriptionPdf({
      doctorName: profile?.fullName || "Doctor",
      doctorLicense: profile?.doctorProfile?.licenseNumber || "Not provided",
      doctorSpecialization: profile?.doctorProfile?.specialization || "Not provided",
      patientName,
      date: prescription.finalizedAt || new Date(),
      timeZone: timezone,
      diagnosis: prescription.diagnosis,
      followUpDate: prescription.followUpDate,
      medicines: prescription.medications.map((medicine) => ({
        med: [medicine.name, medicine.strength, medicine.dosage, medicine.route].filter(Boolean).join(" · "),
        freq: [medicine.frequency, medicine.instructions].filter(Boolean).join(" · "),
        days: medicine.durationDays,
      })),
      notes: prescription.notes,
    });
  };

  return (
    <div className="dh-dash">
      <SectionHeader eyebrow="Doctor-confirmed clinical record" title={<>Prescriptions<em>.</em></>} description="Save a draft, preview its contents, then explicitly finalize. AI cannot create or finalize prescriptions." />
      {error && <div role="alert" className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700"><AlertCircle size={15} className="mr-2 inline" />{error}</div>}
      {loading ? (
        <div className="flex justify-center py-16" role="status" aria-label="Loading prescriptions"><Loader2 className="animate-spin text-indigo-600" /></div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
          <form onSubmit={saveDraft} className="dh-panel space-y-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-slate-900">{amendingId ? "Amend finalized prescription" : draftId ? "Prescription draft" : "New prescription"}</h2>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">{amendingId ? "Amendment pending" : draftId ? "Draft" : "Not finalized"}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">Patient
                <select required disabled={Boolean(amendingId)} value={patientId} onChange={(event) => { setPatientId(event.target.value); setAppointmentId(""); }} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <option value="">Select a related patient</option>
                  {patients.map((patient) => <option key={patient._id} value={patient._id}>{patient.fullName || "Not provided"}</option>)}
                </select>
              </label>
              <label className="text-sm font-medium text-slate-700">Confirmed appointment
                <select required disabled={Boolean(amendingId)} value={appointmentId} onChange={(event) => setAppointmentId(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <option value="">Select appointment</option>
                  {eligibleAppointments.map((appointment) => <option key={appointment._id} value={appointment._id}>{formatTime(appointment.scheduledAt, timezone)} · {appointment.status}</option>)}
                  {amendingId && <option value={appointmentId}>Original appointment</option>}
                </select>
              </label>
            </div>
            <label className="block text-sm font-medium text-slate-700">Assessment / diagnosis (doctor-entered)
              <textarea maxLength={2000} rows={2} value={diagnosis} onChange={(event) => setDiagnosis(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-3" />
            </label>
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-800">Medicines</h3>
              {medications.map((medicine, index) => (
                <fieldset key={medicine.id} className="grid gap-2 rounded-xl border border-slate-100 p-3 sm:grid-cols-2">
                  <legend className="px-1 text-xs text-slate-500">Medicine {index + 1}</legend>
                  {[
                    ["name", "Medicine name", "text"],
                    ["strength", "Strength", "text"],
                    ["dosage", "Dose", "text"],
                    ["route", "Route", "text"],
                    ["frequency", "Frequency", "text"],
                    ["durationDays", "Duration (days)", "number"],
                  ].map(([field, label, type]) => (
                    <label key={field} className="text-xs font-medium text-slate-600">{label}
                      <input required min={type === "number" ? 1 : undefined} type={type} value={medicine[field]} onChange={(event) => setMedicine(medicine.id, field, event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                    </label>
                  ))}
                  <label className="text-xs font-medium text-slate-600 sm:col-span-2">Instructions
                    <input maxLength={1000} value={medicine.instructions} onChange={(event) => setMedicine(medicine.id, "instructions", event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                  </label>
                  {medications.length > 1 && <button type="button" onClick={() => setMedications((current) => current.filter((item) => item.id !== medicine.id))} className="justify-self-start text-xs text-rose-700"><Trash2 size={13} className="mr-1 inline" />Remove</button>}
                </fieldset>
              ))}
              {medications.length < 30 && <button type="button" onClick={() => setMedications((current) => [...current, blankMedicine()])} className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-700"><Plus size={15} />Add medicine</button>}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">Follow-up recommendation date
                <input type="datetime-local" value={followUpDate} onChange={(event) => setFollowUpDate(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" />
              </label>
              <label className="text-sm font-medium text-slate-700">Patient instructions
                <textarea maxLength={5000} rows={2} value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-3" />
              </label>
            </div>
            {amendingId && <label className="block text-sm font-medium text-slate-700">Amendment reason
              <input required maxLength={1000} value={amendmentReason} onChange={(event) => setAmendmentReason(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" />
            </label>}
            <section aria-labelledby="prescription-preview-title" className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
              <h3 id="prescription-preview-title" className="font-semibold text-slate-900">Preview · not finalized</h3>
              <p className="mt-1 text-xs text-slate-600">Patient: {patients.find((patient) => patient._id === patientId)?.fullName || "Not provided"}</p>
              <p className="mt-2 text-sm text-slate-700">Assessment: {diagnosis || "Not provided"}</p>
              <ul className="mt-2 space-y-1">
                {medications.map((medicine) => (
                  <li key={medicine.id} className="text-xs text-slate-700">
                    {[medicine.name, medicine.strength, medicine.dosage, medicine.route, medicine.frequency, medicine.durationDays ? `${medicine.durationDays} days` : ""].filter(Boolean).join(" · ") || "Medicine details not provided"}
                    {medicine.instructions && <span className="block text-slate-500">{medicine.instructions}</span>}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-slate-600">Follow-up: {previewTime(followUpDate, timezone)}</p>
              <p className="mt-1 whitespace-pre-wrap text-xs text-slate-600">Instructions: {notes || "Not provided"}</p>
            </section>
            <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">A typed doctor name on a PDF is not a legally verified digital signature. Follow-up recommendations do not create an appointment or reminder schedule.</p>
            <div className="flex flex-wrap gap-2">
              {!amendingId && <button disabled={saving} className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Save draft"}</button>}
              {!amendingId && <button type="button" disabled={saving} onClick={finalize} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Finalize with confirmation"}</button>}
              {amendingId && <button type="button" disabled={saving} onClick={saveAmendment} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Confirm amendment"}</button>}
              <button type="button" onClick={reset} className="rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700">Clear</button>
            </div>
          </form>

          <aside className="dh-panel space-y-4 p-4">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900"><FileText size={17} />Prescription records</h2>
            <form onSubmit={uploadExisting} className="space-y-2 rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-semibold text-slate-700">Upload an existing prescription for the selected patient and appointment above.</p>
              <label className="block text-xs font-medium text-slate-600">Private document (PDF, PNG, JPG; server-configured size limit)
                <input required type="file" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" onChange={(event) => setExistingFile(event.target.files?.[0] || null)} className="mt-1 block w-full text-xs" />
              </label>
              <button disabled={uploadingExisting || !patientId || !appointmentId || !existingFile} className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{uploadingExisting ? "Uploading…" : "Upload privately"}</button>
            </form>
            {prescriptions.length === 0 ? <p className="text-sm text-slate-500">No prescriptions.</p> : (
              <ul className="space-y-2">
                {prescriptions.map((prescription) => (
                  <li key={prescription._id} className="rounded-xl border border-slate-100 p-3">
                    <p className="text-sm font-medium text-slate-800">{prescription.patient?.fullName || "Not provided"}</p>
                    <p className="mt-1 text-xs text-slate-500">{prescription.status} · {formatTime(prescription.updatedAt, timezone)}</p>
                    {prescription.sourceType === "existing_upload" ? (
                      <button type="button" onClick={() => downloadOriginal(prescription)} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-700"><Download size={13} />Download original privately</button>
                    ) : prescription.status === "draft" ? (
                      <button type="button" onClick={() => {
                        setDraftId(prescription._id);
                        setAmendingId("");
                        setPatientId(prescription.patient?._id);
                        setAppointmentId(prescription.appointment?._id);
                        setMedications((prescription.medications || []).map((medicine) => ({ ...medicine, id: medicine._id, durationDays: String(medicine.durationDays || "") })));
                        setDiagnosis(prescription.diagnosis || "");
                        setNotes(prescription.notes || "");
                        setFollowUpDate(prescription.followUpDate ? isoToLocalDateTime(prescription.followUpDate, timezone) : "");
                      }} className="mt-2 text-xs font-semibold text-indigo-700">Edit draft</button>
                    ) : (
                      <div className="mt-2 flex gap-2">
                        <button type="button" onClick={() => exportPdf(prescription)} className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700"><Download size={13} />PDF</button>
                        <button type="button" onClick={() => selectAmendment(prescription)} className="text-xs font-semibold text-amber-700">Amend</button>
                      </div>
                    )}
                    {prescription.amendmentHistory?.length > 0 && <p className="mt-1 text-xs text-slate-500">{prescription.amendmentHistory.length} retained amendment(s)</p>}
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
