import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar
} from "recharts";

import api from "../../../services/api";


function Dashboard() {

    const navigate = useNavigate();

    const [dashboard, setDashboard] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

        // ==================================================
        // Live Clock
        // ==================================================

        const [currentTime, setCurrentTime] =
            useState(new Date());


    // ==================================================
    // Fetch Dashboard
    // ==================================================

    const fetchDashboard = async () => {

        try {

            setLoading(true);


            const response =
                await api.get(
                    "/admin/dashboard"
                );


            setDashboard(
                response.data.dashboard
            );


            setError("");


        } catch (error) {

            console.error(
                "Dashboard Error:",
                error
            );


            setError(
                error.response?.data?.message ||
                "Failed to load dashboard"
            );


        } finally {

            setLoading(false);

        }

    };

    // ==================================================
    // Live Clock
    // ==================================================

    useEffect(() => {

        const clockInterval =
            setInterval(() => {

                setCurrentTime(
                    new Date()
                );

            }, 1000);


        return () => {

            clearInterval(
                clockInterval
            );

        };

    }, []);


    // ==================================================
    // Initial Load
    // ==================================================

    useEffect(() => {

        fetchDashboard();


        // Refresh every 30 seconds

        const interval =
            setInterval(
                () => {

                    fetchDashboard();

                },
                30000
            );


        return () => {

            clearInterval(
                interval
            );

        };

    }, []);


    // ==================================================
    // Loading
    // ==================================================

    if (
        loading &&
        !dashboard
    ) {

        return (

            <div className="flex items-center justify-center min-h-[400px]">

                <p className="text-lg text-gray-500">
                    Loading dashboard...
                </p>

            </div>

        );

    }


    // ==================================================
    // Error
    // ==================================================

    if (
        error &&
        !dashboard
    ) {

        return (

            <div className="bg-red-100 text-red-700 p-5 rounded-xl">

                <h2 className="font-bold text-lg">
                    Dashboard Error
                </h2>


                <p className="mt-1">
                    {error}
                </p>


                <button
                    onClick={
                        fetchDashboard
                    }
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg"
                >
                    Try Again
                </button>

            </div>

        );

    }


    if (!dashboard) {
        return null;
    }


    // ==================================================
    // Revenue Chart Data
    // ==================================================

    const revenueData =
        dashboard.last7DaysRevenue?.map(
            item => ({

                date:
                    item._id,

                revenue:
                    item.revenue,

                orders:
                    item.orders

            })
        ) || [];


    // ==================================================
    // Order Status Chart Data
    // ==================================================

    const statusData =
        dashboard.ordersByStatus?.map(
            item => ({

                name:
                    item.status,

                value:
                    item.count

            })
        ) || [];


    // ==================================================
    // Monthly Revenue Data
    // ==================================================

    const monthlyData =
        dashboard.monthlyRevenue?.map(
            item => ({

                month:
                    `${item.month.substring(
                        0,
                        3
                    )} ${item.year}`,

                revenue:
                    item.revenue

            })
        ) || [];


    // ==================================================
    // Status Colors
    // ==================================================

    const statusColors = {

        Pending:
            "#f59e0b",

        Preparing:
            "#3b82f6",

        Ready:
            "#8b5cf6",

        Delivered:
            "#22c55e",

        Cancelled:
            "#ef4444"

    };


    // ==================================================
    // Order Status Class
    // ==================================================

    const getStatusClass = (
        status
    ) => {

        switch (status) {

            case "Pending":

                return (
                    "bg-yellow-100 text-yellow-700"
                );


            case "Preparing":

                return (
                    "bg-blue-100 text-blue-700"
                );


            case "Ready":

                return (
                    "bg-purple-100 text-purple-700"
                );


            case "Delivered":

                return (
                    "bg-green-100 text-green-700"
                );


            case "Cancelled":

                return (
                    "bg-red-100 text-red-700"
                );


            default:

                return (
                    "bg-gray-100 text-gray-700"
                );

        }

    };


    // ==================================================
    // Table Status Class
    // ==================================================

    const getTableStatusClass = (
        status
    ) => {

        switch (status) {

            case "Available":

                return (
                    "bg-green-100 text-green-700"
                );


            case "Reserved":

                return (
                    "bg-yellow-100 text-yellow-700"
                );


            case "Occupied":

                return (
                    "bg-red-100 text-red-700"
                );


            default:

                return (
                    "bg-gray-100 text-gray-700"
                );

        }

    };


    // ==================================================
    // Table Status Icon
    // ==================================================

    const getTableStatusIcon = (
        status
    ) => {

        switch (status) {

            case "Available":
                return "🟢";

            case "Reserved":
                return "🟡";

            case "Occupied":
                return "🔴";

            default:
                return "⚪";

        }

    };


    // ==================================================
    // Format Reservation Date
    // ==================================================

    const formatReservationDate = (
        date
    ) => {

        if (!date) {
            return "";
        }


        try {

            return new Date(
                date
            ).toLocaleDateString(
                "en-IN",
                {
                    day:
                        "2-digit",

                    month:
                        "short",

                    year:
                        "numeric"
                }
            );


        } catch {

            return "";

        }

    };

    // ======================================================
    // Format Reservation Time (12-hour)
    // ======================================================

    const formatReservationTime = (time) => {

        if (!time) {
            return "";
        }

        try {

            const [hour, minute] =
                time.split(":").map(Number);

            const date = new Date();

            date.setHours(
                hour,
                minute,
                0,
                0
            );

            return date.toLocaleTimeString(
                "en-IN",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true
                }
            );

        } catch {

            return time;

        }

    };


    // ======================================================
    // Get Reservation Display Status
    // ======================================================

    const getReservationDisplayStatus = (reservation) => {

        if (!reservation) {
            return "Unknown";
        }

        // Keep final database states
        if (reservation.status === "Cancelled") {
            return "Cancelled";
        }

        if (reservation.status === "Completed") {
            return "Completed";
        }

        if (!reservation.reservationDate) {
            return reservation.status;
        }

        try {

            const now = new Date();

            const reservationDate =
                new Date(reservation.reservationDate);

            // Reservation date in local format
            const reservationDateString =
                `${reservationDate.getUTCFullYear()}-${String(
                    reservationDate.getUTCMonth() + 1
                ).padStart(2, "0")}-${String(
                    reservationDate.getUTCDate()
                ).padStart(2, "0")}`;

            // Current local date
            const currentDateString =
                `${now.getFullYear()}-${String(
                    now.getMonth() + 1
                ).padStart(2, "0")}-${String(
                    now.getDate()
                ).padStart(2, "0")}`;

            // Future reservation
            if (reservationDateString > currentDateString) {
                return "Upcoming";
            }

            // Past reservation
            if (reservationDateString < currentDateString) {
                return "Completed";
            }

            // Same day → compare time
            const currentTime =
                `${String(
                    now.getHours()
                ).padStart(2, "0")}:${String(
                    now.getMinutes()
                ).padStart(2, "0")}`;

            // Currently active
            if (
                currentTime >= reservation.startTime &&
                currentTime < reservation.endTime
            ) {
                return "Active";
            }

            // Reservation hasn't started yet
            if (
                currentTime < reservation.startTime
            ) {
                return "Upcoming";
            }

            // Reservation has ended
            if (
                currentTime >= reservation.endTime
            ) {
                return "Completed";
            }

            return reservation.status;

        } catch (error) {

            console.error(
                "Reservation Status Error:",
                error
            );

            return reservation.status;
        }
    };

    // ======================================================
    // Reservation Status Class
    // ======================================================

    const getReservationStatusClass = (status) => {

        switch (status) {

            case "Active":
                return "bg-green-100 text-green-700";

            case "Upcoming":
                return "bg-blue-100 text-blue-700";

            case "Confirmed":
                return "bg-green-100 text-green-700";

            case "Completed":
                return "bg-gray-100 text-gray-700";

            case "Cancelled":
                return "bg-red-100 text-red-700";

            case "Pending":
                return "bg-yellow-100 text-yellow-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    // ======================================================
    // Reservation Time Information
    // ======================================================

    const getReservationTimeInfo = (reservation) => {

        if (!reservation) {
            return {
                type: "none",
                text: "No upcoming reservation",
                className: "text-gray-400"
            };
        }

        try {

            const now = new Date();

            const reservationDate =
                new Date(reservation.reservationDate);


            // Reservation date
            const year =
                reservationDate.getUTCFullYear();

            const month =
                reservationDate.getUTCMonth();

            const day =
                reservationDate.getUTCDate();


            // Start time
            const [startHour, startMinute] =
                reservation.startTime
                    .split(":")
                    .map(Number);


            // End time
            const [endHour, endMinute] =
                reservation.endTime
                    .split(":")
                    .map(Number);


            const startDate =
                new Date(
                    year,
                    month,
                    day,
                    startHour,
                    startMinute,
                    0
                );


            const endDate =
                new Date(
                    year,
                    month,
                    day,
                    endHour,
                    endMinute,
                    0
                );


            // ==================================================
            // ACTIVE RESERVATION
            // ==================================================

            if (
                now >= startDate &&
                now < endDate
            ) {

                const minutesRemaining =
                    Math.max(
                        0,
                        Math.ceil(
                            (endDate - now) /
                            (1000 * 60)
                        )
                    );


                return {
                    type: "active",

                    text:
                        `Ends in ${minutesRemaining} min`,

                    className:
                        "text-green-600 font-semibold"
                };

            }


            // ==================================================
            // UPCOMING RESERVATION
            // ==================================================

            if (now < startDate) {

                const minutesUntil =
                    Math.max(
                        0,
                        Math.ceil(
                            (startDate - now) /
                            (1000 * 60)
                        )
                    );


                // More than 30 minutes
                if (minutesUntil > 30) {

                    return {
                        type: "upcoming",

                        text:
                            `Starts in ${minutesUntil} min`,

                        className:
                            "text-gray-600"
                    };

                }


                // 10–30 minutes
                if (minutesUntil > 10) {

                    return {
                        type: "soon",

                        text:
                            `Starts in ${minutesUntil} min`,

                        className:
                            "text-amber-600 font-semibold"
                    };

                }


                // 10 minutes or less
                return {
                    type: "verySoon",

                    text:
                        `Starts in ${minutesUntil} min`,

                    className:
                        "text-orange-600 font-semibold"
                };

            }


            // ==================================================
            // ENDED
            // ==================================================

            return {
                type: "ended",

                text: "Reservation ended",

                className: "text-gray-400"
            };


        } catch (error) {

            console.error(
                "Reservation Time Error:",
                error
            );

            return {
                type: "error",

                text: "Time unavailable",

                className: "text-gray-400"
            };

        }

    };

    // ======================================================
    // Find Next Relevant Reservation For Table
    // ======================================================

    const getTableReservation = (tableId) => {

        if (!tableId) {
            return null;
        }


        const reservations =
            dashboard.activeReservations?.filter(
                reservation => {

                    // ------------------------------------------
                    // Must belong to this table
                    // ------------------------------------------

                    if (
                        reservation.table?._id?.toString() !==
                        tableId?.toString()
                    ) {
                        return false;
                    }


                    // ------------------------------------------
                    // Only Pending / Confirmed reservations
                    // ------------------------------------------

                    // Only Confirmed reservations
                    if (reservation.status !== "Confirmed") {
                        return false;
                    }


                    // ------------------------------------------
                    // Build reservation date/time
                    // ------------------------------------------

                    const reservationDate =
                        new Date(
                            reservation.reservationDate
                        );


                    const year =
                        reservationDate.getUTCFullYear();

                    const month =
                        reservationDate.getUTCMonth();

                    const day =
                        reservationDate.getUTCDate();


                    const [startHour, startMinute] =
                        reservation.startTime
                            .split(":")
                            .map(Number);


                    const [endHour, endMinute] =
                        reservation.endTime
                            .split(":")
                            .map(Number);


                    const startDate =
                        new Date(
                            year,
                            month,
                            day,
                            startHour,
                            startMinute,
                            0
                        );


                    const endDate =
                        new Date(
                            year,
                            month,
                            day,
                            endHour,
                            endMinute,
                            0
                        );


                    const now =
                        new Date();


                    // ------------------------------------------
                    // Keep only active or upcoming reservations
                    // ------------------------------------------

                    return now < endDate;

                }
            ) || [];


        // ------------------------------------------
        // No relevant reservation
        // ------------------------------------------

        if (
            reservations.length === 0
        ) {
            return null;
        }


        // ------------------------------------------
        // Sort by nearest reservation
        // ------------------------------------------

        reservations.sort(
            (a, b) => {

                const dateA =
                    new Date(
                        a.reservationDate
                    );

                const dateB =
                    new Date(
                        b.reservationDate
                    );


                const [aHour, aMinute] =
                    a.startTime
                        .split(":")
                        .map(Number);


                const [bHour, bMinute] =
                    b.startTime
                        .split(":")
                        .map(Number);


                dateA.setHours(
                    aHour,
                    aMinute,
                    0,
                    0
                );

                dateB.setHours(
                    bHour,
                    bMinute,
                    0,
                    0
                );


                return dateA - dateB;

            }
        );


        return reservations[0];

    };

    const pendingReservations =
        dashboard?.activeReservations?.filter(
            reservation => reservation.status === "Pending"
        ).length || 0;

    const occupiedTables =
        dashboard?.tables?.filter(
            table => table.status === "Occupied"
        ).length || 0;
    // ==================================================
    // RENDER
    // ==================================================

    return (

        <div className="space-y-8 pb-12">


            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                <div>

                    <p className="text-xs font-black uppercase tracking-[0.22em] text-[#B88A4A]">
                        LUX Management
                    </p>

                    <h1 className="mt-1 text-4xl font-black tracking-tight text-[#0B0B0B]">
                        Dashboard
                    </h1>

                    <p className="mt-1 text-sm text-[#756F66]">
                        Overview of your restaurant operations
                    </p>

                </div>


                <div className="flex items-center gap-4">

                    {/* ==================================================
                        LIVE CLOCK
                    ================================================== */}

                    <div className="min-w-[190px] rounded-2xl border border-[#D4AF7C]/20 bg-[#0B0B0B] px-5 py-3 text-center shadow-xl shadow-black/10">

                        <div className="text-2xl font-black tracking-wide text-[#F8F5EE]">
                            {currentTime.toLocaleTimeString(
                                "en-IN",
                                {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                    hour12: true
                                }
                            )}
                        </div>

                        <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#D4AF7C]">
                            {currentTime.toLocaleDateString(
                                "en-IN",
                                {
                                    weekday: "short",
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric"
                                }
                            )}
                        </div>

                    </div>


                    {/* ==================================================
                        LIVE DATA
                    ================================================== */}

                    <span className="text-sm text-gray-400">
                        Live data
                    </span>


                    {/* ==================================================
                        REFRESH
                    ================================================== */}

                    <button
                        onClick={
                            fetchDashboard
                        }
                        className="rounded-xl bg-[#0B0B0B] px-5 py-3 font-bold text-white shadow-lg shadow-black/10 transition-all hover:bg-[#2B1F14] hover:shadow-xl active:scale-[0.98] disabled:opacity-60"
                    >
                        ↻ Refresh
                    </button>

                </div>

            </div>


            {/* ==================================================
                MAIN STATS
            ================================================== */}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">


                {/* Total Orders */}

                <div className="group rounded-2xl border border-[#D8D0C4] bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#D4AF7C]/60 hover:shadow-xl hover:shadow-black/[0.06]">

                    <div className="flex justify-between">

                        <div>

                            <p className="text-gray-500">
                                Total Orders
                            </p>


                            <h2 className="text-3xl font-bold mt-2">
                                {
                                    dashboard.totalOrders
                                }
                            </h2>

                        </div>


                        <div className="w-12 h-12 rounded-lg bg-[#D4AF7C]/15 text-[#8B6A3E] flex items-center justify-center text-2xl">
                            🧾
                        </div>

                    </div>

                </div>


                {/* Customers */}

                <div className="group rounded-2xl border border-[#D8D0C4] bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#D4AF7C]/60 hover:shadow-xl hover:shadow-black/[0.06]">

                    <div className="flex justify-between">

                        <div>

                            <p className="text-gray-500">
                                Customers
                            </p>


                            <h2 className="text-3xl font-bold mt-2">
                                {
                                    dashboard.totalCustomers
                                }
                            </h2>

                        </div>


                        <div className="w-12 h-12 rounded-lg bg-[#D4AF7C]/15 text-[#8B6A3E] flex items-center justify-center text-2xl">
                            👥
                        </div>

                    </div>

                </div>


                {/* Pending Orders */}

                <div className="group rounded-2xl border border-[#D8D0C4] bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#D4AF7C]/60 hover:shadow-xl hover:shadow-black/[0.06]">

                    <div className="flex justify-between">

                        <div>

                            <p className="text-gray-500">
                                Pending Orders
                            </p>


                            <h2 className="text-3xl font-bold mt-2">
                                {
                                    dashboard.pendingOrders
                                }
                            </h2>

                        </div>


                        <div className="w-12 h-12 rounded-lg bg-[#D4AF7C]/15 text-[#8B6A3E] flex items-center justify-center text-2xl">
                            ⏳
                        </div>

                    </div>

                </div>


                {/* Revenue */}

                <div className="group rounded-2xl border border-[#D8D0C4] bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#D4AF7C]/60 hover:shadow-xl hover:shadow-black/[0.06]">

                    <div className="flex justify-between">

                        <div>

                            <p className="text-gray-500">
                                Total Revenue
                            </p>


                            <h2 className="text-3xl font-bold mt-2">

                                ₹
                                {
                                    dashboard.totalRevenue?.toLocaleString(
                                        "en-IN"
                                    )
                                }

                            </h2>

                        </div>


                        <div className="w-12 h-12 rounded-lg bg-[#D4AF7C]/15 text-[#8B6A3E] flex items-center justify-center text-2xl">
                            💰
                        </div>

                    </div>

                </div>

            </div>


            {/* ==================================================
                ATTENTION REQUIRED
            ================================================== */}

            {(dashboard.pendingOrders > 0 ||
                pendingReservations > 0 ||
                occupiedTables > 0) && (

                <div className="rounded-3xl border border-[#D8D0C4] bg-white p-6 shadow-sm">

                    <div className="mb-5">

                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4AF7C]/15 text-lg">
                                !
                            </span>

                            <div>
                                <h2 className="text-2xl font-black text-[#0B0B0B]">
                                    Attention Required
                                </h2>

                                <p className="mt-0.5 text-sm text-[#756F66]">
                                    Items that may need your attention
                                </p>
                            </div>
                        </div>

                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">


                        {/* Pending Orders */}

                        {dashboard.pendingOrders > 0 && (

                            <div
                                onClick={() => navigate("/admin/orders")}
                                className="group cursor-pointer rounded-2xl border border-[#E6D8B8] bg-[#FCF8ED] p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#D4AF7C] hover:shadow-lg"
                            >

                                <div className="flex items-center gap-3">

                                    <div className="text-2xl">
                                        ⏳
                                    </div>

                                    <div>

                                        <p className="font-semibold">
                                            Pending Orders
                                        </p>

                                        <p className="text-gray-600 text-sm mt-1">
                                            {dashboard.pendingOrders} order
                                            {dashboard.pendingOrders !== 1 && "s"}
                                            {" "}waiting for action
                                        </p>

                                    </div>

                                </div>

                            </div>

                        )}


                        {/* Pending Reservations */}

                        {pendingReservations > 0 && (

                            <div
                                onClick={() => navigate("/admin/reservations")}
                                className="group cursor-pointer rounded-2xl border border-[#E6D8B8] bg-[#FBF5EC] p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#D4AF7C] hover:shadow-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl">
                                        📅
                                    </div>

                                    <div>

                                        <p className="font-semibold">
                                            Pending Reservations
                                        </p>

                                        <p className="text-gray-600 text-sm mt-1">
                                            {pendingReservations} reservation
                                            {pendingReservations !== 1 && "s"}
                                            {" "}waiting for confirmation
                                        </p>

                                    </div>

                                </div>

                            </div>

                        )}


                        {/* Occupied Tables */}

                        {occupiedTables > 0 && (

                            <div
                                onClick={() => navigate("/admin/tables")}
                                className="group cursor-pointer rounded-2xl border border-red-200 bg-red-50/70 p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                            >

                                <div className="flex items-center gap-3">

                                    <div className="text-2xl">
                                        🔴
                                    </div>

                                    <div>

                                        <p className="font-semibold">
                                            Occupied Tables
                                        </p>

                                        <p className="text-gray-600 text-sm mt-1">
                                            {occupiedTables} table
                                            {occupiedTables !== 1 && "s"}
                                            currently occupied
                                        </p>

                                    </div>

                                </div>

                            </div>

                        )}

                    </div>

                </div>

            )}
            {/* ==================================================
                LIVE TABLE STATUS
            ================================================== */}
            <div className="rounded-3xl border border-[#D8D0C4] bg-white p-6 shadow-sm">

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

                    <div>

                        <h2 className="text-2xl font-black text-[#0B0B0B]">
                            Live Table Status
                        </h2>

                        <p className="text-gray-500 mt-1">
                            Current restaurant table availability
                        </p>

                    </div>


                    <div className="flex flex-wrap gap-4 text-sm">

                        <span className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                            Available
                        </span>

                        <span className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-[#D4AF7C]" />
                            Reserved
                        </span>

                        <span className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                            Occupied
                        </span>

                    </div>

                </div>


                {dashboard.tables?.length === 0 ? (

                    <div className="text-center py-10 text-gray-500">

                        No tables found.

                    </div>

                ) : (

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">

                        {dashboard.tables?.map(
                            table => {

                                const reservation =
                                    getTableReservation(
                                        table._id
                                    );


                                return (

                                    <div
                                        key={
                                            table._id
                                        }
                                        className="group rounded-2xl border border-[#D8D0C4] bg-[#FCFAF6] p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#D4AF7C]/70 hover:bg-white hover:shadow-lg"
                                    >

                                        <div className="flex justify-between items-start gap-2">

                                            <div>

                                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8B8175]">
                                                    Table
                                                </p>


                                                <h3 className="mt-1 text-3xl font-black text-[#0B0B0B]">
                                                    {
                                                        table.tableNumber
                                                    }
                                                </h3>

                                            </div>


                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-semibold ${getTableStatusClass(
                                                    table.status
                                                )}`}
                                            >

                                                {
                                                    getTableStatusIcon(
                                                        table.status
                                                    )
                                                }{" "}

                                                {
                                                    table.status
                                                }

                                            </span>

                                        </div>


                                        <div className="mt-5">

                                            <p className="text-gray-500 text-sm">
                                                Capacity
                                            </p>


                                            <p className="font-semibold mt-1">
                                                🪑{" "}
                                                {
                                                    table.capacity
                                                }{" "}
                                                seats
                                            </p>

                                        </div>


                                        {reservation && (() => {

                                            const timeInfo =
                                                getReservationTimeInfo(reservation);

                                            return (

                                                <div className="mt-4 pt-4 border-t">

                                                    <p className="text-gray-500 text-sm">
                                                        Reservation
                                                    </p>

                                                    <p className="font-semibold mt-1 truncate">
                                                        {
                                                            reservation.user?.fullName ||
                                                            "Customer"
                                                        }
                                                    </p>

                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {
                                                            formatReservationTime(
                                                                reservation.startTime
                                                            )
                                                        }
                                                        {" → "}
                                                        {
                                                            formatReservationTime(
                                                                reservation.endTime
                                                            )
                                                        }
                                                    </p>

                                                    <p className={`text-sm mt-1 ${timeInfo.className}`}>
                                                        {timeInfo.text}
                                                    </p>

                                                </div>

                                            );

                                        })()}

                                    </div>

                                );

                            }
                        )}

                    </div>

                )}

            </div>


            {/* ==================================================
                ACTIVE RESERVATIONS
            ================================================== */}

            <div className="rounded-3xl border border-[#D8D0C4] bg-white shadow-sm overflow-hidden">

                <div className="p-6 border-b">

                    <h2 className="text-2xl font-black text-[#0B0B0B]">
                        Active Reservations
                    </h2>

                    <p className="text-gray-500 mt-1">
                        Current and upcoming reservations
                    </p>

                </div>


                {dashboard.activeReservations?.length === 0 ? (

                    <div className="p-8 text-center text-gray-500">
                        No active reservations.
                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead className="bg-gray-50">

                                <tr>

                                    <th className="p-4 text-left text-[10px] font-black uppercase tracking-[0.14em] text-[#8B8175]">
                                        Table
                                    </th>

                                    <th className="p-4 text-left text-[10px] font-black uppercase tracking-[0.14em] text-[#8B8175]">
                                        Customer
                                    </th>

                                    <th className="p-4 text-left text-[10px] font-black uppercase tracking-[0.14em] text-[#8B8175]">
                                        Date
                                    </th>

                                    <th className="p-4 text-left text-[10px] font-black uppercase tracking-[0.14em] text-[#8B8175]">
                                        Time
                                    </th>

                                    <th className="p-4 text-left text-[10px] font-black uppercase tracking-[0.14em] text-[#8B8175]">
                                        Guests
                                    </th>

                                    <th className="p-4 text-left text-[10px] font-black uppercase tracking-[0.14em] text-[#8B8175]">
                                        Status
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {dashboard.activeReservations.map(
                                    reservation => (

                                        <tr
                                            key={
                                                reservation._id
                                            }
                                            className="border-t hover:bg-gray-50"
                                        >

                                            <td className="p-4 font-semibold">

                                                {
                                                    reservation.table
                                                        ? `Table ${reservation.table.tableNumber}`
                                                        : "Unassigned"
                                                }

                                            </td>


                                            <td className="p-4">

                                                {
                                                    reservation.user?.fullName ||
                                                    "Unknown"
                                                }

                                            </td>


                                            <td className="p-4">

                                                {
                                                    formatReservationDate(
                                                        reservation.reservationDate
                                                    )
                                                }

                                            </td>


                                            <td className="p-4">

                                                {
                                                    formatReservationTime(
                                                        reservation.startTime
                                                    )
                                                }

                                                {" → "}

                                                {
                                                    formatReservationTime(
                                                        reservation.endTime
                                                    )
                                                }

                                            </td>


                                            <td className="p-4">

                                                {
                                                    reservation.guests
                                                }

                                            </td>


                                            <td className="p-4">

                                                {(() => {

                                                    const displayStatus =
                                                        getReservationDisplayStatus(
                                                            reservation
                                                        );

                                                    return (
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-sm font-medium ${getReservationStatusClass(
                                                                displayStatus
                                                            )}`}
                                                        >
                                                            {displayStatus}
                                                        </span>
                                                    );

                                                })()}

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* ==================================================
                REVENUE STATS
            ================================================== */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


                <div className="rounded-3xl border border-[#D8D0C4] bg-white p-6 shadow-sm">

                    <p className="text-gray-500">
                        Today's Revenue
                    </p>


                    <h2 className="text-3xl font-black tracking-tight text-[#0B0B0B] mt-2 text-green-600">

                        ₹
                        {
                            dashboard.todayRevenue?.toLocaleString(
                                "en-IN"
                            )
                        }

                    </h2>

                </div>


                <div className="rounded-3xl border border-[#D8D0C4] bg-white p-6 shadow-sm">

                    <p className="text-gray-500">
                        This Month
                    </p>


                    <h2 className="text-3xl font-bold mt-2 text-blue-600">

                        ₹
                        {
                            dashboard.currentMonthRevenue?.toLocaleString(
                                "en-IN"
                            )
                        }

                    </h2>

                </div>

            </div>


            {/* ==================================================
                REVENUE + ORDER STATUS
            ================================================== */}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">


                {/* Revenue */}

                <div className="rounded-3xl border border-[#D8D0C4] bg-white p-6 shadow-sm">

                    <div className="mb-6">

                        <h2 className="text-2xl font-black text-[#0B0B0B]">
                            Revenue Overview
                        </h2>

                        <p className="text-gray-500">
                            Paid revenue over the last 7 days
                        </p>

                    </div>


                    {revenueData.length === 0 ? (

                        <div className="h-[300px] flex items-center justify-center text-gray-400">
                            No revenue data available
                        </div>

                    ) : (

                        <ResponsiveContainer
                            width="100%"
                            height={300}
                        >

                            <LineChart
                                data={
                                    revenueData
                                }
                            >

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                />

                                <XAxis
                                    dataKey="date"
                                />

                                <YAxis />

                                <Tooltip
                                    formatter={
                                        value => [
                                            `₹${value}`,
                                            "Revenue"
                                        ]
                                    }
                                />

                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#D4AF7C"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: "#D4AF7C" }}
                                    activeDot={{ r: 6, fill: "#B88A4A" }}
                                />

                            </LineChart>

                        </ResponsiveContainer>

                    )}

                </div>


                {/* Order Status */}

                <div className="rounded-3xl border border-[#D8D0C4] bg-white p-6 shadow-sm">

                    <div className="mb-4">

                        <h2 className="text-2xl font-black text-[#0B0B0B]">
                            Orders
                        </h2>

                        <p className="text-gray-500">
                            Orders by status
                        </p>

                    </div>


                    {statusData.length === 0 ? (

                        <div className="h-[300px] flex items-center justify-center text-gray-400">
                            No order data
                        </div>

                    ) : (

                        <ResponsiveContainer
                            width="100%"
                            height={300}
                        >

                            <PieChart>

                                <Pie
                                    data={
                                        statusData
                                    }
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label
                                >

                                    {statusData.map(
                                        (
                                            entry,
                                            index
                                        ) => (

                                            <Cell
                                                key={
                                                    index
                                                }
                                                fill={
                                                    statusColors[
                                                        entry.name
                                                    ] ||
                                                    "#9ca3af"
                                                }
                                            />

                                        )
                                    )}

                                </Pie>


                                <Tooltip />

                            </PieChart>

                        </ResponsiveContainer>

                    )}

                </div>

            </div>


            {/* ==================================================
                MONTHLY REVENUE
            ================================================== */}

            <div className="rounded-3xl border border-[#D8D0C4] bg-white p-6 shadow-sm">

                <div className="mb-6">

                    <h2 className="text-2xl font-black text-[#0B0B0B]">
                        Monthly Revenue
                    </h2>

                    <p className="text-gray-500">
                        Revenue performance
                    </p>

                </div>


                {monthlyData.length === 0 ? (

                    <div className="h-[300px] flex items-center justify-center text-gray-400">
                        No monthly revenue data
                    </div>

                ) : (

                    <ResponsiveContainer
                        width="100%"
                        height={300}
                    >

                        <BarChart
                            data={
                                monthlyData
                            }
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                            />

                            <XAxis
                                dataKey="month"
                            />

                            <YAxis />

                            <Tooltip
                                formatter={
                                    value => [
                                        `₹${value}`,
                                        "Revenue"
                                    ]
                                }
                            />

                            <Bar
                                dataKey="revenue"
                                fill="#D4AF7C"
                                radius={[
                                    6,
                                    6,
                                    0,
                                    0
                                ]}
                            />

                        </BarChart>

                    </ResponsiveContainer>

                )}

            </div>


            {/* ==================================================
                RECENT ORDERS
            ================================================== */}

            <div className="rounded-3xl border border-[#D8D0C4] bg-white shadow-sm overflow-hidden">

                <div className="p-6 border-b">

                    <h2 className="text-2xl font-black text-[#0B0B0B]">
                        Recent Orders
                    </h2>

                    <p className="text-gray-500">
                        Latest customer orders
                    </p>

                </div>


                {dashboard.recentOrders?.length === 0 ? (

                    <div className="p-8 text-center text-gray-500">
                        No orders found.
                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead className="bg-[#F8F5EE]">

                                <tr>

                                    <th className="p-4 text-left text-[10px] font-black uppercase tracking-[0.14em] text-[#8B8175]">
                                        Order
                                    </th>

                                    <th className="p-4 text-left text-[10px] font-black uppercase tracking-[0.14em] text-[#8B8175]">
                                        Customer
                                    </th>

                                    <th className="p-4 text-left text-[10px] font-black uppercase tracking-[0.14em] text-[#8B8175]">
                                        Status
                                    </th>

                                    <th className="p-4 text-left text-[10px] font-black uppercase tracking-[0.14em] text-[#8B8175]">
                                        Payment
                                    </th>

                                    <th className="p-4 text-left text-[10px] font-black uppercase tracking-[0.14em] text-[#8B8175]">
                                        Total
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {dashboard.recentOrders.map(
                                    order => (

                                        <tr
                                            key={
                                                order._id
                                            }
                                            className="border-t border-[#E9E3DA] transition-colors hover:bg-[#FCFAF6]"
                                        >

                                            <td className="p-4 font-semibold">

                                                #
                                                {
                                                    order._id.slice(
                                                        -6
                                                    )
                                                }

                                            </td>


                                            <td className="p-4">

                                                {
                                                    order.user?.fullName ||
                                                    "Unknown"
                                                }

                                            </td>


                                            <td className="p-4">

                                                <span
                                                    className={`px-3 py-1 rounded-full text-sm ${getStatusClass(
                                                        order.orderStatus
                                                    )}`}
                                                >

                                                    {
                                                        order.orderStatus
                                                    }

                                                </span>

                                            </td>


                                            <td className="p-4">

                                                {
                                                    order.paymentStatus
                                                }

                                            </td>


                                            <td className="p-4 font-semibold">

                                                ₹
                                                {
                                                    order.totalPrice?.toLocaleString(
                                                        "en-IN"
                                                    )
                                                }

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* ==================================================
                TOP SELLING
            ================================================== */}

            <div className="rounded-3xl border border-[#D8D0C4] bg-white p-6 shadow-sm">

                <div className="mb-6">

                    <h2 className="text-2xl font-black text-[#0B0B0B]">
                        Top Selling Items
                    </h2>

                    <p className="text-gray-500">
                        Most ordered dishes
                    </p>

                </div>


                {dashboard.topSellingItems?.length === 0 ? (

                    <p className="text-gray-500">
                        No sales data available.
                    </p>

                ) : (

                    <div className="space-y-5">

                        {
                            dashboard.topSellingItems.map(
                                (
                                    item,
                                    index
                                ) => {

                                    const max =
                                        dashboard
                                            .topSellingItems[0]
                                            ?.quantitySold ||
                                        1;


                                    const percentage =
                                        (
                                            item.quantitySold /
                                            max
                                        ) *
                                        100;


                                    return (

                                        <div
                                            key={
                                                index
                                            }
                                            className="flex items-center gap-4"
                                        >

                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D4AF7C]/30 bg-[#D4AF7C]/10 font-black text-[#8B6A3E]">
                                                {
                                                    index + 1
                                                }
                                            </div>


                                            <div className="flex-1">

                                                <div className="flex justify-between mb-2">

                                                    <span className="font-semibold">
                                                        {
                                                            item.name
                                                        }
                                                    </span>


                                                    <span className="text-gray-500">
                                                        {
                                                            item.quantitySold
                                                        }{" "}
                                                        sold
                                                    </span>

                                                </div>


                                                <div className="h-2 bg-gray-200 rounded-full">

                                                    <div
                                                        className="h-2 rounded-full bg-[#D4AF7C] transition-all duration-500"
                                                        style={{
                                                            width:
                                                                `${percentage}%`
                                                        }}
                                                    />

                                                </div>

                                            </div>

                                        </div>

                                    );

                                }
                            )
                        }

                    </div>

                )}

            </div>


            {/* ==================================================
                RESTAURANT STATS
            ================================================== */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">


                <div className="rounded-3xl border border-[#D8D0C4] bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#D4AF7C]/60 hover:shadow-lg">

                    <p className="text-gray-500">
                        Menu Items
                    </p>


                    <h2 className="text-3xl font-bold mt-2">
                        {
                            dashboard.totalMenuItems
                        }
                    </h2>

                </div>


                <div className="rounded-3xl border border-[#D8D0C4] bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#D4AF7C]/60 hover:shadow-lg">

                    <p className="text-gray-500">
                        Categories
                    </p>


                    <h2 className="text-3xl font-bold mt-2">
                        {
                            dashboard.totalCategories
                        }
                    </h2>

                </div>


                <div className="rounded-3xl border border-[#D8D0C4] bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#D4AF7C]/60 hover:shadow-lg">

                    <p className="text-gray-500">
                        Delivered
                    </p>


                    <h2 className="text-3xl font-bold mt-2">
                        {
                            dashboard.deliveredOrders
                        }
                    </h2>

                </div>

            </div>


        </div>

    );

}


export default Dashboard;