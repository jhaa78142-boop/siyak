import "dotenv/config";
import { connectDB } from "../config/db.js";
import DrugInteractionReference from "../models/DrugInteractionReference.js";
import EducationArticle from "../models/EducationArticle.js";
import KnowledgeBaseDoc from "../models/KnowledgeBaseDoc.js";
import User from "../models/User.js";
import { uploadPrivatePdf, deletePrivatePdf } from "../services/cloudinaryService.js";
import { processApprovedMedicalDocument } from "../services/medicalKnowledgeBaseService.js";
import mongoose from "mongoose";

const interactions = [
  { drugA: "metformin", drugB: "glimepiride", severity: "Low", note: "Additive glucose-lowering effect — monitor for hypoglycemia symptoms." },
  { drugA: "atorvastatin", drugB: "clarithromycin", severity: "High", note: "Increased risk of myopathy/rhabdomyolysis — consider an alternative antibiotic." },
  { drugA: "aspirin", drugB: "ibuprofen", severity: "Medium", note: "Combined long-term use raises GI bleeding risk." },
  { drugA: "warfarin", drugB: "aspirin", severity: "High", note: "Significantly increased bleeding risk." },
  { drugA: "lisinopril", drugB: "potassium", severity: "Medium", note: "Risk of hyperkalemia with ACE inhibitors + potassium supplements." },
  { drugA: "sertraline", drugB: "tramadol", severity: "High", note: "Increased risk of serotonin syndrome." },
  { drugA: "metformin", drugB: "atorvastatin", severity: "Low", note: "No clinically significant interaction typically reported." },
].map((r) => ({ ...r, drugA: r.drugA.toLowerCase(), drugB: r.drugB.toLowerCase() }));

const articles = [
  { tag: "Cardiology", title: "Understanding Blood Pressure Numbers", readTimeMinutes: 4, audience: "patient" },
  { tag: "Nutrition", title: "Building a Balanced Plate for Diabetics", readTimeMinutes: 6, audience: "patient" },
  { tag: "Mental Health", title: "5 Breathing Techniques to Reduce Stress", readTimeMinutes: 3, audience: "both" },
  { tag: "Preventive Care", title: "Why Annual Screenings Matter After 30", readTimeMinutes: 5, audience: "both" },
];

// Medical Knowledge Base seed documents. These must go through the SAME pipeline
// the admin UI uses (Cloudinary upload -> approved doc -> real indexing), because
// the retrieval layer only trusts docs that are INDEXED, reviewed, and stored with
// a Cloudinary asset id. Inserting hand-written records straight into MongoDB
// produced documents that were invisible on the admin page and dead for RAG.
const kbDocs = [
  {
    title: "Hypertension - Clinical Reference Summary",
    originalFilename: "hypertension-clinical-reference.pdf",
    sourceOrganization: "MediMind Clinical Reference Library",
    category: "Cardiology",
    language: "English",
    version: "1.0",
    description: "Standard adult blood pressure categories and first-line antihypertensive therapy.",
    lines: [
      "MediMind Clinical Reference Summary: Hypertension",
      "Adult office blood pressure categories:",
      "Normal: systolic below 120 and diastolic below 80 mmHg.",
      "Elevated: systolic 120 to 129 and diastolic below 80 mmHg.",
      "Stage 1 hypertension: systolic 130 to 139 or diastolic 80 to 89 mmHg.",
      "Stage 2 hypertension: systolic 140 or higher, or diastolic 90 or higher.",
      "Hypertensive crisis: above 180 and/or 120 mmHg; seek immediate medical care.",
      "First-line antihypertensive classes: thiazide diuretics, ACE inhibitors,",
      "angiotensin receptor blockers, and calcium channel blockers.",
      "Lifestyle measures: reduce dietary sodium, stay physically active, limit alcohol,",
      "avoid tobacco, and maintain a healthy body weight.",
    ],
  },
  {
    title: "Type 2 Diabetes - Clinical Reference Summary",
    originalFilename: "type2-diabetes-clinical-reference.pdf",
    sourceOrganization: "MediMind Clinical Reference Library",
    category: "Endocrinology",
    language: "English",
    version: "1.0",
    description: "Diagnostic thresholds, treatment targets, and usual first-line therapy for type 2 diabetes.",
    lines: [
      "MediMind Clinical Reference Summary: Type 2 Diabetes",
      "Diagnostic thresholds: fasting plasma glucose 126 mg/dL or higher,",
      "or HbA1c 6.5 percent or higher, or 2-hour plasma glucose 200 mg/dL or higher.",
      "Usual treatment target: HbA1c below 7 percent for most non-pregnant adults.",
      "Metformin is generally the first-line oral glucose-lowering medication.",
      "Other drug classes include sulfonylureas, SGLT2 inhibitors, DPP-4 inhibitors,",
      "GLP-1 receptor agonists, and insulin.",
      "Follow-up: HbA1c every 3 to 6 months, annual kidney and eye screening,",
      "and regular foot examination.",
    ],
  },
  {
    title: "Adult Immunization - Reference Schedule",
    originalFilename: "adult-immunization-reference.pdf",
    sourceOrganization: "MediMind Clinical Reference Library",
    category: "Public health",
    language: "English",
    version: "1.0",
    description: "Commonly recommended adult vaccines and their usual intervals.",
    lines: [
      "MediMind Clinical Reference Summary: Adult Immunization",
      "Influenza vaccine: recommended annually for adults.",
      "Tetanus and diphtheria booster: every 10 years.",
      "COVID-19 vaccine: follow current national guidance.",
      "Hepatitis B: a 3-dose series for unvaccinated adults at risk.",
      "Pneumococcal vaccine: for adults aged 65 and older, and younger adults with risk factors.",
      "Human papillomavirus vaccine: recommended up to age 26, with shared decision-making to 45.",
      "Always confirm the schedule with the latest national immunization guidelines.",
    ],
  },
  {
    title: "Common Drug Interactions - Reference Summary",
    originalFilename: "common-drug-interactions-reference.pdf",
    sourceOrganization: "MediMind Clinical Reference Library",
    category: "General medicine",
    language: "English",
    version: "1.0",
    description: "Well-documented drug interaction pairs and their clinical concerns.",
    lines: [
      "MediMind Clinical Reference Summary: Common Drug Interactions",
      "Warfarin with aspirin: significantly increased risk of bleeding.",
      "Atorvastatin with clarithromycin: increased risk of myopathy and rhabdomyolysis.",
      "Sertraline with tramadol: increased risk of serotonin syndrome.",
      "Lisinopril with potassium supplements: risk of hyperkalemia.",
      "Metformin with glimepiride: additive glucose-lowering effect; watch for hypoglycemia.",
      "Aspirin with ibuprofen: long-term combined use raises gastrointestinal bleeding risk.",
    ],
  },
];

// Builds a minimal, valid single-page text PDF so seeding does not need a
// heavyweight PDF library. Content is written in the native Helvetica font.
function makeReferencePdf(lines) {
  const escape = (value) => String(value).replace(/[\\()]/g, (match) => `\\${match}`);
  const content =
    "BT /F1 12 Tf 72 740 Td 16 TL\n" +
    lines.map((line) => `(${escape(line)}) Tj T*`).join("\n") +
    "\nET";
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf, "latin1");
}

// Seeds the knowledge base through the real upload -> approve -> index pipeline
// so the documents are visible to the admin module and usable by the chatbot.
async function seedKnowledgeBase() {
  const admin = await User.findOne({ role: "ADMIN" }).select("_id");
  if (!admin) {
    console.warn("No ADMIN user found — skipping medical knowledge base seeding. Create an admin, then re-run `npm run seed`.");
    return;
  }

  for (const kb of kbDocs) {
    const existing = await KnowledgeBaseDoc.findOne({ title: kb.title });
    if (existing?.cloudinaryAssetId) {
      console.log(`  · already seeded: ${kb.title}`);
      continue;
    }
    if (existing) await KnowledgeBaseDoc.deleteOne({ _id: existing._id });

    const buffer = makeReferencePdf(kb.lines);
    const asset = await uploadPrivatePdf(buffer, kb.originalFilename);
    let doc;
    try {
      doc = await KnowledgeBaseDoc.create({
        title: kb.title,
        originalFilename: kb.originalFilename,
        sourceOrganization: kb.sourceOrganization,
        sourceUrl: "",
        category: kb.category,
        language: kb.language,
        version: kb.version,
        publicationDate: null,
        description: kb.description,
        cloudinaryAssetId: asset.assetId,
        cloudinaryPublicId: asset.publicId,
        cloudinaryResourceType: asset.resourceType,
        cloudinaryFormat: asset.format,
        fileSize: buffer.length,
        uploadedBy: admin._id,
        reviewedBy: admin._id,
        reviewedAt: new Date(),
        status: "APPROVED",
      });
    } catch (error) {
      await deletePrivatePdf({ publicId: asset.publicId, resourceType: asset.resourceType }).catch(() => {});
      throw error;
    }

    await processApprovedMedicalDocument(doc._id);
    const indexed = await KnowledgeBaseDoc.findById(doc._id).select("status chunks searchBackend processingError").lean();
    console.log(`  · ${kb.title} -> ${indexed?.status} | ${indexed?.chunks ?? 0} chunks | ${indexed?.searchBackend || "-"}${indexed?.processingError ? ` | error: ${indexed.processingError}` : ""}`);
  }
}

async function run() {
  await connectDB();

  for (const i of interactions) {
    await DrugInteractionReference.updateOne({ drugA: i.drugA, drugB: i.drugB }, i, { upsert: true });
  }
  console.log(`Seeded ${interactions.length} drug interaction reference pairs`);

  for (const a of articles) {
    await EducationArticle.updateOne({ title: a.title }, a, { upsert: true });
  }
  console.log(`Seeded ${articles.length} education articles`);

  await seedKnowledgeBase();
  console.log(`Seeded ${kbDocs.length} knowledge base docs`);

  await mongoose.disconnect();
  console.log("Seed complete.");
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
