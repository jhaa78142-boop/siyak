import { motion } from "framer-motion";
import { AlertTriangle, MapPin, Clock } from "lucide-react";
import SectionHeader from "../../components/SectionHeader";
import { Badge } from "../../components/Bits";
import { earlyWarnings } from "../../lib/mockData";

export default function EarlyWarning() {
  return (
    <div>
      <SectionHeader eyebrow="Population health signals" title="Early Warning" description="AI-detected symptom clusters and anomalies across regions, before they become outbreaks." />

      <div className="space-y-4">
        {earlyWarnings.map((w, i) => (
          <motion.div key={w.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className={`card-shell p-5 border-l-4 ${w.level === "High" ? "border-l-rose-500" : w.level === "Medium" ? "border-l-amber-500" : "border-l-emerald-500"}`}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${w.level === "High" ? "bg-rose-50 text-rose-600" : w.level === "Medium" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <p className="font-semibold text-ink text-sm">{w.title}</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-lg">{w.detail}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge tone={w.level === "High" ? "bad" : w.level === "Medium" ? "warn" : "good"}>{w.level}</Badge>
                <span className="text-xs text-slate-400 flex items-center gap-1"><Clock size={11}/> {w.time}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="card-shell p-8 mt-5 text-center text-slate-400">
        <MapPin size={26} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">Regional heat-map view — connect a mapping API key to visualise geographic clusters.</p>
      </div>
    </div>
  );
}
