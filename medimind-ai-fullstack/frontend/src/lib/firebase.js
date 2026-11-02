// Firebase client setup. This config is the public "web app" config — safe to
// ship in frontend code (it identifies the project, it isn't a secret).
// The backend uses a separate, secret service-account key — see backend/README.md.
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDD5qr6Fobea4gwI__VuuDdKTx2XytMFq8",
  authDomain: "medimind-ai-81e65.firebaseapp.com",
  projectId: "medimind-ai-81e65",
  storageBucket: "medimind-ai-81e65.firebasestorage.app",
  messagingSenderId: "461538682572",
  appId: "1:461538682572:web:ae4bfec5ad67d845704469",
  measurementId: "G-YREG6CN6FN",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const analytics = getAnalytics(firebaseApp);
export const auth = getAuth(firebaseApp);

/** Creates a Firebase account, sets the display name, returns the User. */
export async function registerWithEmail(email, password, name) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (name) await updateProfile(cred.user, { displayName: name });
  cred.user.user = cred.user; // supports both `const user = ...` and `const { user } = ...`
  return cred.user;
}

/** Signs in an existing user, returns the User. */
export async function loginWithEmail(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export function logout() {
  return firebaseSignOut(auth);
}

/** Sends a password-reset email via Firebase. */
export function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}

/** Subscribes to auth state; callback receives the Firebase User or null. */
export function watchAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

/** Gets a fresh ID token for the currently signed-in user (or null). */
export async function getIdToken(forceRefresh = false) {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken(forceRefresh);
}

export async function registerForPushNotifications() {
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    throw new Error("Push notifications are not supported by this browser.");
  }
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    throw new Error("Push notifications are not configured. Set VITE_FIREBASE_VAPID_KEY.");
  }

  const { getMessaging, getToken, isSupported } = await import("firebase/messaging");
  if (!(await isSupported())) throw new Error("Firebase push notifications are not supported in this browser.");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Allow browser notifications to register this device.");

  const serviceWorkerRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  const token = await getToken(getMessaging(firebaseApp), { vapidKey, serviceWorkerRegistration });
  if (!token) throw new Error("Firebase did not return a push token for this device.");
  return token;
}

/** Signs in with Google */
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  cred.user.user = cred.user;
  return cred.user;
}
