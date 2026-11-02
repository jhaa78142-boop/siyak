// Centralised mock data — swap for real API responses when the backend is wired up.

export const currentPatient = {
  name: "Rahul Sharma",
  age: 29,
  gender: "Male",
  bloodGroup: "O+",
  healthScore: 82,
  avatarColor: "from-teal-400 to-cyan-600",
};

export const currentDoctor = {
  name: "Dr. Anjali Verma",
  specialization: "Cardiology",
  hospital: "City Medical Center",
  license: "MCI-2024-58213",
  rating: 4.8,
  patients: 214,
};

export const currentAdmin = {
  name: "Admin · Ops Console",
  role: "Platform Administrator",
};

export const vitalsHistory = [
  { day: "Mon", hr: 72, spo2: 98, sleep: 6.4 },
  { day: "Tue", hr: 75, spo2: 97, sleep: 7.1 },
  { day: "Wed", hr: 70, spo2: 98, sleep: 6.8 },
  { day: "Thu", hr: 78, spo2: 96, sleep: 5.9 },
  { day: "Fri", hr: 74, spo2: 98, sleep: 7.4 },
  { day: "Sat", hr: 69, spo2: 99, sleep: 8.0 },
  { day: "Sun", hr: 71, spo2: 98, sleep: 7.6 },
];

export const healthScoreTrend = [
  { month: "Mar", score: 68 },
  { month: "Apr", score: 71 },
  { month: "May", score: 74 },
  { month: "Jun", score: 77 },
  { month: "Jul", score: 79 },
  { month: "Aug", score: 82 },
];

export const upcomingAppointments = [
  { id: 1, doctor: "Dr. Anjali Verma", specialization: "Cardiology", date: "Aug 15, 2026", time: "10:30 AM", mode: "Video", status: "Confirmed" },
  { id: 2, doctor: "Dr. Kabir Rao", specialization: "Dermatology", date: "Aug 20, 2026", time: "4:00 PM", mode: "In-person", status: "Pending" },
  { id: 3, doctor: "Dr. Meera Nair", specialization: "General Physician", date: "Aug 26, 2026", time: "9:15 AM", mode: "Video", status: "Confirmed" },
];

export const doctorsDirectory = [
  { id: 1, name: "Dr. Anjali Verma", specialization: "Cardiology", hospital: "City Medical Center", rating: 4.8, experience: "12 yrs", fee: "₹800", available: "Today, 6:00 PM" },
  { id: 2, name: "Dr. Kabir Rao", specialization: "Dermatology", hospital: "Sunrise Clinic", rating: 4.6, experience: "8 yrs", fee: "₹600", available: "Tomorrow, 11:00 AM" },
  { id: 3, name: "Dr. Meera Nair", specialization: "General Physician", hospital: "Wellness Hub", rating: 4.9, experience: "15 yrs", fee: "₹500", available: "Today, 9:15 AM" },
  { id: 4, name: "Dr. Sameer Iyer", specialization: "Orthopedics", hospital: "City Medical Center", rating: 4.5, experience: "10 yrs", fee: "₹900", available: "Aug 18, 2:00 PM" },
];

export const medicineReminders = [
  { id: 1, name: "Metformin 500mg", dosage: "1 tablet · after breakfast", time: "08:00 AM", taken: true, status: "taken", scheduleGroup: "today", stockRemaining: 18, stockTotal: 30, refillThreshold: 7 },
  { id: 2, name: "Atorvastatin 10mg", dosage: "1 tablet · after dinner", time: "09:00 PM", taken: false, status: "due", scheduleGroup: "today", stockRemaining: 5, stockTotal: 30, refillThreshold: 7, refillDate: "Refill in 5 days" },
  { id: 3, name: "Vitamin D3", dosage: "1 capsule · weekly, Sunday", time: "08:00 AM", taken: false, status: "upcoming", scheduleGroup: "upcoming", stockRemaining: 12, stockTotal: 12, refillThreshold: 2, scheduleLabel: "Sunday" },
];

export const healthTimeline = [
  { id: 1, date: "Aug 10, 2026", type: "Report", title: "Lipid Profile uploaded", detail: "AI flagged mildly elevated LDL — follow-up suggested.", tone: "warn" },
  { id: 2, date: "Aug 05, 2026", type: "Appointment", title: "Consultation with Dr. Anjali Verma", detail: "Routine cardiology check-up completed.", tone: "good" },
  { id: 3, date: "Jul 28, 2026", type: "Prescription", title: "Atorvastatin prescribed", detail: "10mg once daily, review after 4 weeks.", tone: "neutral" },
  { id: 4, date: "Jul 20, 2026", type: "Symptom", title: "Logged mild chest tightness", detail: "AI triage rated urgency: Low — advised monitoring.", tone: "warn" },
  { id: 5, date: "Jul 02, 2026", type: "Vaccination", title: "Annual flu vaccine", detail: "Administered at City Medical Center.", tone: "good" },
];

export const chatSeed = [
  { role: "ai", text: "Hi Rahul, I'm your MediMind AI assistant. How are you feeling today?" },
  { role: "user", text: "I've had a mild headache since morning and feel a bit tired." },
  { role: "ai", text: "Thanks for sharing. On a scale of 1–10, how strong is the headache, and have you had enough water and sleep today?" },
];

export const educationArticles = [
  { id: 1, tag: "Cardiology", title: "Understanding Blood Pressure Numbers", read: "4 min read" },
  { id: 2, tag: "Nutrition", title: "Building a Balanced Plate for Diabetics", read: "6 min read" },
  { id: 3, tag: "Mental Health", title: "5 Breathing Techniques to Reduce Stress", read: "3 min read" },
  { id: 4, tag: "Preventive Care", title: "Why Annual Screenings Matter After 30", read: "5 min read" },
];

export const doctorPatients = [
  { id: 1, name: "Rahul Sharma", age: 29, gender: "M", condition: "Hypertension, monitoring", lastVisit: "Aug 05, 2026", risk: "Medium" },
  { id: 2, name: "Priya Nair", age: 34, gender: "F", condition: "Type 2 Diabetes", lastVisit: "Aug 09, 2026", risk: "High" },
  { id: 3, name: "Arjun Mehta", age: 22, gender: "M", condition: "Seasonal allergy", lastVisit: "Jul 29, 2026", risk: "Low" },
  { id: 4, name: "Sneha Kulkarni", age: 45, gender: "F", condition: "Post-op follow-up", lastVisit: "Aug 11, 2026", risk: "Medium" },
  { id: 5, name: "Aditya Verma", age: 51, gender: "M", condition: "Coronary risk screening", lastVisit: "Aug 12, 2026", risk: "High" },
];

export const doctorAppointmentsToday = [
  { id: 1, patient: "Rahul Sharma", time: "10:30 AM", type: "Video", reason: "Cardiology follow-up" },
  { id: 2, patient: "Aditya Verma", time: "11:15 AM", type: "In-person", reason: "Risk screening review" },
  { id: 3, patient: "Sneha Kulkarni", time: "01:00 PM", type: "Video", reason: "Post-op check-in" },
  { id: 4, patient: "New patient — Farhan Sheikh", time: "03:30 PM", type: "In-person", reason: "First consultation" },
];

export const drugInteractionLog = [
  { id: 1, patient: "Priya Nair", drugs: "Metformin + Glimepiride", severity: "Low", note: "Monitor for hypoglycemia symptoms." },
  { id: 2, patient: "Aditya Verma", drugs: "Atorvastatin + Clarithromycin", severity: "High", note: "Increased risk of myopathy — consider alternative antibiotic." },
  { id: 3, patient: "Rahul Sharma", drugs: "Aspirin + Ibuprofen", severity: "Medium", note: "GI bleeding risk if combined long-term." },
];

export const adminStats = {
  totalUsers: 8420,
  patients: 7311,
  doctors: 1042,
  pendingVerifications: 18,
  appointmentsToday: 356,
  aiQueriesToday: 12894,
};

export const userGrowth = [
  { month: "Mar", patients: 4200, doctors: 640 },
  { month: "Apr", patients: 4950, doctors: 710 },
  { month: "May", patients: 5680, doctors: 790 },
  { month: "Jun", patients: 6320, doctors: 860 },
  { month: "Jul", patients: 6890, doctors: 950 },
  { month: "Aug", patients: 7311, doctors: 1042 },
];

export const aiQualityBreakdown = [
  { name: "Symptom Checker", accuracy: 94, volume: 4210 },
  { name: "Report OCR", accuracy: 97, volume: 2890 },
  { name: "RAG Chat", accuracy: 91, volume: 5120 },
  { name: "Vision (X-ray)", accuracy: 88, volume: 1320 },
  { name: "Triage Routing", accuracy: 95, volume: 3010 },
];

export const pendingDoctorVerifications = [
  { id: 1, name: "Dr. Farhan Sheikh", specialization: "Pediatrics", hospital: "Sunrise Clinic", license: "MCI-2026-91823", submitted: "2 hrs ago" },
  { id: 2, name: "Dr. Ritu Kapoor", specialization: "Endocrinology", hospital: "Wellness Hub", license: "MCI-2026-77291", submitted: "5 hrs ago" },
  { id: 3, name: "Dr. Vivek Malhotra", specialization: "Neurology", hospital: "City Medical Center", license: "MCI-2026-88210", submitted: "1 day ago" },
];

export const knowledgeBaseDocs = [
  { id: 1, title: "WHO Hypertension Management Guidelines 2025", chunks: 412, status: "Indexed" },
  { id: 2, title: "ICMR Diabetes Care Standards", chunks: 358, status: "Indexed" },
  { id: 3, title: "Drug Interaction Reference — OpenFDA sync", chunks: 1290, status: "Syncing" },
  { id: 4, title: "Pediatric Vaccination Schedule (India)", chunks: 96, status: "Indexed" },
];

export const feedbackList = [
  { id: 1, user: "Priya Nair", role: "Patient", rating: 5, note: "The AI reminded me to take my medicine right on time every day.", date: "Aug 11" },
  { id: 2, user: "Dr. Kabir Rao", role: "Doctor", rating: 4, note: "AI summaries save a lot of time before consultations.", date: "Aug 10" },
  { id: 3, user: "Arjun Mehta", role: "Patient", rating: 3, note: "Report analyser was slightly slow on large PDF uploads.", date: "Aug 08" },
];

export const auditLog = [
  { id: 1, actor: "admin@medimind.ai", action: "Approved doctor verification — Dr. Ritu Kapoor", time: "10:42 AM" },
  { id: 2, actor: "system", action: "Nightly RAG knowledge base re-index completed", time: "02:00 AM" },
  { id: 3, actor: "admin@medimind.ai", action: "Suspended account — user #48213 (policy violation)", time: "Yesterday, 6:18 PM" },
  { id: 4, actor: "system", action: "Firebase auth token rotation completed", time: "Yesterday, 3:00 AM" },
];

export const earlyWarnings = [
  { id: 1, level: "High", title: "Cluster of respiratory symptom reports — Andheri zone", detail: "42 patients logged similar symptoms in 48 hrs, above baseline.", time: "35 min ago" },
  { id: 2, level: "Medium", title: "Spike in AI-flagged hypertensive readings", detail: "18% increase in high BP self-reports this week.", time: "3 hrs ago" },
  { id: 3, level: "Low", title: "Seasonal allergy queries trending up", detail: "Expected seasonal pattern, monitoring only.", time: "1 day ago" },
];
