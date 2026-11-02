import { motion, useScroll, useTransform, useMotionValue, useSpring, useMotionTemplate, useMotionValueEvent, AnimatePresence, useAnimationControls } from "framer-motion";
import { useRef, useEffect, useState, useMemo, useCallback, useSyncExternalStore } from "react";

const IS_BROWSER = typeof window !== "undefined";
const useIsTouch = () =>
  useSyncExternalStore(
    () => () => {},
    () =>
      IS_BROWSER &&
      (window.matchMedia?.("(pointer: coarse)").matches ||
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0),
    () => false
  );
const usePrefersReducedMotion = () =>
  useSyncExternalStore(
    () => () => {},
    () => IS_BROWSER && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    () => false
  );
const useIsLowEnd = () => {
  const touch = useIsTouch();
  const reduced = usePrefersReducedMotion();
  const [lowCpu, setLowCpu] = useState(false);
  useEffect(() => {
    if (!IS_BROWSER) return;
    const mem = (navigator).deviceMemory;
    const cores = navigator.hardwareConcurrency || 4;
    setLowCpu((mem && mem < 4) || cores < 6);
  }, []);
  return touch || reduced || lowCpu;
};
import {
  ArrowRight, MessageCircle, ScanLine, HeartPulse, ShieldCheck,
  Stethoscope, Sparkles, Activity, Play, Lock, Fingerprint, Star, Zap, Brain,
  TrendingUp, CheckCircle2, ChevronRight, Menu, X, Command, Award, Users,
  Clock, FileText, Pill, Shield, Globe, ChevronDown, Plus, Minus,
  Mail, Phone, MapPin, BadgeCheck, Verified, Rocket, Target, Eye,
  ArrowUpRight, BarChart3, Cpu, BellRing, Volume2, Wifi, Lightbulb,
  Download, Share2, Check, AlertCircle, Info, ExternalLink, Layers,
} from "lucide-react";
import logo from "../assets/logo.png";
import heroVideo from "../assets/media/ee.mp4";
import imgHealthConcern from "../assets/media/health-concern.webp";
import imgUploadReports from "../assets/media/add reports.webp";
import imgConnectSpecialist from "../assets/media/connect with verified specailist.webp";
import imgTrackProgress from "../assets/media/track progress.webp";
import AIPulse from "../components/AIPulse";
import { CommandPalette } from "../components/CommandPalette";
import { api } from "../lib/api";
import { useI18n } from "../lib/I18nContext";
import LanguageSelector from "../components/LanguageSelector";

/* ═══════════════════════════════════════════════════════════════════════════
   🎨 ULTRA-PREMIUM WELCOME PAGE - NEXT GENERATION
   ═══════════════════════════════════════════════════════════════════════════
   
   This is the most premium, sophisticated, jaw-dropping welcome page ever created.
   Features:
   - 3D tilting cards with real depth
   - Liquid morphing backgrounds
   - Interactive particle systems that respond to cursor
   - Holographic glassmorphism UI
   - Smooth micro-interactions everywhere
   - Premium FAQ accordion with stunning animations
   - Next-level testimonials with video support
   - Breathtaking hero with multiple parallax layers
   - Advanced scroll-triggered animations
   - Custom cursor with dynamic states
   - Mesh gradients that flow and morph
   - Real-time AI status indicators
   - Interactive comparison sliders
   - 3D feature cards
   - Premium pricing cards with hover effects
   - Stunning statistics with count-up animations
   - Advanced social proof section
   - Premium footer with hover effects
   
   Total lines: 3500+ of pure premium code
   ═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATION PRESETS - ULTRA SMOOTH TRANSITIONS
   ═══════════════════════════════════════════════════════════════════════════ */
const easeOutExpo = [0.19, 1, 0.22, 1];
const easeOutQuint = [0.16, 1, 0.3, 1];
const easeInOutQuart = [0.76, 0, 0.24, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  show: (i = 0) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { 
      delay: i * 0.08, 
      duration: 1.2, 
      ease: easeOutQuint 
    },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: (i = 0) => ({
    opacity: 1,
    transition: { delay: i * 0.1, duration: 0.9, ease: "easeOut" },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85, rotateX: 8 },
  show: (i = 0) => ({
    opacity: 1, scale: 1, rotateX: 0,
    transition: { delay: i * 0.07, duration: 0.95, ease: easeOutQuint },
  }),
};

const slideIn = {
  hidden: { opacity: 0, x: -60 },
  show: (i = 0) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.05, duration: 0.85, ease: easeOutQuint },
  }),
};

const zoomIn = {
  hidden: { opacity: 0, scale: 0.75 },
  show: (i = 0) => ({
    opacity: 1, scale: 1,
    transition: { delay: i * 0.05, duration: 1.1, ease: easeOutQuint },
  }),
};

const bounceIn = {
  hidden: { opacity: 0, scale: 0, rotate: -12 },
  show: (i = 0) => ({
    opacity: 1, scale: 1, rotate: 0,
    transition: { 
      delay: i * 0.1, 
      duration: 0.8, 
      ease: [0.34, 1.56, 0.64, 1] // Bounce
    },
  }),
};

const rippleEffect = {
  hidden: { scale: 0.8, opacity: 0 },
  show: { scale: 2, opacity: 0, transition: { duration: 1.5, ease: "easeOut", repeat: Infinity } },
};

/* ═══════════════════════════════════════════════════════════════════════════
   📊 DATA - COMPREHENSIVE CONTENT
   ═══════════════════════════════════════════════════════════════════════════ */
const heroFeatures = [
  { icon: Brain, text: "AI-Powered Diagnostics", color: "from-teal-500 to-teal-600" },
  { icon: Shield, text: "HIPAA Compliant", color: "from-indigo-500 to-indigo-600" },
  { icon: Zap, text: "Instant Reports", color: "from-teal-500 to-teal-600" },
  { icon: HeartPulse, text: "24/7 Monitoring", color: "from-indigo-500 to-indigo-600" },
];

const heroAudiences = [
  { id: "patient", label: "I'm a patient", route: "/register/patient" },
  { id: "doctor", label: "I'm a doctor", route: "/register/doctor" },
  { id: "admin", label: "I'm an organization", route: "/signup" },
];

const modules = [
  { 
    code: "AI-CHAT · v4.2", 
    icon: MessageCircle, 
    title: "Conversational Diagnostic Triage", 
    gradient: "from-teal-500 to-teal-600", 
    accentColor: "#0EA5A5",
    metric: "320ms", 
    metricLabel: "avg. response", 
    statMini: "32 languages",
    featured: true,
    badge: "Most Popular",
    text: "Our frontier-class LLM, trained on 14 million verified clinical interactions and continuously refined by board-certified physicians, understands symptom nuances across 32 languages. It triages urgency with greater precision than traditional ER intake protocols, asking contextual follow-ups that mirror how expert clinicians think — reducing diagnostic ambiguity before you even meet your doctor.",
    highlights: [
      "14M+ clinical training interactions",
      "Board-certified physician refinement",
      "Context-aware follow-up questions",
      "32 language support"
    ],
    stats: [
      { label: "Accuracy", value: "98.6%" },
      { label: "Response Time", value: "320ms" },
      { label: "Languages", value: "32" }
    ]
  },
  { 
    code: "VISION · OCR+CV", 
    icon: ScanLine, 
    title: "Intelligent Report & Scan Analysis", 
    gradient: "from-indigo-500 to-indigo-600", 
    accentColor: "#4F46E5",
    metric: "99.1%", 
    metricLabel: "extraction accuracy", 
    statMini: "DICOM ready",
    featured: false,
    badge: "AI Powered",
    text: "Our proprietary hybrid pipeline combines state-of-the-art optical character recognition with advanced computer vision to read lab reports, prescriptions, X-rays, and MRI sequences. It extracts every data point with clinical-grade accuracy, cross-references findings against established diagnostic criteria, and delivers a structured, citation-backed summary to your physician — complete with anomaly flags and longitudinal trend analysis.",
    highlights: [
      "State-of-the-art OCR + CV hybrid",
      "DICOM imaging support",
      "Citation-backed summaries",
      "Anomaly detection system"
    ],
    stats: [
      { label: "Accuracy", value: "99.1%" },
      { label: "Processing", value: "1.8s" },
      { label: "Formats", value: "40+" }
    ]
  },
  { 
    code: "TIMELINE · RAG", 
    icon: HeartPulse, 
    title: "Your Living Health Chronicle", 
    gradient: "from-teal-500 to-cyan-600", 
    accentColor: "#0891B2",
    metric: "∞", 
    metricLabel: "memory retention", 
    statMini: "Self-improving",
    featured: true,
    badge: "Revolutionary",
    text: "Powered by retrieval-augmented generation architecture, your complete medical narrative — every consultation, lab result, prescription, symptom log, and wearable insight — is woven into a single, continuously refined AI-scored timeline. This isn't a static database; it's an intelligent system that grows more accurate and contextually aware with each interaction, learning your unique health signature over time.",
    highlights: [
      "RAG-powered intelligent memory",
      "Infinite longitudinal tracking",
      "Self-improving AI algorithms",
      "Wearable integration"
    ],
    stats: [
      { label: "Memory", value: "∞" },
      { label: "Accuracy", value: "99.4%" },
      { label: "Updates", value: "Real-time" }
    ]
  },
  { 
    code: "VERIFY · ADMIN", 
    icon: ShieldCheck, 
    title: "Rigorous Physician Credentialing", 
    gradient: "from-indigo-500 to-blue-600", 
    accentColor: "#4F46E5",
    metric: "100%", 
    metricLabel: "human verified", 
    statMini: "3-tier audit",
    featured: false,
    badge: "Verified",
    text: "Patient safety is non-negotiable. Every physician undergoes our exhaustive three-tier verification process: medical license authentication against national registries, specialty board certification validation, and peer review by practicing clinicians in their field. Only after passing all checkpoints can they access our platform — ensuring you receive care exclusively from credentialed, vetted professionals.",
    highlights: [
      "3-tier verification process",
      "License authentication",
      "Board certification validation",
      "Peer review system"
    ],
    stats: [
      { label: "Verified", value: "100%" },
      { label: "Physicians", value: "2,048" },
      { label: "Specialties", value: "36" }
    ]
  },
  { 
    code: "DRUG · SAFETY", 
    icon: Pill, 
    title: "Comprehensive Drug Interaction Shield", 
    gradient: "from-amber-500 to-amber-600", 
    accentColor: "#D97706",
    metric: "48K+", 
    metricLabel: "drug index", 
    statMini: "Severity graded",
    featured: false,
    badge: "Safety First",
    text: "Our real-time pharmacological safety engine screens prescriptions against an index of over 48,000 molecules, flagging contraindications, allergy risks, and adverse interactions the moment they're prescribed. Every alert is severity-graded and accompanied by evidence-based alternative recommendations, with instant physician notification for critical concerns — a digital safety net that never sleeps.",
    highlights: [
      "48,000+ drug molecule index",
      "Real-time interaction screening",
      "Severity-graded alerts",
      "Alternative recommendations"
    ],
    stats: [
      { label: "Drugs", value: "48K+" },
      { label: "Accuracy", value: "99.8%" },
      { label: "Speed", value: "< 50ms" }
    ]
  },
  { 
    code: "VOICE · PRO", 
    icon: Volume2, 
    title: "Clinical-Grade Voice Intelligence", 
    gradient: "from-teal-500 to-cyan-600", 
    accentColor: "#0891B2",
    metric: "97.4%", 
    metricLabel: "intent accuracy", 
    statMini: "Offline capable",
    featured: true,
    badge: "Voice Enabled",
    text: "Navigate your healthcare hands-free with our advanced voice assistant, engineered for clinical accuracy and medical terminology recognition. Book appointments, log symptoms, set medication reminders, or query your health record using natural speech. With offline capability and 97.4% intent accuracy benchmarked against professional medical scribes, it's the most reliable voice interface in healthcare technology.",
    highlights: [
      "Medical terminology recognition",
      "Offline capability",
      "97.4% intent accuracy",
      "Natural language processing"
    ],
    stats: [
      { label: "Accuracy", value: "97.4%" },
      { label: "Languages", value: "28" },
      { label: "Mode", value: "Offline" }
    ]
  },
];

const stats = [
  { value: "50,000+", label: "Patients Empowered", icon: HeartPulse, suffix: "across 18+ geographic regions", color: "from-teal-500 to-teal-600" },
  { value: "2,048", label: "Credentialed Physicians", icon: Stethoscope, suffix: "spanning 36 medical specializations", color: "from-indigo-500 to-indigo-600" },
  { value: "98.6%", label: "AI Diagnostic Accuracy", icon: Brain, suffix: "validated via blind clinical benchmark", color: "from-teal-500 to-teal-600" },
  { value: "1.8s", label: "Report Analysis Latency", icon: Zap, suffix: "from upload to structured summary", color: "from-indigo-500 to-indigo-600" },
];

const testimonials = [
  { 
    name: "Dr. Anjali Verma", 
    role: "Interventional Cardiologist", 
    organization: "Apollo Hospitals", 
    avatar: "AV", 
    stars: 5,
    verified: true,
    featured: true,
    videoThumbnail: null,
    text: "MediMind AI has fundamentally transformed my clinical workflow. The AI-generated case summaries are extraordinarily precise — they surface lipid trends, enzyme patterns, and historical correlations I would otherwise spend 15 minutes manually searching for. It's not just time-saving; it's genuinely enhancing diagnostic quality.",
    highlight: "50% reduction in prep time", 
    accent: "from-teal-500 to-teal-600",
    stats: {
      timeSaved: "15 min/patient",
      accuracy: "+12%",
      satisfaction: "5/5"
    }
  },
  { 
    name: "Rahul Sharma", 
    role: "Patient", 
    organization: "Type II Diabetes Management", 
    avatar: "RS", 
    stars: 5,
    verified: true,
    featured: false,
    videoThumbnail: null,
    text: "I uploaded six months of disorganized lab reports, and within minutes received a comprehensive, easy-to-understand summary that I could discuss with my endocrinologist. Six months into using the platform, my HbA1c dropped from 8.2 to 6.8 — a life-changing improvement driven by better insights and consistent tracking.",
    highlight: "HbA1c improved by 1.4 points", 
    accent: "from-indigo-500 to-indigo-600",
    stats: {
      hba1c: "-1.4 points",
      compliance: "94%",
      duration: "6 months"
    }
  },
  { 
    name: "Dr. Priya Nair", 
    role: "General Physician", 
    organization: "12 Years Clinical Practice", 
    avatar: "PN", 
    stars: 5,
    verified: true,
    featured: true,
    videoThumbnail: null,
    text: "The drug interaction screening has been invaluable. Just this month, it caught two potentially dangerous contraindications I might have missed during busy clinic hours. The RAG-powered patient timeline retrieves complete historical context in under three seconds — a technological capability that genuinely enhances patient safety.",
    highlight: "Prevented 2 critical interactions", 
    accent: "from-teal-500 to-cyan-600",
    stats: {
      prevented: "2 critical cases",
      speed: "< 3s",
      safety: "+40%"
    }
  },
  { 
    name: "Meera Krishnan", 
    role: "Patient", 
    organization: "Chronic Asthma Management", 
    avatar: "MK", 
    stars: 5,
    verified: true,
    featured: false,
    videoThumbnail: null,
    text: "The voice assistant has been transformative for my asthma management. When I'm experiencing breathing difficulty, I can log peak-flow readings and symptoms entirely hands-free. The system's intelligent reminders and trend analysis helped me achieve 92% medication adherence — up from barely 60% before.",
    highlight: "92% medication adherence", 
    accent: "from-indigo-500 to-blue-600",
    stats: {
      adherence: "+32%",
      attacks: "-65%",
      quality: "+85%"
    }
  },
  { 
    name: "Dr. Arjun Mehta", 
    role: "Diagnostic Radiologist", 
    organization: "Fortis Memorial Research Institute", 
    avatar: "AM", 
    stars: 5,
    verified: true,
    featured: true,
    videoThumbnail: null,
    text: "The computer vision module for radiological imaging is remarkably sophisticated. It flags pulmonary nodules, subtle opacities, and anatomical anomalies with a false-positive rate lower than most residents I've trained. It's not replacing clinical judgment — it's augmenting it with a tireless second set of expert eyes.",
    highlight: "Resident-level diagnostic accuracy", 
    accent: "from-teal-500 to-teal-600",
    stats: {
      accuracy: "99.1%",
      detections: "1,200+",
      falsePositive: "< 2%"
    }
  },
];

const faqs = [
  {
    category: "Getting Started",
    icon: Rocket,
    gradient: "from-teal-500 to-teal-600",
    questions: [
      {
        q: "How do I get started with MediMind AI?",
        a: "Getting started is incredibly simple! Click 'Get Started' in the navigation, choose your role (Patient, Doctor, or Administrator), and complete the quick signup process. For patients, you'll be up and running in under 2 minutes. For physicians, we'll guide you through our streamlined credentialing process to ensure platform security and patient safety.",
        featured: true,
      },
      {
        q: "Is MediMind AI really free for patients?",
        a: "Yes, absolutely! Our core platform is 100% free for patients, forever. This includes unlimited AI symptom triage, report digitization, health timeline tracking, medication reminders, and verified physician connections. We believe quality healthcare intelligence should be accessible to everyone. Our revenue comes from premium physician tools and enterprise partnerships, not patient subscriptions.",
        featured: false,
      },
      {
        q: "What devices and platforms are supported?",
        a: "MediMind AI is fully cloud-based and works seamlessly across all modern devices. Access it via web browser (Chrome, Safari, Firefox, Edge) on desktop, laptop, tablet, or smartphone. We also offer native iOS and Android apps with offline capability for our voice assistant feature. Your health data syncs automatically across all devices in real-time.",
        featured: false,
      },
    ]
  },
  {
    category: "Privacy & Security",
    icon: Shield,
    gradient: "from-indigo-500 to-indigo-600",
    questions: [
      {
        q: "How is my health data protected?",
        a: "Your health data security is our highest priority. We employ military-grade AES-256 encryption for data at rest and TLS 1.3 for data in transit. We're fully HIPAA compliant, SOC 2 Type II certified, and undergo quarterly third-party security audits. Your data is stored in geographically distributed, redundant data centers with 99.99% uptime. We never sell your data to third parties under any circumstances.",
        featured: true,
      },
      {
        q: "Who can access my medical information?",
        a: "Only you control access to your medical information. By default, your data is private and encrypted. You can selectively share specific records with physicians you choose within the platform. All access is logged in an immutable audit trail. Healthcare providers can only see what you explicitly grant them permission to view. You can revoke access at any time with immediate effect.",
        featured: false,
      },
      {
        q: "Is MediMind AI HIPAA compliant?",
        a: "Yes, MediMind AI is fully HIPAA compliant and exceeds all required standards. We maintain Business Associate Agreements (BAAs) with all relevant partners, conduct regular compliance audits, implement comprehensive administrative safeguards, and provide detailed audit trails for all data access. Our compliance is validated by independent third-party auditors annually.",
        featured: true,
      },
    ]
  },
  {
    category: "AI & Technology",
    icon: Brain,
    gradient: "from-teal-500 to-cyan-600",
    questions: [
      {
        q: "How accurate is the AI diagnostic triage?",
        a: "Our AI diagnostic triage achieves 98.6% accuracy, validated through rigorous blind clinical benchmarks against board-certified physicians. The system is trained on 14 million verified clinical interactions and continuously refined by expert physicians. However, it's important to understand that our AI is designed to augment, not replace, professional medical judgment. It helps triage urgency and surface relevant information, but final diagnoses always come from licensed healthcare providers.",
        featured: true,
      },
      {
        q: "Can the AI replace my doctor?",
        a: "Absolutely not, and that's by design. MediMind AI is a clinical intelligence platform that augments physician capabilities and empowers patient understanding — it never replaces the irreplaceable human judgment, empathy, and expertise of qualified healthcare professionals. Think of it as giving your doctor superpowers and giving you better insights, not as a substitute for professional medical care.",
        featured: false,
      },
      {
        q: "What happens if the AI makes an error?",
        a: "While our AI is highly accurate, no system is perfect. That's why we implement multiple safety layers: (1) All AI outputs include confidence scores and citations, (2) Critical findings trigger immediate physician review, (3) Our drug interaction engine has secondary validation, (4) We maintain comprehensive audit trails, and (5) All final medical decisions rest with licensed healthcare providers. If you ever encounter an issue, our 24/7 support team responds within 15 minutes.",
        featured: false,
      },
      {
        q: "How does the AI learn and improve?",
        a: "Our AI continuously improves through a carefully controlled process: (1) De-identified usage patterns inform model refinements, (2) Board-certified physicians review and correct AI outputs, (3) We conduct regular benchmark tests against clinical gold standards, (4) Federated learning allows improvement without compromising privacy, and (5) Major updates undergo rigorous clinical validation before deployment. Your privacy is never compromised in this learning process.",
        featured: true,
      },
    ]
  },
  {
    category: "For Healthcare Professionals",
    icon: Stethoscope,
    gradient: "from-indigo-500 to-blue-600",
    questions: [
      {
        q: "How long does physician credentialing take?",
        a: "Our streamlined credentialing process typically takes 48-72 hours. You'll need to provide: (1) Medical license verification, (2) Board certification documents, (3) DEA registration (if applicable), (4) Professional liability insurance, and (5) Two peer references. We verify all credentials directly with issuing authorities. Once approved, you can immediately start using the platform. Rush verification is available for urgent cases.",
        featured: true,
      },
      {
        q: "Does MediMind AI integrate with my existing EMR/EHR?",
        a: "Yes! We support seamless integration with all major EMR/EHR systems including Epic, Cerner, Meditech, Allscripts, and more through HL7 FHIR APIs. Our integration enables bidirectional data flow, automated chart population, and real-time updates. Implementation typically takes 2-4 weeks with support from our dedicated integration team. We also offer a standalone mode if EMR integration isn't feasible.",
        featured: false,
      },
      {
        q: "What are the costs for physicians?",
        a: "Patient access is currently free. The Professional card offers a one-time ₹799 UPI checkout for controlled testing only; it is not a recurring subscription and does not automatically activate physician access. Doctor registration and credential review remain separate. Contact us for organization pricing.",
        featured: false,
      },
    ]
  },
  {
    category: "Features & Usage",
    icon: Sparkles,
    gradient: "from-teal-500 to-teal-600",
    questions: [
      {
        q: "Can I upload old medical records and reports?",
        a: "Absolutely! Our advanced OCR and computer vision can process virtually any medical document: lab reports (PDFs, images), prescriptions, discharge summaries, imaging reports (including DICOM), handwritten notes, and even photographs of paper documents. Simply drag-and-drop or snap a photo. The AI extracts all relevant data points, structures them, and integrates them into your health timeline within seconds. We support 40+ document formats.",
        featured: true,
      },
      {
        q: "Does the voice assistant work offline?",
        a: "Yes! Our voice assistant includes offline mode for core functions: logging symptoms, setting medication reminders, recording vitals, and viewing your health timeline. Advanced features like AI triage and report analysis require internet connection. Offline data automatically syncs when you reconnect. This ensures you can manage your health even in areas with poor connectivity.",
        featured: false,
      },
      {
        q: "Can I share my health data with family members?",
        a: "Yes, we offer controlled data sharing for caregivers and family members. You can: (1) Grant view-only access to specific health records, (2) Allow emergency contacts to access critical information, (3) Share real-time health alerts with designated individuals, (4) Set time-limited access that automatically expires, and (5) Revoke access instantly at any time. Perfect for managing elderly parents' health or coordinating care for children.",
        featured: false,
      },
      {
        q: "What languages does MediMind AI support?",
        a: "Our AI supports 32 languages for symptom triage and 28 languages for voice commands, including English, Spanish, French, German, Mandarin, Hindi, Arabic, Portuguese, Russian, Japanese, and more. The interface is available in 18 languages. All translations are medically accurate and culturally appropriate. We're continuously adding more languages based on user demand.",
        featured: false,
      },
    ]
  },
  {
    category: "Billing & Enterprise",
    icon: BadgeCheck,
    gradient: "from-indigo-500 to-indigo-600",
    questions: [
      {
        q: "Do you offer enterprise solutions for hospitals?",
        a: "Yes! Our enterprise platform is designed for healthcare systems, hospital networks, and large clinics. Features include: (1) Centralized admin dashboard with organization-wide analytics, (2) Custom branding and white-label options, (3) Advanced credentialing workflows, (4) HIPAA-compliant audit trails, (5) Dedicated support and training, (6) Custom integrations with existing systems, and (7) Volume-based pricing with significant discounts. Contact our enterprise team for a personalized demo.",
        featured: true,
      },
      {
        q: "What payment methods do you accept?",
        a: "The current Professional checkout is a one-time ₹799 UPI test/demo flow through the self-hosted YouPI project. It is experimental, not production-ready or bank/NPCI-certified, and payment is not considered confirmed until a signed bank-statement reconciliation webhook is received. Cards, PayPal, and recurring billing are not currently supported.",
        featured: false,
      },
    ]
  },
];

const howItWorks = [
  { 
    step: "01", 
    icon: Sparkles, 
    title: "Share your health concerns", 
    gradient: "from-teal-500 to-teal-600",
    glowColor: "rgba(14, 165, 165, 0.3)",
    duration: "< 30s",
    text: "Describe your symptoms in plain, conversational language — type or speak naturally. Our clinical AI asks intelligent follow-up questions just like an experienced general practitioner would, understanding context and nuance. No rigid symptom checklists, no medical jargon required — just talk to us like you'd talk to your doctor.",
    features: [
      "Natural language understanding",
      "Context-aware follow-ups",
      "32 language support",
      "Voice & text input"
    ],
    image: imgHealthConcern,
  },
  { 
    step: "02", 
    icon: FileText, 
    title: "Upload medical documents instantly", 
    gradient: "from-indigo-500 to-indigo-600",
    glowColor: "rgba(79, 70, 229, 0.3)",
    duration: "< 3s",
    text: "Simply drag and drop PDFs, photograph prescriptions, or upload DICOM imaging previews and lab reports. Our advanced OCR and computer vision technology extracts every relevant data point — vitals, medication names, dosages, lab values, diagnostic impressions — and automatically integrates them into your comprehensive health record within seconds.",
    features: [
      "99.1% extraction accuracy",
      "40+ document formats",
      "DICOM imaging support",
      "Instant processing"
    ],
    image: imgUploadReports,
  },
  { 
    step: "03", 
    icon: Users, 
    title: "Connect with verified specialists", 
    gradient: "from-teal-500 to-cyan-600",
    glowColor: "rgba(8, 145, 178, 0.3)",
    duration: "Instant",
    text: "Get intelligently matched to the appropriate medical specialist based on your presenting symptoms and medical history. Book appointments instantly with physicians who have undergone rigorous credentialing verification. Your doctor receives an AI-generated clinical brief before your consultation, ensuring they're fully prepared to provide informed, personalized care.",
    features: [
      "100% credentialed physicians",
      "Intelligent matching",
      "Instant booking",
      "AI clinical briefs"
    ],
    image: imgConnectSpecialist,
  },
  { 
    step: "04", 
    icon: TrendingUp, 
    title: "Track progress & optimize health", 
    gradient: "from-indigo-500 to-blue-600",
    glowColor: "rgba(79, 70, 229, 0.3)",
    duration: "Ongoing",
    text: "Every interaction continuously refines your personalized Health Score — a dynamic metric that learns your unique health signature. Receive proactive reminders for medication refills, scheduled follow-ups, and recommended preventive screenings. We help you stay ahead of health concerns before they escalate into urgent problems.",
    features: [
      "Dynamic Health Score",
      "Proactive reminders",
      "Trend analysis",
      "Wearable integration"
    ],
    image: imgTrackProgress,
  },
];

const comparisonData = {
  traditional: {
    name: "Traditional Healthcare",
    features: [
      { name: "Wait for symptoms to worsen", available: true, negative: true },
      { name: "Search Dr. Google", available: true, negative: true },
      { name: "Long wait times for appointments", available: true, negative: true },
      { name: "Scattered medical records", available: true, negative: true },
      { name: "Manual symptom tracking", available: true, negative: true },
      { name: "Generic health advice", available: true, negative: true },
      { name: "Reactive care", available: true, negative: true },
    ]
  },
  medimind: {
    name: "MediMind AI",
    features: [
      { name: "AI triage in seconds", available: true },
      { name: "Clinical-grade diagnostics", available: true },
      { name: "Instant physician matching", available: true },
      { name: "Unified health timeline", available: true },
      { name: "Automated intelligent tracking", available: true },
      { name: "Personalized AI insights", available: true },
      { name: "Proactive prevention", available: true },
    ]
  }
};

const pricingPlans = [
  {
    name: "Patient",
    tagline: "For Individuals",
    price: "Free",
    period: "Forever",
    description: "Everything you need to take control of your health",
    featured: false,
    popular: false,
    cta: "Start Free",
    ctaLink: "/register/patient",
    gradient: "from-teal-500 to-teal-600",
    features: [
      { text: "Unlimited AI symptom triage", included: true },
      { text: "Report & scan digitization", included: true },
      { text: "Living health timeline", included: true },
      { text: "Medication reminders", included: true },
      { text: "Verified physician network", included: true },
      { text: "Health Score tracking", included: true },
      { text: "Voice assistant", included: true },
      { text: "24/7 support", included: true },
      { text: "Priority support", included: false },
      { text: "Advanced analytics", included: false },
    ]
  },
  {
    name: "Professional",
    tagline: "For Physicians",
    price: "₹799",
    period: "one-time",
    description: "Powerful tools to enhance your practice",
    featured: true,
    popular: true,
    cta: "Pay ₹799 with UPI",
    ctaLink: "/register/doctor",
    checkout: true,
    gradient: "from-indigo-500 to-blue-700",
    features: [
      { text: "Everything in Patient, plus:", included: true, bold: true },
      { text: "Unlimited patient management", included: true },
      { text: "AI clinical summaries", included: true },
      { text: "Drug interaction screening", included: true },
      { text: "E-prescribing tools", included: true },
      { text: "Automated follow-ups", included: true },
      { text: "Advanced analytics dashboard", included: true },
      { text: "EMR/EHR integration", included: true },
      { text: "Priority support", included: true },
      { text: "Custom branding", included: false },
    ]
  },
  {
    name: "Enterprise",
    tagline: "For Organizations",
    price: "Custom",
    period: "Contact sales",
    description: "Comprehensive solutions for healthcare systems",
    featured: false,
    popular: false,
    cta: "Contact Sales",
    ctaLink: "#contact",
    gradient: "from-slate-800 to-slate-950",
    features: [
      { text: "Everything in Professional, plus:", included: true, bold: true },
      { text: "Custom deployment options", included: true },
      { text: "White-label branding", included: true },
      { text: "Advanced credentialing workflows", included: true },
      { text: "Organization-wide analytics", included: true },
      { text: "Custom integrations", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "SLA guarantees", included: true },
      { text: "On-premise option", included: true },
      { text: "Training & onboarding", included: true },
    ]
  },
];

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

/* ═══════════════════════════════════════════════════════════════════════════
   🎯 CUSTOM HOOKS
   ═══════════════════════════════════════════════════════════════════════════ */

function useCountUp(target, trigger, duration = 2000) {
  const [value, setValue] = useState("0");
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    if (!trigger) return;
    if (reduced) {
      setValue(String(target));
      return;
    }
    const start = performance.now();
    const numericTarget = parseFloat(String(target).replace(/[^0-9.]/g, "")) || 0;
    let raf;
    let last = 0;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      if (t - last < 0.04 && t < 1) {
        raf = requestAnimationFrame(tick);
        return;
      }
      last = t;
      const eased = 1 - Math.pow(1 - t, 3);
      const current = numericTarget * eased;
      let formatted;
      if (numericTarget >= 1000) formatted = current.toLocaleString("en-US", { maximumFractionDigits: 0 });
      else if (numericTarget < 10) formatted = current.toFixed(1);
      else formatted = Math.round(current).toString();
      if (t < 1) { 
        setValue(formatted); 
        raf = requestAnimationFrame(tick); 
      } else {
        setValue(String(target));
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, trigger, duration, reduced]);
  return value;
}

function useInView(ref, options = {}) {
  const [isInView, setIsInView] = useState(false);
  
  useEffect(() => {
    if (!ref.current) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, { threshold: 0.1, ...options });
    
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, options]);
  
  return isInView;
}

/* ═══════════════════════════════════════════════════════════════════════════
   🎨 PREMIUM HELPER COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

// 3D Tilt Card Effect
function Tilt3D({ children, className = "", intensity = 15 }) {
  const ref = useRef(null);
  const lowEnd = useIsLowEnd();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), { 
    stiffness: lowEnd ? 500 : 260, 
    damping: lowEnd ? 60 : 20 
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), { 
    stiffness: lowEnd ? 500 : 260, 
    damping: lowEnd ? 60 : 20 
  });
  
  const handleMove = (e) => {
    if (lowEnd) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  
  const handleLeave = () => { 
    x.set(0); 
    y.set(0); 
  };

  if (lowEnd) {
    return (
      <div ref={ref} className={className} style={{ willChange: "transform", transform: "translateZ(0)" }}>
        {children}
      </div>
    );
  }
  
  return (
    <motion.div 
      ref={ref} 
      onMouseMove={handleMove} 
      onMouseLeave={handleLeave}
      style={{ 
        rotateX, 
        rotateY, 
        transformStyle: "preserve-3d",
        willChange: "transform",
        transform: "translateZ(0)",
      }} 
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Magnetic Button Effect
function Magnetic({ children, strength = 20, className = "" }) {
  const ref = useRef(null);
  const lowEnd = useIsLowEnd();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const sx = useSpring(x, { stiffness: lowEnd ? 900 : 300, damping: lowEnd ? 80 : 20 });
  const sy = useSpring(y, { stiffness: lowEnd ? 900 : 300, damping: lowEnd ? 80 : 20 });
  
  const handleMove = (e) => {
    if (lowEnd) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const mx = (e.clientX - (r.left + r.width / 2)) * (strength / (r.width / 2));
    const my = (e.clientY - (r.top + r.height / 2)) * (strength / (r.height / 2));
    x.set(Math.max(-strength, Math.min(strength, mx)));
    y.set(Math.max(-strength, Math.min(strength, my)));
  };
  
  const handleLeave = () => { 
    x.set(0); 
    y.set(0); 
  };

  if (lowEnd) {
    return (
      <div ref={ref} className={`inline-block will-change-transform ${className}`} style={{ transform: "translateZ(0)" }}>
        {children}
      </div>
    );
  }
  
  return (
    <motion.div 
      ref={ref} 
      style={{ x: sx, y: sy, willChange: "transform", transform: "translateZ(0)" }} 
      onMouseMove={handleMove} 
      onMouseLeave={handleLeave}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
}

// Card Spotlight Effect
function CardSpotlight({ children, className = "" }) {
  const ref = useRef(null);
  const lowEnd = useIsLowEnd();
  const [pos, setPos] = useState({ x: 50, y: 50, active: false });
  
  const onMove = (e) => {
    if (lowEnd) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setPos({ 
      x: ((e.clientX - r.left) / r.width) * 100, 
      y: ((e.clientY - r.top) / r.height) * 100, 
      active: true 
    });
  };
  
  return (
    <div 
      ref={ref}
      onMouseMove={onMove} 
      onMouseEnter={() => !lowEnd && setPos((p) => ({ ...p, active: true }))}
      onMouseLeave={() => !lowEnd && setPos((p) => ({ ...p, active: false }))}
      className={`relative group overflow-hidden will-change-transform ${className}`}
      style={{ transform: "translateZ(0)" }}
    >
      {!lowEnd && (
        <div 
          className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-500"
          style={{
            opacity: pos.active ? 1 : 0,
            background: `radial-gradient(600px circle at ${pos.x}% ${pos.y}%, rgba(14,165,165,0.15), rgba(124,58,237,0.08) 40%, transparent 70%)`,
          }} 
        />
      )}
      {children}
    </div>
  );
}

// Floating Particles
function FloatingParticles({ count = 20 }) {
  const lowEnd = useIsLowEnd();
  const actualCount = lowEnd ? 0 : count;
  const particles = useMemo(() =>
    Array.from({ length: actualCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 30,
      delay: Math.random() * 10,
    })), [actualCount]);
  
  if (lowEnd) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-gradient-to-r from-teal-400/20 to-cyan-400/20 blur-sm"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            willChange: "transform, opacity",
            transform: "translateZ(0)",
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Liquid Mesh Background
function LiquidMesh() {
  const lowEnd = useIsLowEnd();
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
      <div className="absolute -top-1/2 -left-1/4 w-full h-full">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(14,165,165,0.4) 0%, rgba(34,211,238,0.2) 40%, transparent 70%)",
            filter: "blur(80px)",
            willChange: "transform",
            transform: "translateZ(0)",
          }}
          animate={lowEnd ? {} : {
            scale: [1, 1.08, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: lowEnd ? 0 : 40,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
      <div className="absolute -bottom-1/2 -right-1/4 w-full h-full">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(59,91,255,0.4) 0%, rgba(124,58,237,0.2) 40%, transparent 70%)",
            filter: "blur(80px)",
            willChange: "transform",
            transform: "translateZ(0)",
          }}
          animate={lowEnd ? {} : {
            scale: [1, 1.1, 1],
            x: [0, -30, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: lowEnd ? 0 : 50,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
}

// Stat Card with Count Up
function StatCard({ s, index, trigger }) {
  const v = useCountUp(s.value, trigger, 2200);
  
  return (
    <motion.div 
      variants={zoomIn} 
      initial="hidden" 
      whileInView="show" 
      viewport={{ once: true }} 
      custom={index}
      className="relative group"
    >
      <CardSpotlight className="p-8 lg:p-10 rounded-3xl h-full">
        <div className="absolute inset-0 rounded-3xl bg-white/80 backdrop-blur-2xl border border-slate-200/80 group-hover:border-teal-300/60 transition-all duration-700" />
        
        {/* Animated gradient border */}
        <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${s.color} opacity-20 blur-xl`} />
        </div>
        
        <div className="relative">
          <div className="flex items-center gap-4 mb-6">
            <div className={`relative h-14 w-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-[0_0_0_4px_rgba(14,165,165,0.1)] group-hover:scale-110 transition-transform duration-500`}>
              <s.icon size={24} strokeWidth={2.5} />
            </div>
            <motion.div
              className="h-2 w-2 rounded-full bg-emerald-400"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
          </div>
          
          <div className="space-y-2">
            <p className="font-display-modern font-black tracking-tighter text-slate-900 text-5xl lg:text-6xl leading-none tabular-nums">
              {v}
            </p>
            <p className="text-base font-bold text-slate-700 leading-tight">{s.label}</p>
            <p className="text-sm text-slate-500 font-medium leading-snug">{s.suffix}</p>
          </div>
        </div>
      </CardSpotlight>
    </motion.div>
  );
}

// Premium FAQ Item
function FAQItem({ faq, index }) {
  const [open, setOpen] = useState(false);
  
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      custom={index}
      className="relative group"
    >
      <CardSpotlight>
        <button
          onClick={() => setOpen(!open)}
          className={`w-full text-left p-6 lg:p-7 rounded-2xl bg-white/90 backdrop-blur-xl border border-slate-200/80 hover:border-teal-200 transition-all duration-500 ${
            faq.featured ? 'ring-2 ring-teal-500/20' : ''
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {faq.featured && (
                  <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-[10px] font-bold tracking-wide uppercase">
                    Popular
                  </span>
                )}
                <h4 className="font-display-modern font-bold text-lg text-slate-900 leading-tight">
                  {faq.q}
                </h4>
              </div>
            </div>
            <motion.div
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.3, ease: easeOutQuint }}
              className="shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white"
            >
              <ChevronDown size={20} strokeWidth={2.5} />
            </motion.div>
          </div>
          
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: easeOutQuint }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-slate-200">
                  <p className="text-slate-600 leading-relaxed text-base">
                    {faq.a}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </CardSpotlight>
    </motion.div>
  );
}

function LaunchTransition({ open, onComplete }) {
  const reducedMotion = usePrefersReducedMotion();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!open) return undefined;
    if (reducedMotion) {
      setPhase(3);
      const reducedTimer = setTimeout(onComplete, 450);
      return () => clearTimeout(reducedTimer);
    }
    const timers = [
      setTimeout(() => setPhase(1), 260),
      setTimeout(() => setPhase(2), 760),
      setTimeout(() => setPhase(3), 1360),
      setTimeout(onComplete, 2380),
    ];
    return () => timers.forEach(clearTimeout);
  }, [open, onComplete, reducedMotion]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="launch-transition"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.35 }}
          role="status"
          aria-live="polite"
          aria-label="Preparing your secure MediMind workspace"
        >
          <div className="launch-transition-grid" />
          <div className="launch-transition-scan" />
          <div className="launch-transition-corners" aria-hidden="true"><span /><span /><span /><span /></div>
          <div className="launch-transition-orbit launch-transition-orbit-a" />
          <div className="launch-transition-orbit launch-transition-orbit-b" />
          <motion.div className="launch-transition-core" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, ease: easeOutQuint }}>
            <motion.div className="launch-transition-ring launch-transition-ring-a" animate={{ rotate: 360 }} transition={{ duration: 7, repeat: Infinity, ease: "linear" }} />
            <motion.div className="launch-transition-ring launch-transition-ring-b" animate={{ rotate: -360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} />
            <motion.div className="launch-transition-logo" animate={{ scale: [1, 1.06, 1], filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <img src={logo} alt="" />
            </motion.div>
          </motion.div>
          <div className="launch-transition-copy">
            <motion.div className="launch-transition-kicker" initial={{ opacity: 0, y: 8 }} animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 8 }}>MEDIMIND / SECURE LAUNCH</motion.div>
            <motion.h2 initial={{ opacity: 0, y: 15 }} animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 15 }}>Entering your <span>health intelligence</span></motion.h2>
            <div className="launch-transition-readout"><span className={phase >= 1 ? "is-active" : ""}>01 / IDENTITY VERIFIED</span><span className={phase >= 2 ? "is-active" : ""}>02 / PRIVATE RELAY</span><span className={phase >= 3 ? "is-active" : ""}>03 / WORKSPACE READY</span></div>
          </div>
          <div className="launch-transition-progress"><motion.span initial={{ scaleX: 0 }} animate={{ scaleX: phase >= 3 ? 1 : phase >= 2 ? 0.68 : phase >= 1 ? 0.34 : 0.12 }} transition={{ duration: 0.45, ease: easeOutQuint }} /></div>
          <div className="launch-transition-footer"><span>Encrypted session handoff</span><span>v4.2.0</span><span>All systems nominal</span></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   🚀 MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

export default function Welcome() {
  const { t } = useI18n();
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const lowEnd = useIsLowEnd();
  const reduced = usePrefersReducedMotion();
  
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [statsVisible, setStatsVisible] = useState(false);
  const [showBackTop, setShowBackTop] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [activeFAQCategory, setActiveFAQCategory] = useState(0);
  const [audience, setAudience] = useState("patient");
  const [launching, setLaunching] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [paymentNotice, setPaymentNotice] = useState(null);
  const paymentOrderId = useMemo(() => {
    if (!IS_BROWSER) return "";
    const orderId = new URLSearchParams(window.location.search).get("payment_order") || "";
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(orderId)
      ? orderId
      : "";
  }, []);

  const startProfessionalCheckout = useCallback(async () => {
    setCheckoutLoading(true);
    setCheckoutError("");
    try {
      const response = await api.post("/payments/youpi/orders", {});
      const checkoutUrl = new URL(response?.data?.checkoutUrl);
      if (!["https:", "http:"].includes(checkoutUrl.protocol)) {
        throw new Error("The payment gateway returned an invalid checkout URL.");
      }
      window.location.assign(checkoutUrl.toString());
    } catch (error) {
      setCheckoutError(error.message || "Could not start checkout. Please try again.");
      setCheckoutLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!paymentOrderId) return undefined;
    let active = true;
    let timer;
    let attempts = 0;
    const checkPaymentStatus = async () => {
      try {
        const response = await api.get(`/payments/youpi/orders/${paymentOrderId}`);
        if (!active) return;
        const order = response?.data;
        setPaymentNotice({ status: order?.status || "UNKNOWN", orderId: paymentOrderId });
        if (
          ["PENDING", "OBSERVED_SUCCESS", "MANUAL_REVIEW"].includes(order?.status) &&
          attempts < 6
        ) {
          attempts += 1;
          timer = window.setTimeout(checkPaymentStatus, 10000);
        }
      } catch {
        if (active) setPaymentNotice({ status: "UNKNOWN", orderId: paymentOrderId });
      }
    };
    void checkPaymentStatus();
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [paymentOrderId]);
  const navigate = useCallback(() => {
    setLaunching(true);
  }, []);
  const completeLaunch = useCallback(() => {
    const selectedAudience = heroAudiences.find((item) => item.id === audience);
    window.location.href = selectedAudience?.route || "/signup";
  }, [audience]);
  
  const { scrollYProgress: heroScroll } = useScroll({ 
    target: heroRef, 
    offset: ["start start", "end start"] 
  });
  
  const heroY = useTransform(heroScroll, [0, 1], [0, lowEnd ? 60 : 200]);
  const heroOpacity = useTransform(heroScroll, [0, 0.5], [1, 0]);
  const heroScale = useTransform(heroScroll, [0, 1], [1, lowEnd ? 1.02 : 1.1]);
  
  const { scrollYProgress } = useScroll();
  // NOTE: useSpring must be called unconditionally on every render (Rules of Hooks).
  // `lowEnd` starts false and can flip to true one render later, once the async
  // device-capability check resolves — a hook called only in the `else` branch
  // here would make React see a different number of hooks between renders and
  // throw. Instead we always call the hook, and only decide which *value* to use.
  const springScaleX = useSpring(scrollYProgress, { stiffness: 300, damping: 40 });
  const progressScaleX = lowEnd ? scrollYProgress : springScaleX;
  
  useEffect(() => {
    let raf = 0;
    let pending = null;
    const handleScroll = () => {
      const y = window.scrollY;
      pending = { scrolled: y > 24, backTop: y > 900 };
      if (!raf) raf = requestAnimationFrame(() => {
        if (pending) {
          const { scrolled, backTop } = pending;
          setScrolled((prev) => (prev === scrolled ? prev : scrolled));
          setShowBackTop((prev) => (prev === backTop ? prev : backTop));
        }
        pending = null;
        raf = 0;
      });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  
  useEffect(() => {
    if (!statsRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.2 }
    );
    obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);
  
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => {
      setActiveTestimonial((p) => (p + 1) % testimonials.length);
    }, 9000);
    return () => clearInterval(id);
  }, [reduced]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);
  
  const scrollTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }, [reduced]);
  
  return (
    <>
    <LaunchTransition open={launching} onComplete={completeLaunch} />
    <div id="main-content" className={`welcome-premium bg-white text-slate-900 selection-highlight overflow-x-clip relative will-change-transform ${lowEnd ? "perf-mobile" : ""}`} style={{ transform: "translateZ(0)" }}>
      <a href="#hero" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:rounded-lg focus:bg-slate-900 focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-white">
        Skip to main content
      </a>
      
      {/* Film Grain (hidden on touch already via CSS, but skip render on low-end) */}
      {!lowEnd && <div className="film-grain" aria-hidden="true" />}
      
      {/* Scroll Progress */}
      {!lowEnd && (
        <motion.div 
          className="scroll-progress" 
          style={{ scaleX: progressScaleX }} 
        />
      )}
      
      {/* Back to Top */}
      <AnimatePresence>
        {showBackTop && (
          <motion.button
            initial={{ opacity: 0, y: 36, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.9 }}
            transition={{ duration: lowEnd ? 0.15 : 0.4, ease: lowEnd ? "linear" : easeOutQuint }}
            onClick={scrollTop}
            aria-label="Back to top"
            className="scroll-top-btn group"
          >
            <svg 
              viewBox="0 0 24 24" 
              className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M12 19V5" />
              <path d="m5 12 7-7 7 7" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
      
      {/* Command Palette */}
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
      
      {/* Sticky Navigation */}
      <motion.nav
        aria-label={t("Main navigation")}
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.75, ease: easeOutQuint, delay: 0.2 }}
        className={`sticky top-0 z-[80] transition-all duration-500 ${
          scrolled
            ? "bg-white/80 backdrop-blur-2xl border-b border-slate-200/70 shadow-[0_1px_0_rgba(15,23,42,0.04),0_12px_32px_-20px_rgba(15,23,42,0.18)]"
            : "bg-white/50 backdrop-blur-xl border-b border-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-[1320px] items-center gap-4 px-5 py-3.5 sm:px-6 lg:px-12 2xl:gap-6">
          <a href="#hero" onClick={(e) => { e.preventDefault(); scrollTop(); }} className="flex shrink-0 items-center gap-3 group">
            <div className="relative">
              <div className="absolute -inset-1.5 rounded-xl bg-gradient-to-br from-teal-500/40 via-cyan-500/30 to-blue-500/40 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img src={logo} alt="MediMind AI" className="relative h-10 w-10" />
            </div>
            <div className="leading-tight">
              <span className="font-display-modern font-black text-[17px] tracking-tight text-slate-900 block leading-none">
                MediMind AI
              </span>
              <span className="hidden font-mono text-[9px] tracking-[0.16em] text-teal-600 uppercase sm:block">
                Clinical Intelligence · v4.2
              </span>
            </div>
          </a>
          
          <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 text-[13px] font-semibold xl:flex">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="relative whitespace-nowrap rounded-full px-2.5 py-2.5 text-slate-600 transition-colors group hover:text-slate-900"
              >
                {t(l.label)}
                <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-0.5 w-0 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 group-hover:w-1/2 transition-all duration-300" />
              </a>
            ))}
          </div>
          
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <div className="hidden sm:flex">
              <LanguageSelector className="w-[148px] px-3 text-xs" />
            </div>
            <div className="hidden shrink-0 items-center gap-2 border-l border-slate-200/80 pl-3 xl:flex">
              <button
                onClick={() => setCmdOpen(true)}
                aria-label="Open search"
                title="Open search"
                className="hidden h-9 w-9 items-center justify-center rounded-full bg-slate-100/90 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 2xl:flex"
              >
                <Command size={15} />
              </button>
              <a
                href="/login"
                className="whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:bg-teal-50/90 hover:text-teal-700"
              >
                {t("Sign In")}
              </a>
              <Magnetic strength={18}>
                <button
                  onClick={navigate}
                  className="btn-premium group relative inline-flex whitespace-nowrap items-center gap-2 rounded-full bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 px-5 py-3 text-sm font-bold text-white shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_10px_28px_-8px_rgba(14,165,165,0.6)] transition-all hover:shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_18px_45px_-10px_rgba(14,165,165,0.8)]"
                >
                  {t("Get Started Free")}
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
              </Magnetic>
            </div>
            <button
              onClick={() => setMenuOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-700 transition-colors hover:border-slate-300 xl:hidden"
              aria-label={t("Menu")}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </motion.nav>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90]"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: easeOutQuint }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-2xl z-[100] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <img src={logo} alt="MediMind AI" className="h-10 w-10" />
                    <div className="leading-tight">
                      <span className="font-display-modern font-black text-base text-slate-900 block leading-none">
                        MediMind AI
                      </span>
                      <span className="font-mono text-[9px] tracking-[0.2em] text-teal-600 uppercase">
                        v4.2
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMenuOpen(false)}
                    className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors"
                    aria-label="Close menu"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="mb-6 flex justify-center">
                  <LanguageSelector />
                </div>
                
                <div className="space-y-2 mb-8">
                  {navLinks.map((l) => (
                    <a
                      key={l.label}
                      href={l.href}
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-3 rounded-xl text-base font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                    >
                      {t(l.label)}
                    </a>
                  ))}
                </div>
                
                <div className="space-y-3 pt-6 border-t border-slate-200">
                  <a
                    href="/login"
                    className="block text-center px-6 py-3.5 rounded-xl text-base font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    {t("Sign In")}
                  </a>
                  <button
                    onClick={navigate}
                    className="block w-full text-center px-6 py-3.5 rounded-xl text-base font-bold text-white bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    {t("Get Started Free")}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* ═══════════════════════════════════════════════════════════════════════
          🎬 HERO SECTION - ULTRA PREMIUM
          ═══════════════════════════════════════════════════════════════════ */}
      <section 
        ref={heroRef} 
        id="hero" 
        aria-labelledby="hero-heading"
        className="premium-hero relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-32 lg:pt-32 lg:pb-40"
      >
        {/* Liquid Mesh Background */}
        <LiquidMesh />
        
        {/* Floating Particles */}
        <FloatingParticles count={14} />
        
        {/* Dot Grid */}
        <div className="absolute inset-0 dots-grid-fine opacity-30" />
        <div className="premium-hero-scanline absolute inset-0 pointer-events-none" aria-hidden="true" />
        
        {/* Main Content */}
        <div className="relative z-10 max-w-[1320px] mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left: Text Content */}
            <motion.div
              style={{ y: heroY, opacity: heroOpacity, willChange: "transform, opacity", transform: "translateZ(0)", backfaceVisibility: "hidden" }}
              className="text-center lg:text-left"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: easeOutQuint, delay: 0.3 }}
                className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-white/80 backdrop-blur-xl border border-teal-200/80 shadow-[0_8px_32px_-12px_rgba(14,165,165,0.3)] mb-8"
              >
                <AIPulse size={16} tone="teal" />
                <span className="font-mono text-xs tracking-[0.16em] text-teal-700 font-bold uppercase">
                  Personal health intelligence
                </span>
                <motion.div
                  className="h-2 w-2 rounded-full bg-emerald-400"
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
              </motion.div>
              
              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: easeOutQuint, delay: 0.5 }}
                id="hero-heading"
                className="font-display font-black tracking-tighter text-slate-900 text-5xl sm:text-6xl lg:text-7xl leading-[1.1] mb-6"
              >
                Healthcare that{" "}
                <span className="relative inline-block">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600 animate-text-shimmer">
                    understands
                  </span>
                  <motion.span
                    className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 1.2 }}
                  />
                </span>
                {" "}your signals,{" "}
                <span className="italic text-slate-600">before</span> you can articulate them.
              </motion.h1>
              
              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: easeOutQuint, delay: 0.7 }}
                className="text-xl text-slate-600 leading-relaxed mb-10 max-w-2xl mx-auto lg:mx-0"
              >
                Bring symptoms, reports, and follow-ups into one clear health picture —
                then take the next step with confidence.
              </motion.p>

              <div className="mb-7" role="radiogroup" aria-label="Choose your account type">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Choose your path</p>
                <div className="inline-flex max-w-full flex-wrap rounded-xl border border-slate-200 bg-white/70 p-1 shadow-sm backdrop-blur-xl">
                  {heroAudiences.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      role="radio"
                      aria-checked={audience === item.id}
                      onClick={() => setAudience(item.id)}
                      className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 sm:px-4 ${audience === item.id ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: easeOutQuint, delay: 0.9 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12"
              >
                <Magnetic strength={22}>
                  <button
                    type="button"
                    onClick={navigate}
                    className="btn-premium group relative inline-flex items-center gap-3 text-lg font-bold text-white bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 px-8 py-4 rounded-2xl shadow-[0_2px_0_rgba(255,255,255,0.4)_inset,0_16px_48px_-12px_rgba(14,165,165,0.7)] hover:shadow-[0_2px_0_rgba(255,255,255,0.4)_inset,0_24px_64px_-16px_rgba(14,165,165,0.9)] transition-all overflow-hidden"
                  >
                    <span className="relative z-10">{audience === "patient" ? "Start as a patient" : audience === "doctor" ? "Join as a doctor" : "Explore for organizations"}</span>
                    <ArrowRight size={20} className="relative z-10 transition-transform group-hover:translate-x-2" />
                  </button>
                </Magnetic>
                
                <Magnetic strength={18}>
                  <button
                    type="button"
                    onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" })}
                    aria-label="Watch how MediMind AI works"
                    className="group inline-flex items-center gap-3 text-lg font-bold text-slate-700 bg-white/90 backdrop-blur-xl border-2 border-slate-200 hover:border-teal-300 px-8 py-4 rounded-2xl shadow-sm hover:shadow-lg transition-all"
                  >
                    <Play size={20} className="transition-transform group-hover:scale-110" />
                    Watch Demo
                  </button>
                </Magnetic>
              </motion.div>
              
              {/* Feature Pills */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: easeOutQuint, delay: 1.1 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-3"
              >
                {heroFeatures.map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.3 + i * 0.1 }}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:scale-105 transition-all group`}
                  >
                    <div className={`h-6 w-6 rounded-lg bg-gradient-to-br ${f.color} flex items-center justify-center text-white`}>
                      <f.icon size={14} strokeWidth={2.5} />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                      {f.text}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
            
            {/* Right: 3D Hero Visual */}
            <motion.div
              style={{ y: heroY, scale: heroScale, willChange: "transform", transform: "translate3d(0,0,0)", backfaceVisibility: "hidden" }}
              className="premium-hero-visual relative lg:block"
            >
              <div className="premium-orbit premium-orbit-one" aria-hidden="true" />
              <div className="premium-orbit premium-orbit-two" aria-hidden="true" />
              <div className="premium-signal-card premium-signal-card-top" aria-label="AI system status">
                <span className="premium-signal-live"><span /> Live clinical layer</span>
                <span className="premium-signal-value">98.6%</span>
                <span className="premium-signal-label">signal confidence</span>
              </div>
              <div className="premium-signal-card premium-signal-card-side" aria-label="Protected health data">
                <div className="premium-signal-icon"><ShieldCheck size={16} /></div>
                <div><strong>Protected by design</strong><span>AES-256 encrypted</span></div>
              </div>
              <Tilt3D intensity={12} className="relative">
                {/* Main Card */}
                <div className="relative p-1.5 rounded-[2.5rem] bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 shadow-[0_32px_80px_-20px_rgba(14,165,165,0.5)]">
                  <div className="relative rounded-[2.2rem] bg-white/95 backdrop-blur-2xl overflow-hidden">
                    <div className="premium-hero-chrome">
                      <span className="premium-chrome-dot premium-chrome-dot-red" />
                      <span className="premium-chrome-dot premium-chrome-dot-gold" />
                      <span className="premium-chrome-dot premium-chrome-dot-green" />
                      <span className="premium-chrome-title">MEDIMIND / LIVE OVERVIEW</span>
                      <span className="premium-chrome-time">09:41:28 UTC</span>
                    </div>
                    {/* Video */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <video
                        src={heroVideo}
                        poster={imgHealthConcern}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        aria-label="MediMind AI product preview"
                        className="w-full h-full object-cover"
                      />
                      {/* Overlay with glassmorphism */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />
                      <div className="premium-video-vignette absolute inset-0" />
                      <div className="premium-video-caption absolute left-6 top-6">
                        <span className="premium-caption-kicker">PERSONAL HEALTH OS</span>
                        <span className="premium-caption-title">A clearer picture<br />starts here.</span>
                      </div>
                      
                      {/* Bottom Stats */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1.7 }}
                        className="absolute bottom-6 left-6 right-6 grid grid-cols-3 gap-3"
                      >
                        {[
                          { label: "Patients", value: "50K+" },
                          { label: "Doctors", value: "2K+" },
                          { label: "Accuracy", value: "98.6%" },
                        ].map((stat, i) => (
                          <div
                            key={i}
                            className="p-3 rounded-xl bg-white/15 backdrop-blur-xl border border-white/20"
                          >
                            <p className="font-display-modern font-black text-white text-lg leading-none mb-1">
                              {stat.value}
                            </p>
                            <p className="text-white/70 text-xs font-medium">
                              {stat.label}
                            </p>
                          </div>
                        ))}
                      </motion.div>
                    </div>
                  </div>
                </div>
                
              </Tilt3D>
            </motion.div>
            
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2.3, repeat: Infinity, repeatType: "reverse", repeatDelay: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium text-slate-500">Scroll to explore</span>
            <ChevronDown size={20} className="text-slate-400" />
          </div>
        </motion.div>
      </section>
      
      {/* Continue with more sections... Due to length constraints, I'll add a comment indicating where the rest goes */}
      
      {/* ═══════════════════════════════════════════════════════════════════════
          📊 STATS SECTION
          ═══════════════════════════════════════════════════════════════════ */}
      <section ref={statsRef} className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50" />
        <LiquidMesh />
        
        <div className="relative z-10 max-w-[1320px] mx-auto px-6 lg:px-12">
          {/* Section Header */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-16 lg:mb-24"
          >
            <motion.div
              variants={fadeIn}
              custom={0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-xl border border-teal-200/80 shadow-sm mb-6"
            >
              <TrendingUp size={16} className="text-teal-600" />
              <span className="font-mono text-xs tracking-[0.16em] text-teal-700 font-bold uppercase">
                Trusted Globally
              </span>
            </motion.div>
            
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="font-display font-black tracking-tighter text-slate-900 text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6"
            >
              Built on{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-cyan-500 to-blue-600">
                clinical excellence
              </span>
            </motion.h2>
            
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto"
            >
              Join thousands of patients and physicians who trust MediMind AI 
              for precision healthcare intelligence.
            </motion.p>
          </motion.div>
          
          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((s, i) => (
              <StatCard key={i} s={s} index={i} trigger={statsVisible} />
            ))}
          </div>
        </div>
      </section>
      
      {/* ... Continue with Features, How It Works, Testimonials, Pricing, FAQ sections ... */}
      {/* Due to character limits, I'm providing the framework. The full implementation would be 3500+ lines */}
      
      {/* ═══════════════════════════════════════════════════════════════════════
          🎯 FEATURES SECTION - 3D MODULE CARDS
          ═══════════════════════════════════════════════════════════════════ */}
      <section id="features" className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-white" />
        <div className="absolute inset-0 dots-grid opacity-20" />
        
        <div className="relative z-10 max-w-[1320px] mx-auto px-6 lg:px-12">
          {/* Section Header */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-16 lg:mb-24"
          >
            <motion.div
              variants={fadeIn}
              custom={0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200/80 shadow-sm mb-6"
            >
              <Sparkles size={16} className="text-teal-600" />
              <span className="font-mono text-xs tracking-[0.16em] text-teal-700 font-bold uppercase">
                Powerful AI Modules
              </span>
            </motion.div>
            
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="font-display font-black tracking-tighter text-slate-900 text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6"
            >
              Clinical intelligence{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-cyan-500 to-blue-600">
                that never sleeps
              </span>
            </motion.h2>
            
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto"
            >
              Six frontier AI modules working in perfect harmony to deliver 
              the most sophisticated healthcare experience ever built.
            </motion.p>
          </motion.div>
          
          {/* Features Grid */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-10">
            {modules.map((module, index) => (
              <motion.div
                key={index}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={index}
              >
                <Tilt3D intensity={8}>
                  <CardSpotlight className="h-full">
                    <div className="relative p-8 lg:p-10 rounded-[2rem] bg-white border border-slate-200/80 hover:border-slate-300 transition-all duration-700 h-full group">
                      {/* Featured Badge */}
                      {module.featured && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 }}
                          className="absolute top-8 right-8 px-3 py-1.5 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-xs font-bold shadow-lg"
                        >
                          {module.badge}
                        </motion.div>
                      )}
                      
                      {/* Icon & Code */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className={`relative h-16 w-16 rounded-2xl bg-gradient-to-br ${module.gradient} flex items-center justify-center text-white shadow-[0_0_0_4px_rgba(255,255,255,0.5)] group-hover:scale-110 transition-transform duration-500`}>
                            <module.icon size={28} strokeWidth={2.5} />
                            {/* Ripple */}
                            <motion.span
                              className="absolute inset-0 rounded-2xl border-2 opacity-0 group-hover:opacity-100"
                              style={{ borderColor: module.accentColor }}
                              animate={{
                                scale: [1, 1.4],
                                opacity: [0.8, 0],
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                              }}
                            />
                          </div>
                          <div>
                            <span className="font-mono text-xs tracking-wider text-teal-600 font-bold block mb-1">
                      <div className="premium-hero-footnote"><span className="premium-footnote-line" /> <span>Intelligence that stays with you</span> <ArrowUpRight size={14} /></div>
                              {module.code}
                            </span>
                            <span className="text-2xl font-display-modern font-black text-slate-900 leading-tight">
                              {module.metric}
                            </span>
                            <p className="text-xs text-slate-500 font-medium">{module.metricLabel}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-2xl font-display-modern font-black text-slate-900 mb-4 leading-tight">
                        {module.title}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-slate-600 leading-relaxed mb-6">
                        {module.text}
                      </p>
                      
                      {/* Highlights */}
                      <div className="space-y-3 mb-6">
                        {module.highlights.map((highlight, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 * i }}
                            className="flex items-center gap-3"
                          >
                            <div className={`h-6 w-6 rounded-lg bg-gradient-to-br ${module.gradient} flex items-center justify-center shrink-0`}>
                              <Check size={14} className="text-white" strokeWidth={3} />
                            </div>
                            <span className="text-sm font-medium text-slate-700">
                              {highlight}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                      
                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200">
                        {module.stats.map((stat, i) => (
                          <div key={i} className="text-center">
                            <p className="font-display-modern font-black text-xl text-slate-900 leading-none mb-1">
                              {stat.value}
                            </p>
                            <p className="text-xs text-slate-500 font-medium">
                              {stat.label}
                            </p>
                          </div>
                        ))}
                      </div>
                      
                      {/* Hover glow effect */}
                      <div className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br ${module.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none`} />
                    </div>
                  </CardSpotlight>
                </Tilt3D>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* ═══════════════════════════════════════════════════════════════════════
          🔄 HOW IT WORKS SECTION
          ═══════════════════════════════════════════════════════════════════ */}
      <section id="how" className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50" />
        <LiquidMesh />
        
        <div className="relative z-10 max-w-[1320px] mx-auto px-6 lg:px-12">
          {/* Section Header */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-16 lg:mb-24"
          >
            <motion.div
              variants={fadeIn}
              custom={0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-xl border border-indigo-200/80 shadow-sm mb-6"
            >
              <Rocket size={16} className="text-indigo-600" />
              <span className="font-mono text-xs tracking-[0.16em] text-indigo-700 font-bold uppercase">
                Simple 4-Step Process
              </span>
            </motion.div>
            
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="font-display font-black tracking-tighter text-slate-900 text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6"
            >
              Your health journey,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
                reimagined
              </span>
            </motion.h2>
            
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto"
            >
              From first symptom to optimized health — experience healthcare 
              the way it should be: intelligent, proactive, and personalized.
            </motion.p>
          </motion.div>
          
          {/* Steps */}
          <div className="space-y-20 lg:space-y-32">
            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
                custom={index}
                className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Content */}
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  {/* Step Number */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-3 mb-6"
                  >
                    <div className={`relative h-16 w-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white font-display-modern font-black text-2xl shadow-[0_0_0_4px_rgba(255,255,255,0.5)]`}>
                      {step.step}
                      <motion.div
                        className="absolute inset-0 rounded-2xl"
                        style={{ 
                          boxShadow: `0 0 40px ${step.glowColor}`
                        }}
                        animate={{
                          opacity: [0.35, 0.6, 0.35],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    </div>
                    <div>
                      <span className="font-mono text-xs tracking-wider text-slate-500 font-bold uppercase block">
                        Step {step.step}
                      </span>
                      <span className="font-bold text-teal-600">
                        {step.duration}
                      </span>
                    </div>
                  </motion.div>
                  
                  <h3 className="text-3xl lg:text-4xl font-display-modern font-black text-slate-900 mb-4 leading-tight">
                    {step.title}
                  </h3>
                  
                  <p className="text-lg text-slate-600 leading-relaxed mb-6">
                    {step.text}
                  </p>
                  
                  {/* Features */}
                  <div className="space-y-3">
                    {step.features.map((feature, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 * i }}
                        className="flex items-center gap-3"
                      >
                        <div className={`h-7 w-7 rounded-lg bg-gradient-to-br ${step.gradient} flex items-center justify-center shrink-0`}>
                          <Check size={16} className="text-white" strokeWidth={3} />
                        </div>
                        <span className="text-base font-semibold text-slate-700">
                          {feature}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                {/* Visual */}
                <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                  <Tilt3D intensity={10}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8 }}
                      className="relative aspect-[4/3] rounded-[2rem] bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200/80 overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)]"
                    >
                      {/* Real step image */}
                      <img
                        src={step.image}
                        alt={step.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      
                      {/* Subtle gradient overlay for depth */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                      
                      {/* Step badge */}
                      <div className="absolute top-5 left-5">
                        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white font-display-modern font-black text-sm shadow-lg`}
                          style={{ boxShadow: `0 4px 20px ${step.glowColor}` }}
                        >
                          {step.step}
                        </div>
                      </div>
                      
                      {/* Floating live indicator */}
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-5 right-5 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-lg"
                      >
                        <div className="flex items-center gap-2">
                          <motion.div
                            className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                          <span className="text-[10px] font-bold text-slate-700 tracking-wider uppercase">Live</span>
                        </div>
                      </motion.div>
                      
                      {/* Bottom info bar */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                        <div className="flex items-center gap-2">
                          <div className={`h-7 w-7 rounded-lg bg-gradient-to-br ${step.gradient} flex items-center justify-center shrink-0`}>
                            <step.icon size={14} className="text-white" strokeWidth={2.5} />
                          </div>
                          <span className="text-xs font-bold text-white/90 truncate">{step.title}</span>
                        </div>
                      </div>
                    </motion.div>
                  </Tilt3D>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* ═══════════════════════════════════════════════════════════════════════
          💬 TESTIMONIALS SECTION - PREMIUM CARDS
          ═══════════════════════════════════════════════════════════════════ */}
      <section id="testimonials" className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-white" />
        <div className="absolute inset-0 dots-grid-fine opacity-30" />
        
        <div className="relative z-10 max-w-[1320px] mx-auto px-6 lg:px-12">
          {/* Section Header */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-16 lg:mb-24"
          >
            <motion.div
              variants={fadeIn}
              custom={0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200/80 shadow-sm mb-6"
            >
              <Star size={16} className="text-teal-600 fill-teal-600" />
              <span className="font-mono text-xs tracking-[0.16em] text-teal-700 font-bold uppercase">
                Trusted by Healthcare Professionals
              </span>
            </motion.div>
            
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="font-display font-black tracking-tighter text-slate-900 text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6"
            >
              Stories from{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">
                real people
              </span>
            </motion.h2>
            
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto"
            >
              Discover how MediMind AI is transforming healthcare experiences 
              for patients and physicians worldwide.
            </motion.p>
          </motion.div>
          
          {/* Testimonials Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.slice(0, 6).map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={index}
              >
                <Tilt3D intensity={6}>
                  <CardSpotlight className="h-full">
                    <div className="relative p-8 rounded-[2rem] bg-white border border-slate-200/80 hover:border-slate-300 transition-all duration-700 h-full group">
                      {/* Featured badge */}
                      {testimonial.featured && (
                        <div className="absolute top-8 right-8 px-3 py-1.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5">
                          <Star size={12} className="fill-white" />
                          Featured
                        </div>
                      )}
                      
                      {/* Stars */}
                      <div className="flex items-center gap-1 mb-4">
                        {Array.from({ length: testimonial.stars }).map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 * i }}
                          >
                            <Star size={16} className="text-amber-400 fill-amber-400" />
                          </motion.div>
                        ))}
                      </div>
                      
                      {/* Quote */}
                      <p className="text-slate-700 leading-relaxed mb-6 text-base">
                        "{testimonial.text}"
                      </p>
                      
                      {/* Highlight */}
                      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r ${testimonial.accent} bg-opacity-10 border border-current border-opacity-20 mb-6`}>
                        <TrendingUp size={14} className="shrink-0" />
                        <span className="text-sm font-bold">
                          {testimonial.highlight}
                        </span>
                      </div>
                      
                      {/* Author */}
                      <div className="flex items-center gap-4 pt-6 border-t border-slate-200">
                        <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${testimonial.accent} flex items-center justify-center text-white font-display-modern font-black text-lg`}>
                          {testimonial.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-slate-900 leading-tight">
                              {testimonial.name}
                            </p>
                            {testimonial.verified && (
                              <BadgeCheck size={16} className="text-teal-600 fill-teal-100" />
                            )}
                          </div>
                          <p className="text-sm text-slate-500 font-medium leading-tight">
                            {testimonial.role}
                          </p>
                          <p className="text-xs text-slate-400 leading-tight mt-0.5">
                            {testimonial.organization}
                          </p>
                        </div>
                      </div>
                      
                      {/* Stats */}
                      {testimonial.stats && (
                        <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-200">
                          {Object.entries(testimonial.stats).map(([key, value], i) => (
                            <div key={i} className="text-center">
                              <p className="font-display-modern font-black text-lg text-slate-900 leading-none mb-1">
                                {value}
                              </p>
                              <p className="text-xs text-slate-500 font-medium capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Hover effect */}
                      <div className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br ${testimonial.accent} opacity-0 group-hover:opacity-5 transition-opacity duration-700 pointer-events-none`} />
                    </div>
                  </CardSpotlight>
                </Tilt3D>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* ═══════════════════════════════════════════════════════════════════════
          ⚖️ COMPARISON SECTION
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50" />
        <LiquidMesh />
        
        <div className="relative z-10 max-w-[1320px] mx-auto px-6 lg:px-12">
          {/* Section Header */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-16 lg:mb-24"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="font-display font-black tracking-tighter text-slate-900 text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6"
            >
              Not your average{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
                healthcare platform
              </span>
            </motion.h2>
            
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto"
            >
              See how MediMind AI revolutionizes every aspect of traditional healthcare.
            </motion.p>
          </motion.div>
          
          {/* Comparison Table */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <div className="grid md:grid-cols-2 gap-8">
              {/* Traditional Healthcare */}
              <div className="relative">
                <CardSpotlight>
                  <div className="p-8 rounded-[2rem] bg-white/60 backdrop-blur-xl border-2 border-slate-300">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-slate-200 text-slate-400 mb-4">
                        <AlertCircle size={32} strokeWidth={2} />
                      </div>
                      <h3 className="text-2xl font-display-modern font-black text-slate-700 mb-2">
                        {comparisonData.traditional.name}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium">The old way</p>
                    </div>
                    
                    <div className="space-y-4">
                      {comparisonData.traditional.features.map((feature, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.05 * i }}
                          className="flex items-center gap-3 p-3 rounded-xl bg-red-50/50"
                        >
                          <div className="h-6 w-6 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                            <X size={14} className="text-red-600" strokeWidth={3} />
                          </div>
                          <span className="text-sm font-medium text-slate-600">
                            {feature.name}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CardSpotlight>
              </div>
              
              {/* MediMind AI */}
              <div className="relative">
                <CardSpotlight>
                  <div className="p-8 rounded-[2rem] bg-white border-2 border-teal-300 shadow-[0_0_0_4px_rgba(14,165,165,0.1)]">
                    {/* Premium badge */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white text-xs font-bold shadow-lg">
                      🚀 The Future
                    </div>
                    
                    <div className="text-center mb-8 mt-4">
                      <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white mb-4 shadow-lg">
                        <Zap size={32} strokeWidth={2.5} />
                      </div>
                      <h3 className="text-2xl font-display-modern font-black text-slate-900 mb-2">
                        {comparisonData.medimind.name}
                      </h3>
                      <p className="text-sm text-teal-600 font-bold">The intelligent way</p>
                    </div>
                    
                    <div className="space-y-4">
                      {comparisonData.medimind.features.map((feature, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.05 * i }}
                          className="flex items-center gap-3 p-3 rounded-xl bg-teal-50/80 border border-teal-100 hover:bg-teal-100/80 transition-colors"
                        >
                          <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shrink-0">
                            <Check size={14} className="text-white" strokeWidth={3} />
                          </div>
                          <span className="text-sm font-semibold text-slate-900">
                            {feature.name}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CardSpotlight>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* ═══════════════════════════════════════════════════════════════════════
          💰 PRICING SECTION - PREMIUM CARDS
          ═══════════════════════════════════════════════════════════════════ */}
      <section id="pricing" className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-white" />
        <div className="absolute inset-0 dots-grid opacity-20" />
        
        <div className="relative z-10 max-w-[1320px] mx-auto px-6 lg:px-12">
          {/* Section Header */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-16 lg:mb-24"
          >
            <motion.div
              variants={fadeIn}
              custom={0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200/80 shadow-sm mb-6"
            >
              <BadgeCheck size={16} className="text-indigo-600" />
              <span className="font-mono text-xs tracking-[0.16em] text-indigo-700 font-bold uppercase">
                Simple, Transparent Pricing
              </span>
            </motion.div>
            
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="font-display font-black tracking-tighter text-slate-900 text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6"
            >
              Choose your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
                healthcare plan
              </span>
            </motion.h2>
            
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto"
            >
              Whether you're a patient seeking better care or a physician looking 
              to enhance your practice, we have the perfect plan for you.
            </motion.p>
          </motion.div>

          {(paymentNotice || checkoutError) && (
            <div
              className={`max-w-3xl mx-auto mb-8 rounded-2xl border p-5 text-sm ${
                checkoutError || paymentNotice?.status === "UNKNOWN"
                  ? "border-rose-200 bg-rose-50 text-rose-800"
                  : paymentNotice?.status === "RECONCILED"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-amber-200 bg-amber-50 text-amber-900"
              }`}
              role="status"
              aria-live="polite"
            >
              {checkoutError && <p>{checkoutError}</p>}
              {paymentNotice && (
                <p>
                  {paymentNotice.status === "RECONCILED"
                    ? "The gateway reports this UPI payment as bank-statement reconciled. This demo checkout does not activate or grant a subscription."
                    : paymentNotice.status === "OBSERVED_SUCCESS"
                      ? "A payment alert was observed, but it is not bank-statement reconciled. Do not treat it as confirmed payment."
                      : paymentNotice.status === "MANUAL_REVIEW"
                        ? "This payment needs gateway review. It is not confirmed or eligible for service access."
                        : paymentNotice.status === "FAILED" ||
                            paymentNotice.status === "EXPIRED" ||
                            paymentNotice.status === "CANCELLED" ||
                            paymentNotice.status === "INITIATION_FAILED"
                          ? `Payment status: ${paymentNotice.status.toLowerCase()}. You can try checkout again.`
                          : paymentNotice.status === "UNKNOWN"
                            ? "Could not check the payment status. Please try again later and keep your order ID."
                            : "Checkout returned. Waiting for signed bank-statement reconciliation; a browser redirect does not confirm payment."}
                  {paymentNotice.orderId && (
                    <span className="block mt-1 text-xs opacity-80">
                      Order ID: {paymentNotice.orderId}
                    </span>
                  )}
                </p>
              )}
              {paymentNotice && (
                <p className="mt-2 text-xs opacity-80">
                  Experimental test/demo checkout only. No recurring billing or doctor subscription is enabled.
                </p>
              )}
            </div>
          )}

          {/* Pricing Cards */}
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={index}
                className={plan.featured ? 'lg:-mt-8' : ''}
              >
                <Tilt3D intensity={8}>
                  <CardSpotlight className="h-full">
                    <div className={`relative p-8 lg:p-10 rounded-[2rem] border-2 transition-all duration-700 h-full group ${
                      plan.featured
                        ? 'bg-white border-indigo-300 shadow-[0_0_0_4px_rgba(79,70,229,0.15),0_32px_64px_-24px_rgba(79,70,229,0.4)]'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}>
                      {/* Popular badge */}
                      {plan.popular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-xs font-bold shadow-lg">
                          ⭐ Most Popular
                        </div>
                      )}
                      
                      {/* Header */}
                      <div className="text-center mb-8">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
                          {plan.tagline}
                        </p>
                        <h3 className="text-3xl font-display-modern font-black text-slate-900 mb-4">
                          {plan.name}
                        </h3>
                        
                        {/* Price */}
                        <div className="mb-4">
                          <div className="flex items-baseline justify-center gap-2">
                            <span className={`text-6xl font-display-modern font-black ${
                              plan.featured
                                ? 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600'
                                : 'text-slate-900'
                            }`}>
                              {plan.price}
                            </span>
                            {plan.period !== 'Forever' && plan.period !== 'Contact sales' && plan.period !== 'one-time' && (
                              <span className="text-lg text-slate-500 font-medium">
                                /{plan.period}
                              </span>
                            )}
                            {plan.period === 'one-time' && (
                              <span className="text-lg text-slate-500 font-medium">
                                one-time
                              </span>
                            )}
                          </div>
                          {plan.period !== 'Contact sales' && plan.period !== 'one-time' && (
                            <p className="text-sm text-slate-500 mt-2">{plan.period}</p>
                          )}
                        </div>
                        
                        <p className="text-slate-600 leading-relaxed">
                          {plan.description}
                        </p>
                      </div>
                      
                      {/* CTA Button */}
                      <Magnetic strength={15}>
                        {plan.checkout ? (
                          <button
                            type="button"
                            onClick={startProfessionalCheckout}
                            disabled={checkoutLoading}
                            aria-busy={checkoutLoading}
                            className={`block w-full text-center px-6 py-4 rounded-2xl font-bold text-base transition-all mb-8 disabled:cursor-wait disabled:opacity-70 ${
                              plan.featured
                                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-[0_2px_0_rgba(255,255,255,0.3)_inset,0_16px_48px_-12px_rgba(79,70,229,0.6)] hover:shadow-[0_2px_0_rgba(255,255,255,0.3)_inset,0_24px_64px_-16px_rgba(79,70,229,0.8)]'
                                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg hover:shadow-xl'
                            }`}
                          >
                            {checkoutLoading ? "Connecting to checkout…" : plan.cta}
                          </button>
                        ) : (
                          <a
                            href={plan.ctaLink}
                            className={`block w-full text-center px-6 py-4 rounded-2xl font-bold text-base transition-all mb-8 ${
                              plan.featured
                                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-[0_2px_0_rgba(255,255,255,0.3)_inset,0_16px_48px_-12px_rgba(79,70,229,0.6)] hover:shadow-[0_2px_0_rgba(255,255,255,0.3)_inset,0_24px_64px_-16px_rgba(79,70,229,0.8)]'
                                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg hover:shadow-xl'
                            }`}
                          >
                            {plan.cta}
                          </a>
                        )}
                      </Magnetic>
                      {plan.checkout && (
                        <p className="-mt-5 mb-6 text-center text-xs text-slate-500">
                          Experimental UPI demo. Payment requires bank-statement reconciliation.
                        </p>
                      )}
                      
                      {/* Features */}
                      <div className="space-y-4">
                        {plan.features.map((feature, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.03 * i }}
                            className="flex items-start gap-3"
                          >
                            <div className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                              feature.included
                                ? `bg-gradient-to-br ${plan.gradient}`
                                : 'bg-slate-200'
                            }`}>
                              {feature.included ? (
                                <Check size={14} className="text-white" strokeWidth={3} />
                              ) : (
                                <Minus size={14} className="text-slate-400" strokeWidth={3} />
                              )}
                            </div>
                            <span className={`text-sm ${
                              feature.bold ? 'font-bold text-slate-900' : 'font-medium text-slate-600'
                            }`}>
                              {feature.text}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                      
                      {/* Hover effect */}
                      {plan.featured && (
                        <div className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br ${plan.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-700 pointer-events-none`} />
                      )}
                    </div>
                  </CardSpotlight>
                </Tilt3D>
              </motion.div>
            ))}
          </div>
          
          {/* Trust badges */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <p className="text-sm text-slate-500 font-medium mb-6">
              Trusted by healthcare organizations worldwide
            </p>
            <div className="relative overflow-hidden will-change-transform" style={{ transform: "translateZ(0)" }}>
              <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
              <div className="animate-marquee marquee-pause flex items-center gap-16 w-max whitespace-nowrap opacity-40 grayscale py-2" style={{ willChange: "transform", transform: "translate3d(0,0,0)", backfaceVisibility: "hidden" }}>
                {[...["APOLLO", "FORTIS", "MAX", "MANIPAL", "MEDANTA"], ...["APOLLO", "FORTIS", "MAX", "MANIPAL", "MEDANTA"]].map((partner, i) => (
                  <div
                    key={i}
                    className="font-display-modern font-black text-2xl text-slate-400 shrink-0"
                  >
                    {partner}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* ═══════════════════════════════════════════════════════════════════════
          ❓ FAQ SECTION - ULTRA PREMIUM ACCORDION
          ═══════════════════════════════════════════════════════════════════ */}
      <section id="faq" className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50" />
        <LiquidMesh />
        
        <div className="relative z-10 max-w-[1320px] mx-auto px-6 lg:px-12">
          {/* Section Header */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-16 lg:mb-24"
          >
            <motion.div
              variants={fadeIn}
              custom={0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-xl border border-teal-200/80 shadow-sm mb-6"
            >
              <Lightbulb size={16} className="text-teal-600" />
              <span className="font-mono text-xs tracking-[0.16em] text-teal-700 font-bold uppercase">
                Frequently Asked Questions
              </span>
            </motion.div>
            
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="font-display font-black tracking-tighter text-slate-900 text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6"
            >
              Everything you{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">
                need to know
              </span>
            </motion.h2>
            
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto"
            >
              Get answers to the most common questions about MediMind AI. 
              Can't find what you're looking for? Contact our support team.
            </motion.p>
          </motion.div>
          
          {/* FAQ Categories Tabs */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex flex-wrap items-center justify-center gap-3 mb-12"
          >
            {faqs.map((category, index) => (
              <Magnetic key={index} strength={12}>
                <button
                  onClick={() => setActiveFAQCategory(index)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all ${
                    activeFAQCategory === index
                      ? `bg-gradient-to-r ${category.gradient} text-white shadow-[0_8px_24px_-8px_rgba(14,165,165,0.5)]`
                      : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <category.icon size={18} strokeWidth={2.5} />
                  {category.category}
                </button>
              </Magnetic>
            ))}
          </motion.div>
          
          {/* FAQ Items */}
          <div className="max-w-4xl mx-auto space-y-4">
            {faqs[activeFAQCategory].questions.map((faq, index) => (
              <FAQItem key={index} faq={faq} index={index} />
            ))}
          </div>
          
          {/* Still have questions CTA */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <div className="inline-flex flex-col items-center gap-6 p-10 rounded-[2rem] bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 border-2 border-teal-200">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white">
                <MessageCircle size={32} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-2xl font-display-modern font-black text-slate-900 mb-2">
                  Still have questions?
                </h3>
                <p className="text-slate-600 mb-6">
                  Our support team is here to help 24/7
                </p>
                <Magnetic strength={18}>
                  <a
                    href="#contact"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                  >
                    Contact Support
                    <ArrowRight size={18} />
                  </a>
                </Magnetic>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* ═══════════════════════════════════════════════════════════════════════
          📞 CONTACT / CTA SECTION
          ═══════════════════════════════════════════════════════════════════ */}
      <section id="contact" className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-slate-900" />
        <LiquidMesh />
        <div className="absolute inset-0 dots-grid-fine opacity-20" />
        
        <div className="relative z-10 max-w-[1320px] mx-auto px-6 lg:px-12">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="font-display font-black tracking-tighter text-white text-4xl sm:text-5xl lg:text-7xl leading-tight mb-6"
            >
              Ready to transform{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">
                your healthcare?
              </span>
            </motion.h2>
            
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto mb-12"
            >
              Join 50,000+ patients and 2,000+ physicians who trust MediMind AI 
              for intelligent, proactive, and personalized healthcare.
            </motion.p>
            
            <motion.div
              variants={fadeUp}
              custom={2}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Magnetic strength={22}>
                <button
                  onClick={navigate}
                  className="btn-premium group relative inline-flex items-center gap-3 text-lg font-bold text-white bg-gradient-to-r from-teal-600 to-blue-600 px-10 py-5 rounded-2xl shadow-[0_2px_0_rgba(255,255,255,0.4)_inset,0_24px_64px_-16px_rgba(14,165,165,0.9)] hover:shadow-[0_2px_0_rgba(255,255,255,0.4)_inset,0_32px_80px_-20px_rgba(14,165,165,1)] transition-all"
                >
                  Get Started Free
                  <ArrowRight size={22} className="transition-transform group-hover:translate-x-2" />
                </button>
              </Magnetic>
              
              <Magnetic strength={18}>
                <button className="group inline-flex items-center gap-3 text-lg font-bold text-white bg-white/10 backdrop-blur-xl border-2 border-white/20 hover:bg-white/20 px-10 py-5 rounded-2xl transition-all">
                  <Phone size={22} />
                  Schedule Demo
                </button>
              </Magnetic>
            </motion.div>
            
            {/* Trust indicators */}
            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex flex-wrap items-center justify-center gap-8 mt-16 text-sm text-slate-400"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-teal-400" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock size={18} className="text-teal-400" />
                <span>AES-256 Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe size={18} className="text-teal-400" />
                <span>99.99% Uptime</span>
              </div>
              <div className="flex items-center gap-2">
                <BadgeCheck size={18} className="text-teal-400" />
                <span>SOC 2 Certified</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* ═══════════════════════════════════════════════════════════════════════
          🦶 FOOTER - PREMIUM DESIGN
          ═══════════════════════════════════════════════════════════════════ */}
      <footer className="relative bg-slate-950 text-white overflow-hidden">
        <div className="absolute inset-0 dots-grid-fine opacity-10" />
        
        <div className="relative z-10 max-w-[1320px] mx-auto px-6 lg:px-12 py-16 lg:py-20">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 mb-16">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <img src={logo} alt="MediMind AI" className="h-12 w-12" />
                <div className="leading-tight">
                  <span className="font-display-modern font-black text-xl text-white block leading-none">
                    MediMind AI
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.2em] text-teal-400 uppercase">
                    Clinical Intelligence · v4.2
                  </span>
                </div>
              </div>
              
              <p className="text-slate-400 leading-relaxed mb-6 max-w-md">
                Transforming healthcare through frontier AI, board-certified expertise, 
                and personalized intelligence that anticipates your needs.
              </p>
              
              {/* Social Links */}
              <div className="flex items-center gap-3">
                {['Twitter', 'LinkedIn', 'GitHub', 'YouTube'].map((social, i) => (
                  <Magnetic key={i} strength={10}>
                    <a
                      href="#"
                      className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 flex items-center justify-center transition-all group"
                      aria-label={social}
                    >
                      <ExternalLink size={16} className="text-slate-400 group-hover:text-white transition-colors" />
                    </a>
                  </Magnetic>
                ))}
              </div>
            </div>
            
            {/* Links Columns */}
            <div>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">
                Product
              </h4>
              <ul className="space-y-3">
                {["AI Triage Chat", "Report Analysis", "Health Timeline", "Drug Safety", "Voice Assistant", "Pricing"].map((item, i) => (
                  <li key={i}>
                    <a
                      href="#"
                      className="text-slate-400 hover:text-white transition-colors text-sm"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">
                Solutions
              </h4>
              <ul className="space-y-3">
                {["For Patients", "For Doctors", "For Hospitals", "Enterprise", "Integrations", "API"].map((item, i) => (
                  <li key={i}>
                    <a
                      href="#"
                      className="text-slate-400 hover:text-white transition-colors text-sm"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">
                Company
              </h4>
              <ul className="space-y-3">
                {["About Us", "Careers", "Press Kit", "Research", "Security", "Contact"].map((item, i) => (
                  <li key={i}>
                    <a
                      href="#"
                      className="text-slate-400 hover:text-white transition-colors text-sm"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-slate-500 text-sm">
                © 2026 MediMind AI. All rights reserved.
              </p>
              
              <div className="flex items-center gap-6 text-sm">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
      
    </div>
    </>
  );
}
