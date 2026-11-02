# MediMind AI — Backend

Node.js/Express + MongoDB API for the MediMind AI frontend. Auth is handled by
Firebase (verified server-side), transactional email by Brevo.

## 1. Install

```bash
cd backend
npm install
```

## 2. Environment variables

Copy `.env.example` to `.env` and provide local service credentials. Double-check
`CLIENT_URL` matches wherever your frontend runs (default
`http://localhost:5173` for Vite).

**Keep `.env` private.** It's already git-ignored. Don't commit it or paste it
into a public repo/issue — rotate the Mongo password and Brevo API key if they
are ever exposed outside this project.
If the ElevenLabs credential previously present in `.env.example` was real,
revoke it with the provider and replace it in your private `.env`.

The Admin Medical Knowledge Base also requires server-only Cloudinary
credentials (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and
`CLOUDINARY_API_SECRET`) for private PDF storage. Set these in `backend/.env`;
never add them to frontend variables. Existing `CHROMA_URL` and
`EMBEDDING_MODEL` configuration is reused for indexing.

### Experimental YouPI checkout (test/demo only)

The Professional pricing card can create a one-time ₹799 UPI checkout through
the separately hosted YouPI PG REST API. This integration uses the documented
merchant API and does not copy or bundle the YouPI repository. Configure
`YOUPI_API_URL`, `YOUPI_MERCHANT_ID`, and `YOUPI_WEBHOOK_SECRET` in the backend
`.env`; register `POST /api/payments/youpi/webhook` as the merchant webhook URL.
The browser return is not proof of payment: the backend marks an order
`RECONCILED` only after verifying the webhook signature, expected amount, UPI
method, and bank-statement reconciliation state.

The YouPI project describes itself as experimental and not production-ready or
bank/NPCI-certified. Use this checkout only for controlled tests/demos; do not
rely on it for production medical-service access or critical payments. A
reconciled order is recorded, but this integration does not grant or enforce a
doctor subscription.

## 3. Firebase Admin service account (required for auth to work)

The Firebase config you gave me (`apiKey`, `authDomain`, etc.) is the **public
web config** — it belongs in the frontend and is safe to expose there. The
backend needs a separate, secret **service account key** to verify login
tokens:

1. Go to the [Firebase Console](https://console.firebase.google.com/) → your
   `medimind-ai-81e65` project → ⚙️ **Project Settings** → **Service accounts**.
2. Click **Generate new private key** → confirm. A JSON file downloads.
3. Save it as `backend/config/serviceAccountKey.json` (this exact path is
   already in `.gitignore`).

Until that file exists, the server still runs — every route that needs login
will return a clear `503` instead of crashing, so you can keep testing
public endpoints (e.g. `GET /api/health`, `GET /api/education`).

## 4. Run it

```bash
npm run dev      # restarts when backend source/config changes, not node_modules
npm start        # plain start
```

Server listens on `http://localhost:5000` by default. Health check:
`GET /api/health`.

## 5. Seed reference data (recommended, run once)

Populates the drug-interaction reference table, a few education articles, and
knowledge-base doc stubs so those pages aren't empty on first run:

```bash
npm run seed
```

## 6. OCR and imaging setup

Non-imaging PDF and image uploads are processed by `services/ocrService.js`.
Born-digital PDFs use their text layer first; scanned PDFs and images use
Tesseract.js. Extracted text is analyzed and indexed through the existing
patient-scoped RAG ingestion path.

Imaging uploads use Hugging Face only when a verified serverless model and
token are configured in `.env`:

```env
HF_API_TOKEN=your-huggingface-token
HF_XRAY_MODEL=verified-xray-model-id
HF_MRI_MODEL=verified-mri-model-id
```

Unconfigured or unavailable models are recorded as `imaging.status=unavailable`
with a clear message; the API does not fabricate a classification. DICOM files
are currently rejected for imaging because raw DICOM pixel conversion is not
enabled.

Run the imaging safety smoke test with an optional sample image:

```bash
npm run test:imaging -- path/to/sample-chest-xray.png
```

## API overview

All routes are under `/api` and (except `/api/health`) require
`Authorization: Bearer <Firebase ID token>`.

| Area | Base path |
|---|---|
| Auth / profile sync | `/api/auth` |
| Appointments | `/api/appointments` |
| Health records (vitals, score, timeline) | `/api/health-records` |
| Medicine reminders | `/api/medicine-reminders` |
| AI features (symptom checker, drug interactions, chat, reports, summaries) | `/api/ai` |
| Prescriptions & follow-ups | `/api/prescriptions` |
| Doctor patient list & schedule | `/api/doctor` |
| Education articles | `/api/education` |
| Feedback | `/api/feedback` |
| Medical knowledge base (admin) | `/api/rag-documents` |
| Admin (stats, users, verification, audit log, early warnings) | `/api/admin` |
| Notifications & preferences | `/api/notifications` |

See the `routes/` folder for the exact endpoint list — each file is short and
maps 1:1 to a frontend page group.

## Doctor module

Doctor identity comes from a verified Firebase ID token. Clinical endpoints
require an active account and an approved doctor verification record; identity,
role, and approval are never accepted from request data. Admin decisions are
separate from a doctor's profile edits. Changes to the doctor's name,
specialization, registration number, issuing authority, or qualifications put
an approved doctor back into pending verification. Suspended doctors cannot
change verified credentials or restore their own access.

Appointments are scoped to the authenticated patient or doctor. Slot
availability is checked against the doctor's IANA timezone, weekly schedule,
breaks, leave dates, and slot duration. A unique database slot-claim index
guards concurrent booking attempts. Booking or rescheduling does not grant
medical-record access.

Doctors only see patients with confirmed, in-progress, or completed
appointment relationships. Report previews, downloads, review, and AI-summary
retrieval additionally require active consent for the exact shared report IDs.
Existing uploaded prescriptions are kept in the private local
`uploads/private-prescriptions` directory and downloaded only through an
authenticated, resource-authorized endpoint. This local disk storage is a
single-instance prototype choice; production deployments need a private,
durable storage adapter and deployment-specific retention/backups.

Consultation notes and doctor-created prescriptions support drafts, explicit
finalization, and retained amendments. Existing-prescription uploads preserve
the original document. Generated prescription PDFs are computer-generated
copies, not legally verified digital signatures. AI summaries are drafts with
source references and require doctor review; no AI output is a confirmed
diagnosis or prescription.

Run the doctor authorization unit tests from `backend/`:

```bash
npm run test:doctor
```

The current tests cover authorization status decisions only. MongoDB/Firebase
integration, true concurrent-booking, file-storage, and end-to-end workflows
still need deployment-backed tests before production use.

### Manual doctor workflow verification

Use synthetic accounts and records only:

1. Register a doctor, submit synthetic verification documents, and confirm the
   pending doctor cannot access clinical routes.
2. Verify an administrator cannot approve their own account; approve the
   synthetic doctor and confirm the private document download is admin-only
   or owner-only.
3. Configure a timezone, weekday hours, breaks, slot length, and leave dates;
   verify patient booking outside those constraints is rejected.
4. Submit two concurrent requests for the same doctor/time and verify only one
   succeeds. Test doctor accept/reject, reschedule proposal and patient
   confirmation, cancellation reason, start, completion, and no-show rules.
5. Confirm the doctor's patient list includes only established appointment
   relationships. Verify unshared reports, expired/revoked consent, and
   unrelated/family records remain inaccessible, including their download and
   AI-summary endpoints.
6. Share a synthetic report, review the preserved original/OCR/AI draft,
   record a doctor decision, revoke sharing, and verify subsequent access is
   denied.
7. Create and finalize a consultation and prescription, export the PDF, then
   amend each and confirm prior versions remain available.
8. Upload an invalid, oversized, and valid synthetic prescription document;
   verify validation, private storage, and patient/owning-doctor-only download.
9. Trigger appointment/report/prescription notifications and confirm previews
   contain only generic notification labels, not patient or medical details.
10. Configure an AI provider failure and confirm the UI shows an unavailable
    state without fabricated clinical output.

Medical reference PDFs start in `PENDING` and are not retrieved until an Admin
approves them and indexing completes. The Admin endpoints support upload,
listing, details, approval, rejection, and retrying failed indexing jobs.
Original PDFs are stored as authenticated Cloudinary assets; only metadata is
returned to the browser. Chat answers use the existing configured Groq model
when the approved knowledge base lacks enough evidence, and identify that
answer as general medical guidance rather than attributing it to a document.

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/rag-documents/upload` | Upload a PDF for review |
| `GET` | `/api/rag-documents` | List/search/filter Admin documents |
| `GET` | `/api/rag-documents/:id` | Read document metadata |
| `PATCH` | `/api/rag-documents/:id/approve` | Approve and start indexing |
| `PATCH` | `/api/rag-documents/:id/reject` | Reject a pending document |
| `POST` | `/api/rag-documents/:id/retry` | Retry a failed indexing job |

## Notifications and delivery queue

Notifications are stored in MongoDB and processed by the backend worker, which
polls the durable queue and schedules appointment reminders, medicine reminders,
and opted-in monthly health report notices. Delivery records retain the trigger,
channel, scheduled/sent timestamps, status, preference and consent snapshot,
retry count, and last error. Failed deliveries retry with backoff up to three
attempts. Email uses Brevo and push uses Firebase Admin; register a browser
device from Patient Settings to save its Firebase Messaging token. Monthly
report delivery requires explicit consent. SMS preference settings are
available, but SMS delivery is marked skipped until an SMS provider is added.

## About the "AI" features

AI Chat uses the configured Groq model with patient-scoped RAG context. Symptom
Checker, Drug Interaction Checker, Report Analyzer, and AI Patient Summary keep
their deterministic, inspectable logic in `services/aiService.js`.

Every AI response includes a `disclaimer` field — keep it visible in the UI.

To upgrade to a real LLM later: add an API key (OpenAI, Anthropic, etc.) to
`.env`, then swap the body of the relevant function in `aiService.js` for a
call to that provider. Controllers won't need to change.

## Data model

See `models/` — one file per collection, 20 total, covering every page in the
frontend (patients/doctors/admins, appointments, prescriptions, vitals, health
score, timeline, medicine reminders, AI chat, symptom checks, drug interaction
checks + reference table, reports, AI summaries, education, feedback, knowledge
base docs, audit log, early warnings, notifications).

## Known limitations / next steps

- **Report Analyzer** now extracts text server-side. A client-supplied
  `extractedText` remains an override for Prescription uploads.
- **Doctor directory / verification** — newly registered doctors start
  `pending`; an admin must approve them (`PATCH /api/admin/doctors/:id/verification`)
  before they show up in `GET /api/appointments/doctors`.
- No payment/billing integration — `consultationFee` is just a display field.
- Rate limiting is a simple global 600 req/15min per IP; tighten for production.
