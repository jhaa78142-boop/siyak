import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function exportReportSummaryPdf(report) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("MediMind AI — Report Analysis Summary", 14, 20);
  doc.setFontSize(10);
  doc.text(`Patient: ${report.patientName || "Patient"}`, 14, 30);
  doc.text(`File: ${report.fileName || "—"}`, 14, 36);
  doc.text(
    `Date: ${report.createdAt ? new Date(report.createdAt).toLocaleString() : new Date().toLocaleString()}`,
    14,
    42
  );
  if (report.analysis?.flags?.length > 0) {
    const body = report.analysis.flags.map((f) => [
      f.label,
      f.detail || "",
      f.severity || "",
    ]);
    autoTable(doc, {
      startY: 50,
      head: [["Label", "Detail", "Severity"]],
      body,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [13, 148, 136] },
    });
  } else if (report.imaging) {
    autoTable(doc, {
      startY: 50,
      head: [["Imaging Result", "Confidence", "Disclaimer"]],
      body: [
        [
          report.imaging.label || "",
          report.imaging.confidence != null
            ? (report.imaging.confidence * 100).toFixed(1) + "%"
            : "",
          report.imaging.disclaimer || "",
        ],
      ],
      headStyles: { fillColor: [13, 148, 136] },
    });
  }
  doc.setFontSize(10);
  doc.text(
    `Summary: ${(report.analysis?.summary || report.imaging?.label || "No analysis summary").slice(0, 120)}`,
    14,
    (doc.lastAutoTable?.finalY + 10) || 80
  );
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  const disclaimerY = doc.internal.pageSize.getHeight() - 20;
  doc.text(
    "DISCLAIMER: Informational only — not a medical diagnosis. Always confirm with a licensed clinician.",
    14,
    disclaimerY
  );
  doc.save(`report-analysis-${Date.now()}.pdf`);
}

export function exportPrescriptionPdf(prescription) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(prescription.doctorName || "Doctor", 14, 22);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${prescription.doctorSpecialization || "Physician"} · Reg: ${prescription.doctorLicense || "—"}`,
    14,
    29
  );
  const issueDate = prescription.date
    ? new Date(prescription.date).toLocaleDateString()
    : new Date().toLocaleDateString();
  doc.text(`Date: ${issueDate}`, 160, 22, { align: "right" });
  doc.line(14, 35, 196, 35);
  doc.setFontSize(11);
  doc.text(`Patient: ${prescription.patientName || "Patient"}`, 14, 44);
  const body = (prescription.medicines || []).map((m) => [
    m.med || "",
    m.freq || "",
    m.days || "",
  ]);
  autoTable(doc, {
    startY: 52,
    head: [["Medicine", "Frequency", "Days"]],
    body,
    headStyles: { fillColor: [79, 70, 229] },
  });
  let y = (doc.lastAutoTable?.finalY + 10) || 90;
  const bottomLimit = doc.internal.pageSize.getHeight() - 28;
  const addSection = (label, value) => {
    if (!value) return;
    const lines = doc.splitTextToSize(String(value), 180);
    if (y + 6 + lines.length * 5 > bottomLimit) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 14, y);
    doc.setFont("helvetica", "normal");
    doc.text(lines, 14, y + 5);
    y += 10 + lines.length * 5;
  };
  addSection("Assessment", prescription.diagnosis);
  addSection("Follow-up recommendation", prescription.followUpDate
    ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: prescription.timeZone || "Asia/Kolkata" }).format(new Date(prescription.followUpDate))
    : "");
  addSection("Patient instructions", prescription.notes);
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "Computer-generated copy; this is not an electronically verified digital signature.",
    14,
    doc.internal.pageSize.getHeight() - 18
  );
  doc.save(`prescription-${Date.now()}.pdf`);
}

export function exportTimelinePdf(events) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("MediMind AI — Patient Health Timeline", 14, 22);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
  const body = (events || []).map((e) => [
    e.date || "",
    e.type || "",
    e.title || "",
    (e.detail || "").slice(0, 150),
  ]);
  autoTable(doc, {
    startY: 40,
    head: [["Date", "Type", "Title", "Detail"]],
    body,
    styles: { fontSize: 8, cellWidth: "wrap" },
    headStyles: { fillColor: [13, 148, 136] },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 25 },
      2: { cellWidth: 45 },
      3: { cellWidth: "auto" },
    },
  });
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "Timeline export — for personal records. Consult a doctor for clinical interpretation.",
    14,
    doc.internal.pageSize.getHeight() - 18
  );
  doc.save(`health-timeline-${Date.now()}.pdf`);
}
