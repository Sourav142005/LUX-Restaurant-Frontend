import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../../services/api";


const getLocalTimeString = () => {
    const now = new Date();

    return `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
    ).padStart(2, "0")}`;
};

const getLocalDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const isPastReservationStart = (reservationDate, startTime) => {
  if (!reservationDate || !startTime) return false;

  const now = new Date();
  const selectedDateTime = new Date(
    `${reservationDate}T${startTime}:00`
  );

  return selectedDateTime <= now;
};

function Reservations() {

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const returnTo = searchParams.get("returnTo");

    const [tables, setTables] = useState([]);

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [selectedTable, setSelectedTable] = useState("");

    const [formData, setFormData] = useState({
        reservationDate: "",
        startTime: "",
        endTime: "",
        guests: 1,
        notes: ""
    });


    // =====================================
    // Fetch Available Tables
    // =====================================

    const fetchTables = async () => {

        if (
            !formData.reservationDate ||
            !formData.startTime ||
            !formData.endTime
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
        // Validate time

        if (formData.startTime >= formData.endTime) {

            setTables([]);
            setSelectedTable("");

            return;
        }


        try {

            setLoading(true);

            const response = await api.get(
                "/reservation/available",
                {
                    params: {
                        reservationDate:
                            formData.reservationDate,

                        startTime:
                            formData.startTime,

                        endTime:
                            formData.endTime
                    }
                }
            );


            setTables(
                Array.isArray(response.data.tables)
                    ? response.data.tables.filter(Boolean)
                    : []
            );

            setSelectedTable("");

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Failed to check table availability"
            );

            setTables([]);

        } finally {

            setLoading(false);

        }

    };


    // =====================================
    // Automatically Check Availability
    // =====================================

    useEffect(() => {

        fetchTables();

    }, [
        formData.reservationDate,
        formData.startTime,
        formData.endTime
    ]);


    // =====================================
    // Handle Input
    // =====================================

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };


    // =====================================
    // Submit Reservation
    // =====================================

    const handleSubmit = async (e) => {

        e.preventDefault();


        // Validate table

        if (!selectedTable) {

            toast.error(
                "Please select a table"
            );

            return;

        }


        // Validate date/time

        if (
            !formData.reservationDate ||
            !formData.startTime ||
            !formData.endTime
        ) {

            toast.error(
                "Please select date and time"
            );

            return;

        }

        if (
            isPastReservationStart(
                formData.reservationDate,
                formData.startTime
            )
            ) {
            toast.error("Please select a future reservation time.");
            setSelectedTable("");
            setTables([]);
            return;
            }


        if (formData.startTime >= formData.endTime) {

            toast.error(
                "End time must be after start time"
            );

            return;

        }


        // Validate guest count

        if (Number(formData.guests) < 1) {

            toast.error(
                "Number of guests must be at least 1"
            );

            return;

        }


        // Check selected table capacity

        const selectedTableData = tables.find(
            (table) =>
                table &&
                table._id === selectedTable
        );

        if (
            !selectedTableData ||
            !selectedTableData.isAvailable
        ) {

            toast.error(
                "Selected table is no longer available"
            );

            setSelectedTable("");

            fetchTables();

            return;

        }


        if (
            selectedTableData.capacity <
            Number(formData.guests)
        ) {

            toast.error(
                "Selected table is too small for your group"
            );

            setSelectedTable("");

            return;

        }


        try {

            setSubmitting(true);


            const response =
                await api.post(
                    "/reservation",
                    {
                        table: selectedTable,

                        reservationDate:
                            formData.reservationDate,

                        startTime:
                            formData.startTime,

                        endTime:
                            formData.endTime,

                        guests:
                            Number(formData.guests),

                        notes:
                            formData.notes
                    }
                );


            toast.success(
                response.data.message ||
                "Table reserved successfully"
            );

            if (returnTo === "checkout") {
                navigate("/checkout");
                return;
            }

            // Reset form

            setSelectedTable("");

            setFormData({
                reservationDate: "",
                startTime: "",
                endTime: "",
                guests: 1,
                notes: ""
            });


        } catch (error) {

            console.error(error);

            const message =
                error.response?.data?.message ||
                "Failed to create reservation";

            toast.error(message);

            // Refresh table availability
            await fetchTables();

            // Remove the selected table because it may
            // have been booked by another customer
            setSelectedTable("");

        } finally {

            setSubmitting(false);
        }

    };


    // =====================================
    // Suitable Tables
    // =====================================

    const suitableTables = tables.filter(
        (table) =>
            table &&
            table.isAvailable === true &&
            table.capacity >= Number(formData.guests)
    );


    // =====================================
    // Page
    // =====================================

    return (

        <div className="max-w-6xl mx-auto px-4 py-10">


            {/* ================================= */}
            {/* Header */}
            {/* ================================= */}

            <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">

                <div>

                    <p className="text-orange-500 font-semibold uppercase tracking-wide text-sm">
                        LUX Restaurant
                    </p>

                    <h1 className="text-4xl font-bold mt-1">
                        Reserve a Table
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Choose your table, date and preferred time.
                    </p>

                </div>


                <Link
                    to="/reservations/my"
                    className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-3 rounded-xl font-semibold"
                >
                    My Reservations
                </Link>

            </div>


            {/* ================================= */}
            {/* Main Layout */}
            {/* ================================= */}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">


                {/* ================================= */}
                {/* LEFT — FORM */}
                {/* ================================= */}

                <div className="lg:col-span-2">

                    <div className="bg-white border rounded-2xl p-6">

                        <h2 className="text-2xl font-bold mb-6">
                            Reservation Details
                        </h2>


                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >


                            {/* Date */}

                            <div>

                                <label className="block font-medium mb-2">
                                    Date
                                </label>

                                <input
                                    type="date"
                                    name="reservationDate"
                                    value={
                                        formData.reservationDate
                                    }
                                    onChange={handleChange}
                                    min={getLocalDateString()}
                                    className="w-full border rounded-xl p-3"
                                    required
                                />

                            </div>


                            {/* Time */}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <div>

                                    <label className="block font-medium mb-2">
                                        Start Time
                                    </label>

                                    <input
                                        type="time"
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleChange}
                                        min={
                                            formData.reservationDate === getLocalDateString()
                                                ? getLocalTimeString()
                                                : undefined
                                        }
                                        className="w-full border rounded-xl p-3"
                                        required
                                    />

                                </div>


                                <div>

                                    <label className="block font-medium mb-2">
                                        End Time
                                    </label>

                                    <input
                                        type="time"
                                        name="endTime"
                                        value={formData.endTime}
                                        onChange={handleChange}
                                        min={formData.startTime || undefined}
                                        className="w-full border rounded-xl p-3"
                                        required
                                    />

                                </div>

                            </div>


                            {/* Guests */}

                            <div>

                                <label className="block font-medium mb-2">
                                    Number of Guests
                                </label>

                                <input
                                    type="number"
                                    name="guests"
                                    value={
                                        formData.guests
                                    }
                                    onChange={handleChange}
                                    min="1"
                                    className="w-full border rounded-xl p-3"
                                    required
                                />

                            </div>


                            {/* Notes */}

                            <div>

                                <label className="block font-medium mb-2">

                                    Special Notes

                                    <span className="text-gray-400 font-normal">
                                        {" "}(Optional)
                                    </span>

                                </label>

                                <textarea
                                    name="notes"
                                    value={
                                        formData.notes
                                    }
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Birthday, window seat, special requests..."
                                    className="w-full border rounded-xl p-3"
                                />

                            </div>


                            {/* Submit */}

                            <button
                                type="submit"
                                disabled={
                                    submitting ||
                                    !selectedTable ||
                                    loading
                                }
                                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white py-3 rounded-xl font-bold text-lg"
                            >

                                {submitting
                                    ? "Reserving..."
                                    : "Reserve Table"}

                            </button>

                        </form>

                    </div>

                </div>


                {/* ================================= */}
                {/* RIGHT — TABLES */}
                {/* ================================= */}

                <div>

                    <div className="bg-white border rounded-2xl p-6">

                        <h2 className="text-2xl font-bold">
                            Choose Your Table
                        </h2>

                        <p className="text-gray-500 mt-1 mb-5">
                            Select a table that fits your group.
                        </p>


                        {/* No Date/Time */}

                        {!formData.reservationDate ||
                        !formData.startTime ||
                        !formData.endTime ? (

                            <div className="bg-gray-50 rounded-xl p-5 text-center">

                                <p className="text-gray-500">
                                    📅 Select a date and time first
                                    to check table availability.
                                </p>

                            </div>

                        ) : loading ? (

                            <div className="bg-gray-50 rounded-xl p-5 text-center">

                                <p className="text-gray-500">
                                    Checking table availability...
                                </p>

                            </div>

                        ) : isPastReservationStart(
                            formData.reservationDate,
                            formData.startTime
                        ) ? (
                            <div className="bg-yellow-50 rounded-xl p-5 text-center">
                                <p className="text-yellow-700">
                                    This time has already passed. Please select a future time.
                                </p>
                            </div>
                        ) : suitableTables.length === 0 ? (

                            <div className="bg-yellow-50 rounded-xl p-5 text-center">

                                <p className="text-yellow-700">
                                    No suitable tables are available for{" "}
                                    {formData.guests} guests at this time.
                                </p>

                            </div>

                        ) : (

                            <div className="space-y-3">

                                {suitableTables.map((table) => {
                                    if (!table) return null;

                                    const isAvailable =
                                        table.isAvailable === true;

                                    const isSelected =
                                        selectedTable === table._id;

                                    return (
                                        <button
                                            key={table._id}
                                            type="button"
                                            disabled={!isAvailable}
                                            onClick={() =>
                                                setSelectedTable(table._id)
                                            }
                                            className={`w-full text-left p-4 rounded-xl border-2 transition ${
                                                isSelected
                                                    ? "border-orange-500 bg-orange-50"
                                                    : "border-gray-200 hover:border-orange-300"
                                            }`}
                                        >
                                            <div className="flex justify-between items-center">

                                                <div>
                                                    <p className="font-bold text-lg">
                                                        🪑 Table {table.tableNumber}
                                                    </p>

                                                    <p className="text-sm text-gray-500">
                                                        {table.capacity} seats
                                                    </p>
                                                </div>

                                                <div className="text-right">
                                                    <span className="text-xs font-semibold text-green-600 block">
                                                        ✓ Available
                                                    </span>

                                                    <span className="text-xs text-gray-400">
                                                        {formData.startTime} → {formData.endTime}
                                                    </span>
                                                </div>

                                            </div>
                                        </button>
                                    );
                                })}

                            </div>

                        )}

                    </div>

                </div>

            </div>

        </div>

    );

}

export default Reservations;