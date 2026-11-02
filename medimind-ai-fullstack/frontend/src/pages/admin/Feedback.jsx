import { useEffect, useState } from "react";
import { Star, MessageSquare } from "lucide-react";
import SectionHeader from "../../components/SectionHeader";
import { Badge } from "../../components/Bits";
import { api } from "../../lib/api";

export default function Feedback() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/feedback")
      .then(({ data }) => {
        if (active) setFeedbackList(data || []);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const averageRating = feedbackList.length
    ? (feedbackList.reduce((total, item) => total + item.rating, 0) / feedbackList.length).toFixed(1)
    : "—";
  const positivePercent = feedbackList.length
    ? `${Math.round(feedbackList.filter((item) => item.rating >= 4).length / feedbackList.length * 100)}%`
    : "—";

  return (
    <div>
      <SectionHeader eyebrow="Voice of the user" title="Feedback" description="Ratings and comments submitted by patients and doctors." />

      <div className="grid sm:grid-cols-3 gap-4 mb-5">
        <div className="card-shell p-5"><p className="text-2xl font-display font-semibold">{loading ? "…" : error ? "—" : averageRating}</p><p className="text-xs text-slate-400 mt-1">Average rating (latest responses)</p></div>
        <div className="card-shell p-5"><p className="text-2xl font-display font-semibold">{loading ? "…" : error ? "—" : feedbackList.length}</p><p className="text-xs text-slate-400 mt-1">Responses loaded</p></div>
        <div className="card-shell p-5"><p className="text-2xl font-display font-semibold text-emerald-600">{loading ? "…" : error ? "—" : positivePercent}</p><p className="text-xs text-slate-400 mt-1">Rated 4 or 5</p></div>
      </div>

      <div className="space-y-3">
        {error && <p className="card-shell p-5 text-sm text-rose-600" role="alert">Could not load feedback: {error}</p>}
        {loading && <p className="card-shell p-5 text-sm text-slate-500">Loading feedback…</p>}
        {!loading && !error && feedbackList.length === 0 && (
          <p className="card-shell p-5 text-sm text-slate-500">No feedback has been submitted yet.</p>
        )}
        {feedbackList.map(f => (
          <div key={f.id} className="card-shell p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-violet-50 text-violet-700 flex items-center justify-center text-xs font-semibold">
                  {(f.user?.fullName || "Former user").split(" ").map(n => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{f.user?.fullName || "Former user"}</p>
                  <Badge tone={f.user?.role === "DOCTOR" ? "doctor" : f.user?.role === "PATIENT" ? "patient" : "neutral"}>
                    {f.user?.role?.toLowerCase() || "unknown"}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} fill={i < f.rating ? "currentColor" : "none"} />)}
              </div>
            </div>
            {f.note && <p className="text-sm text-slate-600 flex items-start gap-2 mt-2"><MessageSquare size={14} className="text-slate-300 mt-0.5 shrink-0"/> {f.note}</p>}
            <p className="text-xs text-slate-400 mt-2">{new Date(f.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
