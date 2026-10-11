import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import api from "../../../services/api";

function AdminReservations() {

    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // =====================================
    // Fetch All Reservations
    // =====================================

    const fetchReservations = async () => {

        try {

            setLoading(true);

            const response =
                await api.get("/reservation");

            setReservations(
                response.data.reservations || []
            );

            setError("");

        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load reservations"
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        fetchReservations();

    }, []);


    // =====================================
    // Update Reservation Status
    // =====================================

    const updateStatus = async (
        reservationId,
        status
    ) => {

        try {

            await api.put(
                `/reservation/${reservationId}/status`,
                { status }
            );

            toast.success(
                `Reservation marked as ${status}`
            );

            await fetchReservations();

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Failed to update reservation"
            );

        }

    };


    // =====================================
    // Format Date
    // =====================================

    const formatDate = (date) => {

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

    };

    const formatTime12Hour = (time) => {

        if (!time) return "";

        const [hours, minutes] = time.split(":");

        const hour = Number(hours);

        const period = hour >= 12 ? "PM" : "AM";

        const displayHour =
            hour % 12 === 0
                ? 12
                : hour % 12;

        return `${displayHour}:${minutes} ${period}`;
    };


    const isReservationActive = (reservation) => {

        if (!reservation?.reservationDate) {
            return false;
        }

        const reservationDate =
            new Date(reservation.reservationDate);

        const today = new Date();

        const sameDay =
            reservationDate.toDateString() ===
            today.toDateString();

        if (!sameDay) {
            return false;
        }

        const currentTime =
            `${String(today.getHours()).padStart(2, "0")}:${String(
                today.getMinutes()
            ).padStart(2, "0")}`;

        return (
            currentTime >= reservation.startTime &&
            currentTime < reservation.endTime
        );
    };


    // =====================================
    // Loading
    // =====================================

    if (loading) {

        return (

            <div className="text-center mt-10">

                <p className="text-gray-600 text-lg">
                    Loading reservations...
                </p>

            </div>

        );

    }


    // =====================================
    // Error
    // =====================================

    if (error) {

        return (

            <div className="text-center mt-10">

                <p className="text-red-600 text-lg">
                    ❌ {error}
                </p>

                <button
                    onClick={fetchReservations}
                    className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded"
                >
                    Try Again
                </button>

            </div>

        );

    }


    // =====================================
    // Statistics
    // =====================================

    const totalReservations =
        reservations.length;

    const pendingReservations =
        reservations.filter(
            reservation =>
                reservation.status === "Pending"
        ).length;

    const confirmedReservations =
        reservations.filter(
            reservation =>
                reservation.status === "Confirmed"
        ).length;

    const completedReservations =
        reservations.filter(
            reservation =>
                reservation.status === "Completed"
        ).length;

    const cancelledReservations =
        reservations.filter(
            reservation =>
                reservation.status === "Cancelled"
        ).length;

    // =====================================
    // Sort Reservations For Admin
    // =====================================

    const sortedReservations = [...reservations].sort(
        (a, b) => {

            const statusOrder = {
                Pending: 1,
                Confirmed: 2,
                Completed: 3,
                Cancelled: 4
            };

            const statusDifference =
                statusOrder[a.status] -
                statusOrder[b.status];

            if (statusDifference !== 0) {
                return statusDifference;
            }

            // Active confirmed reservations first
            if (
                a.status === "Confirmed" &&
                b.status === "Confirmed"
            ) {
                const activeA =
                    isReservationActive(a);

                const activeB =
                    isReservationActive(b);

                if (activeA !== activeB) {
                    return activeB - activeA;
                }
            }

            const dateA =
                new Date(a.reservationDate);

            const dateB =
                new Date(b.reservationDate);

            if (dateA.getTime() !== dateB.getTime()) {
                return dateA - dateB;
            }

            return a.startTime.localeCompare(
                b.startTime
            );
        }
    );
    // =====================================
    // Page
    // =====================================

    return (

        <div>

            {/* ================================= */}
            {/* Header */}
            {/* ================================= */}

            <div className="mb-8">

                <h1 className="text-3xl font-bold">
                    Reservations
                </h1>

                <p className="text-gray-500 mt-1">
                    Manage customer table reservations
                </p>

            </div>


            {/* ================================= */}
            {/* Statistics */}
            {/* ================================= */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">


                {/* Total */}

                <div className="bg-white shadow rounded-lg p-5">

                    <p className="text-gray-500">
                        Total
                    </p>

                    <p className="text-3xl font-bold mt-2">
                        {totalReservations}
                    </p>

                </div>


                {/* Pending */}

                <div className="bg-yellow-50 shadow rounded-lg p-5">

                    <p className="text-yellow-600">
                        Pending
                    </p>

                    <p className="text-3xl font-bold mt-2 text-yellow-700">
                        {pendingReservations}
                    </p>

                </div>


                {/* Confirmed */}

                <div className="bg-green-50 shadow rounded-lg p-5">

                    <p className="text-green-600">
                        Confirmed
                    </p>

                    <p className="text-3xl font-bold mt-2 text-green-700">
                        {confirmedReservations}
                    </p>

                </div>


                {/* Completed */}

                <div className="bg-blue-50 shadow rounded-lg p-5">

                    <p className="text-blue-600">
                        Completed
                    </p>

                    <p className="text-3xl font-bold mt-2 text-blue-700">
                        {completedReservations}
                    </p>

                </div>


                {/* Cancelled */}

                <div className="bg-red-50 shadow rounded-lg p-5">

                    <p className="text-red-600">
                        Cancelled
                    </p>

                    <p className="text-3xl font-bold mt-2 text-red-700">
                        {cancelledReservations}
                    </p>

                </div>

            </div>


            {/* ================================= */}
            {/* No Reservations */}
            {/* ================================= */}

            {reservations.length === 0 ? (

                <div className="bg-white shadow rounded-lg p-10 text-center">

                    <div className="text-5xl mb-4">
                        🪑
                    </div>

                    <h2 className="text-2xl font-bold">
                        No Reservations
                    </h2>

                    <p className="text-gray-500 mt-2">
                        There are currently no table reservations.
                    </p>

                </div>

            ) : (

                /* ================================= */
                /* Reservation Cards */
                /* ================================= */

                <div className="space-y-6">

                    {sortedReservations.map(
                        (reservation) => (

                            <div
                                key={reservation._id}
                                className="bg-white shadow rounded-xl p-6"
                            >

                                {/* ================================= */}
                                {/* Header */}
                                {/* ================================= */}

                                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">

                                    <div>

                                        <h2 className="text-xl font-bold">

                                            Reservation #
                                            {reservation._id.slice(-6)}

                                        </h2>

                                        <p className="text-gray-500 mt-1">

                                            Created on{" "}

                                            {new Date(
                                                reservation.createdAt
                                            ).toLocaleString()}

                                        </p>

                                    </div>


                                    {/* Status */}

                                    <span
                                        className={`px-4 py-2 rounded-full text-sm font-semibold w-fit ${
                                            reservation.status === "Confirmed"
                                                ? "bg-green-100 text-green-700"
                                                : reservation.status === "Pending"
                                                ? "bg-yellow-100 text-yellow-700"
                                                : reservation.status === "Cancelled"
                                                ? "bg-red-100 text-red-700"
                                                : "bg-blue-100 text-blue-700"
                                        }`}
                                    >

                                        {reservation.status}

                                    </span>

                                </div>


                                {/* ================================= */}
                                {/* Customer + Table */}
                                {/* ================================= */}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">


                                    {/* Customer */}

                                    <div className="bg-gray-50 rounded-xl p-5">

                                        <h3 className="font-semibold mb-3">
                                            Customer
                                        </h3>

                                        <p className="font-medium">

                                            👤{" "}
                                            {reservation.user?.fullName ||
                                                "Unknown"}

                                        </p>

                                        <p className="text-gray-500 mt-1">

                                            📧{" "}
                                            {reservation.user?.email ||
                                                "Unknown"}

                                        </p>

                                        {reservation.user?.phone && (

                                            <p className="text-gray-500 mt-1">

                                                📞{" "}
                                                {reservation.user.phone}

                                            </p>

                                        )}

                                    </div>


                                    {/* Table */}

                                    <div className="bg-gray-50 rounded-xl p-5">

                                        <h3 className="font-semibold mb-3">
                                            Table
                                        </h3>

                                        <p className="font-medium text-lg">

                                            🪑 Table{" "}

                                            {reservation.table?.tableNumber ||
                                                "Unknown"}

                                        </p>

                                        {reservation.table?.capacity && (

                                            <p className="text-gray-500 mt-1">

                                                Capacity:{" "}

                                                {reservation.table.capacity}
                                                {" "}guests

                                            </p>

                                        )}

                                    </div>

                                </div>


                                {/* ================================= */}
                                {/* Reservation Details */}
                                {/* ================================= */}

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">


                                    {/* Date */}

                                    <div className="border rounded-xl p-4">

                                        <p className="text-sm text-gray-500">
                                            Date
                                        </p>

                                        <p className="font-semibold mt-1">

                                            📅{" "}
                                            {formatDate(
                                                reservation.reservationDate
                                            )}

                                        </p>

                                    </div>


                                    {/* Time */}

                                    <div className="border rounded-xl p-4">

                                        <p className="text-sm text-gray-500">
                                            Time
                                        </p>

                                        <p className="font-semibold mt-1">

                                            🕐{" "}
                                            {formatTime12Hour(reservation.startTime)}
                                            {" → "}
                                            {formatTime12Hour(reservation.endTime)}

                                        </p>

                                    </div>


                                    {/* Guests */}

                                    <div className="border rounded-xl p-4">

                                        <p className="text-sm text-gray-500">
                                            Guests
                                        </p>

                                        <p className="font-semibold mt-1">

                                            👥{" "}
                                            {reservation.guests}

                                        </p>

                                    </div>

                                </div>


                                {/* ================================= */}
                                {/* Notes */}
                                {/* ================================= */}

                                {reservation.notes && (

                                    <div className="mt-5">

                                        <p className="text-sm text-gray-500">
                                            Special Notes
                                        </p>

                                        <p className="mt-1 text-gray-700 bg-gray-50 rounded-lg p-3">

                                            {reservation.notes}

                                        </p>

                                    </div>

                                )}


                                {/* ================================= */}
                                {/* Admin Actions */}
                                {/* ================================= */}

                                <div className="mt-6 flex flex-wrap gap-3">


                                    {/* Pending */}

                                    {reservation.status === "Pending" && (

                                        <>

                                            <button
                                                onClick={() =>
                                                    updateStatus(
                                                        reservation._id,
                                                        "Confirmed"
                                                    )
                                                }
                                                className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg"
                                            >
                                                Confirm Reservation
                                            </button>


                                            <button
                                                onClick={() =>
                                                    updateStatus(
                                                        reservation._id,
                                                        "Cancelled"
                                                    )
                                                }
                                                className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg"
                                            >
                                                Cancel Reservation
                                            </button>

                                        </>

                                    )}


                                    {/* Confirmed */}

                                    {reservation.status === "Confirmed" &&
                                        isReservationActive(reservation) && (

                                        <div className="bg-blue-50 text-blue-700 px-5 py-2 rounded-lg font-medium">
                                            🟢 Reservation is Active
                                        </div>

                                    )}

                                    {reservation.status === "Confirmed" &&
                                        !isReservationActive(reservation) && (

                                        <button
                                            onClick={() =>
                                                updateStatus(
                                                    reservation._id,
                                                    "Cancelled"
                                                )
                                            }
                                            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg"
                                        >
                                            Cancel Reservation
                                        </button>

                                    )}

                                </div>

                            </div>

                        )
                    )}

                </div>

            )}

        </div>

    );

}

export default AdminReservations;