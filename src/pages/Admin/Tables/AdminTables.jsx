import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { QRCodeSVG } from "qrcode.react";
import api from "../../../services/api";

const inputClass = "w-full rounded-xl border border-[#D8D0C4] bg-[#FCFBF8] px-4 py-3 text-[#0B0B0B] outline-none transition-all focus:border-[#D4AF7C] focus:ring-4 focus:ring-[#D4AF7C]/10";
const primaryButton = "rounded-xl bg-[#0B0B0B] px-5 py-3 font-bold text-white shadow-lg shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#2B1F14] hover:shadow-xl active:scale-[0.98]";

function AdminTables() {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ tableNumber: "", capacity: "", tableType: "Reservation" });

    const fetchTables = async () => {
        try {
            setLoading(true);
            const response = await api.get("/table");
            setTables(response.data.tables || []);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to load tables");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTables();
        const interval = setInterval(fetchTables, 30000);
        return () => clearInterval(interval);
    }, []);

    const createTable = async (event) => {
        event.preventDefault();
        try {
            await api.post("/table", { tableNumber: Number(formData.tableNumber), capacity: Number(formData.capacity), tableType: formData.tableType });
            toast.success("Table created successfully");
            setFormData({ tableNumber: "", capacity: "", tableType: "Reservation" });
            setShowForm(false);
            await fetchTables();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to create table");
        }
    };

    const updateStatus = async (tableId, status) => {
        try {
            await api.put(`/table/${tableId}/status`, { status });
            toast.success("Table status updated");
            await fetchTables();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to update table");
        }
    };

    const deleteTable = async (tableId) => {
        if (!window.confirm("Are you sure you want to delete this table?")) return;
        try {
            await api.delete(`/table/${tableId}`);
            toast.success("Table deleted successfully");
            await fetchTables();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to delete table");
        }
    };

    const downloadTableQR = (table) => {
        const svg = document.getElementById(`qr-table-${table.tableNumber}`);
        if (!svg) return toast.error("QR code not found");
        const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `LUX-Table-${table.tableNumber}-QR.svg`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const stats = useMemo(() => ({
        total: tables.length,
        available: tables.filter((table) => table.status === "Available").length,
        occupied: tables.filter((table) => table.status === "Occupied").length,
        reserved: tables.filter((table) => table.status === "Reserved").length
    }), [tables]);

    if (loading) return <div className="flex min-h-[400px] items-center justify-center"><p className="text-sm font-bold uppercase tracking-[0.18em] text-[#8B8175]">Loading tables…</p></div>;

    return (
        <div className="space-y-7 pb-12">
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0B0B0B] text-xl text-[#D4AF7C] shadow-lg shadow-black/10">▦</div><div><p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#B88A4A]">LUX Management</p><h1 className="mt-1 text-3xl font-black tracking-tight text-[#0B0B0B]">Table Management</h1><p className="mt-1 text-sm text-[#756F66]">Manage dining spaces, capacity, and table availability</p></div></div>
                <div className="flex flex-wrap gap-3"><button onClick={fetchTables} className="rounded-xl border border-[#D8D0C4] bg-white px-5 py-3 font-bold text-[#0B0B0B] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D4AF7C] hover:bg-[#F8F5EE] hover:shadow-md active:scale-[0.98]">↻ Refresh</button><button onClick={() => setShowForm((visible) => !visible)} className={primaryButton}>{showForm ? "Close Form" : "+ Add Table"}</button></div>
            </header>

            <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <StatCard label="Total Tables" value={stats.total} />
                <StatCard label="Available" value={stats.available} tone="green" />
                <StatCard label="Occupied" value={stats.occupied} tone="red" />
                <StatCard label="Reserved" value={stats.reserved} tone="gold" />
            </section>

            {showForm && <section className="rounded-3xl border border-[#D8D0C4] bg-white p-6 shadow-sm md:p-7"><div className="mb-6"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B88A4A]">New dining space</p><h2 className="mt-1 text-2xl font-black text-[#0B0B0B]">Add Table</h2><p className="mt-1 text-sm text-[#756F66]">Set its number, seating capacity, and service type.</p></div><form onSubmit={createTable} className="grid items-end gap-5 md:grid-cols-4"><Field label="Table Number"><input type="number" name="tableNumber" value={formData.tableNumber} onChange={(event) => setFormData({ ...formData, tableNumber: event.target.value })} min="1" placeholder="e.g. 7" className={inputClass} required /></Field><Field label="Capacity"><input type="number" name="capacity" value={formData.capacity} onChange={(event) => setFormData({ ...formData, capacity: event.target.value })} min="1" placeholder="e.g. 4" className={inputClass} required /></Field><Field label="Table Type"><select name="tableType" value={formData.tableType} onChange={(event) => setFormData({ ...formData, tableType: event.target.value })} className={inputClass}><option value="Reservation">Reservation</option><option value="Walk-In">Walk-In</option></select></Field><button type="submit" className={primaryButton}>Create Table</button></form></section>}

            {tables.length === 0 ? <section className="rounded-3xl border border-dashed border-[#D8D0C4] bg-white p-12 text-center shadow-sm"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D4AF7C]/15 text-2xl text-[#8A642F]">▦</div><h2 className="mt-5 text-xl font-black text-[#0B0B0B]">No tables created yet</h2><p className="mt-1 text-sm text-[#756F66]">Create a table to begin managing your dining floor.</p><button onClick={() => setShowForm(true)} className={`${primaryButton} mt-5`}>+ Add Table</button></section> : <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">{tables.map((table) => <TableCard key={table._id} table={table} updateStatus={updateStatus} deleteTable={deleteTable} downloadTableQR={downloadTableQR} />)}</section>}
        </div>
    );
}

function StatCard({ label, value, tone = "default" }) {
    const colors = { default: "border-[#D8D0C4] bg-white text-[#756F66]", green: "border-green-200 bg-green-50 text-green-700", red: "border-red-200 bg-red-50 text-red-700", gold: "border-[#D4AF7C]/30 bg-[#D4AF7C]/10 text-[#8A642F]" };
    return <div className={`rounded-3xl border p-5 shadow-sm ${colors[tone]}`}><p className="text-sm font-medium">{label}</p><p className="mt-1 text-3xl font-black text-[#0B0B0B]">{value}</p></div>;
}

function Field({ label, children }) { return <div><label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#5F584F]">{label}</label>{children}</div>; }

function TableCard({ table, updateStatus, deleteTable, downloadTableQR }) {
    const statusStyles = table.status === "Available" ? "border-green-200 bg-green-50 text-green-700" : table.status === "Occupied" ? "border-red-200 bg-red-50 text-red-700" : "border-[#D4AF7C]/30 bg-[#D4AF7C]/10 text-[#8A642F]";
    const qrUrl = `${window.location.origin}/menu?table=${table._id}`;
    return <article className="rounded-3xl border border-[#D8D0C4] bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#D4AF7C]/70 hover:shadow-xl hover:shadow-black/[0.05]"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#B88A4A]">{table.tableType}</p><h2 className="mt-1 text-2xl font-black text-[#0B0B0B]">Table {table.tableNumber}</h2></div><span className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wide ${statusStyles}`}>{table.status}</span></div><div className="mt-5 rounded-2xl bg-[#F8F5EE] p-4"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8B8175]">Seating capacity</p><p className="mt-1 text-lg font-black text-[#0B0B0B]">🪑 {table.capacity} seats</p></div><div className="mt-5">{table.tableType === "Reservation" ? <><label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#5F584F]">Status</label><div className="rounded-xl border border-[#D8D0C4] bg-[#FCFBF8] px-4 py-3 text-sm font-bold text-[#756F66]">Automatic via reservations</div></> : <><label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#5F584F]">Change status</label><select value={table.status} onChange={(event) => updateStatus(table._id, event.target.value)} className={inputClass}><option value="Available">Available</option><option value="Occupied">Occupied</option></select></>}</div>{table.tableType === "Walk-In" && <div className="mt-5 border-t border-[#E8E1D7] pt-5 text-center"><p className="text-sm font-black text-[#0B0B0B]">Scan to Order</p><p className="mt-1 text-xs text-[#756F66]">Guests can order directly from this table.</p><div className="mt-4 flex justify-center"><div className="rounded-2xl border border-[#D8D0C4] bg-white p-3"><QRCodeSVG id={`qr-table-${table.tableNumber}`} value={qrUrl} size={150} /></div></div><button onClick={() => downloadTableQR(table)} className="mt-4 rounded-xl border border-[#D8D0C4] bg-[#F8F5EE] px-4 py-2.5 text-sm font-bold text-[#0B0B0B] transition hover:border-[#D4AF7C] hover:bg-[#D4AF7C]/10">⇩ Download QR</button></div>}<button onClick={() => deleteTable(table._id)} className="mt-5 w-full rounded-xl border border-red-200 bg-red-50 py-2.5 font-bold text-red-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-100 active:scale-[0.98]">Delete Table</button></article>;
}

export default AdminTables;
