import mongoose from "mongoose";

// Log of interaction checks run for/about a patient (drives DrugInteractions
// page for doctors and MedicineChecker for patients).
const drugInteractionCheckSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    checkedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    drugs: [{ type: String, required: true }],
    severity: { type: String, enum: ["None", "Low", "Medium", "High"], required: true },
    note: String,
  },
  { timestamps: true }
);

export default mongoose.model("DrugInteractionCheck", drugInteractionCheckSchema);
