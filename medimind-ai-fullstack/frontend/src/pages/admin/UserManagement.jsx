import { useState, useEffect, useCallback } from "react";
import { Search, MoreVertical, UserPlus, RefreshCw } from "lucide-react";
import SectionHeader from "../../components/SectionHeader";
import Button from "../../components/Button";
import { Badge } from "../../components/Bits";
import { SkeletonTable } from "../../components/Skeleton";
import { api } from "../../lib/api";

export default function UserManagement() {
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data || []);
    } catch (err) {
      console.error("[UserManagement] Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = users.filter((u) => {
    const roleMatch =
      roleFilter === "All" ||
      (u.role || "").toUpperCase() === roleFilter.toUpperCase();
    const nameMatch = (u.fullName || u.name || "")
      .toLowerCase()
      .includes(q.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(q.toLowerCase());
    return roleMatch && nameMatch;
  });

  if (loading) {
    return (
      <div>
        <SectionHeader eyebrow="Accounts" title="User Management" description="Manage patient and doctor accounts across the platform." />
        <SkeletonTable rows={6} cols={5} />
      </div>
    );
  }

  return (
    <div>
      <SectionHeader
        eyebrow="Accounts"
        title="User Management"
        description="Manage patient and doctor accounts across the platform."
        action={
          <Button role="admin" icon={UserPlus}>Invite Admin</Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search users…" className="w-full border border-slate-200 rounded-full pl-9 pr-4 py-2.5 text-sm outline-none focus:border-violet-500 bg-white" />
        </div>
        <div className="flex gap-2">
          {["All", "Patient", "Doctor"].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)} className={`text-xs font-semibold px-3.5 py-2 rounded-full border ${roleFilter === r ? "bg-violet-700 text-white border-violet-700" : "border-slate-200 text-slate-500"}`}>{r}</button>
          ))}
        </div>
      </div>

      <div className="card-shell overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold text-slate-400 border-b border-slate-100">
              <th className="px-5 py-3.5">User</th>
              <th className="px-5 py-3.5">Role</th>
              <th className="px-5 py-3.5">Email</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Joined</th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u._id || u.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    {u.avatarUrl ? (
                      <img src={u.avatarUrl} alt={u.fullName || u.name} className="h-9 w-9 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-violet-50 text-violet-700 flex items-center justify-center text-xs font-semibold shrink-0">
                        {(u.fullName || u.name || "U").split(" ").map(n => n[0]).slice(0, 2).join("")}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-ink">{u.fullName || u.name}</p>
                      <p className="text-xs text-slate-400">@{u.username || "user"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5"><Badge tone={(u.role || "").toLowerCase() === "doctor" ? "doctor" : (u.role || "").toLowerCase() === "admin" ? "admin" : "patient"}>{u.role}</Badge></td>
                <td className="px-5 py-3.5 text-slate-500">{u.email}</td>
                <td className="px-5 py-3.5"><Badge tone={(u.status || "").toLowerCase() === "active" ? "good" : (u.status || "").toLowerCase() === "approved" ? "good" : (u.status || "").toLowerCase() === "pending" ? "warn" : "bad"}>{u.status}</Badge></td>
                <td className="px-5 py-3.5 text-slate-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Recent"}</td>
                <td className="px-5 py-3.5 text-right"><button className="text-slate-400 hover:text-ink"><MoreVertical size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
