import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import OrderCard from "../../components/OrderCard";

function Orders() {

    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [filter, setFilter] = useState("All");


    // =========================================
    // Fetch Orders
    // =========================================

    const fetchOrders = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await api.get("/order/my");

            setOrders(
                response.data.orders || []
            );

        } catch (error) {

            console.error(
                "Fetch Orders Error:",
                error
            );

            if (error.response?.status === 401) {

                setError(
                    "Your session has expired. Please login again."
                );

            } else {

                setError(
                    error.response?.data?.message ||
                    "Failed to load orders."
                );

            }

        } finally {

            setLoading(false);

        }

    };

    const handleOrderUpdate = (updatedOrder) => {
        setOrders(currentOrders =>
            currentOrders.map(order =>
                order._id === updatedOrder._id
                    ? updatedOrder
                    : order
            )
        );
    };


    // =========================================
    // Initial Load
    // =========================================

    useEffect(() => {

        fetchOrders();

    }, []);


    // =========================================
    // Filter Orders
    // =========================================

    const filteredOrders = orders.filter(order => {

        if (filter === "All") {
            return true;
        }

        return order.orderStatus === filter;

    });


    // =========================================
    // Statistics
    // =========================================

    const activeOrders =
    orders.filter(order =>
        [
            "Scheduled",
            "Pending",
            "Preparing",
            "Ready"
        ].includes(order.orderStatus)
    ).length;


    const completedOrders =
        orders.filter(order =>
            order.orderStatus === "Delivered"
        ).length;


    const cancelledOrders =
        orders.filter(order =>
            order.orderStatus === "Cancelled"
        ).length;


    // =========================================
    // Loading
    // =========================================

    if (loading) {

        return (

            <div className="max-w-6xl mx-auto px-4 py-20">

                <div className="text-center">

                    <div className="text-5xl mb-4">
                        📦
                    </div>

                    <p className="text-gray-500 text-lg">
                        Loading your orders...
                    </p>

                </div>

            </div>

        );

    }


    // =========================================
    // Error
    // =========================================

    if (error) {

        return (

            <div className="max-w-6xl mx-auto px-4 py-20">

                <div className="bg-red-50 border border-red-200 rounded-2xl p-10 text-center">

                    <div className="text-5xl mb-4">
                        ⚠️
                    </div>

                    <h2 className="text-2xl font-bold text-red-700">
                        Unable to load orders
                    </h2>

                    <p className="text-red-600 mt-2">
                        {error}
                    </p>


                    <div className="flex justify-center gap-3 mt-6">

                        <button
                            onClick={fetchOrders}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold"
                        >
                            Try Again
                        </button>


                        {error.includes("login") && (

                            <button
                                onClick={() =>
                                    navigate("/login")
                                }
                                className="border border-gray-300 hover:bg-gray-100 px-6 py-3 rounded-xl font-semibold"
                            >
                                Login
                            </button>

                        )}

                    </div>

                </div>

            </div>

        );

    }


    // =========================================
    // Empty Orders
    // =========================================

    if (orders.length === 0) {

        return (

            <div className="max-w-6xl mx-auto px-4 py-20">

                <div className="bg-white border rounded-2xl shadow-sm p-12 text-center">

                    <div className="text-7xl mb-5">
                        📦
                    </div>

                    <h1 className="text-3xl font-bold">
                        No orders yet
                    </h1>

                    <p className="text-gray-500 mt-3">
                        Your delicious journey starts with your first order.
                    </p>

                    <button
                        onClick={() =>
                            navigate("/menu")
                        }
                        className="mt-7 bg-orange-500 hover:bg-orange-600 text-white px-7 py-3 rounded-xl font-semibold"
                    >
                        Browse Menu
                    </button>

                </div>

            </div>

        );

    }


    return (

        <div className="max-w-6xl mx-auto px-4 py-10">


            {/* ================================= */}
            {/* Header */}
            {/* ================================= */}

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">

                <div>

                    <p className="text-orange-500 font-semibold uppercase tracking-wide text-sm">
                        LUX Restaurant
                    </p>

                    <h1 className="text-4xl md:text-5xl font-bold mt-1">
                        My Orders
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Track and manage your restaurant orders.
                    </p>

                </div>


                <button
                    onClick={fetchOrders}
                    className="border border-gray-300 hover:bg-gray-100 px-5 py-2.5 rounded-lg font-medium"
                >
                    ↻ Refresh
                </button>

            </div>


            {/* ================================= */}
            {/* Statistics */}
            {/* ================================= */}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">


                <div className="bg-orange-50 border border-orange-100 rounded-xl p-5">

                    <p className="text-orange-700">
                        Active Orders
                    </p>

                    <p className="text-3xl font-bold mt-1">
                        {activeOrders}
                    </p>

                </div>


                <div className="bg-green-50 border border-green-100 rounded-xl p-5">

                    <p className="text-green-700">
                        Completed
                    </p>

                    <p className="text-3xl font-bold mt-1">
                        {completedOrders}
                    </p>

                </div>


                <div className="bg-red-50 border border-red-100 rounded-xl p-5">

                    <p className="text-red-700">
                        Cancelled
                    </p>

                    <p className="text-3xl font-bold mt-1">
                        {cancelledOrders}
                    </p>

                </div>

            </div>


            {/* ================================= */}
            {/* Status Filters */}
            {/* ================================= */}

            <div className="flex gap-2 overflow-x-auto pb-2 mb-7">

                {[
                    "All",
                    "Scheduled",
                    "Pending",
                    "Preparing",
                    "Ready",
                    "Delivered",
                    "Cancelled"
                ].map(status => (

                    <button
                        key={status}
                        onClick={() =>
                            setFilter(status)
                        }
                        className={`whitespace-nowrap px-5 py-2.5 rounded-full font-medium transition ${
                            filter === status
                                ? "bg-orange-500 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        {status}
                    </button>

                ))}

            </div>


            {/* ================================= */}
            {/* Result */}
            {/* ================================= */}

            {filteredOrders.length === 0 ? (

                <div className="bg-white border rounded-2xl p-10 text-center">

                    <div className="text-5xl mb-4">
                        📦
                    </div>

                    <h2 className="text-xl font-bold">
                        No {filter.toLowerCase()} orders
                    </h2>

                    <p className="text-gray-500 mt-2">
                        There are no orders with this status.
                    </p>

                </div>

            ) : (

                <div className="space-y-6">

                    {filteredOrders.map(order => (

                        <OrderCard
                            key={order._id}
                            order={order}
                            refreshOrders={fetchOrders}
                            onOrderUpdate={handleOrderUpdate}
                        />

                    ))}

                </div>

            )}

        </div>

    );

}

export default Orders;