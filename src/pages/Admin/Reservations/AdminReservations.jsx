import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../../../services/api";

const primaryButton = "rounded-xl bg-[#0B0B0B] px-5 py-3 font-bold text-white shadow-lg shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#2B1F14] active:scale-[0.98]";

function AdminReservations() {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchReservations = async () => {
        try {
            setLoading(true);
            const response = await api.get("/reservation");
            setReservations(response.data.reservations || []);
            setError("");
        } catch (requestError) {
            console.error(requestError);
            setError(requestError.response?.data?.message || "Failed to load reservations");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservations();
        const interval = setInterval(fetchReservations, 60000);
        return () => clearInterval(interval);
    }, []);

    const updateStatus = async (reservationId, status) => {
        try {
            await api.put(`/reservation/${reservationId}/status`, { status });
            toast.success(`Reservation marked as ${status}`);
            await fetchReservations();
        } catch (requestError) {
            console.error(requestError);
            toast.error(requestError.response?.data?.message || "Failed to update reservation");
        }
    };

    const isReservationActive = (reservation) => {
        if (!reservation?.reservationDate) return false;
        const date = new Date(reservation.reservationDate);
        const now = new Date();
        if (date.toDateString() !== now.toDateString()) return false;
        const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
        return currentTime >= reservation.startTime && currentTime < reservation.endTime;
    };

    const stats = useMemo(() => ({
        total: reservations.length,
        pending: reservations.filter((item) => item.status === "Pending").length,
        confirmed: reservations.filter((item) => item.status === "Confirmed").length,
        completed: reservations.filter((item) => item.status === "Completed").length,
        cancelled: reservations.filter((item) => item.status === "Cancelled").length
    }), [reservations]);

    const sortedReservations = useMemo(() => [...reservations].sort((a, b) => {
        const order = { Pending: 1, Confirmed: 2, Completed: 3, Cancelled: 4 };
        const statusDifference = order[a.status] - order[b.status];
        if (statusDifference) return statusDifference;
        if (a.status === "Confirmed" && isReservationActive(a) !== isReservationActive(b)) return Number(isReservationActive(b)) - Number(isReservationActive(a));
        const dateDifference = new Date(a.reservationDate) - new Date(b.reservationDate);
        return dateDifference || a.startTime.localeCompare(b.startTime);
    }), [reservations]);

    if (loading) return <div className="flex min-h-[400px] items-center justify-center"><p className="text-sm font-bold uppercase tracking-[0.18em] text-[#8B8175]">Loading reservations…</p></div>;
    if (error) return <div className="flex min-h-[400px] flex-col items-center justify-center text-center"><div className="rounded-3xl border border-red-200 bg-red-50 p-8"><p className="font-bold text-red-700">{error}</p><button onClick={fetchReservations} className={`${primaryButton} mt-5`}>Try Again</button></div></div>;

    return <div className="space-y-7 pb-12">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0B0B0B] text-xl text-[#D4AF7C] shadow-lg shadow-black/10">◷</div><div><p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#B88A4A]">LUX Management</p><h1 className="mt-1 text-3xl font-black tracking-tight text-[#0B0B0B]">Reservations</h1><p className="mt-1 text-sm text-[#756F66]">Review and manage customer table reservations</p></div></div><button onClick={fetchReservations} className="rounded-xl border border-[#D8D0C4] bg-white px-5 py-3 font-bold text-[#0B0B0B] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#D4AF7C] hover:bg-[#F8F5EE]">↻ Refresh</button></header>
        <section className="grid grid-cols-2 gap-4 md:grid-cols-5"><Stat label="Total" value={stats.total} /><Stat label="Pending" value={stats.pending} tone="gold" /><Stat label="Confirmed" value={stats.confirmed} tone="green" /><Stat label="Completed" value={stats.completed} tone="blue" /><Stat label="Cancelled" value={stats.cancelled} tone="red" /></section>
        {reservations.length === 0 ? <section className="rounded-3xl border border-dashed border-[#D8D0C4] bg-white p-12 text-center shadow-sm"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D4AF7C]/15 text-2xl text-[#8A642F]">◷</div><h2 className="mt-5 text-xl font-black text-[#0B0B0B]">No reservations yet</h2><p className="mt-1 text-sm text-[#756F66]">There are currently no customer table reservations.</p></section> : <section className="space-y-5">{sortedReservations.map((reservation) => <ReservationCard key={reservation._id} reservation={reservation} isActive={isReservationActive(reservation)} updateStatus={updateStatus} />)}</section>}
    </div>;
}

function Stat({ label, value, tone = "default" }) { const colors = { default: "border-[#D8D0C4] bg-white text-[#756F66]", gold: "border-[#D4AF7C]/30 bg-[#D4AF7C]/10 text-[#8A642F]", green: "border-green-200 bg-green-50 text-green-700", blue: "border-blue-200 bg-blue-50 text-blue-700", red: "border-red-200 bg-red-50 text-red-700" }; return <div className={`rounded-3xl border p-5 shadow-sm ${colors[tone]}`}><p className="text-sm font-medium">{label}</p><p className="mt-1 text-3xl font-black text-[#0B0B0B]">{value}</p></div>; }

function ReservationCard({ reservation, isActive, updateStatus }) {
    const statusStyles = reservation.status === "Confirmed" ? "border-green-200 bg-green-50 text-green-700" : reservation.status === "Pending" ? "border-[#D4AF7C]/30 bg-[#D4AF7C]/10 text-[#8A642F]" : reservation.status === "Cancelled" ? "border-red-200 bg-red-50 text-red-700" : "border-blue-200 bg-blue-50 text-blue-700";
    const formatDate = (date) => new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    const formatTime = (time) => { if (!time) return ""; const [hours, minutes] = time.split(":"); const hour = Number(hours); return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? "PM" : "AM"}`; };
    return <article className="rounded-3xl border border-[#D8D0C4] bg-white p-6 shadow-sm transition-all duration-200 hover:border-[#D4AF7C]/70 hover:shadow-lg"><div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#B88A4A]">Reservation</p><h2 className="mt-1 text-xl font-black text-[#0B0B0B]">#{reservation._id.slice(-6).toUpperCase()}</h2><p className="mt-1 text-xs text-[#8B8175]">Created {new Date(reservation.createdAt).toLocaleString()}</p></div><span className={`w-fit rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wide ${statusStyles}`}>{reservation.status}</span></div><div className="mt-6 grid gap-5 md:grid-cols-2"><InfoPanel label="Customer"><p className="font-bold text-[#0B0B0B]">👤 {reservation.user?.fullName || "Unknown"}</p><p className="mt-1 text-sm text-[#756F66]">✉ {reservation.user?.email || "Unknown"}</p>{reservation.user?.phone && <p className="mt-1 text-sm text-[#756F66]">☎ {reservation.user.phone}</p>}</InfoPanel><InfoPanel label="Table"><p className="text-lg font-black text-[#0B0B0B]">🪑 Table {reservation.table?.tableNumber || "Unknown"}</p><p className="mt-1 text-sm text-[#756F66]">Capacity: {reservation.table?.capacity || "-"} guests</p></InfoPanel></div><div className="mt-5 grid gap-4 sm:grid-cols-3"><Detail label="Date" value={`📅 ${formatDate(reservation.reservationDate)}`} /><Detail label="Time" value={`🕐 ${formatTime(reservation.startTime)} → ${formatTime(reservation.endTime)}`} /><Detail label="Guests" value={`👥 ${reservation.guests}`} /></div>{reservation.notes && <div className="mt-5 rounded-2xl border border-[#D8D0C4] bg-[#FCFBF8] p-4"><p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#5F584F]">Special notes</p><p className="mt-2 text-sm leading-6 text-[#756F66]">{reservation.notes}</p></div>}<div className="mt-6 flex flex-wrap gap-3">{reservation.status === "Pending" && <><button onClick={() => updateStatus(reservation._id, "Confirmed")} className={primaryButton}>Confirm Reservation</button><button onClick={() => updateStatus(reservation._id, "Cancelled")} className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 font-bold text-red-600 transition hover:bg-red-100">Cancel Reservation</button></>}{reservation.status === "Confirmed" && isActive && <span className="rounded-xl border border-green-200 bg-green-50 px-5 py-3 text-sm font-bold text-green-700">● Reservation is Active</span>}{reservation.status === "Confirmed" && !isActive && <button onClick={() => updateStatus(reservation._id, "Cancelled")} className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 font-bold text-red-600 transition hover:bg-red-100">Cancel Reservation</button>}</div></article>;
}

function InfoPanel({ label, children }) { return <div className="rounded-2xl bg-[#F8F5EE] p-5"><p className="mb-3 text-[10px] font-black uppercase tracking-[0.14em] text-[#8B8175]">{label}</p>{children}</div>; }
function Detail({ label, value }) { return <div className="rounded-2xl border border-[#E8E1D7] p-4"><p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#8B8175]">{label}</p><p className="mt-2 text-sm font-bold text-[#0B0B0B]">{value}</p></div>; }

export default AdminReservations;
