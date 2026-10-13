import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
    FiCalendar,
    FiClock,
    FiUsers,
    FiCheck,
    FiInfo,
    FiArrowRight,
    FiRefreshCw,
    FiAlertCircle
} from "react-icons/fi";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

// ======================================================
// Helpers & Presets
// ======================================================

const getLocalDateString = (offsetDays = 0) => {
    const date = new Date();
    if (offsetDays) {
        date.setDate(date.getDate() + offsetDays);
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const getLocalTimeString = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
    ).padStart(2, "0")}`;
};

const isPastReservationStart = (reservationDate, startTime) => {
    if (!reservationDate || !startTime) return false;
    const now = new Date();
    const selectedDateTime = new Date(`${reservationDate}T${startTime}:00`);
    return selectedDateTime <= now;
};

/**
 * Calculates endTime as "HH:mm" from a startTime and duration in minutes.
 * Returns { endTime: string, exceedsDay: boolean }.
 * If total duration extends past midnight (totalEndMins > 1439 mins / 23:59),
 * exceedsDay is true and endTime is empty ("") so duration is never silently truncated.
 */
const getDurationEndTime = (startTime, durationMinutes = 120) => {
    if (!startTime || typeof startTime !== "string") {
        return { endTime: "", exceedsDay: false };
    }
    const parts = startTime.split(":");
    const startHours = Number(parts[0]);
    const startMins = Number(parts[1]);
    if (isNaN(startHours) || isNaN(startMins)) {
        return { endTime: "", exceedsDay: false };
    }

    const totalStartMins = startHours * 60 + startMins;
    const totalEndMins = totalStartMins + Number(durationMinutes);

    // Backend contract: reservation must be on the same calendar date (up to 23:59 = 1439 mins)
    // If it extends past midnight, mark exceedsDay: true and do not truncate
    if (totalEndMins > 1439) {
        return { endTime: "", exceedsDay: true };
    }

    const endHours = Math.floor(totalEndMins / 60);
    const endMins = totalEndMins % 60;
    const endTime = `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;

    return { endTime, exceedsDay: false };
};

const formatTime12h = (time24) => {
    if (!time24 || typeof time24 !== "string") return "";
    const [hoursStr, minsStr] = time24.split(":");
    const hours = Number(hoursStr);
    if (isNaN(hours)) return time24;
    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minsStr || "00"} ${period}`;
};

const formatDateReadable = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(`${dateStr}T12:00:00`);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
    });
};

const DURATION_OPTIONS = [
    { label: "1.5h", value: 90, desc: "Quick Dining" },
    { label: "2.0h", value: 120, desc: "Standard (Recommended)" },
    { label: "2.5h", value: 150, desc: "Leisurely Dinner" },
    { label: "3.0h", value: 180, desc: "Celebration Feast" }
];

const POPULAR_SLOTS = [
    { label: "12:30 PM", value: "12:30", category: "Lunch" },
    { label: "1:00 PM", value: "13:00", category: "Lunch" },
    { label: "1:30 PM", value: "13:30", category: "Lunch" },
    { label: "2:00 PM", value: "14:00", category: "Lunch" },
    { label: "7:00 PM", value: "19:00", category: "Dinner" },
    { label: "7:30 PM", value: "19:30", category: "Dinner" },
    { label: "8:00 PM", value: "20:00", category: "Dinner" },
    { label: "8:30 PM", value: "20:30", category: "Dinner" },
    { label: "9:00 PM", value: "21:00", category: "Dinner" },
    { label: "9:30 PM", value: "21:30", category: "Dinner" }
];

const GUEST_PRESETS = [1, 2, 3, 4, 5, 6, 8];

// ======================================================
// Component
// ======================================================

function Reservations() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const returnTo = searchParams.get("returnTo");
    const { logout } = useAuth();

    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedTable, setSelectedTable] = useState("");
    const [confirmedBooking, setConfirmedBooking] = useState(null);

    // Duration in minutes (default: 2 hours = 120 mins)
    const [duration, setDuration] = useState(() => {
        try {
            const saved = sessionStorage.getItem("lux_pending_reservation");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed?.duration) {
                    return parsed.duration;
                }
            }
        } catch {
            // Ignore sessionStorage errors
        }
        return 120;
    });

    const [formData, setFormData] = useState(() => {
        try {
            const saved = sessionStorage.getItem("lux_pending_reservation");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed?.formData) {
                    sessionStorage.removeItem("lux_pending_reservation");
                    return parsed.formData;
                }
            }
        } catch {
            // Ignore sessionStorage errors
        }
        return {
            reservationDate: "",
            startTime: "",
            endTime: "",
            guests: 2,
            notes: ""
        };
    });

    // Check whether current startTime + duration extends past midnight
    const durationWindowExceeded = Boolean(
        formData.startTime &&
        getDurationEndTime(formData.startTime, duration).exceedsDay
    );

    // =====================================
    // Fetch Available Tables
    // =====================================

    const fetchTables = async () => {
        if (
            !formData.reservationDate ||
            !formData.startTime ||
            !formData.endTime ||
            durationWindowExceeded
        ) {
            setTables([]);
            setSelectedTable("");
            return;
        }

        if (
            isPastReservationStart(
                formData.reservationDate,
                formData.startTime
            )
        ) {
            setTables([]);
            setSelectedTable("");
            return;
        }

        if (formData.startTime >= formData.endTime) {
            setTables([]);
            setSelectedTable("");
            return;
        }

        try {
            setLoading(true);

            const response = await api.get("/reservation/available", {
                params: {
                    reservationDate: formData.reservationDate,
                    startTime: formData.startTime,
                    endTime: formData.endTime
                }
            });

            setTables(
                Array.isArray(response.data.tables)
                    ? response.data.tables.filter(Boolean)
                    : []
            );
            setSelectedTable("");
        } catch (error) {
            console.error(error);
            if (error.response?.status === 401) {
                try {
                    sessionStorage.setItem(
                        "lux_pending_reservation",
                        JSON.stringify({
                            formData,
                            duration
                        })
                    );
                } catch {
                    // Ignore storage quota errors
                }
                logout();
                toast.error("Your session has expired. Please sign in to check table availability.");
                const safeReturn = returnTo ? `/reservations?returnTo=${encodeURIComponent(returnTo)}` : "/reservations";
                navigate(`/login?returnTo=${encodeURIComponent(safeReturn)}`);
                return;
            }
            toast.error(
                error.response?.data?.message ||
                "Failed to check table availability"
            );
            setTables([]);
        } finally {
            setLoading(false);
        }
    };

    // Auto-check availability when date or times change
    useEffect(() => {
        fetchTables();
    }, [
        formData.reservationDate,
        formData.startTime,
        formData.endTime,
        durationWindowExceeded
    ]);

    // Keep selectedTable valid when guest count or table availability changes
    useEffect(() => {
        if (selectedTable && tables.length > 0) {
            const tableData = tables.find((t) => t._id === selectedTable);
            if (
                !tableData ||
                !tableData.isAvailable ||
                tableData.capacity < Number(formData.guests)
            ) {
                setSelectedTable("");
            }
        }
    }, [formData.guests, tables, selectedTable]);

    // =====================================
    // Input Handlers
    // =====================================

    const handleDateSelect = (dateValue) => {
        setFormData((prev) => ({
            ...prev,
            reservationDate: dateValue
        }));
    };

    const handleTimeSelect = (timeValue) => {
        const { endTime: computedEnd } = getDurationEndTime(timeValue, duration);
        setFormData((prev) => ({
            ...prev,
            startTime: timeValue,
            endTime: computedEnd
        }));
    };

    const handleDurationSelect = (durationValue) => {
        setDuration(durationValue);
        if (formData.startTime) {
            const { endTime: computedEnd } = getDurationEndTime(
                formData.startTime,
                durationValue
            );
            setFormData((prev) => ({
                ...prev,
                endTime: computedEnd
            }));
        }
    };

    const handleGuestsSelect = (guestCount) => {
        setFormData((prev) => ({
            ...prev,
            guests: Math.max(1, Number(guestCount))
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "startTime") {
            const { endTime: computedEnd } = getDurationEndTime(value, duration);
            setFormData((prev) => ({
                ...prev,
                startTime: value,
                endTime: computedEnd
            }));
        } else if (name === "guests") {
            setFormData((prev) => ({
                ...prev,
                guests: Math.max(1, Number(value))
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // =====================================
    // Submit Reservation
    // =====================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (durationWindowExceeded) {
            toast.error(
                "The selected dining duration extends past midnight. Please choose an earlier arrival time or shorter duration."
            );
            return;
        }

        if (!selectedTable) {
            toast.error("Please select a table to complete your reservation");
            return;
        }

        if (
            !formData.reservationDate ||
            !formData.startTime ||
            !formData.endTime
        ) {
            toast.error("Please select date and time");
            return;
        }

        if (
            isPastReservationStart(
                formData.reservationDate,
                formData.startTime
            )
        ) {
            toast.error("Please select a future reservation time");
            setSelectedTable("");
            setTables([]);
            return;
        }

        if (formData.startTime >= formData.endTime) {
            toast.error("End time must be after start time");
            return;
        }

        if (Number(formData.guests) < 1) {
            toast.error("Number of guests must be at least 1");
            return;
        }

        const selectedTableData = tables.find(
            (table) => table && table._id === selectedTable
        );

        if (!selectedTableData || !selectedTableData.isAvailable) {
            toast.error("Selected table is no longer available");
            setSelectedTable("");
            fetchTables();
            return;
        }

        if (selectedTableData.capacity < Number(formData.guests)) {
            toast.error("Selected table is too small for your party");
            setSelectedTable("");
            return;
        }

        try {
            setSubmitting(true);

            const response = await api.post("/reservation", {
                table: selectedTable,
                reservationDate: formData.reservationDate,
                startTime: formData.startTime,
                endTime: formData.endTime,
                guests: Number(formData.guests),
                notes: formData.notes
            });

            toast.success(
                response.data.message || "Table reserved successfully"
            );

            if (returnTo === "checkout") {
                navigate("/checkout");
                return;
            }

            // Show luxury confirmation screen
            setConfirmedBooking(response.data.reservation);
        } catch (error) {
            console.error(error);
            if (error.response?.status === 401) {
                try {
                    sessionStorage.setItem(
                        "lux_pending_reservation",
                        JSON.stringify({
                            formData,
                            duration
                        })
                    );
                } catch {
                    // Ignore storage quota errors
                }
                logout();
                toast.error("Your session has expired. Please sign in to complete your reservation.");
                const safeReturn = returnTo ? `/reservations?returnTo=${encodeURIComponent(returnTo)}` : "/reservations";
                navigate(`/login?returnTo=${encodeURIComponent(safeReturn)}`);
                return;
            }
            const message =
                error.response?.data?.message ||
                "Failed to create reservation";
            toast.error(message);
            await fetchTables();
            setSelectedTable("");
        } finally {
            setSubmitting(false);
        }
    };

    // Filter suitable tables
    const suitableTables = tables.filter(
        (table) =>
            table &&
            table.isAvailable === true &&
            table.capacity >= Number(formData.guests)
    );

    const isDateToday =
        formData.reservationDate === getLocalDateString();
    const currentLocalTime = getLocalTimeString();

    // ======================================================
    // Render: Post-Booking Confirmation Card
    // ======================================================

    if (confirmedBooking) {
        return (
            <div className="lux-page bg-[#F8F5EE] py-10 sm:py-16">
                <div className="lux-container max-w-2xl">
                    <div className="overflow-hidden rounded-[2.5rem] border border-[#D4AF7C]/40 bg-white shadow-2xl shadow-black/10">
                        {/* Header Banner */}
                        <div className="relative overflow-hidden bg-[#0B0B0B] p-8 text-center text-white sm:p-10">
                            <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#D4AF7C]/15 blur-2xl" />
                            <div className="absolute -left-20 -bottom-20 h-48 w-48 rounded-full bg-[#D4AF7C]/15 blur-2xl" />

                            <div className="relative z-10">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#D4AF7C]/50 bg-[#D4AF7C]/20 shadow-lg shadow-black/30">
                                    <FiCheck className="text-3xl text-[#D4AF7C]" />
                                </div>
                                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#D4AF7C]">
                                    Table Confirmed
                                </p>
                                <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-white">
                                    Table {confirmedBooking.table?.tableNumber || "Reserved"} is Yours
                                </h1>
                                <p className="mt-2 text-xs sm:text-sm text-white/70">
                                    Reference #{confirmedBooking._id?.slice(-6).toUpperCase() || "LUX"} • Status: {confirmedBooking.status}
                                </p>
                            </div>
                        </div>

                        {/* Confirmation Details */}
                        <div className="p-6 sm:p-8 space-y-6">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <div className="rounded-2xl border border-[#E8E0D4] bg-[#FBF7EF] p-4 text-center">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#8F6938]">Date</p>
                                    <p className="mt-1 text-sm font-black text-[#0B0B0B]">
                                        {formatDateReadable(
                                            confirmedBooking.reservationDate ||
                                            formData.reservationDate
                                        )}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-[#E8E0D4] bg-[#FBF7EF] p-4 text-center">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#8F6938]">Dining Window</p>
                                    <p className="mt-1 text-sm font-black text-[#0B0B0B]">
                                        {formatTime12h(confirmedBooking.startTime)} → {formatTime12h(confirmedBooking.endTime)}
                                    </p>
                                </div>
                                <div className="col-span-2 sm:col-span-1 rounded-2xl border border-[#E8E0D4] bg-[#FBF7EF] p-4 text-center">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#8F6938]">Party</p>
                                    <p className="mt-1 text-sm font-black text-[#0B0B0B]">
                                        {confirmedBooking.guests} {confirmedBooking.guests === 1 ? "Guest" : "Guests"}
                                    </p>
                                </div>
                            </div>

                            {confirmedBooking.notes && (
                                <div className="rounded-2xl border border-[#E8E0D4] bg-[#FCFBF8] p-4 text-sm">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#8F6938]">Special Requests</p>
                                    <p className="mt-1 text-[#2B1F14]">{confirmedBooking.notes}</p>
                                </div>
                            )}

                            <div className="space-y-3 pt-2">
                                <Link
                                    to="/menu"
                                    className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#0B0B0B] font-bold text-white shadow-xl shadow-black/15 hover:bg-[#2B1F14] transition"
                                >
                                    <span>Explore Menu & Pre-Order</span>
                                    <FiArrowRight />
                                </Link>
                                <Link
                                    to="/reservations/my"
                                    className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[#D4AF7C]/40 bg-white font-bold text-[#0B0B0B] hover:bg-[#FBF7EF] transition"
                                >
                                    <FiCalendar className="text-[#8F6938]" />
                                    <span>View My Reservations</span>
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setConfirmedBooking(null);
                                        setSelectedTable("");
                                        setFormData({
                                            reservationDate: "",
                                            startTime: "",
                                            endTime: "",
                                            guests: 2,
                                            notes: ""
                                        });
                                    }}
                                    className="w-full text-center text-xs font-semibold text-[#8B8175] hover:text-[#0B0B0B] py-2 transition"
                                >
                                    Make Another Reservation
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ======================================================
    // Render: Main Reservation Form
    // ======================================================

    return (
        <div className="lux-page bg-[#F8F5EE] py-8 sm:py-12">
            <div className="lux-container">
                {/* Header */}
                <div className="mb-8 sm:mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-5">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#B88A4A]" />
                            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#B88A4A]">
                                LUX Fine Dining & Concierge
                            </p>
                        </div>
                        <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#0B0B0B]">
                            Reserve Your Table
                        </h1>
                        <p className="mt-2 text-sm sm:text-base text-[#6B6358] max-w-xl">
                            Select your date, preferred dining hour, and party size to discover available tables.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            to="/reservations/my"
                            className="inline-flex h-12 items-center gap-2 rounded-2xl border border-[#D8D0C4] bg-white px-5 text-sm font-bold text-[#0B0B0B] shadow-sm hover:border-[#D4AF7C] hover:bg-[#FBF7EF] transition"
                        >
                            <FiCalendar className="text-[#8F6938]" />
                            <span>My Reservations</span>
                        </Link>
                    </div>
                </div>

                {/* Main 2-Column Responsive Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* LEFT COLUMN: Booking Configuration */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="rounded-[2rem] border border-[#D8D0C4] bg-white p-6 sm:p-8 shadow-sm">
                            <form onSubmit={handleSubmit} className="space-y-7">
                                {/* SECTION 1: Date */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-sm font-black uppercase tracking-wider text-[#0B0B0B] flex items-center gap-2">
                                            <FiCalendar className="text-[#8F6938]" />
                                            <span>1. Dining Date</span>
                                        </label>
                                        <span className="text-xs text-[#8B8175]">
                                            {formData.reservationDate
                                                ? formatDateReadable(formData.reservationDate)
                                                : "Required"}
                                        </span>
                                    </div>

                                    {/* Date Shortcuts */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-3">
                                        <button
                                            type="button"
                                            onClick={() => handleDateSelect(getLocalDateString(0))}
                                            className={`h-11 rounded-xl text-xs font-bold border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF7C] focus-visible:ring-offset-2 ${
                                                formData.reservationDate === getLocalDateString(0)
                                                    ? "bg-[#0B0B0B] text-white border-[#0B0B0B] shadow-sm"
                                                    : "bg-[#FBF7EF] text-[#2B1F14] border-[#E8E0D4] hover:border-[#D4AF7C]"
                                            }`}
                                        >
                                            Today
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDateSelect(getLocalDateString(1))}
                                            className={`h-11 rounded-xl text-xs font-bold border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF7C] focus-visible:ring-offset-2 ${
                                                formData.reservationDate === getLocalDateString(1)
                                                    ? "bg-[#0B0B0B] text-white border-[#0B0B0B] shadow-sm"
                                                    : "bg-[#FBF7EF] text-[#2B1F14] border-[#E8E0D4] hover:border-[#D4AF7C]"
                                            }`}
                                        >
                                            Tomorrow
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDateSelect(getLocalDateString(2))}
                                            className={`col-span-2 sm:col-span-1 h-11 rounded-xl text-xs font-bold border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF7C] focus-visible:ring-offset-2 ${
                                                formData.reservationDate === getLocalDateString(2)
                                                    ? "bg-[#0B0B0B] text-white border-[#0B0B0B] shadow-sm"
                                                    : "bg-[#FBF7EF] text-[#2B1F14] border-[#E8E0D4] hover:border-[#D4AF7C]"
                                            }`}
                                        >
                                            In 2 Days
                                        </button>
                                    </div>

                                    <input
                                        type="date"
                                        name="reservationDate"
                                        value={formData.reservationDate}
                                        onChange={handleChange}
                                        min={getLocalDateString(0)}
                                        className="w-full rounded-2xl border border-[#D8D0C4] bg-[#FCFBF8] px-4 py-3 text-sm font-semibold text-[#0B0B0B] focus:border-[#D4AF7C] focus:bg-white focus:outline-none"
                                        required
                                    />
                                </div>

                                {/* SECTION 2: Arrival Time & Duration */}
                                <div className="border-t border-[#F0EBE1] pt-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-sm font-black uppercase tracking-wider text-[#0B0B0B] flex items-center gap-2">
                                            <FiClock className="text-[#8F6938]" />
                                            <span>2. Arrival Time & Experience</span>
                                        </label>
                                        {formData.startTime && (
                                            <span className="text-xs font-bold text-[#8F6938]">
                                                {durationWindowExceeded ? (
                                                    <span className="text-amber-700 font-semibold">Exceeds same-day window</span>
                                                ) : (
                                                    `${formatTime12h(formData.startTime)} → ${formatTime12h(formData.endTime)}`
                                                )}
                                            </span>
                                        )}
                                    </div>

                                    {/* Popular Time Slot Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
                                        {POPULAR_SLOTS.map((slot) => {
                                            const isPastToday =
                                                isDateToday &&
                                                slot.value <= currentLocalTime;
                                            const isSelected =
                                                formData.startTime === slot.value;

                                            return (
                                                <button
                                                    key={slot.value}
                                                    type="button"
                                                    disabled={isPastToday}
                                                    onClick={() => handleTimeSelect(slot.value)}
                                                    className={`h-11 rounded-xl text-xs font-bold border transition flex flex-col items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF7C] focus-visible:ring-offset-2 ${
                                                        isPastToday
                                                            ? "opacity-35 bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400"
                                                            : isSelected
                                                            ? "bg-[#0B0B0B] text-white border-[#0B0B0B] shadow-sm"
                                                            : "bg-[#FBF7EF] text-[#2B1F14] border-[#E8E0D4] hover:border-[#D4AF7C]"
                                                    }`}
                                                >
                                                    <span>{slot.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Custom Time Picker */}
                                    <div className="mb-4">
                                        <label className="block text-xs font-semibold text-[#8B8175] mb-1.5">
                                            Or select specific time:
                                        </label>
                                        <input
                                            type="time"
                                            name="startTime"
                                            value={formData.startTime}
                                            onChange={handleChange}
                                            min={isDateToday ? currentLocalTime : undefined}
                                            className="w-full rounded-2xl border border-[#D8D0C4] bg-[#FCFBF8] px-4 py-3 text-sm font-semibold text-[#0B0B0B] focus:border-[#D4AF7C] focus:bg-white focus:outline-none"
                                            required
                                        />
                                    </div>

                                    {/* Duration Selector */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-[#6B6358]">
                                                Dining Duration
                                            </label>
                                            <span className="text-xs text-[#8F6938] font-semibold">
                                                {duration / 60} hrs reservation
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {DURATION_OPTIONS.map((item) => (
                                                <button
                                                    key={item.value}
                                                    type="button"
                                                    onClick={() => handleDurationSelect(item.value)}
                                                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition text-center ${
                                                        duration === item.value
                                                            ? "border-[#D4AF7C] bg-[#FBF7EF] text-[#0B0B0B] shadow-sm ring-1 ring-[#D4AF7C]"
                                                            : "border-[#E8E0D4] bg-white text-[#6B6358] hover:border-[#D4AF7C]/60"
                                                    }`}
                                                >
                                                    <p>{item.label}</p>
                                                    <p className="text-[10px] font-normal text-[#8B8175] truncate mt-0.5">
                                                        {item.desc}
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Validation Notice when duration extends past midnight */}
                                    {durationWindowExceeded && (
                                        <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold text-amber-800 flex items-start gap-2.5">
                                            <FiAlertCircle className="text-base text-amber-600 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-bold">Dining window extends past midnight</p>
                                                <p className="mt-0.5 text-amber-700 font-normal">
                                                    A {duration / 60}-hour reservation starting at {formatTime12h(formData.startTime)} cannot fit within the same-day reservation window. Please select an earlier arrival time or a shorter duration.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* SECTION 3: Guests */}
                                <div className="border-t border-[#F0EBE1] pt-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-sm font-black uppercase tracking-wider text-[#0B0B0B] flex items-center gap-2">
                                            <FiUsers className="text-[#8F6938]" />
                                            <span>3. Party Size</span>
                                        </label>
                                        <span className="text-xs font-bold text-[#8F6938]">
                                            {formData.guests} {formData.guests === 1 ? "Guest" : "Guests"}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {GUEST_PRESETS.map((num) => (
                                            <button
                                                key={num}
                                                type="button"
                                                onClick={() => handleGuestsSelect(num)}
                                                className={`h-11 w-11 rounded-xl text-xs font-bold border transition ${
                                                    Number(formData.guests) === num
                                                        ? "bg-[#0B0B0B] text-white border-[#0B0B0B] shadow-sm"
                                                        : "bg-[#FBF7EF] text-[#2B1F14] border-[#E8E0D4] hover:border-[#D4AF7C]"
                                                }`}
                                            >
                                                {num}{num === 8 ? "+" : ""}
                                            </button>
                                        ))}

                                        <div className="flex-1 min-w-[120px]">
                                            <input
                                                type="number"
                                                name="guests"
                                                min="1"
                                                max="30"
                                                value={formData.guests}
                                                onChange={handleChange}
                                                placeholder="Custom"
                                                className="h-11 w-full rounded-xl border border-[#D8D0C4] bg-[#FCFBF8] px-3 text-xs font-bold text-[#0B0B0B] focus:border-[#D4AF7C] focus:bg-white focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 4: Special Notes */}
                                <div className="border-t border-[#F0EBE1] pt-6">
                                    <label className="block text-sm font-black uppercase tracking-wider text-[#0B0B0B] mb-2">
                                        4. Special Notes & Ambience Requests
                                        <span className="text-xs font-normal text-[#8B8175] ml-1">
                                            (Optional)
                                        </span>
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="Anniversary celebration, window seating preference, dietary restrictions..."
                                        className="w-full rounded-2xl border border-[#D8D0C4] bg-[#FCFBF8] p-4 text-sm text-[#0B0B0B] placeholder:text-[#9A9184] focus:border-[#D4AF7C] focus:bg-white focus:outline-none"
                                    />
                                </div>

                                {/* Submit for Mobile / Inline */}
                                <div className="lg:hidden pt-4">
                                    <button
                                        type="submit"
                                        disabled={submitting || !selectedTable || loading || durationWindowExceeded}
                                        className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#0B0B0B] font-bold text-white shadow-xl shadow-black/15 transition hover:bg-[#2B1F14] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        {submitting ? (
                                            <>
                                                <FiRefreshCw className="animate-spin text-lg" />
                                                <span>Securing Table...</span>
                                            </>
                                        ) : durationWindowExceeded ? (
                                            <span>Adjust Dining Window</span>
                                        ) : selectedTable ? (
                                            <span>Confirm Reservation</span>
                                        ) : (
                                            <span>Select a Table Below</span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Table Stations & Live Summary */}
                    <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                        <div className="rounded-[2rem] border border-[#D8D0C4] bg-white p-6 sm:p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-xl font-black text-[#0B0B0B]">
                                    Available Tables
                                </h2>
                                {formData.reservationDate && formData.startTime && !durationWindowExceeded && (
                                    <button
                                        type="button"
                                        onClick={fetchTables}
                                        disabled={loading}
                                        className="text-xs font-bold text-[#8F6938] hover:text-[#0B0B0B] flex items-center gap-1 transition"
                                        title="Refresh tables"
                                    >
                                        <FiRefreshCw className={loading ? "animate-spin" : ""} />
                                        <span>Refresh</span>
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-[#8B8175] mb-5">
                                Live availability synchronized with LUX floor management.
                            </p>

                            {/* State: No date or time selected */}
                            {!formData.reservationDate || !formData.startTime || !formData.endTime ? (
                                durationWindowExceeded ? (
                                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
                                        <FiAlertCircle className="mx-auto text-2xl text-amber-600 mb-2" />
                                        <h3 className="text-sm font-bold text-amber-800">
                                            Window Extends Past Midnight
                                        </h3>
                                        <p className="mt-1 text-xs text-amber-700 leading-relaxed">
                                            A {duration / 60}-hour dining experience starting at {formatTime12h(formData.startTime)} cannot fit within the same-day reservation window. Please select an earlier arrival time or shorter duration.
                                        </p>
                                    </div>
                                ) : formData.reservationDate ? (
                                    <div className="rounded-2xl border border-dashed border-[#D8D0C4] bg-[#FCFBF8] p-8 text-center">
                                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D4AF7C]/15 text-[#8F6938]">
                                            <FiClock className="text-xl" />
                                        </div>
                                        <h3 className="text-sm font-bold text-[#0B0B0B]">
                                            Select Arrival Time
                                        </h3>
                                        <p className="mt-1 text-xs text-[#8B8175] max-w-xs mx-auto">
                                            Choose your preferred dining hour for {formatDateReadable(formData.reservationDate)} to view real-time table availability.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-[#D8D0C4] bg-[#FCFBF8] p-8 text-center">
                                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D4AF7C]/15 text-[#8F6938]">
                                            <FiCalendar className="text-xl" />
                                        </div>
                                        <h3 className="text-sm font-bold text-[#0B0B0B]">
                                            Select Date & Arrival Time
                                        </h3>
                                        <p className="mt-1 text-xs text-[#8B8175] max-w-xs mx-auto">
                                            Choose your dining date and preferred hour to view real-time table availability.
                                        </p>
                                    </div>
                                )
                            ) : loading ? (
                                <div className="rounded-2xl border border-[#E8E0D4] bg-[#FBF7EF] p-8 text-center">
                                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#D4AF7C] border-t-transparent mb-3" />
                                    <p className="text-sm font-bold text-[#0B0B0B]">
                                        Checking floor availability…
                                    </p>
                                    <p className="text-xs text-[#8B8175] mt-1">
                                        Matching tables for {formData.guests} guests
                                    </p>
                                </div>
                            ) : isPastReservationStart(formData.reservationDate, formData.startTime) ? (
                                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
                                    <FiInfo className="mx-auto text-2xl text-amber-600 mb-2" />
                                    <h3 className="text-sm font-bold text-amber-800">
                                        Time Already Passed
                                    </h3>
                                    <p className="mt-1 text-xs text-amber-700">
                                        The selected hour has already passed today. Please pick an upcoming time.
                                    </p>
                                </div>
                            ) : suitableTables.length === 0 ? (
                                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
                                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                                        🪑
                                    </div>
                                    <h3 className="text-sm font-bold text-amber-800">
                                        No Tables Available
                                    </h3>
                                    <p className="mt-1 text-xs text-amber-700 leading-relaxed">
                                        All reservation tables for {formData.guests} guests are booked for this window. Please try an adjacent time slot or alternate date.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                                    {suitableTables.map((table) => {
                                        const isSelected = selectedTable === table._id;
                                        const stationTag =
                                            table.capacity === 2
                                                ? "Intimate 2-Top"
                                                : table.capacity <= 4
                                                ? "Dining 4-Top"
                                                : table.capacity <= 6
                                                ? "Family 6-Top"
                                                : "Banquet Station";

                                        return (
                                            <button
                                                key={table._id}
                                                type="button"
                                                onClick={() => setSelectedTable(table._id)}
                                                className={`w-full text-left p-4 rounded-2xl border-2 transition relative ${
                                                    isSelected
                                                        ? "border-[#D4AF7C] bg-[#FBF7EF] shadow-md ring-2 ring-[#D4AF7C]/30"
                                                        : "border-[#E8E0D4] bg-white hover:border-[#D4AF7C]/70 hover:bg-[#FCFBF8]"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg font-black text-[#0B0B0B]">
                                                                🪑 Table {table.tableNumber}
                                                            </span>
                                                            <span className="rounded-full bg-[#D4AF7C]/20 text-[#8F6938] px-2.5 py-0.5 text-[10px] font-bold">
                                                                {stationTag}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-[#8B8175] mt-1">
                                                            Up to {table.capacity} guests • {formatTime12h(formData.startTime)} → {formatTime12h(formData.endTime)}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {isSelected ? (
                                                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0B0B0B] text-white">
                                                                <FiCheck className="text-sm text-[#D4AF7C]" />
                                                            </span>
                                                        ) : (
                                                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                                                                Available
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Booking Action Button (Desktop) */}
                            <div className="hidden lg:block pt-6 border-t border-[#F0EBE1] mt-6">
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={submitting || !selectedTable || loading || durationWindowExceeded}
                                    className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#0B0B0B] font-bold text-white shadow-xl shadow-black/15 transition hover:bg-[#2B1F14] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    {submitting ? (
                                        <>
                                            <FiRefreshCw className="animate-spin text-lg" />
                                            <span>Securing Reservation...</span>
                                        </>
                                    ) : durationWindowExceeded ? (
                                        <span>Adjust Dining Window</span>
                                    ) : (
                                        <>
                                            <span>Complete Reservation</span>
                                            <FiArrowRight />
                                        </>
                                    )}
                                </button>
                                <p className="text-center text-[11px] text-[#8B8175] mt-2">
                                    Instant confirmation • No reservation fee
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Reservations;