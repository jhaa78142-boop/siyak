import { useState } from "react";
import { motion } from "framer-motion";
import { FlaskConical, AlertTriangle, ShieldCheck, Search, ArrowUpRight, Sparkles, Activity, Pill, Info } from "lucide-react";
import SectionHeader from "../../components/SectionHeader";
import { Badge } from "../../components/Bits";
import { drugInteractionLog } from "../../lib/mockData";

const ease = [0.16, 1, 0.3, 1];

export default function DrugInteractions() {
  const [q, setQ] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");

  const filtered = drugInteractionLog.filter((d) => {
    const matchQ = !q || d.patient.toLowerCase().includes(q.toLowerCase()) || d.drugs.toLowerCase().includes(q.toLowerCase());
    const matchSeverity = severityFilter === "All" || d.severity === severityFilter;
    return matchQ && matchSeverity;
  });

  const highCount = drugInteractionLog.filter((d) => d.severity === "High").length;
  const medCount = drugInteractionLog.filter((d) => d.severity === "Medium").length;
  const lowCount = drugInteractionLog.filter((d) => d.severity === "Low").length;

  return (
    <div className="dh-dash">
      <SectionHeader
        eyebrow="Safety layer"
        title={<>Drug Interactions<em>.</em></>}
        description="AI-flagged interaction risks across your patients' active prescriptions — reviewed in real-time."
      />

      {/* Safety insight hero */}
      <motion.section
        className="dh-panel dh-panel-insight"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.05, ease }}
        style={{ marginBottom: "1rem" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
            <div style={{
              display: "grid", placeItems: "center",
              width: "2.6rem", height: "2.6rem", borderRadius: "0.75rem",
              background: "rgba(255,255,255,0.08)",
            }}>
              <ShieldCheck size={20} style={{ color: "#A5B4FC" }} />
            </div>
            <div>
              <p className="dh-panel-label soft">Pharmacological safety engine</p>
              <h3 style={{ fontSize: "1.15rem", marginTop: "0.2rem" }}>
                {drugInteractionLog.length} interactions flagged across {new Set(drugInteractionLog.map((d) => d.patient)).size} patients
              </h3>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.55rem" }}>
            {[
              { label: "High", count: highCount, bg: "rgba(239,68,68,0.15)", color: "#FCA5A5" },
              { label: "Medium", count: medCount, bg: "rgba(245,158,11,0.15)", color: "#FCD34D" },
              { label: "Low", count: lowCount, bg: "rgba(16,185,129,0.15)", color: "#6EE7B7" },
            ].map((s) => (
              <div key={s.label} style={{
                padding: "0.45rem 0.75rem", borderRadius: "0.6rem",
                background: s.bg, textAlign: "center", minWidth: "4.5rem",
              }}>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 650, color: s.color }}>{s.count}</p>
                <p style={{ fontSize: "0.6rem", color: s.color, opacity: 0.8, fontWeight: 600 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Stat cards */}
      <motion.div
        className="dh-vitals"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }}
      >
        {[
          { icon: FlaskConical, label: "Total flagged", value: String(drugInteractionLog.length), note: "Active interactions", tone: "indigo" },
          { icon: AlertTriangle, label: "Critical alerts", value: String(highCount), note: "Immediate attention", tone: "amber" },
          { icon: Pill, label: "Drugs screened", value: "48K+", note: "Molecule index", tone: "sky" },
          { icon: Activity, label: "Screening speed", value: "<50ms", note: "Real-time checks", tone: "violet" },
        ].map((v) => (
          <motion.article
            key={v.label}
            className={`dh-vital dh-vital-${v.tone}`}
            variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } } }}
            whileHover={{ y: -4 }}
          >
            <div className="dh-vital-top">
              <span className="dh-vital-icon"><v.icon size={16} /></span>
              <span className="dh-vital-label">{v.label}</span>
            </div>
            <p className="dh-vital-value">{v.value}</p>
            <p className="dh-vital-note">{v.note}</p>
          </motion.article>
        ))}
      </motion.div>

      {/* Search & filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5, ease }}
        style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.65rem", margin: "1.15rem 0" }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: "200px", maxWidth: "20rem" }}>
          <Search size={15} style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by patient or drug…"
            style={{
              width: "100%", border: "1px solid var(--dh-line)", borderRadius: "0.85rem",
              paddingLeft: "2.4rem", paddingRight: "1rem", paddingTop: "0.65rem", paddingBottom: "0.65rem",
              fontSize: "0.84rem", outline: "none", background: "rgba(255,255,255,0.65)",
              backdropFilter: "blur(8px)", fontFamily: "var(--font-body)", color: "var(--dh-ink)",
            }}
            onFocus={(e) => { e.target.style.borderColor = "var(--dh-blue)"; }}
            onBlur={(e) => { e.target.style.borderColor = "var(--dh-line)"; }}
          />
        </div>
        <div style={{ display: "flex", gap: "0.3rem" }}>
          {["All", "High", "Medium", "Low"].map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              style={{
                padding: "0.4rem 0.7rem", borderRadius: "0.55rem", border: "none", cursor: "pointer",
                fontSize: "0.72rem", fontWeight: 650, fontFamily: "var(--font-mono)", letterSpacing: "0.04em",
                background: severityFilter === s ? "var(--dh-blue)" : "rgba(59,91,255,0.06)",
                color: severityFilter === s ? "#fff" : "var(--dh-muted)",
                transition: "all 0.2s",
              }}
            >{s}</button>
          ))}
        </div>
      </motion.div>

      {/* Interaction cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
        {filtered.map((d, i) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.4, ease }}
            className="dh-panel"
            style={{
              padding: "1.1rem 1.25rem",
              borderLeft: `3px solid ${d.severity === "High" ? "#EF4444" : d.severity === "Medium" ? "#F59E0B" : "#10B981"}`,
              display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", flex: 1 }}>
              <div style={{
                display: "grid", placeItems: "center",
                width: "2.5rem", height: "2.5rem", borderRadius: "0.75rem", flexShrink: 0,
                background: d.severity === "High" ? "rgba(239,68,68,0.08)" : d.severity === "Medium" ? "rgba(245,158,11,0.08)" : "rgba(16,185,129,0.08)",
                color: d.severity === "High" ? "#EF4444" : d.severity === "Medium" ? "#F59E0B" : "#10B981",
              }}>
                <FlaskConical size={17} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: "0.88rem", fontWeight: 650, color: "var(--dh-ink)" }}>{d.patient}</p>
                <p style={{ fontSize: "0.78rem", color: "var(--dh-blue, #4F46E5)", marginTop: "0.15rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <Pill size={11} /> {d.drugs}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
              <p style={{ fontSize: "0.78rem", color: "var(--dh-muted)", maxWidth: "16rem", lineHeight: 1.45 }}>{d.note}</p>
              <Badge tone={d.severity === "High" ? "bad" : d.severity === "Medium" ? "warn" : "good"}>{d.severity}</Badge>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
