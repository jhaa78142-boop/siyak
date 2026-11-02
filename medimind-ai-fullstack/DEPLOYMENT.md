# Production deployment

This project is configured for a Vercel frontend, a Render API in Singapore,
MongoDB Atlas, and a persistent Render disk for files saved under
`backend/uploads`. The Render web service and disk are paid resources. Confirm
current provider pricing before creating them.

Do not upload real patient records until you have verified that each provider,
region, retention policy, access controls, and applicable privacy/compliance
requirements are appropriate for the data. A persistent disk alone does not
make this application compliant for medical data.

## 1. Prepare the source repository

Push this project directory to a private GitHub repository. Do not commit
`backend/.env`, `frontend/.env`, `backend/config/serviceAccountKey.json`,
uploads, or database files. Keep the existing `.gitignore` files in place.

If the GitHub repository contains this project in a subdirectory rather than at
its root, configure the Render Blueprint path to
`medimind-ai-fullstack/render.yaml` and the Vercel project root to
`medimind-ai-fullstack/frontend`.

## 2. Create the database

1. Create a MongoDB Atlas cluster in a region near Singapore.
2. Create a dedicated database user with a strong, unique password.
3. Configure Atlas Network Access to allow the Render service's outbound IP
   addresses. Do not allow all internet addresses for a deployment containing
   personal or health data.
4. Copy the Atlas connection string; replace its username, password, and
   database name as directed by Atlas. Add the final value as `MONGODB_URI` in
   Render. Never put it in a `VITE_` variable or commit it.

## 3. Deploy the API

1. In Render, create a Blueprint from the repository and select `render.yaml`.
   The manifest creates the Node web service and a 1 GB persistent disk for
   `backend/uploads`.
2. Set the prompted `MONGODB_URI` and `CLIENT_URL` values. `CLIENT_URL` must be
   the exact deployed Vercel origin (for example, `https://your-app.vercel.app`,
   with no `/` or `/api` suffix).
3. In the Render service's **Secret Files**, add a file named
   `serviceAccountKey.json` containing the Firebase Admin service-account JSON.
   The manifest points `FIREBASE_SERVICE_ACCOUNT_PATH` at
   `/etc/secrets/serviceAccountKey.json`. Keep this private key out of Git and
   frontend settings.
4. Wait for the service health check at `/api/health` to pass. Copy the
   deployed API URL, such as `https://medimind-api.onrender.com`.

Authentication requires the Firebase service-account file. Without it, the
API may start, but protected requests will fail. Optional integrations such as
Brevo email, Cloudinary, Groq, Chroma, Hugging Face, and ElevenLabs need their
own server-side environment variables in Render. In particular, RAG/vector
search remains unavailable until `CHROMA_URL` points to a separately hosted,
durable Chroma instance reachable privately by the API. Do not expose a
patient-document vector database publicly.

## 4. Deploy the frontend

1. Create a Vercel project from the same repository and set its **Root
   Directory** to `frontend` (or the subdirectory path described above).
2. Set the Vercel Production environment variable `VITE_API_URL` to
   `https://<your-render-service>.onrender.com/api`. Do not enable API access
   for Preview deployments unless their origins are explicitly allowed by the
   backend CORS configuration.
3. Set `VITE_FIREBASE_VAPID_KEY` if browser push notifications are enabled.
4. Deploy with the Vite defaults: install `npm install`, build `npm run build`,
   output directory `dist`.
5. Add the deployed Vercel domain to Firebase Authentication's authorized
   domains. Also configure the Firebase email/password and Google sign-in
   providers used by the app.
6. Update Render's `CLIENT_URL` to the final Vercel origin and redeploy the
   API. If you add a custom frontend domain later, update it there too.

The existing `frontend/vercel.json` handles client-side routes. The API URL
must be the Render service URL, not a localhost URL.

## 5. Verify the deployment

- Open `https://<your-render-service>.onrender.com/api/health` and confirm it
  returns a successful health response.
- Open the Vercel URL, register a test account, sign in, and verify an
  authenticated API request.
- Test file upload and retrieval with synthetic test files, then restart the
  Render service and confirm the files remain available.
- Check Render logs, Atlas metrics, and Firebase authorized-domain settings.
- Configure backups, alerts, and a retention/deletion policy before handling
  real user data.

The dashboard setup, account ownership, billing approval, domain selection,
secrets, Atlas networking, and provider compliance configuration must be
completed by the account owner. Do not send credentials or private keys in
chat.
