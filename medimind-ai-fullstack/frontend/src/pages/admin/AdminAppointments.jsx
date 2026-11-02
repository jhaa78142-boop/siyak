import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, CartesianGrid } from "recharts";
import { CalendarClock, Video, Building2 } from "lucide-react";
import SectionHeader from "../../components/SectionHeader";
import StatCard from "../../components/StatCard";
import { Badge } from "../../components/Bits";

const byHour = [
  { hour: "8am", count: 24 }, { hour: "10am", count: 58 }, { hour: "12pm", count: 41 },
  { hour: "2pm", count: 67 }, { hour: "4pm", count: 52 }, { hour: "6pm", count: 38 }, { hour: "8pm", count: 19 },
];

const live = [
  { id: 1, patient: "Rahul Sharma", doctor: "Dr. Anjali Verma", mode: "Video", status: "In progress" },
  { id: 2, patient: "Priya Nair", doctor: "Dr. Ritu Kapoor", mode: "In-person", status: "Waiting" },
  { id: 3, patient: "Arjun Mehta", doctor: "Dr. Kabir Rao", mode: "Video", status: "Completed" },
];

export default function AdminAppointments() {
  return (
    <div>
      <SectionHeader eyebrow="Platform-wide" title="Appointments" description="Live visibility into scheduling activity across all doctors." />

      <div className="grid sm:grid-cols-3 gap-4 mb-5">
        <StatCard icon={CalendarClock} label="Today's Total" value="356" delta="+42 vs avg" accent="from-violet-600 to-fuchsia-700" />
        <StatCard icon={Video} label="Video Consults" value="214" delta="60%" accent="from-indigo-500 to-blue-600" />
        <StatCard icon={Building2} label="In-person Visits" value="142" delta="40%" accent="from-teal-500 to-cyan-600" />
      </div>

      <div className="card-shell p-6 mb-5">
        <h3 className="font-display font-semibold text-ink mb-4">Bookings by Hour</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={byHour}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF2F5" />
            <XAxis dataKey="hour" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#94A3B8" }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E7ECF1", fontSize: 12 }} />
            <Bar dataKey="count" fill="#7C3AED" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card-shell overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold text-slate-400 border-b border-slate-100">
              <th className="px-5 py-3.5">Patient</th><th className="px-5 py-3.5">Doctor</th><th className="px-5 py-3.5">Mode</th><th className="px-5 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {live.map(l => (
              <tr key={l.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                <td className="px-5 py-3.5 font-medium text-ink">{l.patient}</td>
                <td className="px-5 py-3.5 text-slate-500">{l.doctor}</td>
                <td className="px-5 py-3.5 text-slate-500">{l.mode}</td>
                <td className="px-5 py-3.5"><Badge tone={l.status === "In progress" ? "info" : l.status === "Waiting" ? "warn" : "good"}>{l.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
