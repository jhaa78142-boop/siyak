import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud, FileText, ScanLine, Loader2, CheckCircle2, AlertTriangle,
  Image as ImageIcon, Download, Info, Sparkles, ShieldCheck, MessageCircle, X,
} from "lucide-react";
import {
  PageStack, Reveal, HeroBand, SectionCard, ListRow, Toolbar, PageHeader,
  Chip, PremiumButton, SegmentedControl, Skeleton, EmptyState, ErrorState,
  IconButton, IconTile, useIsLowEnd, easePremium, ConsentPrompt,
} from "../../components/premium";
import ShareReportDrawer from "../../components/patient/ShareReportDrawer";
import { api } from "../../lib/api";
import { exportReportSummaryPdf } from "../../lib/pdfExport";
import { useAuth } from "../../lib/AuthContext";

const STEPS = [
  { key: "uploading", label: "Uploading", icon: UploadCloud },
  { key: "reading", label: "Reading text", icon: FileText },
  { key: "analyzing", label: "Analyzing", icon: ScanLine },
  { key: "done", label: "Done", icon: CheckCircle2 },
];

const MODE_OPTIONS = [
  { value: "report", label: "Lab Report / Prescription", icon: FileText },
  { value: "image", label: "X-Ray / MRI Scan", icon: ImageIcon },
];

const KIND_OPTIONS = [
  { value: "Lab", label: "Lab report" },
  { value: "Prescription", label: "Prescription" },
];

const IMAGING_OPTIONS = [
  { value: "xray", label: "X-ray" },
  { value: "mri", label: "MRI" },
];

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

/* ── Premium stepper rail ──────────────────────────────── */

function StepRail({ uploadStep, currentStepIndex, getStepIndex }) {
  return (
    <ol className="flex items-center w-full mb-5" aria-label="Analysis progress">
      {STEPS.map((step, i) => {
        const isComplete = currentStepIndex > getStepIndex(step.key) || uploadStep === "done";
        const isActive = uploadStep === step.key && uploadStep !== "done";
        const Icon = step.icon;

        return (
          <li key={step.key} className={`flex items-center ${i < STEPS.length - 1 ? "flex-1" : ""}`}>
            <div className="flex flex-col items-center gap-2 shrink-0">
              <motion.span
                initial={false}
                animate={{ scale: isActive ? 1.06 : 1 }}
                transition={{ duration: 0.35, ease: easePremium }}
                aria-current={isActive ? "step" : undefined}
                className={[
                  "relative flex items-center justify-center h-10 w-10 rounded-full border text-sm font-semibold transition-colors duration-300",
                  isComplete
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : isActive
                      ? "bg-gradient-to-br from-teal-500 to-cyan-600 border-transparent text-white shadow-lg shadow-teal-600/25"
                      : "bg-[var(--mm-surface)] border-[var(--mm-border)] text-[var(--mm-muted)]",
                ].join(" ")}
              >
                {isActive && (
                  <span
                    className="absolute inset-0 rounded-full bg-[var(--mm-accent-soft)] animate-ping opacity-60"
                    aria-hidden
                  />
                )}
                <span className="relative z-[1]">
                  {isComplete ? <CheckCircle2 size={17} /> : isActive ? <Loader2 size={17} className="animate-spin" /> : <Icon size={16} />}
                </span>
              </motion.span>
              <span
                className={`text-[10px] font-semibold tracking-wide whitespace-nowrap ${
                  isComplete ? "text-emerald-600" : isActive ? "text-[var(--mm-accent-deep)]" : "text-[var(--mm-muted)]"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="relative h-0.5 flex-1 mx-2 mb-5 rounded-full bg-[var(--mm-border)] overflow-hidden">
                <motion.span
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-500"
                  initial={false}
                  animate={{ width: isComplete ? "100%" : "0%" }}
                  transition={{ duration: 0.5, ease: easePremium }}
                />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ── Animated scanning panel ───────────────────────────── */

function ScanningPanel() {
  const lowEnd = useIsLowEnd();
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--mm-border)] bg-[var(--mm-surface)] p-5 space-y-3">
      {!lowEnd && (
        <motion.span
          className="pointer-events-none absolute inset-x-0 h-28"
          style={{
            background:
              "linear-gradient(180deg, transparent, color-mix(in srgb, var(--mm-accent) 24%, transparent), transparent)",
          }}
          initial={{ top: "-30%" }}
          animate={{ top: "115%" }}
          transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        />
      )}
      <div className="relative flex items-center gap-2.5 text-[var(--mm-accent-deep)]">
        <ScanLine size={18} className="animate-pulse" />
        <p className="text-sm font-semibold">Scanning your document…</p>
      </div>
      <div className="relative space-y-2.5">
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-5/6" />
        <Skeleton className="h-3.5 w-1/2" />
        <Skeleton className="h-20 w-full" />
      </div>
      <p className="relative text-xs text-[var(--mm-muted)]">Extracting values, medicines and findings — this only takes a moment.</p>
    </div>
  );
}

export default function ReportAnalyzer() {
  const [mode, setMode] = useState("report"); // report | image
  const [docKind, setDocKind] = useState("Lab"); // Lab | Prescription
  const [imagingType, setImagingType] = useState("xray");
  const [status, setStatus] = useState("idle");
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadStep, setUploadStep] = useState(null);
  const [pastReports, setPastReports] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [selectedForShare, setSelectedForShare] = useState(null);
  const [showConsentPrompt, setShowConsentPrompt] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const uploadStartTs = useRef(null);
  const inputRef = useRef(null);
  const { profile } = useAuth();

  const loadPastReports = async () => {
    try {
      const res = await api.get("/ai/reports");
      const list = Array.isArray(res?.data) ? res.data : [];
      setPastReports(
        list.slice(0, 5).map((r) => ({
          id: r._id,
          name: r.fileName || "Document",
          type: r.reportType || "Lab",
          status: r.reportType === "Imaging"
            ? r.imaging?.status === "done" ? "Screened" : "Unavailable"
            : r.analysis?.status === "done" ? "Analyzed" : r.analysis?.status || "Pending",
          flag: r.analysis?.status === "failed" || (r.reportType === "Imaging" && r.imaging?.status !== "done")
            ? "warn"
            : r.analysis?.flags?.length ? "warn" : "good",
        }))
      );
    } catch {
      /* keep empty */
    }
  };

  useEffect(() => {
    loadPastReports();
  }, []);

  const scheduleStepTransitions = () => {
    const now = Date.now();
    const elapsedSinceStart = now - (uploadStartTs.current || now);
    const delayUntilReading = Math.max(150 - elapsedSinceStart, 0);

    setTimeout(() => {
      setUploadStep((prev) => {
        if (prev === "uploading") {
          setTimeout(() => {
            setUploadStep((prev2) => {
              if (prev2 === "reading") return "analyzing";
              return prev2;
            });
          }, 300);
          return "reading";
        }
        return prev;
      });
    }, delayUntilReading);
  };

  const handleFile = (file) => {
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      setError("The document must be 15 MB or smaller.");
      setStatus("error");
      return;
    }
    const extension = `.${(file.name.split(".").pop() || "").toLowerCase()}`;
    const imageExtensions = [".png", ".jpg", ".jpeg", ".webp"];
    const allowedExtensions = mode === "image" ? imageExtensions : [".pdf", ...imageExtensions];
    if (!allowedExtensions.includes(extension)) {
      setError(mode === "image"
        ? "Upload an X-ray or MRI image in PNG, JPG, or WEBP format."
        : "Upload a PDF, PNG, JPG, or WEBP report.");
      setStatus("error");
      return;
    }
    setError("");
    setStatus("idle");
    setPendingFile(file);
    setIsConsentOpen(true);
  };

  const processUpload = async (file) => {
    if (!file) return;
    setError("");
    setReport(null);
    setStatus("uploading");
    setUploadStep("uploading");
    uploadStartTs.current = Date.now();
    scheduleStepTransitions();

    if (file.type.startsWith("image/")) setPreviewUrl(URL.createObjectURL(file));
    else setPreviewUrl("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("reportType", mode === "image" ? "Imaging" : docKind);
    if (mode === "image") formData.append("reportSubType", imagingType);

    try {
      setStatus("analyzing");
      const response = await api.upload("/ai/reports", formData);
      setReport(response?.data || null);
      setStatus("done");
      setUploadStep("done");
      setShowConsentPrompt(true);
      loadPastReports();
    } catch (requestError) {
      setError(requestError.message || "Upload failed. Please try again.");
      setStatus("error");
    }
  };

  const onConsentAccept = () => {
    setIsConsentOpen(false);
    if (pendingFile) {
      processUpload(pendingFile);
      setPendingFile(null);
    }
  };

  const onConsentCancel = () => {
    setIsConsentOpen(false);
    setPendingFile(null);
  };

  const onDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    handleFile(event.dataTransfer.files?.[0]);
  };

  const resetToIdle = () => {
    setStatus("idle");
    setReport(null);
    setError("");
    setUploadStep(null);
  };

  const switchMode = (next) => {
    setMode(next);
    resetToIdle();
  };

  const isLoading = status === "uploading" || status === "analyzing";

  const getStepIndex = (key) => STEPS.findIndex((s) => s.key === key);
  const currentStepIndex = uploadStep ? getStepIndex(uploadStep) : -1;

  const getBannerText = () => {
    if (mode === "image") {
      return "This is an automated image-classification result, not a medical reading or diagnosis. A radiologist must review the scan.";
    }
    if (report?.analysis?.plainLanguage) return report.analysis.plainLanguage;
    const flags = report?.analysis?.flags;
    if (flags?.length > 0) {
      return "Flagged items need attention — please discuss these findings with your doctor.";
    }
    return report?.analysis?.summary || report?.analysis?.aiSummary || "";
  };

  const findingStatusTone = (status) => {
    if (status === "high" || status === "abnormal") return "warn";
    if (status === "low") return "warn";
    if (status === "normal") return "good";
    return "neutral";
  };

  const exportPdf = () => {
    try {
      exportReportSummaryPdf({
        patientName: profile?.fullName || profile?.name || "Patient",
        fileName: report.fileName,
        analysis: report.analysis,
        imaging: report.imaging,
        createdAt: report.createdAt || new Date().toISOString(),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const openShare = (r) => {
    setSelectedForShare(r);
    setShareOpen(true);
  };

  return (
    <PageStack>
      <ConsentPrompt
        open={isConsentOpen}
        onAccept={onConsentAccept}
        onCancel={onConsentCancel}
        fileName={pendingFile?.name}
      />
      <ShareReportDrawer
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        report={selectedForShare}
      />
      {/* Page header */}
      <Reveal index={0}>
        <PageHeader
          eyebrow="OCR + AI extraction"
          title="Report & Image Analyzer"
          description="Upload lab reports, prescriptions, or scans — MediMind AI extracts values, medicines, and explains the findings."
        />
      </Reveal>

      {/* Hero showcase */}
      <Reveal index={1}>
        <HeroBand
          kicker="Understand every result"
          title={
            <>
              Turn dense reports into <span>plain, calm clarity.</span>
            </>
          }
          copy="Drop a lab report, prescription, or scan and MediMind reads, flags, and translates it — quietly stored for your records."
          cta={
            <PremiumButton role="patient" icon={UploadCloud} onClick={() => inputRef.current?.click()}>
              Upload a document
            </PremiumButton>
          }
          right={
            <div className="flex flex-col gap-2 text-sm text-white/80">
              <span className="flex items-center gap-2"><ShieldCheck size={15} /> Private by design</span>
              <span className="flex items-center gap-2"><Sparkles size={15} /> Instant AI summary</span>
            </div>
          }
        />
      </Reveal>

      {/* Upload + findings */}
      <Reveal index={2} className="w-full">
        <div className="grid w-full gap-6 lg:grid-cols-12">
          {/* Upload column */}
          <div className="lg:col-span-5">
            <SectionCard icon={UploadCloud} title="Upload" subtitle="Lab report, prescription, or scan image">
              <div className="space-y-4">
                <Toolbar>
                  <SegmentedControl options={MODE_OPTIONS} value={mode} onChange={switchMode} />
                </Toolbar>

                {mode === "report" && (
                  <SegmentedControl options={KIND_OPTIONS} value={docKind} onChange={setDocKind} />
                )}
                {mode === "image" && (
                  <label className="block text-sm font-medium text-[var(--mm-ink)]">
                    Scan type
                    <select
                      value={imagingType}
                      onChange={(event) => setImagingType(event.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-[var(--mm-border)] bg-[var(--mm-surface)] px-3 py-2.5 text-sm"
                    >
                      {IMAGING_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                    <span className="mt-1 block text-xs font-normal text-[var(--mm-muted)]">
                      The selected type chooses the screening model; it does not produce a diagnosis.
                    </span>
                  </label>
                )}

                <input
                  ref={inputRef}
                  id="report-document-file"
                  type="file"
                  className="sr-only"
                  accept={mode === "image" ? ".png,.jpg,.jpeg,.webp" : ".pdf,.png,.jpg,.jpeg,.webp"}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    handleFile(file);
                  }}
                />
                <label
                  htmlFor="report-document-file"
                  onDragOver={(event) => {
                    event.preventDefault();
                    if (status === "idle") setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={onDrop}
                  className={[
                    "group relative overflow-hidden rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center py-12 px-4 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mm-accent)]",
                    status === "idle"
                      ? "border-[color-mix(in_srgb,var(--mm-accent)_45%,transparent)] bg-[var(--mm-accent-soft)] cursor-pointer"
                      : "border-[var(--mm-border)] bg-[rgba(15,23,42,0.02)]",
                    dragActive ? "scale-[1.01] shadow-[0_0_0_4px_var(--mm-accent-soft)]" : "",
                  ].join(" ")}
                >
                  <span
                    className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: "radial-gradient(320px circle at 50% 0%, var(--mm-accent-soft), transparent 70%)" }}
                    aria-hidden
                  />
                  {isLoading ? (
                    <div className="relative flex flex-col items-center">
                      <Loader2 size={30} className="animate-spin text-[var(--mm-accent)] mb-3" />
                      <p className="text-sm font-semibold text-[var(--mm-ink)]">Processing your document…</p>
                      <p className="text-xs text-[var(--mm-muted)] mt-1">Hang tight, this is quick.</p>
                    </div>
                  ) : (
                    <div className="relative flex flex-col items-center">
                      <span className="mm-metric-icon mb-3" style={{ width: "3rem", height: "3rem", borderRadius: "0.9rem" }}>
                        <UploadCloud size={22} strokeWidth={2} />
                      </span>
                      <p className="text-sm font-semibold text-[var(--mm-ink)]">
                        Click to upload {mode === "report" ? "a report (PDF/JPG)" : "a scan image"}
                      </p>
                      <p className="text-xs text-[var(--mm-muted)] mt-1">or drag and drop — max 15MB</p>
                    </div>
                  )}
                </label>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[var(--mm-muted)] uppercase tracking-wide">Recent uploads</p>
                  {pastReports.length === 0 ? (
                    <p className="text-xs text-[var(--mm-muted)]">No uploads yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {pastReports.map((r) => (
                      <ListRow
                        key={r.id}
                        leading={<IconTile icon={FileText} size={14} />}
                        title={r.name}
                        meta={r.type}
                        trailing={
                          <div className="flex items-center gap-2">
                            <Chip tone={r.flag}>{r.status}</Chip>
                            <IconButton
                              icon={ShieldCheck}
                              label="Share"
                              size="sm"
                              onClick={() => openShare(r)}
                            />
                          </div>
                        }
                      />
                    ))}
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Findings column */}
          <div className="lg:col-span-7">
            <SectionCard
            icon={ScanLine}
            title="AI Findings"
            subtitle="Structured extraction and plain-language explanation"
            action={
              status === "done" && report != null ? (
                <div className="flex items-center gap-2">
                  <PremiumButton size="sm" variant="outline" icon={ShieldCheck} onClick={() => openShare(report)} magnetic={false}>
                    Share
                  </PremiumButton>
                  <PremiumButton size="sm" variant="outline" icon={Download} onClick={exportPdf} magnetic={false}>
                    Export PDF
                  </PremiumButton>
                </div>
              ) : null
            }
          >
            {uploadStep != null && (
              <StepRail uploadStep={uploadStep} currentStepIndex={currentStepIndex} getStepIndex={getStepIndex} />
            )}

            <AnimatePresence mode="wait">
              {showConsentPrompt && status === "done" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-5 overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-4 rounded-2xl border border-teal-200 bg-teal-50/80 p-4 dark:border-teal-500/30 dark:bg-teal-500/10">
                    <div className="flex items-start gap-3">
                      <ShieldCheck size={18} className="mt-0.5 text-teal-600 dark:text-teal-400" />
                      <div>
                        <p className="text-sm font-semibold text-teal-900 dark:text-teal-200">Share with your doctor?</p>
                        <p className="mt-0.5 text-xs text-teal-700 dark:text-teal-300/80">You can securely grant temporary access to this report for your next consultation.</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <PremiumButton size="sm" onClick={() => { openShare(report); setShowConsentPrompt(false); }}>Share now</PremiumButton>
                      <IconButton icon={X} size="sm" onClick={() => setShowConsentPrompt(false)} label="Dismiss" />
                    </div>
                  </div>
                </motion.div>
              )}

              {status === "idle" && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <EmptyState
                    icon={ScanLine}
                    title="No findings yet"
                    detail="Upload a document to see structured AI findings here — extracted markers, medicines, and a plain-language summary."
                    actionLabel="Upload a document"
                    onAction={() => inputRef.current?.click()}
                  />
                </motion.div>
              )}

              {isLoading && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ScanningPanel />
                </motion.div>
              )}

              {status === "done" && mode === "report" && (
                <motion.div key="done-report" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                  {/* Plain-language banner */}
                  <div className="relative overflow-hidden rounded-2xl border border-[var(--mm-border)] bg-[var(--mm-accent-soft)] p-[1.15rem]">
                    <div className="flex items-start gap-3">
                      <span className="mm-metric-icon shrink-0" style={{ width: "2.3rem", height: "2.3rem" }}>
                        <Info size={17} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--mm-ink)]">What this means for you</p>
                        <p className="text-sm text-[var(--mm-muted)] mt-1.5 leading-relaxed">{getBannerText()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Summary + meta */}
                  <div className="rounded-2xl border border-[var(--mm-border)] bg-[rgba(15,23,42,0.02)] dark:bg-white/[0.02] p-4 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-[var(--mm-ink)]">{report?.fileName || "Report uploaded"}</p>
                      <Chip tone="info">{report?.analysis?.documentKind || report?.reportType || docKind}</Chip>
                    </div>
                    {report?.analysis?.status === "failed" && (
                      <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                        {report.analysis.error || "Text could not be extracted reliably. Try a clearer image or searchable PDF."}
                      </p>
                    )}
                    <p className="text-sm text-[var(--mm-muted)]">{report?.analysis?.summary || "No summary was generated."}</p>
                    {(report?.analysis?.meta?.patientName || report?.analysis?.meta?.reportDate || report?.analysis?.meta?.facility || report?.analysis?.meta?.doctorName) && (
                      <div className="grid sm:grid-cols-2 gap-2 pt-2 text-xs text-[var(--mm-muted)]">
                        {report.analysis.meta.patientName && <p><span className="font-semibold text-[var(--mm-ink)]">Patient:</span> {report.analysis.meta.patientName}</p>}
                        {report.analysis.meta.reportDate && <p><span className="font-semibold text-[var(--mm-ink)]">Date:</span> {report.analysis.meta.reportDate}</p>}
                        {report.analysis.meta.facility && <p><span className="font-semibold text-[var(--mm-ink)]">Facility:</span> {report.analysis.meta.facility}</p>}
                        {report.analysis.meta.doctorName && <p><span className="font-semibold text-[var(--mm-ink)]">Doctor:</span> {report.analysis.meta.doctorName}</p>}
                      </div>
                    )}
                  </div>

                  {/* Extracted markers */}
                  {!!report?.analysis?.findings?.length && (
                    <div>
                      <p className="text-xs font-semibold text-[var(--mm-muted)] uppercase tracking-wide mb-2.5">Lab markers</p>
                      <div className="space-y-2">
                        {report.analysis.findings.map((f, index) => (
                          <ListRow
                            key={`${f.name}-${index}`}
                            title={f.name}
                            meta={`${[f.value, f.unit].filter(Boolean).join(" ")}${f.referenceRange ? ` · Ref ${f.referenceRange}` : ""}`}
                            trailing={<Chip tone={findingStatusTone(f.status)}>{f.status || "unknown"}</Chip>}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Medications */}
                  {!!report?.analysis?.medications?.length && (
                    <div>
                      <p className="text-xs font-semibold text-[var(--mm-muted)] uppercase tracking-wide mb-2.5">Medications</p>
                      <div className="space-y-2">
                        {report.analysis.medications.map((m, index) => (
                          <ListRow
                            key={`${m.name}-${index}`}
                            leading={<IconTile icon={FileText} size={14} />}
                            title={m.name}
                            meta={[m.dose, m.frequency, m.duration].filter(Boolean).join(" · ")}
                            trailing={m.instructions ? <span className="text-xs text-[var(--mm-muted)] max-w-[40%] text-right">{m.instructions}</span> : null}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Flags */}
                  {!!report?.analysis?.flags?.length && (
                    <div className="space-y-2">
                      {report.analysis.flags.map((flag, index) => (
                        <div
                          key={`${flag.label}-${index}`}
                          className="rounded-2xl border border-amber-200/70 bg-amber-50/70 dark:border-amber-500/20 dark:bg-amber-500/10 p-4 flex gap-3"
                        >
                          <AlertTriangle size={17} className="text-amber-600 shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">{flag.label}</p>
                            <p className="text-xs text-amber-700 dark:text-amber-400/90 mt-1">{flag.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Raw OCR text */}
                  {report?.analysis?.rawExtractedText && (
                    <details className="rounded-2xl border border-[var(--mm-border)] bg-[rgba(15,23,42,0.02)] dark:bg-white/[0.02] p-4">
                      <summary className="text-xs font-semibold text-[var(--mm-muted)] cursor-pointer flex flex-wrap items-center gap-2">
                        Extracted text (OCR)
                        {report.analysis.ocrConfidence != null && (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              report.analysis.ocrConfidence >= 80
                                ? "bg-emerald-100 text-emerald-700"
                                : report.analysis.ocrConfidence >= 55
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {report.analysis.ocrConfidence}% confidence
                          </span>
                        )}
                        {report.analysis.ocrSource && (
                          <span className="text-[10px] text-[var(--mm-muted)] font-normal">
                            via{" "}
                            {report.analysis.ocrSource === "pdf-text-layer"
                              ? "PDF text layer"
                              : report.analysis.ocrSource === "pdf-ocr"
                                ? "PDF → image → OCR"
                                : report.analysis.ocrSource === "image-ocr"
                                  ? "image OCR"
                                  : report.analysis.ocrSource}
                          </span>
                        )}
                      </summary>
                      <p className="text-xs text-[var(--mm-muted)] mt-2 whitespace-pre-wrap">{report.analysis.rawExtractedText}</p>
                    </details>
                  )}

                  <Chip tone="info">
                    {report?.analysis?.disclaimer || "Informational only — not a medical diagnosis. Confirm with a clinician."}
                  </Chip>
                </motion.div>
              )}

              {status === "done" && mode === "image" && (
                <motion.div key="done-image" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                  <div className="relative overflow-hidden rounded-2xl border border-[var(--mm-border)] bg-[var(--mm-accent-soft)] p-[1.15rem]">
                    <div className="flex items-start gap-3">
                      <span className="mm-metric-icon shrink-0" style={{ width: "2.3rem", height: "2.3rem" }}>
                        <Info size={17} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--mm-ink)]">What this means for you</p>
                        <p className="text-sm text-[var(--mm-muted)] mt-1.5 leading-relaxed">{getBannerText()}</p>
                      </div>
                    </div>
                  </div>

                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Uploaded medical scan"
                      className="rounded-2xl w-full h-52 object-contain bg-[rgba(15,23,42,0.04)] border border-[var(--mm-border)]"
                    />
                  )}

                  <div
                    className={`flex items-center gap-2.5 rounded-2xl px-4 py-3 border ${
                      report?.imaging?.status === "done"
                        ? "bg-emerald-50/70 text-emerald-700 border-emerald-200/70 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                        : "bg-amber-50/70 text-amber-800 border-amber-200/70 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                    }`}
                  >
                    {report?.imaging?.status === "done" ? <CheckCircle2 size={17} /> : <AlertTriangle size={17} />}
                    <p className="text-sm font-semibold">
                      {report?.imaging?.status === "done"
                        ? `${report?.imaging?.subType === "mri" ? "MRI" : "X-ray"} model label: ${report.imaging.label}`
                        : report?.imaging?.message || "Imaging analysis is unavailable."}
                    </p>
                  </div>

                  {report?.imaging?.confidence != null && (
                    <p className="text-xs text-[var(--mm-muted)]">Confidence: {(report.imaging.confidence * 100).toFixed(1)}%</p>
                  )}

                  <p className="text-xs text-[var(--mm-muted)] leading-relaxed">
                    {report?.imaging?.disclaimer || "Automated screening only. A radiologist or physician must confirm any result."}
                  </p>
                </motion.div>
              )}

              {status === "error" && (
                <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ErrorState
                    title="Upload failed"
                    detail={error}
                    onRetry={() => {
                      setReport(null);
                      setError("");
                      setStatus("idle");
                      setUploadStep(null);
                      inputRef.current?.click();
                    }}
                  />
                  <div className="flex flex-col sm:flex-row gap-3 justify-center -mt-6">
                    <PremiumButton
                      variant="outline"
                      size="sm"
                      icon={MessageCircle}
                      magnetic={false}
                      onClick={() => {
                        window.location.href = "mailto:support@medimind.ai?subject=Report%20Analyzer%20Issue";
                      }}
                    >
                      Contact support
                    </PremiumButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Medical disclaimer */}
            <p className="text-[11px] text-[var(--mm-muted)] mt-5 leading-relaxed">
              MediMind AI provides informational analysis only — it is not a medical diagnosis. Always confirm results with a licensed clinician.
            </p>
          </SectionCard>
        </div>
      </div>
    </Reveal>
  </PageStack>
  );
}
