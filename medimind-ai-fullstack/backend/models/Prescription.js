import mongoose from "mongoose";

const medicationLineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    strength: String,
    dosage: String,
    route: String,
    frequency: String,
    durationDays: Number,
    instructions: String,
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
    sourceType: { type: String, enum: ["doctor_created", "existing_upload"], default: "doctor_created" },
    uploadedDocument: {
      storagePath: String,
      fileName: String,
      mimeType: String,
      fileSizeBytes: Number,
      uploadedAt: Date,
    },
    medications: [medicationLineSchema],
    diagnosis: String,
    followUpDate: Date,
    notes: String,
    status: { type: String, enum: ["draft", "finalized", "amended", "uploaded"], default: "finalized", index: true },
    finalizedAt: Date,
    finalizedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    amendmentHistory: [{
      version: { type: Number, required: true },
      medications: [medicationLineSchema],
      diagnosis: String,
      followUpDate: Date,
      notes: String,
      amendedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      amendedAt: { type: Date, default: Date.now },
      reason: { type: String, required: true },
    }],
  },
  { timestamps: true }
);

export default mongoose.model("Prescription", prescriptionSchema);
