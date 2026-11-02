import "dotenv/config";
import mongoose from "mongoose";
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const keyPath = path.resolve(__dirname, "../config/serviceAccountKey.json");
const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf-8"));

// ─── CONFIGURE YOUR ADMIN HERE ─────────────────────────────────────────────
const ADMIN_EMAIL    = "admin@medimind.com";       // ← change as needed
const ADMIN_PASSWORD = "Admin@12345";               // ← change to a strong password
const ADMIN_USERNAME = "admin";
const ADMIN_FULLNAME = "MediMind Administrator";
// ────────────────────────────────────────────────────────────────────────────

// Init Firebase Admin (only if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Init Mongoose
await mongoose.connect(process.env.MONGODB_URI);
console.log("✅ MongoDB connected");

// Import model AFTER mongoose is connected
const { default: User } = await import("../models/User.js");

async function seedAdmin() {
  try {
    // 1. Check if admin already exists in MongoDB
    const existingMongo = await User.findOne({
      $or: [{ email: ADMIN_EMAIL }, { username: ADMIN_USERNAME }],
    });

    if (existingMongo) {
      console.log("⚠️  Admin already exists in MongoDB:", existingMongo.email);
      process.exit(0);
    }

    // 2. Create Firebase account
    let firebaseUser;
    try {
      firebaseUser = await admin.auth().createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        displayName: ADMIN_FULLNAME,
        emailVerified: true,
      });
      console.log("✅ Firebase user created:", firebaseUser.uid);
    } catch (err) {
      if (err.code === "auth/email-already-exists") {
        firebaseUser = await admin.auth().getUserByEmail(ADMIN_EMAIL);
        console.log("ℹ️  Firebase user already existed:", firebaseUser.uid);
      } else if (err.code === "auth/configuration-not-found") {
        console.error("\n❌ FIREBASE ERROR: Email/Password sign-in is NOT enabled.");
        console.error("   Fix: Go to https://console.firebase.google.com");
        console.error("   → Select project 'medimind-ai-81e65'");
        console.error("   → Build → Authentication → Sign-in method");
        console.error("   → Enable 'Email/Password' → Save");
        console.error("   → Then re-run: node scripts/createAdmin.js\n");
        process.exit(1);
      } else {
        throw err;
      }
    }

    // 3. Create MongoDB record
    const adminUser = await User.create({
      firebaseUid: firebaseUser.uid,
      email: ADMIN_EMAIL,
      username: ADMIN_USERNAME,
      fullName: ADMIN_FULLNAME,
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: true,
      adminProfile: {
        title: "Platform Administrator",
      },
    });

    console.log("\n========================================");
    console.log("✅ ADMIN ACCOUNT CREATED SUCCESSFULLY!");
    console.log("========================================");
    console.log("  Email    :", ADMIN_EMAIL);
    console.log("  Password :", ADMIN_PASSWORD);
    console.log("  Username :", ADMIN_USERNAME);
    console.log("  Mongo ID :", adminUser._id.toString());
    console.log("========================================\n");
    console.log("→ Login at: http://localhost:5173/login");
    console.log("→ Select role: ADMIN, enter email + password\n");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating admin:", err.message);
    process.exit(1);
  }
}

seedAdmin();
