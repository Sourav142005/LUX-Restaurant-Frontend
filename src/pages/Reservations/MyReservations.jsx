import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../../services/api";

function MyReservations() {

    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);


    // Fetch Reservations (silent in background on polling)
    const fetchReservations = async (isInitial = false) => {

        try {

            if (isInitial) {
                setLoading(true);
            }

            const response =
                await api.get("/reservation/my");

            setReservations(
                response.data.reservations || []
            );

        } catch (error) {

            console.error(error);

            if (isInitial && error.response?.status !== 401) {
                toast.error(
                    error.response?.data?.message ||
                    "Failed to load reservations"
                );
            }

        } finally {

            if (isInitial) {
                setLoading(false);
            }

        }

    };


    useEffect(() => {

        // Fetch immediately with loading indicator
        fetchReservations(true);

        // Refresh reservations every 30 seconds silently
        const interval = setInterval(() => {

            fetchReservations(false);

        }, 30000);

        // Cleanup when leaving the page
        return () => {

            clearInterval(interval);

        };

    }, []);


    // Cancel Reservation
    const handleCancel = async (reservationId) => {

        if (cancellingId) return;

        const confirmed = window.confirm(
            "Are you sure you want to cancel this reservation?"
        );

        if (!confirmed) {
            return;
        }

        try {

            setCancellingId(reservationId);

            await api.patch(
                `/reservation/${reservationId}/cancel`
            );

            toast.success(
                "Reservation cancelled successfully"
            );

            await fetchReservations(false);

        } catch (error) {

            console.error(error);

            if (error.response?.status !== 401) {
                toast.error(
                    error.response?.data?.message ||
                    "Failed to cancel reservation"
                );
            }

        } finally {

            setCancellingId(null);

        }

    };


    // Format Date safely
    const formatDate = (date) => {

        if (!date) return "N/A";

        const parsed = new Date(date);

        if (isNaN(parsed.getTime())) return "N/A";

        return parsed.toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );

    };

    // Determine the display status of a reservation safely
    const getDisplayStatus = (reservation) => {

        if (!reservation) return "Unknown";

        // Only confirmed reservations can become Active
        if (reservation.status !== "Confirmed") {
            return reservation.status || "Unknown";
        }

        if (
            !reservation.reservationDate ||
            !reservation.startTime ||
            !reservation.endTime
        ) {
            return reservation.status;
        }

        const parseTime = (timeString) => {

            if (!timeString || typeof timeString !== "string") {
                return { hour: 0, minute: 0 };
            }

            const parts = timeString.trim().split(" ");

            const time = parts[0] || "0:0";
            const period = parts[1];

            let [hour = 0, minute = 0] = time
                .split(":")
                .map(Number);

            if (isNaN(hour)) hour = 0;
            if (isNaN(minute)) minute = 0;

            // Handle 12-hour format: 5:12 PM
            if (period) {

                hour = hour % 12;

                if (period.toUpperCase() === "PM") {
                    hour += 12;
                }

            }

            // Handle 24-hour format: 17:12
            return {
                hour,
                minute
            };
        };

        const reservationDate = new Date(
            reservation.reservationDate
        );

        if (isNaN(reservationDate.getTime())) {
            return reservation.status;
        }

        const startTime = parseTime(
            reservation.startTime
        );

        const endTime = parseTime(
            reservation.endTime
        );


        const start = new Date(reservationDate);

        start.setHours(
            startTime.hour,
            startTime.minute,
            0,
            0
        );


        const end = new Date(reservationDate);

        end.setHours(
            endTime.hour,
            endTime.minute,
            0,
            0
        );


        const now = new Date();


        // Currently inside reservation time
        if (now >= start && now < end) {
            return "Active";
        }


        return "Confirmed";
    };

    // Status Badge Helper
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case "Confirmed":
                return "bg-emerald-50 text-emerald-700 border border-emerald-200/80";
            case "Active":
                return "bg-blue-50 text-blue-700 border border-blue-200/80";
            case "Pending":
                return "bg-amber-50 text-amber-800 border border-amber-200/80";
            case "Cancelled":
                return "bg-rose-50 text-rose-700 border border-rose-200/80";
            default:
                return "bg-stone-100 text-stone-700 border border-stone-200";
        }
    };


    // Loading Skeleton
    if (loading) {

        return (
            <div className="lux-container py-16 text-center">

                <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#D4AF7C] border-t-transparent mb-3" />

                <p className="text-gray-600 text-base font-medium">
                    Loading reservations...
                </p>

            </div>
        );

    }


    return (

        <div className="lux-container py-6 sm:py-10">

            {/* Header */}

            <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">

                <div>

                    <p className="text-[#B88A4A] font-bold uppercase tracking-[0.18em] text-xs sm:text-sm">
                        LUX Restaurant
                    </p>

                    <h1 className="text-3xl sm:text-4xl font-black mt-1 text-[#0B0B0B]">
                        My Reservations
                    </h1>

                    <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                        View and manage your table reservations.
                    </p>

                </div>


                <div className="flex items-center gap-2">

                    <button
                        type="button"
                        onClick={() => fetchReservations(true)}
                        className="flex-1 sm:flex-initial h-11 px-4 rounded-xl border border-[#DED5C7] bg-white text-sm font-semibold text-gray-700 shadow-sm hover:border-[#D4AF7C] hover:bg-[#FBF7EF] flex items-center justify-center transition"
                        title="Refresh"
                    >
                        ↻ Refresh
                    </button>

                    <Link
                        to="/reservations"
                        className="flex-1 sm:flex-initial h-11 px-5 rounded-xl bg-[#0B0B0B] hover:bg-[#2B1F14] text-white text-sm font-semibold flex items-center justify-center transition shadow-sm"
                    >
                        + Reserve Table
                    </Link>

                </div>

            </div>


            {/* No Reservations */}

            {reservations.length === 0 ? (

                <div className="bg-white border border-[#E8E0D4] rounded-2xl p-6 sm:p-10 text-center shadow-sm">

                    <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">
                        🪑
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold text-[#0B0B0B]">
                        No Reservations Yet
                    </h2>

                    <p className="text-gray-500 mt-1.5 text-sm sm:text-base">
                        You haven't reserved a table yet.
                    </p>

                    <Link
                        to="/reservations"
                        className="inline-flex mt-5 sm:mt-6 bg-[#0B0B0B] hover:bg-[#2B1F14] text-white px-6 py-3 rounded-xl font-semibold text-sm sm:text-base transition shadow-sm"
                    >
                        Reserve a Table
                    </Link>

                </div>

            ) : (

                <div className="space-y-4 sm:space-y-5">

                    {reservations.map((reservation) => {

                        const displayStatus = getDisplayStatus(reservation);
                        const isCancelling = cancellingId === reservation._id;

                        return (

                            <div
                                key={reservation._id}
                                className="bg-white border border-[#E8E0D4] rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition"
                            >

                                {/* Top Bar: Table and Status */}

                                <div className="flex items-start justify-between gap-3">

                                    <div className="min-w-0">

                                        <h2 className="text-lg sm:text-2xl font-bold text-[#0B0B0B] truncate">

                                            🪑 Table{" "}
                                            {reservation.table?.tableNumber ||
                                                "Unassigned"}

                                        </h2>

                                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">

                                            Reservation #
                                            {reservation._id
                                                ? reservation._id.slice(-6).toUpperCase()
                                                : "N/A"}

                                        </p>

                                    </div>


                                    <span
                                        className={`shrink-0 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-bold tracking-wide ${getStatusBadgeClass(
                                            displayStatus
                                        )}`}
                                    >
                                        {displayStatus}
                                    </span>

                                </div>


                                {/* Details Grid: 2 columns on mobile, 3 columns on sm/desktop */}

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4 mt-4 sm:mt-6">

                                    <div className="bg-[#FBF7EF] border border-[#EFE7DA] rounded-xl p-3 sm:p-4 col-span-1">

                                        <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Date
                                        </p>

                                        <p className="font-bold text-xs sm:text-sm text-[#0B0B0B] mt-1 truncate">
                                            📅{" "}
                                            {formatDate(
                                                reservation.reservationDate
                                            )}
                                        </p>

                                    </div>


                                    <div className="bg-[#FBF7EF] border border-[#EFE7DA] rounded-xl p-3 sm:p-4 col-span-1">

                                        <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Guests
                                        </p>

                                        <p className="font-bold text-xs sm:text-sm text-[#0B0B0B] mt-1 truncate">
                                            👥 {reservation.guests}{" "}
                                            {reservation.guests === 1
                                                ? "Guest"
                                                : "Guests"}
                                        </p>

                                    </div>


                                    <div className="bg-[#FBF7EF] border border-[#EFE7DA] rounded-xl p-3 sm:p-4 col-span-2 sm:col-span-1">

                                        <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Time
                                        </p>

                                        <p className="font-bold text-xs sm:text-sm text-[#0B0B0B] mt-1 truncate">

                                            🕐 {reservation.startTime}
                                            {" → "}
                                            {reservation.endTime}

                                        </p>

                                    </div>

                                </div>


                                {/* Table Capacity */}

                                {reservation.table && (

                                    <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">

                                        Table capacity:{" "}

                                        <span className="font-semibold text-gray-700">

                                            {reservation.table.capacity}
                                            {" "}guests

                                        </span>

                                    </p>

                                )}


                                {/* Notes */}

                                {reservation.notes && (

                                    <div className="mt-3 bg-[#FBF7EF]/60 border border-[#EFE7DA] rounded-xl p-3 sm:p-4 text-xs sm:text-sm">

                                        <p className="font-semibold text-gray-500 uppercase tracking-wider text-[11px]">
                                            Special Notes
                                        </p>

                                        <p className="mt-1 text-gray-700 break-words">
                                            {reservation.notes}
                                        </p>

                                    </div>

                                )}


                                {/* Cancel Action */}

                                {(reservation.status === "Pending" ||
                                    reservation.status === "Confirmed") && (

                                    <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-[#F0EBE1] flex justify-end">

                                        <button
                                            type="button"
                                            disabled={isCancelling}
                                            onClick={() =>
                                                handleCancel(
                                                    reservation._id
                                                )
                                            }
                                            className="w-full sm:w-auto min-h-[42px] px-5 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white transition font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isCancelling ? (
                                                <>
                                                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                    Cancelling...
                                                </>
                                            ) : (
                                                "Cancel Reservation"
                                            )}
                                        </button>

                                    </div>

                                )}

                            </div>

                        );

                    })}

                </div>

            )}

        </div>

    );

}

export default MyReservations;