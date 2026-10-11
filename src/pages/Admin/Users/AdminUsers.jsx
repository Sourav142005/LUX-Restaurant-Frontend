import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../../../services/api";

const inputClass = "w-full rounded-xl border border-[#D8D0C4] bg-[#FCFBF8] px-4 py-3 text-[#0B0B0B] outline-none transition-all focus:border-[#D4AF7C] focus:ring-4 focus:ring-[#D4AF7C]/10";

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("All");
    const [selectedUser, setSelectedUser] = useState(null);

    const fetchUsers = async () => {
        try { setLoading(true); const response = await api.get("/user"); setUsers(response.data.users || []); }
        catch (error) { console.error(error); toast.error(error.response?.data?.message || "Failed to load users"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchUsers(); }, []);

    const filteredUsers = useMemo(() => {
        const term = search.trim().toLowerCase();
        return users.filter((user) => {
            const matchesSearch = !term || user.fullName?.toLowerCase().includes(term) || user.email?.toLowerCase().includes(term) || user.phone?.toLowerCase().includes(term);
            return matchesSearch && (roleFilter === "All" || user.role === roleFilter);
        });
    }, [users, search, roleFilter]);

    const stats = useMemo(() => ({ total: users.length, customers: users.filter((user) => user.role === "customer").length, admins: users.filter((user) => user.role === "admin").length }), [users]);
    if (loading) return <div className="flex min-h-[400px] items-center justify-center"><p className="text-sm font-bold uppercase tracking-[0.18em] text-[#8B8175]">Loading users…</p></div>;

    return <div className="space-y-7 pb-12">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0B0B0B] text-xl text-[#D4AF7C] shadow-lg shadow-black/10">♙</div><div><p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#B88A4A]">LUX Management</p><h1 className="mt-1 text-3xl font-black tracking-tight text-[#0B0B0B]">Users</h1><p className="mt-1 text-sm text-[#756F66]">Manage registered customers and administrators</p></div></div><button onClick={fetchUsers} className="rounded-xl border border-[#D8D0C4] bg-white px-5 py-3 font-bold text-[#0B0B0B] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#D4AF7C] hover:bg-[#F8F5EE]">↻ Refresh</button></header>
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3"><Stat label="Total Users" value={stats.total} icon="👥" /><Stat label="Customers" value={stats.customers} icon="♙" tone="blue" /><Stat label="Administrators" value={stats.admins} icon="♛" tone="gold" /></section>
        <section className="rounded-3xl border border-[#D8D0C4] bg-white p-5 shadow-sm"><div className="grid gap-4 md:grid-cols-2"><Field label="Find a user"><div className="relative"><span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A69E94]">⌕</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, or phone…" className={`${inputClass} pl-10`} /></div></Field><Field label="Role"><select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className={inputClass}><option value="All">All Roles</option><option value="customer">Customers</option><option value="admin">Administrators</option></select></Field></div></section>
        <p className="text-sm font-medium text-[#756F66]">Showing <span className="font-black text-[#0B0B0B]">{filteredUsers.length}</span> of <span className="font-black text-[#0B0B0B]">{users.length}</span> users</p>
        {filteredUsers.length === 0 ? <section className="rounded-3xl border border-dashed border-[#D8D0C4] bg-white p-12 text-center shadow-sm"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D4AF7C]/15 text-2xl text-[#8A642F]">♙</div><h2 className="mt-5 text-xl font-black text-[#0B0B0B]">No users found</h2><p className="mt-1 text-sm text-[#756F66]">Try changing your search or role filter.</p></section> : <section className="overflow-hidden rounded-3xl border border-[#D8D0C4] bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[770px]"><thead className="border-b border-[#E8E1D7] bg-[#F8F5EE]"><tr>{["User", "Email", "Phone", "Role", "Joined", ""].map((heading) => <th key={heading} className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.14em] text-[#5F584F]">{heading}</th>)}</tr></thead><tbody>{filteredUsers.map((user) => <UserRow key={user._id} user={user} onView={() => setSelectedUser(user)} />)}</tbody></table></div></section>}
        {selectedUser && <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </div>;
}

function Stat({ label, value, icon, tone = "default" }) { const colors = { default: "border-[#D8D0C4] bg-white text-[#756F66]", blue: "border-blue-200 bg-blue-50 text-blue-700", gold: "border-[#D4AF7C]/30 bg-[#D4AF7C]/10 text-[#8A642F]" }; return <div className={`rounded-3xl border p-6 shadow-sm ${colors[tone]}`}><div className="flex items-center justify-between"><div><p className="text-sm font-medium">{label}</p><p className="mt-1 text-3xl font-black text-[#0B0B0B]">{value}</p></div><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B0B0B] text-xl text-[#D4AF7C]">{icon}</span></div></div>; }
function Field({ label, children }) { return <div><label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#5F584F]">{label}</label>{children}</div>; }
function RoleBadge({ role }) { return <span className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wide ${role === "admin" ? "border-[#D4AF7C]/30 bg-[#D4AF7C]/10 text-[#8A642F]" : "border-blue-200 bg-blue-50 text-blue-700"}`}>{role === "admin" ? "Administrator" : "Customer"}</span>; }
function UserRow({ user, onView }) { const joined = user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "N/A"; return <tr className="border-b border-[#E8E1D7] last:border-0 transition hover:bg-[#FCFBF8]"><td className="px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0B0B0B] font-black text-[#D4AF7C]">{user.fullName?.charAt(0)?.toUpperCase() || "?"}</div><div><p className="font-bold text-[#0B0B0B]">{user.fullName}</p><p className="mt-0.5 text-xs text-[#8B8175]">#{user._id.slice(-6)}</p></div></div></td><td className="px-5 py-4 text-sm text-[#5F584F]">{user.email}</td><td className="px-5 py-4 text-sm text-[#5F584F]">{user.phone || "N/A"}</td><td className="px-5 py-4"><RoleBadge role={user.role} /></td><td className="px-5 py-4 text-sm text-[#756F66]">{joined}</td><td className="px-5 py-4"><button onClick={onView} className="rounded-xl border border-[#D8D0C4] bg-white px-4 py-2 text-sm font-bold text-[#0B0B0B] transition hover:border-[#D4AF7C] hover:bg-[#D4AF7C]/10">View</button></td></tr>; }
function UserModal({ user, onClose }) { const joined = user.createdAt ? new Date(user.createdAt).toLocaleString("en-IN") : "N/A"; return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" onClick={onClose}><section className="w-full max-w-lg overflow-hidden rounded-3xl border border-[#D8D0C4] bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}><header className="flex items-start justify-between border-b border-[#E8E1D7] p-6"><div className="flex items-center gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0B0B0B] text-xl font-black text-[#D4AF7C]">{user.fullName?.charAt(0)?.toUpperCase() || "?"}</div><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#B88A4A]">LUX customer profile</p><h2 className="mt-1 text-2xl font-black text-[#0B0B0B]">{user.fullName}</h2></div></div><button onClick={onClose} aria-label="Close user details" className="text-2xl text-[#756F66] transition hover:text-[#0B0B0B]">×</button></header><div className="space-y-3 p-6"><ModalDetail label="Email" value={user.email} /><ModalDetail label="Phone" value={user.phone || "Not provided"} /><div className="rounded-2xl bg-[#F8F5EE] p-4"><p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#8B8175]">Role</p><div className="mt-2"><RoleBadge role={user.role} /></div></div><ModalDetail label="Joined" value={joined} /><ModalDetail label="User ID" value={user._id} mono /></div><footer className="flex justify-end border-t border-[#E8E1D7] p-6"><button onClick={onClose} className="rounded-xl bg-[#0B0B0B] px-5 py-2.5 font-bold text-white transition hover:bg-[#2B1F14]">Close</button></footer></section></div>; }
function ModalDetail({ label, value, mono }) { return <div className="rounded-2xl bg-[#F8F5EE] p-4"><p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#8B8175]">{label}</p><p className={`mt-2 break-all text-sm font-bold text-[#0B0B0B] ${mono ? "font-mono text-xs" : ""}`}>{value}</p></div>; }

export default AdminUsers;
