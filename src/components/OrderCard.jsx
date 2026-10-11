import { useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

const getFoodImage = (item) => {
    if (item.menu?.image) {
        return item.menu.image;
    }

    const imageMap = {
        "Tomato Soup": "/images/food/tomato-soup.jpg",
        "Cappuccino": "/images/food/cappuccino.jpg",
        "Classic Cheese & Tomato Pizza":
            "/images/food/cheese-tomato-pizza.jpg",
        "Chocolate Pastry":
            "/images/food/chocolate-pastry.jpg",
        Pepsi: "/images/food/pepsi.jpg",
    };

    return imageMap[item.menu?.name] || null;
};

function OrderCard({ order, refreshOrders }) {

    // ==================================================
    // State
    // ==================================================

    const [cancelling, setCancelling] = useState(false);

    const [paying, setPaying] = useState(false);

    const [closingTable, setClosingTable] = useState(false);

    const [tableClosed, setTableClosed] = useState(
        order.tableClosed === true
    );


    // ==================================================
    // Order Status Badge
    // ==================================================

    const getStatusClass = () => {

        switch (order.orderStatus) {

            case "Scheduled":
                return "text-blue-700 bg-blue-100";

            case "Pending":
                return "text-yellow-700 bg-yellow-100";

            case "Preparing":
                return "text-orange-700 bg-orange-100";

            case "Ready":
                return "text-purple-700 bg-purple-100";

            case "Delivered":
                return "text-green-700 bg-green-100";

            case "Cancelled":
                return "text-red-700 bg-red-100";

            default:
                return "text-gray-700 bg-gray-100";
        }

    };


    // ==================================================
    // Payment Status Badge
    // ==================================================

    const getPaymentClass = () => {

        switch (order.paymentStatus) {

            case "Paid":
                return "text-green-700 bg-green-100";

            case "Pending":
                return "text-yellow-700 bg-yellow-100";

            case "Failed":
                return "text-red-700 bg-red-100";

            default:
                return "text-gray-700 bg-gray-100";
        }

    };


    // ==================================================
    // Cancel Order
    // ==================================================

    const handleCancel = async () => {

        if (cancelling) return;


        const confirmed =
            window.confirm(
                "Are you sure you want to cancel this order?"
            );


        if (!confirmed) return;


        try {

            setCancelling(true);


            await api.patch(
                `/order/${order._id}/cancel`
            );


            toast.success(
                "Order cancelled successfully"
            );


            if (refreshOrders) {

                await refreshOrders();

            }


        } catch (error) {

            console.error(
                "Cancel Order Error:",
                error
            );


            toast.error(
                error.response?.data?.message ||
                "Failed to cancel order"
            );


        } finally {

            setCancelling(false);

        }

    };


    // ==================================================
    // Razorpay Payment
    // ==================================================

    const handlePayment = async () => {

        if (paying) return;


        try {

            setPaying(true);


            // ==================================================
            // Check Razorpay SDK
            // ==================================================

            if (!window.Razorpay) {

                toast.error(
                    "Razorpay is not loaded. Please refresh the page."
                );

                setPaying(false);

                return;

            }


            // ==================================================
            // Create Razorpay Order
            // ==================================================

            const response =
                await api.post(
                    `/order/${order._id}/payment`
                );


            const paymentOrder =
                response.data;


            // ==================================================
            // Open Razorpay Checkout
            // ==================================================

            const options = {

                key:
                    paymentOrder.key ||
                    import.meta.env.VITE_RAZORPAY_KEY_ID,


                amount:
                    paymentOrder.amount,


                currency:
                    paymentOrder.currency ||
                    "INR",


                name:
                    "LUX Restaurant",


                description:
                    `Payment for Order #${order._id.slice(-6)}`,


                order_id:
                    paymentOrder.razorpayOrderId,


                handler:
                    async function (
                        paymentResponse
                    ) {

                        try {

                            // ==================================================
                            // Verify Payment
                            // ==================================================

                            await api.post(
                                `/order/${order._id}/payment/verify`,
                                {

                                    razorpay_order_id:
                                        paymentResponse.razorpay_order_id,

                                    razorpay_payment_id:
                                        paymentResponse.razorpay_payment_id,

                                    razorpay_signature:
                                        paymentResponse.razorpay_signature

                                }
                            );


                            toast.success(
                                "Payment successful!"
                            );


                            // ==================================================
                            // Refresh Order
                            // ==================================================

                            if (refreshOrders) {

                                await refreshOrders();

                            }


                        } catch (error) {

                            console.error(
                                "Payment Verification Error:",
                                error
                            );


                            toast.error(
                                error.response?.data?.message ||
                                "Payment verification failed"
                            );

                        } finally {

                            setPaying(false);

                        }

                    },


                prefill: {

                    name:
                        order.user?.name ||
                        "",

                    email:
                        order.user?.email ||
                        ""

                },


                theme: {

                    color:
                        "#f97316"

                },


                modal: {

                    ondismiss: function () {

                        setPaying(false);

                    }

                }

            };


            const razorpay =
                new window.Razorpay(
                    options
                );


            razorpay.on(
                "payment.failed",
                function () {

                    toast.error(
                        "Payment failed. Please try again."
                    );

                    setPaying(false);

                }
            );


            razorpay.open();


        } catch (error) {

            console.error(
                "Payment Error:",
                error
            );


            toast.error(
                error.response?.data?.message ||
                "Unable to start payment"
            );


            setPaying(false);

        }

    };


    // ==================================================
    // Close Table / Finish Dining
    // ==================================================

    const handleCloseTable = async () => {

        if (closingTable) return;


        const confirmed =
            window.confirm(
                "Have you finished your meal and are you ready to leave the table?"
            );


        if (!confirmed) return;


        try {

            setClosingTable(true);


            await api.post(
                `/order/${order._id}/close-table`
            );


            // ==================================================
            // IMPORTANT
            // ==================================================
            // Do NOT refresh the entire order list here.
            //
            // Updating local state immediately prevents the
            // Finish & Leave Table button from appearing again.
            // ==================================================

            setTableClosed(true);


            toast.success(
                "Table closed. Thank you for dining with LUX!"
            );


        } catch (error) {

            console.error(
                "Close Table Error:",
                error
            );


            toast.error(
                error.response?.data?.message ||
                "Unable to close the table"
            );


        } finally {

            setClosingTable(false);

        }

    };


    // ==================================================
    // Format Date
    // ==================================================

    const formatDate = (date) => {

        if (!date) return "";


        const parsedDate =
            new Date(date);


        if (
            isNaN(
                parsedDate.getTime()
            )
        ) {

            return "";

        }


        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );

    };


    // ==================================================
    // Format Order Date
    // ==================================================

    const formatOrderDate = (date) => {

        if (!date) return "";


        const parsedDate =
            new Date(date);


        if (
            isNaN(
                parsedDate.getTime()
            )
        ) {

            return "";

        }


        return parsedDate.toLocaleString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    };


    // ==================================================
    // Get Reservation Table
    // ==================================================

    const reservationTable =
        order.reservation?.table?.tableNumber;


    const orderTable =
        order.table?.tableNumber;


    // ==================================================
    // Determine Cancellation Availability
    // ==================================================

    const canCancel =
        order.orderStatus === "Pending" ||
        order.orderStatus === "Scheduled";


    // ==================================================
    // Determine Online Payment Availability
    // ==================================================

    const canPayOnline =
        order.orderType === "Dine-In" &&
        order.orderStatus === "Delivered" &&
        order.paymentStatus === "Pending";


    // ==================================================
    // Determine Finish Dining Availability
    // ==================================================

    const canCloseTable =
        order.orderType === "Dine-In" &&
        order.orderStatus === "Delivered" &&
        order.paymentStatus === "Paid" &&
        !!order.table &&
        !tableClosed;


    // ==================================================
    // Render
    // ==================================================

    return (

        <div className="bg-white border rounded-2xl shadow-sm hover:shadow-md transition p-6">


            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">

                <div>

                    <p className="text-sm text-gray-500">
                        LUX Restaurant
                    </p>


                    <h2 className="text-xl font-bold mt-1">
                        Order #{order._id?.slice(-6)}
                    </h2>


                    {order.createdAt && (

                        <p className="text-sm text-gray-500 mt-1">

                            {formatOrderDate(
                                order.createdAt
                            )}

                        </p>

                    )}

                </div>


                <div className="flex flex-wrap gap-2">

                    <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusClass()}`}
                    >

                        {order.orderStatus}

                    </span>


                    <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getPaymentClass()}`}
                    >

                        {order.paymentStatus}

                    </span>

                </div>

            </div>


            {/* ==================================================
                ORDER INFORMATION
            ================================================== */}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">


                {/* Order Type */}

                <div className="bg-gray-50 rounded-xl p-4">

                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Order Type
                    </p>

                    <p className="font-semibold mt-1">
                        {order.orderType}
                    </p>

                </div>


                {/* Payment */}

                <div className="bg-gray-50 rounded-xl p-4">

                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Payment
                    </p>

                    <p className="font-semibold mt-1">
                        {order.paymentStatus}
                    </p>

                </div>


                {/* Total */}

                <div className="bg-gray-50 rounded-xl p-4">

                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Total
                    </p>

                    <p className="font-bold text-lg text-orange-600 mt-1">

                        ₹
                        {Number(
                            order.totalPrice || 0
                        ).toLocaleString("en-IN")}

                    </p>

                </div>

            </div>


            {/* ==================================================
                PAY ONLINE
            ================================================== */}

            {canPayOnline && (

                <div className="mt-5 bg-orange-50 border border-orange-200 rounded-xl p-5">

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                        <div>

                            <h3 className="font-semibold text-orange-800 text-lg">

                                💳 Ready to Pay

                            </h3>


                            <p className="text-sm text-orange-700 mt-1">

                                Your food has been delivered.
                                Pay from your device before leaving.

                            </p>

                        </div>


                        <button
                            type="button"
                            onClick={handlePayment}
                            disabled={paying}
                            className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition"
                        >

                            {paying
                                ? "Opening Payment..."
                                : `💳 Pay ₹${Number(
                                    order.totalPrice || 0
                                ).toLocaleString("en-IN")}`
                            }

                        </button>

                    </div>

                </div>

            )}


            {/* ==================================================
                RAZORPAY PAYMENT INFORMATION
            ================================================== */}

            {order.paymentStatus === "Paid" &&
                order.razorpayPaymentId && (

                    <div className="mt-5 bg-green-50 border border-green-200 rounded-xl p-4">

                        <div className="flex items-center gap-2">

                            <span className="text-xl">
                                ✓
                            </span>

                            <h3 className="font-semibold text-green-800">
                                Payment Successful
                            </h3>

                        </div>


                        <p className="text-sm text-green-700 mt-2 break-all">

                            Payment ID:{" "}

                            <span className="font-medium">

                                {order.razorpayPaymentId}

                            </span>

                        </p>

                    </div>

                )}


            {/* ==================================================
                RESERVATION INFORMATION
            ================================================== */}

            {order.orderType === "Dine-In" &&
                order.reservation && (

                    <div className="mt-5 bg-blue-50 border border-blue-200 rounded-xl p-5">

                        <h3 className="font-semibold text-blue-800 text-lg">
                            🪑 Reservation Details
                        </h3>


                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-sm text-blue-700">


                            {/* Table */}

                            <div>

                                <span className="font-medium">
                                    Table:
                                </span>{" "}

                                Table{" "}
                                {orderTable ||
                                    reservationTable ||
                                    "Assigned at reservation time"}

                            </div>


                            {/* Date */}

                            <div>

                                <span className="font-medium">
                                    Date:
                                </span>{" "}

                                {formatDate(
                                    order.reservation
                                        .reservationDate
                                )}

                            </div>


                            {/* Time */}

                            <div>

                                <span className="font-medium">
                                    Time:
                                </span>{" "}

                                {order.reservation.startTime}

                                {" - "}

                                {order.reservation.endTime}

                            </div>


                            {/* Guests */}

                            <div>

                                <span className="font-medium">
                                    Guests:
                                </span>{" "}

                                {order.reservation.guests}

                            </div>

                        </div>

                    </div>

                )}


            {/* ==================================================
                ORDER ITEMS
            ================================================== */}

            <div className="mt-6">

                <h3 className="font-semibold text-lg">
                    Ordered Items
                </h3>


                <div className="mt-3 space-y-3">

                    {order.items?.map(
                        (item, index) => (

                            <div
                                key={
                                    item._id ||
                                    index
                                }
                                className="flex items-center justify-between gap-4 border-b last:border-b-0 pb-3 last:pb-0"
                            >

                                <div className="flex items-center gap-3">

                                    {getFoodImage(item) ? (
                                        <img
                                            src={getFoodImage(item)}
                                            alt={item.menu?.name || "Menu item"}
                                            className="w-12 h-12 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                            🍽️
                                        </div>
                                    )}


                                    <div>

                                        <p className="font-medium">

                                            {item.menu?.name ||
                                                "Menu item"}

                                        </p>


                                        <p className="text-sm text-gray-500">

                                            ₹
                                            {Number(
                                                item.price || 0
                                            ).toLocaleString(
                                                "en-IN"
                                            )}

                                            {" × "}

                                            {item.quantity}

                                        </p>

                                    </div>

                                </div>


                                <p className="font-semibold">

                                    ₹
                                    {Number(
                                        item.price || 0
                                    ).toLocaleString(
                                        "en-IN"
                                    )}

                                </p>

                            </div>

                        )
                    )}

                </div>

            </div>


            {/* ==================================================
                ORDER STATUS INFORMATION
            ================================================== */}

            {order.orderStatus === "Scheduled" && (

                <div className="mt-5 bg-blue-50 border border-blue-200 rounded-xl p-4">

                    <p className="font-semibold text-blue-800">
                        ⏰ Order Scheduled
                    </p>

                    <p className="text-sm text-blue-700 mt-1">

                        Your order will be processed
                        when your reservation becomes
                        active.

                    </p>

                </div>

            )}


            {order.orderStatus === "Preparing" && (

                <div className="mt-5 bg-orange-50 border border-orange-200 rounded-xl p-4">

                    <p className="font-semibold text-orange-800">
                        👨‍🍳 Your food is being prepared
                    </p>

                    <p className="text-sm text-orange-700 mt-1">

                        The restaurant is currently
                        preparing your order.

                    </p>

                </div>

            )}


            {order.orderStatus === "Ready" && (

                <div className="mt-5 bg-purple-50 border border-purple-200 rounded-xl p-4">

                    <p className="font-semibold text-purple-800">
                        🔔 Your order is ready
                    </p>

                    <p className="text-sm text-purple-700 mt-1">

                        Your order is ready to be served
                        or collected.

                    </p>

                </div>

            )}


            {order.orderStatus === "Delivered" && (

                <div className="mt-5 bg-green-50 border border-green-200 rounded-xl p-4">

                    <p className="font-semibold text-green-800">

                        ✓ Order Delivered

                    </p>

                    <p className="text-sm text-green-700 mt-1">

                        Your food has been delivered.
                        Please complete your meal before leaving.

                    </p>

                </div>

            )}


            {order.orderStatus === "Cancelled" && (

                <div className="mt-5 bg-red-50 border border-red-200 rounded-xl p-4">

                    <p className="font-semibold text-red-800">
                        ✕ Order Cancelled
                    </p>

                    <p className="text-sm text-red-700 mt-1">

                        This order has been cancelled.

                    </p>

                </div>

            )}


            {/* ==================================================
                ACTIONS
            ================================================== */}

            {canCancel && (

                <div className="mt-6 flex justify-end">

                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={cancelling}
                        className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-semibold transition"
                    >

                        {cancelling
                            ? "Cancelling..."
                            : "Cancel Order"}

                    </button>

                </div>

            )}


            {/* ==================================================
                FINISH DINING / CLOSE TABLE
            ================================================== */}

            {canCloseTable && (

                <div className="mt-5 bg-green-50 border border-green-200 rounded-xl p-5">

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                        <div>

                            <h3 className="font-semibold text-green-800 text-lg">

                                🍽️ Finished Your Meal?

                            </h3>

                            <p className="text-sm text-green-700 mt-1">

                                Your payment is complete.
                                Tap the button when you are ready to leave.

                            </p>

                        </div>


                        <button
                            type="button"
                            onClick={handleCloseTable}
                            disabled={closingTable}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition whitespace-nowrap"
                        >

                            {closingTable
                                ? "Closing Table..."
                                : "✓ Finish & Leave Table"
                            }

                        </button>

                    </div>

                </div>

            )}

        </div>

    );

}


export default OrderCard;