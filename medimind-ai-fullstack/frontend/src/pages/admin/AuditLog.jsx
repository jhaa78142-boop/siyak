import { FileClock, Search } from "lucide-react";
import { useState } from "react";
import SectionHeader from "../../components/SectionHeader";
import { Badge } from "../../components/Bits";
import { auditLog } from "../../lib/mockData";

export default function AuditLog() {
  const [q, setQ] = useState("");
  const filtered = auditLog.filter(a => a.action.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <SectionHeader eyebrow="Traceability" title="Audit Log" description="Every administrative and system action, timestamped for compliance." />

      <div className="relative mb-5 max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search audit log…" className="w-full border border-slate-200 rounded-full pl-9 pr-4 py-2.5 text-sm outline-none focus:border-violet-500 bg-white" />
      </div>

      <div className="card-shell p-6">
        <div className="relative pl-8 space-y-6">
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-200" />
          {filtered.map(a => (
            <div key={a.id} className="relative">
              <div className={`absolute -left-8 top-0 h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white ${a.actor === "system" ? "bg-slate-400" : "bg-violet-600"} text-white`}>
                <FileClock size={13} />
              </div>
              <p className="text-sm font-medium text-ink">{a.action}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge tone={a.actor === "system" ? "neutral" : "admin"}>{a.actor}</Badge>
                <span className="text-xs text-slate-400">{a.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
