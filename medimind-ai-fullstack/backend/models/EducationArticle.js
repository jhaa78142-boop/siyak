import mongoose from "mongoose";

const educationArticleSchema = new mongoose.Schema(
  {
    tag: { type: String, required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, default: "" },
    readTimeMinutes: { type: Number, default: 4 },
    audience: { type: String, enum: ["patient", "doctor", "both"], default: "both" },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("EducationArticle", educationArticleSchema);
