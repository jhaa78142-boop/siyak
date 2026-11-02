# MediMind AI — Frontend

An interactive, animated React + Tailwind CSS UI/UX for the MediMind AI healthcare
platform (Patient / Doctor / Admin), built from the project synopsis.

## What's included

- **Animated opening sequence** — the MediMind logo animates in, the wordmark and
  tagline reveal, then the app routes to a marketing "Welcome" screen.
- **Auth flow** — Welcome → Login / Sign Up (role picker) → Patient/Doctor
  registration forms → role-specific dashboard, matching the provided screenshots.
- **Patient console** — AI Chat, Symptom Checker, Report & Image Analyzer,
  Medicine Checker, Appointments, Medicine Reminder, Health Score & Records,
  Timeline, Voice Assistant, Education, Profile, Settings.
- **Doctor console** — Dashboard, Patients, Appointments, AI Patient Summary,
  Prescription, Follow-ups, Drug Interaction Record, Health Records, Education,
  Profile, Settings.
- **Admin console** — Dashboard, User Management, Doctor Verification,
  Appointments, Reports & Analytics, AI Quality Data, Early Warning,
  Knowledge Base (RAG), Feedback, System Settings, Audit Log.
- Fully responsive (desktop sidebar → mobile slide-over nav), so the same routes
  work as a "web app" and a "mobile app" shell.
- Language selector with English, Hindi, Spanish, French, Arabic, Simplified
  Chinese, Bengali, Portuguese, German, Japanese, Korean, Urdu, Russian,
  Italian, Indonesian, and Swahili. The selection is saved in the browser, and
  Arabic/Urdu set right-to-left document direction. Landing-page navigation,
  shared dashboard navigation and section headings are translated, along with
  the doctor dashboard overview. Other page-specific text currently falls back
  to English until its translations are added.
- Framer Motion micro-animations, animated SVG "ECG" line, charts via Recharts,
  and role-based color theming (teal = patient, indigo = doctor, violet = admin).

All data is realistic **mock data** in `src/lib/mockData.js` — wire this up to
your actual Firebase / MongoDB / LLM backend described in the synopsis to make
it fully functional.

## Run it

```bash
npm install
npm run dev       # local dev server
npm run build     # production build -> dist/
```

## Notifications

The patient Settings page saves per-notification email, push, and SMS preferences
to the backend. Browser push registration requires
`VITE_FIREBASE_VAPID_KEY` from Firebase Console → Project settings → Cloud
Messaging → Web Push certificates, plus the Firebase service-account
configuration on the backend. Monthly health reports require a separate
explicit consent toggle. SMS preferences can be saved, but delivery remains
unavailable until an SMS provider is configured.

## Project structure

```
src/
  assets/          logo.png
  components/      Sidebar, Topbar, StatCard, Bits (Badge/ProgressRing/EmptyState), Settings toggles
  layouts/          DashboardLayout (shared shell for all 3 roles)
  lib/              nav.js (per-role nav + theme), mockData.js
  pages/
    Splash.jsx       animated logo intro
    Welcome.jsx       marketing landing / get started
    auth/            Login, Signup, PatientRegister, DoctorRegister
    patient/          13 pages
    doctor/            11 pages
    admin/              11 pages
```

## Notes

- Stock photography is pulled from Unsplash at runtime (requires internet) —
  swap `<img src="...">` URLs for your own assets if you need it to work offline.
- Google Fonts (Space Grotesk / Inter / JetBrains Mono) are loaded via
  `index.html` — also requires internet on first load.
- Login/registration forms are UI-complete but not wired to Firebase yet; submit
  handlers currently just `navigate()` to the right dashboard for demo purposes.
