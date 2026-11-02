import { motion } from "framer-motion";
import { Bell, Moon, Calendar, Lock, Video, Shield, Server, Sparkles, Zap, Eye, Globe } from "lucide-react";
import SectionHeader from "../../components/SectionHeader";
import { Toggle, SettingsRow } from "../../components/Settings";
import { useTheme } from "../../lib/ThemeContext";

const ease = [0.16, 1, 0.3, 1];

export default function DoctorSettings() {
  const { dark, toggleDark } = useTheme();

  const sections = [
    {
      title: "Availability",
      icon: Calendar,
      rows: [
        { icon: Calendar, title: "Accept new patients", description: "Show your profile in patient search results", defaultOn: true },
        { icon: Video, title: "Video consultations", description: "Enable Jitsi-based video appointments", defaultOn: true },
        { icon: Globe, title: "Online booking", description: "Allow patients to book directly from your profile page", defaultOn: true },
      ],
    },
    {
      title: "Notifications",
      icon: Bell,
      rows: [
        { icon: Bell, title: "New appointment alerts", description: "Push + email when a patient books", defaultOn: true },
        { icon: Sparkles, title: "AI summary ready alerts", description: "Notify when pre-consult summaries are generated", defaultOn: true },
        { icon: Zap, title: "Drug interaction alerts", description: "Immediate notification on high-severity flags", defaultOn: true },
      ],
    },
    {
      title: "Privacy & Security",
      icon: Shield,
      rows: [
        { icon: Lock, title: "Two-factor authentication", description: "Extra layer of security for prescription signing", defaultOn: true },
        { icon: Eye, title: "Profile visibility", description: "Control who can see your detailed profile information", defaultOn: true },
      ],
    },
    {
      title: "Appearance",
      icon: Moon,
      rows: [
        { icon: Moon, title: "Dark mode", description: "Apply dark theme across the entire console", isDark: true },
      ],
    },
  ];

  return (
    <div className="dh-dash">
      <SectionHeader
        eyebrow="Preferences"
        title={<>Settings<em>.</em></>}
        description="Manage availability, notifications and consultation preferences."
      />

      <motion.div
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(22rem, 1fr))", gap: "1rem" }}
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.06 } } }}
      >
        {sections.map((section) => {
          const SIcon = section.icon;
          return (
            <motion.div
              key={section.title}
              className="dh-panel"
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } } }}
              style={{ padding: "1.35rem" }}
            >
              {/* Section header */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", marginBottom: "0.85rem", paddingBottom: "0.65rem", borderBottom: "1px solid rgba(59,91,255,0.06)" }}>
                <div style={{
                  display: "grid", placeItems: "center",
                  width: "2rem", height: "2rem", borderRadius: "0.55rem",
                  background: "rgba(79,70,229,0.08)", color: "var(--dh-blue, #4F46E5)",
                }}>
                  <SIcon size={14} />
                </div>
                <h3 style={{
                  fontFamily: "var(--font-display)", fontWeight: 650, fontSize: "0.95rem",
                  color: "var(--dh-ink)", letterSpacing: "-0.02em",
                }}>
                  {section.title}
                </h3>
              </div>

              {/* Rows */}
              <div className="divide-y divide-slate-100">
                {section.rows.map((row) => (
                  <SettingsRow
                    key={row.title}
                    icon={row.icon}
                    title={row.title}
                    description={row.description}
                    right={
                      row.isDark
                        ? <Toggle on={dark} onChange={toggleDark} />
                        : <Toggle defaultOn={row.defaultOn} />
                    }
                  />
                ))}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* AI preferences hint */}
      <motion.div
        className="dh-panel"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5, ease }}
        style={{
          marginTop: "1rem", padding: "1.1rem 1.25rem",
          borderLeft: "3px solid var(--dh-blue, #4F46E5)",
          display: "flex", alignItems: "center", gap: "0.75rem",
        }}
      >
        <Sparkles size={18} style={{ color: "var(--dh-blue)", flexShrink: 0 }} />
        <p style={{ fontSize: "0.84rem", color: "var(--dh-muted)", lineHeight: 1.55 }}>
          <strong style={{ color: "var(--dh-ink)" }}>AI preferences</strong> are managed at the platform level.
          Contact your admin to adjust AI model selection, confidence thresholds, and RAG pipeline settings.
        </p>
      </motion.div>
    </div>
  );
}
