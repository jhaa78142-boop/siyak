import { AlertTriangle, Info, ShieldCheck } from "lucide-react";

export const WELCOME_ID = "welcome";

export const URGENCY = {
  urgent: {
    label: "Urgent care signal",
    icon: AlertTriangle,
    cls: "mm-urgency--urgent",
    book: true,
  },
  soon: {
    label: "See a clinician soon",
    icon: Info,
    cls: "mm-urgency--soon",
    book: true,
  },
  routine: {
    label: "Routine guidance",
    icon: ShieldCheck,
    cls: "mm-urgency--routine",
    book: false,
  },
};

export const PROMPTS = [
  {
    kicker: "Symptoms",
    label: "Fever with body ache",
    hint: "Triage what it might mean",
    prompt: "I have a mild fever and body ache for 2 days. How urgent is this?",
  },
  {
    kicker: "Reports",
    label: "Explain my lab report",
    hint: "Plain-language findings",
    prompt: "Explain my last lab report in simple terms and what I should ask my doctor.",
  },
  {
    kicker: "Medicines",
    label: "Drug safety check",
    hint: "Interactions & caution",
    prompt: "Is it generally safe to take paracetamol with blood pressure medicine?",
  },
  {
    kicker: "Lifestyle",
    label: "Cholesterol diet",
    hint: "Practical next steps",
    prompt: "Suggest a practical diet plan for high cholesterol.",
  },
];

export const THINK_STEPS_CHAT = [
  "Understanding your question",
  "Checking your health context",
  "Composing a careful reply",
];

export const THINK_STEPS_UPLOAD = [
  "Receiving document",
  "Reading text (OCR)",
  "Extracting clinical details",
  "Preparing explanation",
];

export const DEFAULT_DISCLAIMER = "Informational only — not a medical diagnosis.";
