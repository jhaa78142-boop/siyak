import mongoose from "mongoose";

let isConnected = false;

export async function connectDB() {
  if (isConnected) return mongoose.connection;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set in .env");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB_NAME || undefined,
  });

  isConnected = true;

  mongoose.connection.on("error", (err) => {
    console.error("[MongoDB] connection error:", err.message);
  });
  mongoose.connection.on("disconnected", () => {
    console.warn("[MongoDB] disconnected");
    isConnected = false;
  });

  console.log(`[MongoDB] connected -> ${mongoose.connection.host}/${mongoose.connection.name}`);
  return mongoose.connection;
}
