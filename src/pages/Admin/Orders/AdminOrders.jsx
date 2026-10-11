import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import api from "../../../services/api";

function AdminOrders() {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // ==================================================
    // Fetch All Orders
    // ==================================================

    const fetchOrders = async () => {

        try {

            setLoading(true);

            const response =
                await api.get("/admin/orders");

            setOrders(
                response.data.orders || []
            );

            setError("");

        } catch (error) {

            console.error(
                "Fetch Orders Error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load orders."
            );

        } finally {

            setLoading(false);

        }

    };


    // ==================================================
    // Initial Load
    // ==================================================

    useEffect(() => {

        fetchOrders();

    }, []);


    // ==================================================
    // Update Order Status
    // ==================================================

    const updateStatus = async (
        orderId,
        newStatus
    ) => {

        try {

            await api.put(
                `/order/${orderId}`,
                {
                    orderStatus: newStatus
                }
            );

            toast.success(
                `Order marked as ${newStatus}`
            );

            await fetchOrders();

        } catch (error) {

            console.error(
                "Update Order Status Error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to update order status"
            );

        }

    };


    // ==================================================
    // Close Dine-In Table
    // ==================================================

    const closeTable = async (orderId) => {

        try {

            await api.post(
                `/order/${orderId}/close-table`
            );

            toast.success(
                "Table closed successfully"
            );

            await fetchOrders();

        } catch (error) {

            console.error(
                "Close Table Error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to close table"
            );

        }

    };


    // ==================================================
    // Status Badge
    // ==================================================

    const getStatusClass = (status) => {

        switch (status) {

            case "Scheduled":
                return "border border-blue-200 bg-blue-50 text-blue-700";

            case "Pending":
                return "border border-amber-200 bg-amber-50 text-amber-700";

            case "Preparing":
                return "border border-orange-200 bg-orange-50 text-orange-700";

            case "Ready":
                return "border border-green-200 bg-green-50 text-green-700";

            case "Delivered":
                return "border border-purple-200 bg-purple-50 text-purple-700";

            case "Cancelled":
                return "border border-red-200 bg-red-50 text-red-700";

            default:
                return "border border-gray-200 bg-gray-50 text-gray-700";

        }

    };


    // ==================================================
    // Format Reservation Date
    // ==================================================

    const formatReservationDate = (date) => {

        if (!date) {
            return "—";
        }

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );

    };


    // ==================================================
    // Loading
    // ==================================================

    if (loading) {

        return (

            <div className="flex min-h-[50vh] items-center justify-center">

                <p className="text-lg font-bold text-[#756F66]">
                    Loading orders...
                </p>

            </div>

        );

    }


    // ==================================================
    // Error
    // ==================================================

    if (error) {

        return (

            <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">

                <p className="text-lg font-bold text-red-600">
                    ❌ {error}
                </p>


                <button
                    onClick={fetchOrders}
                    className="mt-5 rounded-xl bg-[#0B0B0B] px-5 py-2.5 font-bold text-white transition-all hover:bg-[#2B1F14] active:scale-[0.98]"
                >
                    Try Again
                </button>

            </div>

        );

    }


    // ==================================================
    // Page
    // ==================================================

    return (

        <div className="space-y-7">

            {/* ==================================================
                Page Header
            ================================================== */}

            <div className="mb-8">

                <div className="flex justify-between items-start gap-4">

                    <div>

                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0B0B0B] text-[#D4AF7C] shadow-lg shadow-black/10">
                                ▣
                            </div>

                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#B88A4A]">
                                    LUX Management
                                </p>
                                <h1 className="mt-1 text-3xl font-black tracking-tight text-[#0B0B0B]">
                                    Orders
                                </h1>
                            </div>
                        </div>

                        <p className="mt-2 text-sm text-[#756F66]">
                            Manage all customer orders
                        </p>

                    </div>


                    <button
                        onClick={fetchOrders}
                        className="rounded-xl border border-[#D8D0C4] bg-white px-5 py-3 font-bold text-[#0B0B0B] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D4AF7C] hover:bg-[#F8F5EE] hover:shadow-md active:scale-[0.98]"
                    >
                        ↻ Refresh
                    </button>

                </div>

            </div>


            {/* ==================================================
                No Orders
            ================================================== */}

            {orders.length === 0 ? (

                <div className="rounded-3xl border border-[#D8D0C4] bg-white p-12 text-center shadow-sm">

                    <p className="font-medium text-[#756F66]">
                        No orders found.
                    </p>

                </div>

            ) : (

                <div>

                    {/* ==================================================
                        Orders
                    ================================================== */}

                    {orders.map((order) => (

                        <div
                            key={order._id}
                            className="group mb-6 overflow-hidden rounded-3xl border border-[#D8D0C4] bg-white shadow-sm transition-all duration-200 hover:border-[#D4AF7C]/70 hover:shadow-xl hover:shadow-black/[0.05]"
                        >


                            {/* ==================================================
                                Order Header
                            ================================================== */}

                            <div className="flex justify-between items-start gap-4">

                                <div>

                                    <h2 className="text-xl font-black tracking-tight text-[#0B0B0B]">

                                        Order #
                                        {order._id.slice(-6)}


                                        {/* Active Table */}

                                        {order.orderType === "Dine-In" &&
                                            order.table && (

                                                <span className="ml-3 inline-flex items-center rounded-full bg-[#D4AF7C]/15 px-3 py-1 text-xs font-bold text-[#8B6A3E]">

                                                    🪑 Table{" "}

                                                    {
                                                        order.table.tableNumber
                                                    }

                                                </span>

                                            )}

                                    </h2>


                                    <p className="mt-2 text-sm text-[#756F66]">

                                        Customer:

                                        <span className="ml-1 font-bold text-[#0B0B0B]">

                                            {order.user?.fullName ||
                                                "Unknown"}

                                        </span>

                                    </p>


                                    <p className="text-sm text-[#756F66]">

                                        Email:

                                        <span className="ml-1">

                                            {order.user?.email ||
                                                "Unknown"}

                                        </span>

                                    </p>

                                </div>


                                {/* ==================================================
                                    Status Badge
                                ================================================== */}

                                <span
                                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(
                                        order.orderStatus
                                    )}`}
                                >

                                    {order.orderStatus}

                                </span>

                            </div>


                            {/* ==================================================
                                Scheduled Reservation
                            ================================================== */}

                            {order.orderStatus === "Scheduled" &&
                                order.orderType === "Dine-In" &&
                                order.reservation && (

                                    <div className="mt-6 overflow-hidden rounded-2xl border border-blue-200 bg-blue-50/70 p-5 shadow-sm">

                                        <div className="flex items-center gap-2">

                                            <span className="text-xl">
                                                📅
                                            </span>

                                            <h3 className="text-lg font-black text-blue-800">
                                                Scheduled Reservation
                                            </h3>

                                        </div>


                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">


                                            {/* Date */}

                                            <div>

                                                <p className="text-sm text-blue-600">
                                                    Date
                                                </p>

                                                <p className="font-semibold text-blue-900">

                                                    {formatReservationDate(
                                                        order.reservation.reservationDate
                                                    )}

                                                </p>

                                            </div>


                                            {/* Time */}

                                            <div>

                                                <p className="text-sm text-blue-600">
                                                    Time
                                                </p>

                                                <p className="font-semibold text-blue-900">

                                                    {order.reservation.startTime}

                                                    {" - "}

                                                    {order.reservation.endTime}

                                                </p>

                                            </div>


                                            {/* Guests */}

                                            <div>

                                                <p className="text-sm text-blue-600">
                                                    Guests
                                                </p>

                                                <p className="font-semibold text-blue-900">

                                                    {order.reservation.guests}

                                                </p>

                                            </div>


                                            {/* Reserved Table */}

                                            <div>

                                                <p className="text-sm text-blue-600">
                                                    Reserved Table
                                                </p>

                                                <p className="font-semibold text-blue-900">

                                                    {order.reservation.table?.tableNumber
                                                        ? `Table ${order.reservation.table.tableNumber}`
                                                        : order.table?.tableNumber
                                                        ? `Table ${order.table.tableNumber}`
                                                        : "Assigned"}

                                                </p>

                                            </div>

                                        </div>


                                        <div className="mt-4 bg-blue-100 rounded-lg p-3">

                                            <p className="text-sm text-blue-700">

                                                ℹ️ This order is scheduled for
                                                the customer's reservation.
                                                The table will be occupied when
                                                the order starts.

                                            </p>

                                        </div>

                                    </div>

                                )}


                            {/* ==================================================
                                Order Items
                            ================================================== */}

                            <div className="mt-6">

                                <h3 className="mb-3 text-sm font-black uppercase tracking-[0.15em] text-[#8B8175]">
                                    Order Items
                                </h3>


                                <div className="overflow-hidden rounded-2xl border border-[#D8D0C4]">

                                    {order.items.map((item) => (

                                        <div
                                            key={item._id}
                                            className="flex items-center justify-between border-b border-[#EEE8DE] px-4 py-4 last:border-b-0 transition-colors hover:bg-[#F8F5EE]/70"
                                        >

                                            <div>

                                                <p className="font-medium">

                                                    {item.menu?.name ||
                                                        "Unknown Item"}

                                                </p>


                                                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#8B8175]">

                                                    ₹{item.price}
                                                    {" × "}
                                                    {item.quantity}

                                                </p>

                                            </div>


                                            <p className="font-medium">

                                                ₹
                                                {(
                                                    item.price *
                                                    item.quantity
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}

                                            </p>

                                        </div>

                                    ))}

                                </div>

                            </div>


                            {/* ==================================================
                                Order Information
                            ================================================== */}

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">


                                {/* Total */}

                                <div className="rounded-2xl border border-[#E7E0D6] bg-[#F8F5EE]/70 p-4">

                                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#8B8175]">
                                        Total
                                    </p>

                                    <p className="mt-1 text-xl font-black text-[#B88A4A]">

                                        ₹
                                        {Number(
                                            order.totalPrice
                                        ).toLocaleString(
                                            "en-IN"
                                        )}

                                    </p>

                                </div>


                                {/* Payment */}

                                <div className="rounded-2xl border border-[#E7E0D6] bg-[#F8F5EE]/70 p-4">

                                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#8B8175]">
                                        Payment
                                    </p>

                                    <p className="font-medium">
                                        {order.paymentStatus}
                                    </p>

                                </div>


                                {/* Order Type */}

                                <div className="rounded-2xl border border-[#E7E0D6] bg-[#F8F5EE]/70 p-4">

                                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#8B8175]">
                                        Order Type
                                    </p>

                                    <p className="font-medium">
                                        {order.orderType}
                                    </p>

                                </div>


                                {/* Table */}

                                <div className="rounded-2xl border border-[#E7E0D6] bg-[#F8F5EE]/70 p-4">

                                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#8B8175]">
                                        Table
                                    </p>


                                    {order.orderType === "Dine-In" &&
                                        order.table ? (

                                        <p className="text-xl font-black text-[#0B0B0B]">

                                            🪑 Table{" "}

                                            {order.table.tableNumber}

                                        </p>

                                    ) : order.orderType === "Dine-In" &&
                                        order.reservation?.table ? (

                                        <p className="font-semibold text-lg text-blue-700">

                                            📅 Table{" "}

                                            {
                                                order.reservation.table.tableNumber
                                            }

                                        </p>

                                    ) : (

                                        <p className="font-medium text-[#A49B90]">
                                            —
                                        </p>

                                    )}

                                </div>

                            </div>


                            {/* ==================================================
                                Order Date
                            ================================================== */}

                            <p className="mt-5 text-xs font-medium text-[#8B8175]">

                                Ordered on:{" "}

                                {new Date(
                                    order.createdAt
                                ).toLocaleString()}

                            </p>


                            {/* ==================================================
                                Admin Actions
                            ================================================== */}

                            <div className="mt-6 flex gap-3 flex-wrap">


                                {/* ==================================================
                                    Scheduled Actions
                                ================================================== */}

                                {order.orderStatus === "Scheduled" && (

                                    <>

                                        <button
                                            onClick={() =>
                                                updateStatus(
                                                    order._id,
                                                    "Preparing"
                                                )
                                            }
                                            className="rounded-xl bg-[#0B0B0B] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#2B1F14] active:scale-[0.98]"
                                        >
                                            ▶ Start Preparing
                                        </button>


                                        <button
                                            onClick={() =>
                                                updateStatus(
                                                    order._id,
                                                    "Cancelled"
                                                )
                                            }
                                            className="rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-bold text-red-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-100 active:scale-[0.98]"
                                        >
                                            Cancel Order
                                        </button>

                                    </>

                                )}


                                {/* ==================================================
                                    Pending Actions
                                ================================================== */}

                                {order.orderStatus === "Pending" && (

                                    <>

                                        <button
                                            onClick={() =>
                                                updateStatus(
                                                    order._id,
                                                    "Preparing"
                                                )
                                            }
                                            className="rounded-xl bg-[#0B0B0B] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#2B1F14] active:scale-[0.98]"
                                        >
                                            Start Preparing
                                        </button>


                                        <button
                                            onClick={() =>
                                                updateStatus(
                                                    order._id,
                                                    "Cancelled"
                                                )
                                            }
                                            className="rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-bold text-red-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-100 active:scale-[0.98]"
                                        >
                                            Cancel Order
                                        </button>

                                    </>

                                )}


                                {/* ==================================================
                                    Preparing Action
                                ================================================== */}

                                {order.orderStatus === "Preparing" && (

                                    <button
                                        onClick={() =>
                                            updateStatus(
                                                order._id,
                                                "Ready"
                                            )
                                        }
                                        className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-green-700 active:scale-[0.98]"
                                    >
                                        Mark Ready
                                    </button>

                                )}


                                {/* ==================================================
                                    Ready Action
                                ================================================== */}

                                {order.orderStatus === "Ready" && (

                                    <button
                                        onClick={() =>
                                            updateStatus(
                                                order._id,
                                                "Delivered"
                                            )
                                        }
                                        className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-purple-700 active:scale-[0.98]"
                                    >
                                        Mark Delivered
                                    </button>

                                )}

                                {/* ==================================================
                                    Close Table
                                ================================================== */}

                                {order.orderType === "Dine-In" &&
                                    order.orderStatus === "Delivered" &&
                                    order.paymentStatus === "Paid" &&
                                    order.table &&
                                    !order.tableClosed && (

                                    <button
                                        onClick={() =>
                                            closeTable(order._id)
                                        }
                                        className="rounded-xl bg-[#0B0B0B] px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#2B1F14] active:scale-[0.98]"
                                    >
                                        🪑 Close Table
                                    </button>

                                )}

                            </div>


                        </div>

                    ))}

                </div>

            )}

        </div>

    );

}


export default AdminOrders;