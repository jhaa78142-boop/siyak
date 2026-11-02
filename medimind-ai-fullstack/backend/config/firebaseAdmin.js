import admin from "firebase-admin";
import fs from "fs";
import path from "path";

// Firebase Admin needs a SERVICE ACCOUNT key (server-side secret), which is
// different from the public web `firebaseConfig` object used in the frontend.
//
// To get one:
//   Firebase Console -> Project Settings -> Service accounts -> Generate new
//   private key. Save the downloaded JSON as backend/config/serviceAccountKey.json
//   (this path is already git-ignored).
//
// Until that file exists, auth-protected routes will respond with a clear
// 503 instead of crashing the whole server, so the rest of the API stays testable.

let initialized = false;
let initError = null;

function tryInit() {
  if (initialized || initError) return;

  try {
    const keyPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./config/serviceAccountKey.json");

    if (!fs.existsSync(keyPath)) {
      throw new Error(
        `Firebase service account key not found at ${keyPath}. ` +
        `Download it from Firebase Console -> Project Settings -> Service Accounts, ` +
        `and save it at that path (see README).`
      );
    }

    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf-8"));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id,
    });

    initialized = true;
    console.log("[Firebase Admin] initialized for project:", serviceAccount.project_id);
  } catch (err) {
    initError = err;
    console.warn("[Firebase Admin] NOT initialized:", err.message);
  }
}

tryInit();

export function isFirebaseReady() {
  return initialized;
}

export function getFirebaseInitError() {
  return initError;
}

export default admin;
