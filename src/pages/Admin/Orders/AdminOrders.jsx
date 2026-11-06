import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import api from "../../../services/api";

function AdminOrders() {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reconciliationOnly, setReconciliationOnly] = useState(false);

    // ==================================================
    // Cancel Order Modal State
    // ==================================================

    const [cancelModalOrder, setCancelModalOrder] = useState(null);
    const [cancelReason, setCancelReason] = useState("");
    const [isCancelling, setIsCancelling] = useState(false);


    // ==================================================
    // Fetch All Orders
    // ==================================================

    const fetchOrders = async (isReconciliationOnly = reconciliationOnly) => {

        try {

            setLoading(true);

            const params = {};
            if (isReconciliationOnly) {
                params.reconciliationRequired = "true";
            }

            const response =
                await api.get("/admin/orders", { params });

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
    // Initial Load & Filter Changes
    // ==================================================

    useEffect(() => {

        fetchOrders(reconciliationOnly);

    }, [reconciliationOnly]);


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
    // Cancel Order (Dedicated Safe Refund & Table Release)
    // ==================================================

    const openCancelModal = (order) => {
        setCancelModalOrder(order);
        setCancelReason("Admin cancelled order");
    };

    const closeCancelModal = () => {
        if (isCancelling) return;
        setCancelModalOrder(null);
        setCancelReason("");
    };

    const handleConfirmCancel = async () => {
        if (!cancelModalOrder || isCancelling) return;

        try {
            setIsCancelling(true);
            const reason = cancelReason.trim() || "Admin cancelled order";

            const response = await api.patch(
                `/order/${cancelModalOrder._id}/cancel`,
                { reason }
            );

            const data = response.data || {};
            const backendMessage = data.message || "Order cancelled successfully";

            if (data.refunded) {
                toast.success(backendMessage);
            } else if (data.order?.paymentStatus === "RefundPending") {
                toast.success(`${backendMessage} — refund is pending gateway processing.`);
            } else {
                toast.success(backendMessage);
            }

            setCancelModalOrder(null);
            setCancelReason("");
            await fetchOrders(reconciliationOnly);

        } catch (error) {
            console.error("Admin Cancel Order Error:", error);
            const message =
                error.response?.data?.message ||
                "Failed to cancel order";
            toast.error(message);
        } finally {
            setIsCancelling(false);
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


                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => setReconciliationOnly((prev) => !prev)}
                            className={`rounded-xl px-4 py-3 font-bold text-sm shadow-sm transition-all duration-200 active:scale-[0.98] ${
                                reconciliationOnly
                                    ? "border-2 border-amber-500 bg-amber-50 text-amber-900 shadow-amber-200/50"
                                    : "border border-[#D8D0C4] bg-white text-[#756F66] hover:border-[#D4AF7C] hover:bg-[#F8F5EE] hover:text-[#0B0B0B]"
                            }`}
                        >
                            {reconciliationOnly
                                ? "⚠️ Filtering: Reconciliation Required"
                                : "Filter: Reconciliation Required"}
                        </button>

                        {reconciliationOnly && (
                            <button
                                onClick={() => setReconciliationOnly(false)}
                                className="rounded-xl border border-[#D8D0C4] bg-white px-3 py-3 text-xs font-bold text-[#756F66] hover:bg-[#F8F5EE] hover:text-[#0B0B0B] transition-all"
                            >
                                Clear Filter
                            </button>
                        )}

                        <button
                            onClick={() => fetchOrders(reconciliationOnly)}
                            className="rounded-xl border border-[#D8D0C4] bg-white px-5 py-3 font-bold text-[#0B0B0B] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D4AF7C] hover:bg-[#F8F5EE] hover:shadow-md active:scale-[0.98]"
                        >
                            ↻ Refresh
                        </button>
                    </div>

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
                                    Status Badge & Reconciliation Warning
                                ================================================== */}

                                <div className="flex flex-col items-end gap-2">
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(
                                            order.orderStatus
                                        )}`}
                                    >
                                        {order.orderStatus}
                                    </span>

                                    {order.reconciliationRequired && (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-400 bg-amber-100 px-3 py-0.5 text-xs font-bold text-amber-900 shadow-sm animate-pulse">
                                            ⚠️ Reconciliation Required
                                        </span>
                                    )}
                                </div>

                            </div>


                            {/* ==================================================
                                Reconciliation Required Alert Banner
                            ================================================== */}

                            {order.reconciliationRequired && (
                                <div className="mt-5 rounded-2xl border border-amber-300 bg-amber-50/90 p-4 text-xs text-amber-900 shadow-sm">
                                    <div className="flex items-start gap-2.5">
                                        <span className="text-lg leading-none">⚠️</span>
                                        <div>
                                            <p className="font-black uppercase tracking-wider text-amber-800">
                                                Reconciliation Required
                                            </p>
                                            <p className="mt-1 text-amber-700">
                                                This order requires manual staff review. Payment was captured or modified on a cancelled order or a refund failure occurred. Gateway payment ID:{" "}
                                                <span className="font-mono font-bold">
                                                    {order.razorpayPaymentId || "N/A"}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}


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

                                <div className={`rounded-2xl border p-4 ${
                                    order.reconciliationRequired
                                        ? "border-amber-300 bg-amber-50/80 shadow-sm"
                                        : "border-[#E7E0D6] bg-[#F8F5EE]/70"
                                }`}>

                                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#8B8175]">
                                        Payment
                                    </p>

                                    <div className="flex items-center gap-2 mt-0.5">
                                        <p className="font-medium">
                                            {order.paymentStatus}
                                        </p>
                                        {order.reconciliationRequired && (
                                            <span className="rounded-full bg-amber-200/80 px-2 py-0.5 text-[10px] font-black text-amber-900 uppercase">
                                                Review
                                            </span>
                                        )}
                                    </div>

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
                                                openCancelModal(
                                                    order
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
                                                openCancelModal(
                                                    order
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

            {/* ==================================================
                Cancel Order Confirmation Modal
            ================================================== */}
            {cancelModalOrder && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget && !isCancelling) {
                            closeCancelModal();
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="cancel-modal-title"
                        className="w-full max-w-lg overflow-hidden rounded-3xl border border-[#D8D0C4] bg-[#FCFBF8] p-6 shadow-2xl sm:p-7"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between border-b border-[#E8E1D7] pb-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-xl text-red-600 shadow-sm">
                                    ✕
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B88A4A]">
                                        Order Management
                                    </p>
                                    <h2
                                        id="cancel-modal-title"
                                        className="mt-0.5 text-2xl font-black text-[#0B0B0B]"
                                    >
                                        Cancel Order
                                    </h2>
                                </div>
                            </div>
                            <button
                                type="button"
                                disabled={isCancelling}
                                onClick={closeCancelModal}
                                className="rounded-xl border border-transparent p-2 text-xl font-bold text-[#8B8175] transition hover:border-[#D8D0C4] hover:bg-white hover:text-[#0B0B0B] disabled:opacity-40"
                                aria-label="Close dialog"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Order Details Summary */}
                        <div className="mt-5 space-y-3">
                            <div className="rounded-2xl border border-[#E7E0D6] bg-white p-4">
                                <div className="flex items-center justify-between">
                                    <p className="font-mono text-sm font-black text-[#0B0B0B]">
                                        Order #{cancelModalOrder._id.slice(-6).toUpperCase()}
                                    </p>
                                    <span className="rounded-full border border-[#D8D0C4] bg-[#F8F5EE] px-2.5 py-0.5 text-xs font-bold text-[#756F66]">
                                        {cancelModalOrder.orderStatus}
                                    </span>
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-[#756F66]">
                                    <p>
                                        Customer:{" "}
                                        <span className="font-semibold text-[#0B0B0B]">
                                            {cancelModalOrder.user?.fullName || "Guest"}
                                        </span>
                                    </p>
                                    <p>
                                        Total:{" "}
                                        <span className="font-semibold text-[#0B0B0B]">
                                            ₹{cancelModalOrder.totalPrice}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* Refund & Payment Impact Notice */}
                            {["Paid", "PartiallyRefunded"].includes(cancelModalOrder.paymentStatus) ? (
                                <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-4 text-xs text-amber-900">
                                    <p className="font-bold flex items-center gap-1.5 text-amber-900">
                                        <span>⚠️</span> Gateway Refund Will Be Initiated
                                    </p>
                                    <p className="mt-1 leading-relaxed text-amber-800">
                                        This order has payment status{" "}
                                        <span className="font-bold">{cancelModalOrder.paymentStatus}</span>.
                                        Cancelling will automatically initiate a refund of{" "}
                                        <span className="font-bold">
                                            ₹{Math.max(0, cancelModalOrder.totalPrice - (cancelModalOrder.amountRefunded || 0))}
                                        </span>{" "}
                                        via Razorpay. Gateway processing may be instant or pending.
                                    </p>
                                </div>
                            ) : cancelModalOrder.paymentStatus === "RefundPending" ? (
                                <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-4 text-xs text-amber-900">
                                    <p className="font-bold flex items-center gap-1.5 text-amber-900">
                                        <span>⏳</span> Refund Already Pending
                                    </p>
                                    <p className="mt-1 leading-relaxed text-amber-800">
                                        A refund for this order is currently pending processing with Razorpay.
                                    </p>
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-4 text-xs text-blue-900">
                                    <p className="font-bold flex items-center gap-1.5 text-blue-900">
                                        <span>ℹ️</span> No Gateway Refund Required
                                    </p>
                                    <p className="mt-1 leading-relaxed text-blue-800">
                                        Payment status is <span className="font-bold">{cancelModalOrder.paymentStatus}</span> (unpaid online). Cancelling will update the order status without a gateway refund.
                                    </p>
                                </div>
                            )}

                            {/* Cancellation Reason Input */}
                            <div className="pt-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#5F584F] mb-1.5">
                                    Cancellation Reason
                                </label>
                                <input
                                    type="text"
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    disabled={isCancelling}
                                    placeholder="Reason for cancellation (e.g. Kitchen unavailable)"
                                    className="w-full rounded-xl border border-[#D8D0C4] bg-white px-4 py-2.5 text-sm text-[#0B0B0B] outline-none transition focus:border-[#D4AF7C] focus:ring-2 focus:ring-[#D4AF7C]/20 disabled:opacity-60"
                                />
                            </div>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-[#E8E1D7] pt-5">
                            <button
                                type="button"
                                disabled={isCancelling}
                                onClick={closeCancelModal}
                                className="rounded-xl border border-[#D8CDBB] bg-white px-5 py-2.5 text-sm font-semibold text-[#2B1F14] transition hover:bg-[#F0E9DD] disabled:opacity-50"
                            >
                                Keep Order
                            </button>
                            <button
                                type="button"
                                disabled={isCancelling}
                                onClick={handleConfirmCancel}
                                className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-red-600/20 transition hover:bg-red-700 disabled:opacity-50 active:scale-[0.98]"
                            >
                                {isCancelling ? (
                                    <>
                                        <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Cancelling...
                                    </>
                                ) : (
                                    "Confirm Cancellation"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>

    );

}


export default AdminOrders;