import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  Upload,
  X,
} from "lucide-react";
import SectionHeader from "../../components/SectionHeader";
import { api } from "../../lib/api";
import { useToast } from "../../components/Toast";

const STATUSES = ["PENDING", "APPROVED", "PROCESSING", "INDEXED", "REJECTED", "FAILED"];
const CATEGORIES = [
  "General medicine",
  "Cardiology",
  "Endocrinology",
  "Infectious disease",
  "Neurology",
  "Oncology",
  "Pediatrics",
  "Mental health",
  "Public health",
  "Other",
];
const INITIAL_FORM = {
  title: "",
  sourceOrganization: "",
  sourceUrl: "",
  category: "",
  language: "",
  version: "",
  publicationDate: "",
  description: "",
  file: null,
};

const STATUS_TONES = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  APPROVED: "bg-sky-50 text-sky-700 ring-sky-200",
  PROCESSING: "bg-violet-50 text-violet-700 ring-violet-200",
  INDEXED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 ring-rose-200",
  FAILED: "bg-red-50 text-red-700 ring-red-200",
};

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
}

function processingMessage(doc) {
  const completed = Number(doc.processingCompleted) || 0;
  const total = Number(doc.processingTotal) || 0;
  const count = total ? ` (${completed.toLocaleString()} / ${total.toLocaleString()})` : "";
  switch (doc.processingStage) {
    case "downloading":
      return "Downloading the private PDF…";
    case "extracting":
      return "Extracting text from the PDF…";
    case "ocr":
      return `${doc.processingPass === 2 ? "Retrying OCR" : "Reading scanned pages"}${count}…`;
    case "chunking":
      return `Reading PDF pages and creating text chunks${count}…`;
    case "embedding":
      return completed === 0
        ? `Loading the embedding model; ${total.toLocaleString()} chunks queued…`
        : `Generating embeddings${count}…`;
    case "indexing":
      return `Saving chunks and updating search index${count}…`;
    default:
      return doc.status === "APPROVED" ? "Queued for processing…" : "Preparing document…";
  }
}

function minutesSinceProgress(doc) {
  const updatedAt = new Date(doc.processingUpdatedAt || doc.updatedAt).getTime();
  return Number.isFinite(updatedAt) ? Math.floor((Date.now() - updatedAt) / 60000) : 0;
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${STATUS_TONES[status] || "bg-slate-50 text-slate-600 ring-slate-200"}`}>
      {status || "UNKNOWN"}
    </span>
  );
}

function Metadata({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm text-slate-700">{value || "—"}</p>
    </div>
  );
}

function DocumentDetails({ doc }) {
  return (
    <div className="mt-4 grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
      <Metadata label="Original filename" value={doc.originalFilename} />
      <Metadata label="Source organization" value={doc.sourceOrganization} />
      <Metadata label="Source URL" value={doc.sourceUrl ? <a className="text-violet-700 underline break-all" href={doc.sourceUrl} target="_blank" rel="noreferrer">{doc.sourceUrl}</a> : "—"} />
      <Metadata label="Language" value={doc.language} />
      <Metadata label="Version" value={doc.version} />
      <Metadata label="Publication date" value={formatDate(doc.publicationDate)} />
      <Metadata label="Uploaded" value={formatDate(doc.createdAt)} />
      <Metadata label="File size" value={Number.isFinite(doc.fileSize) ? `${(doc.fileSize / (1024 * 1024)).toFixed(2)} MB` : "—"} />
      {doc.description && <Metadata label="Description" value={doc.description} />}
      {doc.reviewedAt && <Metadata label="Reviewed" value={formatDate(doc.reviewedAt)} />}
      {doc.indexedAt && <Metadata label="Indexed" value={formatDate(doc.indexedAt)} />}
      {doc.searchBackend && <Metadata label="Search index" value={doc.searchBackend === "mongodb" ? "MongoDB text fallback" : "Chroma vector search"} />}
      {doc.rejectionReason && <Metadata label="Rejection reason" value={doc.rejectionReason} />}
      {doc.processingError && (
        <div className="sm:col-span-2 lg:col-span-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-red-500">Processing error</p>
          <p className="mt-1 text-sm text-red-700">{doc.processingError}</p>
        </div>
      )}
    </div>
  );
}

function UploadForm({ onClose, onUploaded }) {
  const { toast } = useToast();
  const [form, setForm] = useState(INITIAL_FORM);
  const [uploading, setUploading] = useState(false);
  const [fileError, setFileError] = useState("");

  const setField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setFileError("");
    if (!form.file) {
      setFileError("Choose a medical PDF to upload.");
      return;
    }
    if (form.file.size > 15 * 1024 * 1024) {
      setFileError("The PDF must be 15 MB or smaller.");
      return;
    }

    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "file") {
        body.append("file", value);
      } else if (value) {
        body.append(key, value);
      }
    });

    setUploading(true);
    try {
      const { data } = await api.upload("/rag-documents/upload", body);
      if (!data?._id || data.status !== "PENDING") {
        throw new Error("The server returned an invalid upload response.");
      }
      onUploaded(data);
      toast("Medical document uploaded and pending review.", { tone: "success" });
      onClose();
    } catch (error) {
      toast(error.message || "Upload failed.", { tone: "error", duration: 5000 });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card-shell mb-6 p-5 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-ink">Upload trusted medical PDF</p>
          <p className="mt-1 text-sm text-slate-500">Documents remain out of the chatbot index until you approve them.</p>
        </div>
        <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close upload form">
          <X size={18} />
        </button>
      </div>

      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Document title *
          <input required maxLength={200} value={form.title} onChange={setField("title")} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Source organization / publisher *
          <input required maxLength={200} value={form.sourceOrganization} onChange={setField("sourceOrganization")} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Source URL
          <input type="url" value={form.sourceUrl} onChange={setField("sourceUrl")} placeholder="https://" className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Medical category *
          <select required value={form.category} onChange={setField("category")} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100">
            <option value="">Select category</option>
            {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Language *
          <input required maxLength={60} value={form.language} onChange={setField("language")} placeholder="e.g. English" className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Version
          <input maxLength={100} value={form.version} onChange={setField("version")} placeholder="Edition or guideline version" className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Publication date
          <input type="date" value={form.publicationDate} onChange={setField("publicationDate")} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
        </label>
        <label className="text-sm font-medium text-slate-700">
          PDF file * <span className="font-normal text-slate-400">(max 15 MB)</span>
          <input
            required
            type="file"
            accept="application/pdf,.pdf"
            onChange={(event) => setForm((current) => ({ ...current, file: event.target.files?.[0] || null }))}
            className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-violet-50 file:px-3 file:py-2 file:font-semibold file:text-violet-700"
          />
        </label>
        <label className="text-sm font-medium text-slate-700 sm:col-span-2">
          Optional description
          <textarea rows={3} maxLength={1000} value={form.description} onChange={setField("description")} className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
        </label>
        {fileError && <p className="text-sm text-red-600 sm:col-span-2" role="alert">{fileError}</p>}
        <div className="flex flex-wrap items-center justify-end gap-3 sm:col-span-2">
          <button type="button" onClick={onClose} disabled={uploading} className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50">Cancel</button>
          <button type="submit" disabled={uploading} className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-700/20 hover:bg-violet-700 disabled:opacity-60">
            {uploading ? <LoaderCircle size={16} className="animate-spin" /> : <Upload size={16} />}
            {uploading ? "Uploading…" : "Upload for review"}
          </button>
        </div>
      </form>
    </div>
  );
}

function RejectDialog({ doc, reason, setReason, onCancel, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" role="presentation">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="reject-title">
        <h2 id="reject-title" className="text-lg font-semibold text-ink">Reject this document?</h2>
        <p className="mt-2 text-sm text-slate-500">{doc.title} will not be available to chatbot retrieval.</p>
        <label className="mt-5 block text-sm font-medium text-slate-700">
          Reason <span className="font-normal text-slate-400">(optional)</span>
          <textarea rows={3} maxLength={1000} value={reason} onChange={(event) => setReason(event.target.value)} className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
        </label>
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onCancel} disabled={loading} className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
          <button type="button" onClick={onConfirm} disabled={loading} className="rounded-full bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60">{loading ? "Rejecting…" : "Confirm rejection"}</button>
        </div>
      </div>
    </div>
  );
}

export default function KnowledgeBase() {
  const { toast } = useToast();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [expandedId, setExpandedId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [actionId, setActionId] = useState("");
  const [rejecting, setRejecting] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const loadDocs = useCallback(async (quiet = false) => {
    if (quiet) setRefreshing(true);
    else setLoading(true);
    try {
      const { data } = await api.get("/rag-documents");
      if (!Array.isArray(data)) throw new Error("The server returned an invalid document list.");
      setDocs(data);
    } catch (error) {
      if (quiet) console.warn("[MedicalKnowledgeBase] refresh failed:", error.message);
      else toast(error.message || "Could not load medical documents.", { tone: "error", duration: 5000 });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  useEffect(() => {
    if (!docs.some((doc) => ["APPROVED", "PROCESSING"].includes(doc.status))) return undefined;
    const timer = window.setInterval(() => loadDocs(true), 3000);
    return () => window.clearInterval(timer);
  }, [docs, loadDocs]);

  const visibleDocs = useMemo(() => docs.filter((doc) => {
    const matchesStatus = statusFilter === "ALL" || doc.status === statusFilter;
    const matchesCategory = categoryFilter === "ALL" || doc.category === categoryFilter;
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || [
      doc.title,
      doc.sourceOrganization,
      doc.originalFilename,
      doc.category,
    ].some((value) => String(value || "").toLowerCase().includes(term));
    return matchesStatus && matchesCategory && matchesSearch;
  }), [docs, search, statusFilter, categoryFilter]);

  const updateDocument = async (doc, action, payload = {}) => {
    setActionId(doc._id);
    try {
      const { data } = action === "retry"
        ? await api.post(`/rag-documents/${doc._id}/retry`, {})
        : await api.patch(`/rag-documents/${doc._id}/${action}`, payload);
      setDocs((current) => current.map((item) => item._id === data._id ? data : item));
      toast(
        action === "approve" ? "Document approved. Indexing has started."
          : action === "reject" ? "Document rejected."
            : "Reindex accepted. Indexing has restarted.",
        { tone: "success" }
      );
      if (action === "reject") {
        setRejecting(null);
        setRejectionReason("");
      }
      loadDocs(true);
    } catch (error) {
      toast(error.message || `Could not ${action} document.`, { tone: "error", duration: 5000 });
    } finally {
      setActionId("");
    }
  };

  const openRejectDialog = (doc) => {
    setRejecting(doc);
    setRejectionReason("");
  };

  const categories = useMemo(
    () => [...new Set(docs.map((doc) => doc.category).filter(Boolean))].sort(),
    [docs]
  );

  return (
    <div className="pb-8">
      <SectionHeader
        eyebrow="RAG pipeline"
        title="Medical Knowledge Base"
        description="Review trusted medical references before they become available to MediMind AI."
        action={
          <button type="button" onClick={() => setUploadOpen((value) => !value)} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-700/25">
            <Plus size={16} /> Upload Medical PDF
          </button>
        }
      />

      {uploadOpen && <UploadForm onClose={() => setUploadOpen(false)} onUploaded={(doc) => setDocs((current) => [doc, ...current])} />}

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {[
          ["Total documents", docs.length],
          ["Pending review", docs.filter((doc) => doc.status === "PENDING").length],
          ["Indexed", docs.filter((doc) => doc.status === "INDEXED").length],
        ].map(([label, count]) => (
          <div key={label} className="card-shell p-4 sm:p-5">
            <p className="text-2xl font-display font-semibold text-ink">{count}</p>
            <p className="mt-1 text-xs text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      <div className="card-shell mb-4 p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(180px,1fr)_190px_210px_auto]">
          <label className="relative block">
            <span className="sr-only">Search medical documents</span>
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, publisher…" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
          </label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status" className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-400">
            <option value="ALL">All statuses</option>
            {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} aria-label="Filter by category" className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-400">
            <option value="ALL">All categories</option>
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          <button type="button" onClick={() => loadDocs(true)} disabled={refreshing} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60">
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card-shell flex min-h-48 items-center justify-center gap-3 text-sm text-slate-500">
          <LoaderCircle size={20} className="animate-spin text-violet-600" /> Loading medical documents…
        </div>
      ) : visibleDocs.length === 0 ? (
        <div className="card-shell flex min-h-56 flex-col items-center justify-center px-6 text-center">
          <div className="mb-3 rounded-2xl bg-violet-50 p-3 text-violet-600"><FileText size={22} /></div>
          <p className="font-semibold text-ink">{docs.length ? "No documents match these filters" : "No medical documents yet"}</p>
          <p className="mt-1 max-w-md text-sm text-slate-500">{docs.length ? "Adjust your search or filters to see available documents." : "Upload a trusted medical PDF to begin. It will remain out of retrieval until approved."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleDocs.map((doc) => (
            <article key={doc._id} className="card-shell overflow-hidden p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-0.5 rounded-xl bg-violet-50 p-2.5 text-violet-600"><FileText size={18} /></div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="break-words font-semibold text-ink">{doc.title}</h2>
                      <StatusBadge status={doc.status} />
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{doc.sourceOrganization} <span className="mx-1.5 text-slate-300">·</span> {doc.category} <span className="mx-1.5 text-slate-300">·</span> {doc.language || "Language not set"}</p>
                    <p className="mt-1 text-xs text-slate-400">Uploaded {formatDate(doc.createdAt)} <span className="mx-1.5">·</span> {doc.version || "No version"} <span className="mx-1.5">·</span> {doc.chunks || 0} chunks</p>
                    {(doc.status === "APPROVED" || doc.status === "PROCESSING") && (
                      <div className="mt-2 max-w-md text-xs font-medium text-violet-700" aria-live="polite">
                        <p className="inline-flex items-center gap-1.5">
                          <LoaderCircle size={13} className="animate-spin" />
                          {processingMessage(doc)}
                        </p>
                        {minutesSinceProgress(doc) >= 5 && (
                          <p className="mt-1 text-[11px] font-normal text-amber-700">
                            No new progress reported for {minutesSinceProgress(doc)} minutes. This step may be slow or stalled; check backend logs before retrying.
                          </p>
                        )}
                        {Number(doc.processingTotal) > 0 && (
                          <div
                            className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-violet-100"
                            role="progressbar"
                            aria-label="Document processing progress"
                            aria-valuemin={0}
                            aria-valuemax={doc.processingTotal}
                            aria-valuenow={Math.min(doc.processingCompleted || 0, doc.processingTotal)}
                          >
                            <div
                              className="h-full rounded-full bg-violet-500 transition-[width]"
                              style={{
                                width: `${Math.min(100, Math.round((doc.processingCompleted / doc.processingTotal) * 100))}%`,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                    {doc.status === "FAILED" && (
                      <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-red-600"><AlertCircle size={13} />{doc.processingError || "Processing failed."}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  {doc.status === "PENDING" && (
                    <>
                      <button type="button" disabled={actionId === doc._id} onClick={() => updateDocument(doc, "approve")} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"><Check size={14} /> Approve</button>
                      <button type="button" disabled={actionId === doc._id} onClick={() => openRejectDialog(doc)} className="rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60">Reject</button>
                    </>
                  )}
                  {["FAILED", "INDEXED"].includes(doc.status) && (
                    <button type="button" disabled={actionId === doc._id} onClick={() => updateDocument(doc, "retry")} className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 px-4 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-50 disabled:opacity-60">
                      {actionId === doc._id ? <LoaderCircle size={14} className="animate-spin" /> : <RefreshCw size={14} />} {doc.status === "FAILED" ? "Retry" : "Reindex"}
                    </button>
                  )}
                  <button type="button" onClick={() => setExpandedId((current) => current === doc._id ? "" : doc._id)} aria-expanded={expandedId === doc._id} className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100">
                    Details {expandedId === doc._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>
              {expandedId === doc._id && <DocumentDetails doc={doc} />}
            </article>
          ))}
        </div>
      )}

      {rejecting && (
        <RejectDialog
          doc={rejecting}
          reason={rejectionReason}
          setReason={setRejectionReason}
          onCancel={() => setRejecting(null)}
          onConfirm={() => updateDocument(rejecting, "reject", { reason: rejectionReason })}
          loading={actionId === rejecting._id}
        />
      )}
    </div>
  );
}
