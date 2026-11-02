# MediMind AI — Full Stack

This package contains both halves of the app:

```
frontend/   React + Vite UI (the app you already had)
backend/    Node.js/Express + MongoDB API (new)
```

## Quick start

For production hosting setup (Vercel frontend, Render API, and MongoDB Atlas),
see [DEPLOYMENT.md](./DEPLOYMENT.md).

**1. Backend**
```bash
cd backend
npm install
# Copy .env.example to .env and add your local service credentials.
# Firebase Admin needs one more file — see backend/README.md section 3.
npm run seed     # optional but recommended, populates reference data
npm run dev
```
Runs on `http://localhost:5000`.

**2. Frontend**
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173` and talks to the backend via `VITE_API_URL`
in `frontend/.env` (already pointed at `http://localhost:5000/api`).

## What's wired up vs. what's still using mock data

**Wired to the real backend + Firebase Auth:**
- Login, Patient Registration, Doctor Registration (`src/pages/auth/`)
- Route protection — dashboards check the real signed-in user/role and
  redirect to `/login` if there isn't one (falls back to mock data if the
  backend isn't running, so local UI dev still works untouched)
- Every feature has a matching, tested-to-boot backend endpoint (see
  `backend/README.md` for the full API list)

**Still reading from `src/lib/mockData.js`:**
- The 30+ inner dashboard pages (PatientHome, AIChat, Appointments,
  DoctorPatients, AdminHome, analytics charts, etc.) — these still render
  the same sample data they always did. The API client (`src/lib/api.js`)
  is ready for each one; swapping a page over is a matter of replacing its
  `mockData` import with an `api.get(...)` call in a `useEffect`/`useState`,
  page by page. Happy to do this next — just say which pages matter most
  and I'll wire those first.

## Security note

`backend/.env` contains your live MongoDB password and Brevo API/SMTP keys.
It's git-ignored, but treat this whole folder as sensitive — don't upload it
to a public repo or share it outside your team. Rotate any of these
credentials if they're ever exposed.

See `backend/README.md` for full API documentation, the Firebase service
account step, and notes on how the "AI" features (symptom checker, drug
interactions, chat, report analyzer, summaries) are implemented.
