import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Clock, Award, Play, BookOpen, ArrowUpRight, TrendingUp, Star, ChevronRight, Sparkles } from "lucide-react";
import SectionHeader from "../../components/SectionHeader";
import { Badge } from "../../components/Bits";

const ease = [0.16, 1, 0.3, 1];

const featuredCourse = {
  title: "Using RAG-grounded AI safely in clinical workflows",
  subtitle: "A comprehensive guide for physicians integrating AI-assisted diagnostics into daily practice.",
  duration: "18 min",
  credit: "2.0 CME",
  tag: "Featured · Digital Health",
};

const cme = [
  { id: 1, title: "2026 Guidelines: Hypertension Management Update", tag: "Cardiology", read: "12 min", credit: "1.0 CME", level: "Intermediate", enrolled: 342, rating: 4.8, color: "#4F46E5" },
  { id: 2, title: "AI-Assisted Diagnosis: Best Practices & Pitfalls", tag: "Digital Health", read: "8 min", credit: "0.5 CME", level: "Advanced", enrolled: 218, rating: 4.9, color: "#6366F1" },
  { id: 3, title: "Drug Interaction Reporting Standards 2026", tag: "Pharmacology", read: "6 min", credit: "0.5 CME", level: "Beginner", enrolled: 156, rating: 4.6, color: "#818CF8" },
  { id: 4, title: "Interpreting Cardiac Biomarkers in Emergency Settings", tag: "Emergency Medicine", read: "15 min", credit: "1.5 CME", level: "Advanced", enrolled: 289, rating: 4.7, color: "#4338CA" },
  { id: 5, title: "Patient Communication in the Age of AI Transparency", tag: "Ethics", read: "10 min", credit: "1.0 CME", level: "All Levels", enrolled: 412, rating: 4.9, color: "#6366F1" },
  { id: 6, title: "Post-Surgical Recovery Protocols: What's New in 2026", tag: "Surgery", read: "14 min", credit: "1.5 CME", level: "Intermediate", enrolled: 178, rating: 4.5, color: "#4F46E5" },
];

export default function DoctorEducation() {
  const [selectedTag, setSelectedTag] = useState("All");
  const tags = ["All", ...new Set(cme.map((c) => c.tag))];
  const filtered = selectedTag === "All" ? cme : cme.filter((c) => c.tag === selectedTag);

  return (
    <div className="dh-dash">
      <SectionHeader
        eyebrow="Continuing education"
        title={<>Education<em>.</em></>}
        description="Clinical updates and CME-eligible resources curated for your specialization."
      />

      {/* Featured hero */}
      <motion.section
        className="dh-panel dh-panel-hero"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.05, ease }}
        style={{ minHeight: "14rem", marginBottom: "1rem" }}
      >
        <div className="dh-hero-aura" style={{ width: "18rem", height: "18rem" }} />
        <div className="dh-hero-grain" />
        <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "2rem", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "16rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <Badge tone="info">Featured</Badge>
              <Badge tone="good"><Award size={10} style={{ marginRight: 2 }} /> {featuredCourse.credit}</Badge>
            </div>
            <h2 style={{
              fontFamily: "var(--font-display)", fontSize: "clamp(1.4rem, 2.5vw, 1.85rem)",
              fontWeight: 650, letterSpacing: "-0.04em", lineHeight: 1.12, maxWidth: "28rem",
            }}>
              {featuredCourse.title}
            </h2>
            <p style={{ marginTop: "0.75rem", fontSize: "0.88rem", color: "rgba(199,210,254,0.78)", lineHeight: 1.6, maxWidth: "30rem" }}>
              {featuredCourse.subtitle}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "1.1rem" }}>
              <button style={{
                display: "inline-flex", alignItems: "center", gap: "0.4rem",
                padding: "0.7rem 1.1rem", borderRadius: "0.75rem",
                background: "#fff", color: "#0B1220", border: "none", cursor: "pointer",
                fontSize: "0.84rem", fontWeight: 650,
                transition: "transform 0.25s var(--ease-premium)",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <Play size={14} fill="currentColor" /> Start learning
              </button>
              <span style={{ fontSize: "0.75rem", color: "rgba(165,180,252,0.8)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <Clock size={12} /> {featuredCourse.duration}
              </span>
            </div>
          </div>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem" }}>
            {[
              ["Total CME", "7.0", "credits earned"],
              ["Completed", "12", "courses"],
              ["Streak", "4 weeks", "consecutive"],
              ["Rank", "Top 8%", "among peers"],
            ].map(([label, value, note]) => (
              <div key={label} style={{
                padding: "0.65rem 0.8rem", borderRadius: "0.7rem",
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                minWidth: "7rem",
              }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(165,180,252,0.7)" }}>{label}</p>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 650, color: "#fff", marginTop: "0.15rem" }}>{value}</p>
                <p style={{ fontSize: "0.62rem", color: "rgba(148,163,184,0.7)", marginTop: "0.1rem" }}>{note}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Tag filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5, ease }}
        style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "1rem" }}
      >
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            style={{
              padding: "0.4rem 0.75rem", borderRadius: "0.6rem", border: "none", cursor: "pointer",
              fontSize: "0.72rem", fontWeight: 600,
              background: selectedTag === tag ? "var(--dh-blue, #4F46E5)" : "rgba(59,91,255,0.06)",
              color: selectedTag === tag ? "#fff" : "var(--dh-muted)",
              transition: "all 0.2s var(--ease-premium)",
            }}
          >
            {tag}
          </button>
        ))}
      </motion.div>

      {/* Course grid */}
      <motion.div
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(18rem, 1fr))", gap: "0.85rem" }}
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } } }}
      >
        {filtered.map((c) => (
          <motion.article
            key={c.id}
            className="dh-panel"
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } }}
            whileHover={{ y: -4 }}
            style={{ cursor: "pointer", transition: "box-shadow 0.3s, border-color 0.25s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(79,70,229,0.25)"; e.currentTarget.style.boxShadow = "0 16px 40px -24px rgba(79,70,229,0.35)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--dh-line)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            {/* Color accent bar */}
            <div style={{ width: "2.5rem", height: "0.25rem", borderRadius: "99px", background: c.color, marginBottom: "0.85rem" }} />

            <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginBottom: "0.65rem" }}>
              <Badge tone="doctor">{c.tag}</Badge>
              <Badge tone="neutral">{c.level}</Badge>
            </div>

            <h3 style={{
              fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 650,
              color: "var(--dh-ink)", letterSpacing: "-0.02em", lineHeight: 1.3,
              marginBottom: "0.75rem",
            }}>
              {c.title}
            </h3>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--dh-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <Clock size={11} /> {c.read}
                </span>
                <span style={{ fontSize: "0.72rem", fontWeight: 650, color: "var(--dh-blue, #4F46E5)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <Award size={11} /> {c.credit}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <Star size={11} fill="#FCD34D" stroke="#FCD34D" />
                <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--dh-ink)" }}>{c.rating}</span>
              </div>
            </div>

            {/* Enrolled count */}
            <div style={{
              marginTop: "0.75rem", paddingTop: "0.65rem",
              borderTop: "1px solid rgba(59,91,255,0.06)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontSize: "0.68rem", color: "var(--dh-muted)" }}>{c.enrolled} enrolled</span>
              <span style={{ fontSize: "0.72rem", fontWeight: 650, color: "var(--dh-blue, #4F46E5)", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                Start <ArrowUpRight size={12} />
              </span>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </div>
  );
}
