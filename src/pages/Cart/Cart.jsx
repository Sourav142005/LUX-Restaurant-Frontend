import { useState, useEffect, useMemo, useCallback } from "react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
    FiAlertTriangle,
    FiCheckCircle,
    FiInfo,
    FiRefreshCw,
    FiTrash2
} from "react-icons/fi";

function getFoodImage(item) {
    if (item.image) return item.image;

    const name = (item.name || "").toLowerCase().trim();

    if (name.includes("tomato soup")) {
        return "/images/food/tomato-soup.jpg";
    }

    if (name.includes("cappuccino")) {
        return "/images/food/cappuccino.jpg";
    }

    if (
        name.includes("classic cheese") ||
        (name.includes("cheese") &&
            name.includes("tomato") &&
            name.includes("pizza"))
    ) {
        return "/images/food/cheese-tomato-pizza.jpg";
    }

    if (
        name.includes("chocolate pastry") ||
        name.includes("chocolate cake") ||
        name.includes("pastry")
    ) {
        return "/images/food/chocolate-pastry.jpg";
    }

    if (name.includes("pepsi")) {
        return "/images/food/pepsi.jpg";
    }

    return "/images/food/tomato-soup.jpg";
}

function Cart() {
    const navigate = useNavigate();

    const {
        cartItems,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount
    } = useCart();

    const [availabilityLoading, setAvailabilityLoading] = useState(false);
    const [availabilityError, setAvailabilityError] = useState("");
    const [liveMenuMap, setLiveMenuMap] = useState(null);

    const fetchAvailability = useCallback(async () => {
        if (!cartItems || cartItems.length === 0) return;

        try {
            setAvailabilityLoading(true);
            setAvailabilityError("");
            const response = await api.get("/menu");
            const menus = response.data?.menus || [];

            const map = new Map();
            menus.forEach((item) => {
                if (item._id) {
                    map.set(String(item._id), {
                        isAvailable: Boolean(item.isAvailable),
                        name: item.name
                    });
                }
            });

            setLiveMenuMap(map);
        } catch (error) {
            console.error("Cart availability check error:", error);
            // Safe failure: do not mark items unavailable or delete anything
            setAvailabilityError(
                error.response?.data?.message ||
                "Live menu availability could not be verified. Please check your network connection."
            );
        } finally {
            setAvailabilityLoading(false);
        }
    }, [cartItems]);

    useEffect(() => {
        fetchAvailability();
    }, [fetchAvailability]);

    // Match each cart item by ID to the live menu record
    const unavailableItemIds = useMemo(() => {
        if (!liveMenuMap) return new Set();

        const unavailable = new Set();
        cartItems.forEach((item) => {
            const id = String(item._id);
            const liveRecord = liveMenuMap.get(id);

            // An item is confirmed unavailable if it's explicitly marked unavailable
            // or if it was removed/deleted from the restaurant menu entirely.
            if (!liveRecord || liveRecord.isAvailable === false) {
                unavailable.add(id);
            }
        });

        return unavailable;
    }, [cartItems, liveMenuMap]);

    const hasUnavailableItems = unavailableItemIds.size > 0;

    const handleProceedToCheckout = () => {
        if (hasUnavailableItems) {
            toast.error(
                "Please remove unavailable items before proceeding to checkout."
            );
            return;
        }
        navigate("/checkout");
    };


    // =========================================
    // Empty Cart
    // =========================================

    if (cartItems.length === 0) {

        return (

            <div className="lux-container py-20">

                <div className="rounded-3xl border border-[#D8D0C4] bg-white p-12 text-center shadow-sm">

                    <div className="text-7xl mb-5">
                        🛒
                    </div>


                    <h1 className="text-3xl font-black text-[#0B0B0B]">
                        Your cart is empty
                    </h1>


                    <p className="mt-3 text-[#756F66]">
                        Looks like you haven't added anything yet.
                    </p>


                    <button
                        onClick={() =>
                            navigate("/menu")
                        }
                        className="mt-7 rounded-xl bg-[#0B0B0B] px-7 py-3 font-semibold text-white transition hover:bg-[#2B1F14]"
                    >
                        Browse Menu
                    </button>

                </div>

            </div>

        );

    }


    return (

        <div className="lux-container py-10">


            {/* ================================= */}
            {/* Header */}
            {/* ================================= */}

            <div className="mb-8">
                <p className="text-[#B88A4A] font-bold uppercase tracking-[0.18em] text-sm">
                    LUX Restaurant
                </p>

                <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h1 className="text-4xl font-black text-[#0B0B0B] md:text-5xl">
                        Your Cart
                    </h1>

                    {/* Live availability status pill */}
                    <div className="flex items-center gap-2">
                        {availabilityLoading && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF7C]/40 bg-[#FAF7F2] px-3 py-1 text-xs font-semibold text-[#8B6A3E]">
                                <span className="h-2 w-2 animate-pulse rounded-full bg-[#D4AF7C]" />
                                Verifying live availability...
                            </span>
                        )}
                        {!availabilityLoading && liveMenuMap && !hasUnavailableItems && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                                <FiCheckCircle className="text-emerald-600" size={13} />
                                All items in stock
                            </span>
                        )}
                        {!availabilityLoading && hasUnavailableItems && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
                                <FiAlertTriangle className="text-rose-600" size={13} />
                                {unavailableItemIds.size} item{unavailableItemIds.size !== 1 ? "s" : ""} unavailable
                            </span>
                        )}
                    </div>
                </div>

                <p className="mt-2 text-[#756F66]">
                    {cartCount} item{cartCount !== 1 ? "s" : ""} in your cart
                </p>
            </div>

            {/* Out of Stock Warning Banner */}
            {hasUnavailableItems && (
                <div className="mb-8 rounded-2xl border border-rose-200 bg-rose-50/90 p-5 shadow-sm">
                    <div className="flex items-start gap-3.5">
                        <FiAlertTriangle className="mt-0.5 shrink-0 text-rose-600" size={20} />
                        <div>
                            <h2 className="text-base font-bold text-rose-900">
                                Unavailable Items in Your Cart
                            </h2>
                            <p className="mt-1 text-sm text-rose-700 leading-relaxed">
                                {unavailableItemIds.size === 1
                                    ? "An item in your cart is currently out of stock at LUX. You must remove it before you can proceed to checkout."
                                    : `${unavailableItemIds.size} items in your cart are currently out of stock at LUX. You must remove them before you can proceed to checkout.`}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Availability Error / Safe Fallback Notice Banner */}
            {availabilityError && !hasUnavailableItems && (
                <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50/90 p-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <FiInfo className="mt-0.5 shrink-0 text-amber-600" size={19} />
                            <div>
                                <h2 className="text-sm font-bold text-amber-900">
                                    Live Availability Notice
                                </h2>
                                <p className="mt-1 text-xs sm:text-sm text-amber-700 leading-relaxed">
                                    {availabilityError} Your existing cart items and quantities are safely preserved.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={fetchAvailability}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-3.5 py-2 text-xs font-bold text-amber-900 shadow-sm transition hover:bg-amber-100 active:scale-95"
                        >
                            <FiRefreshCw size={13} className={availabilityLoading ? "animate-spin" : ""} />
                            Retry Availability Check
                        </button>
                    </div>
                </div>
            )}


            {/* ================================= */}
            {/* Main Layout */}
            {/* ================================= */}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">


                {/* ================================= */}
                {/* Cart Items */}
                {/* ================================= */}

                <div className="lg:col-span-2 space-y-5">


                    {cartItems.map(item => {
                        const isUnavailable = unavailableItemIds.has(String(item._id));

                        return (
                            <div
                                key={item._id}
                                className={`rounded-3xl border p-5 shadow-sm transition-all ${
                                    isUnavailable
                                        ? "border-rose-300 bg-rose-50/25 shadow-rose-100/50"
                                        : "border-[#D8D0C4] bg-white hover:border-[#D4AF7C]/50 hover:shadow-lg"
                                }`}
                            >
                                <div className="flex flex-col sm:flex-row gap-5">

                                    {/* Image */}
                                    <div className="relative w-full sm:w-32 h-28 flex-shrink-0">
                                        <img
                                            src={getFoodImage(item)}
                                            alt={item.name}
                                            className={`w-full h-full object-cover rounded-xl ${
                                                isUnavailable ? "opacity-60 grayscale-[25%]" : ""
                                            }`}
                                        />
                                        {isUnavailable && (
                                            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 backdrop-blur-[1px]">
                                                <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow">
                                                    Out of stock
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1">
                                        <div className="flex justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h2 className="text-xl font-black text-[#0B0B0B]">
                                                        {item.name}
                                                    </h2>
                                                    {isUnavailable && (
                                                        <span className="rounded-full border border-rose-200 bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                                                            Currently unavailable
                                                        </span>
                                                    )}
                                                </div>

                                                {item.category?.name && (
                                                    <p className="mt-1 text-sm font-semibold text-[#B88A4A]">
                                                        {item.category.name}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Veg */}
                                            <span
                                                className={`h-fit px-2.5 py-1 rounded-full text-xs font-bold ${
                                                    item.isVeg
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-red-100 text-red-700"
                                                }`}
                                            >
                                                {item.isVeg ? "VEG" : "NON-VEG"}
                                            </span>
                                        </div>

                                        {/* Price */}
                                        <p className="mt-2 text-sm text-[#756F66]">
                                            ₹{Number(item.price).toLocaleString("en-IN")}{" "}per item
                                        </p>

                                        {/* Unavailable Item Banner */}
                                        {isUnavailable && (
                                            <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700">
                                                <div className="flex items-start gap-2">
                                                    <FiAlertTriangle className="mt-0.5 shrink-0 text-rose-600" size={14} />
                                                    <p className="leading-snug">
                                                        This dish is currently unavailable and must be removed to proceed to checkout.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Bottom */}
                                        <div className="flex flex-wrap items-center justify-between gap-4 mt-5">

                                            {/* Quantity */}
                                            <div className="flex items-center overflow-hidden rounded-xl border border-[#D8D0C4]">
                                                <button
                                                    type="button"
                                                    onClick={() => decreaseQuantity(item._id)}
                                                    aria-label={`Decrease quantity of ${item.name}`}
                                                    className="h-10 w-10 bg-[#F3EFE8] text-lg font-bold text-[#2B1F14] hover:bg-[#D4AF7C]/20"
                                                >
                                                    −
                                                </button>

                                                <span className="w-12 text-center font-bold">
                                                    {item.quantity}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() => increaseQuantity(item._id)}
                                                    disabled={isUnavailable}
                                                    aria-label={`Increase quantity of ${item.name}`}
                                                    className={`h-10 w-10 text-lg font-bold transition ${
                                                        isUnavailable
                                                            ? "cursor-not-allowed bg-[#EEEAE3] text-[#AAA49B]"
                                                            : "bg-[#F3EFE8] text-[#2B1F14] hover:bg-[#D4AF7C]/20"
                                                    }`}
                                                >
                                                    +
                                                </button>
                                            </div>

                                            {/* Item Total */}
                                            <p className="text-xl font-black text-[#0B0B0B]">
                                                ₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}
                                            </p>

                                            {/* Remove actions */}
                                            {isUnavailable ? (
                                                <button
                                                    type="button"
                                                    onClick={() => removeFromCart(item._id)}
                                                    aria-label={`Remove unavailable item ${item.name}`}
                                                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700 active:scale-95"
                                                >
                                                    <FiTrash2 size={13} />
                                                    Remove Item
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => removeFromCart(item._id)}
                                                    className="text-sm font-semibold text-red-500 hover:text-red-700"
                                                >
                                                    Remove
                                                </button>
                                            )}

                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}


                    {/* Clear Cart */}

                    <button
                        onClick={() => {

                            const confirmed =
                                window.confirm(
                                    "Are you sure you want to clear your cart?"
                                );

                            if (confirmed) {
                                clearCart();
                            }

                        }}
                        className="font-semibold text-red-500 hover:text-red-700"
                    >
                        Clear entire cart
                    </button>

                </div>


                {/* ================================= */}
                {/* Order Summary */}
                {/* ================================= */}

                <div className="lg:col-span-1">

                    <div className="sticky rounded-3xl border border-[#D8D0C4] bg-white p-6 shadow-sm lg:top-6">


                        <h2 className="text-2xl font-black text-[#0B0B0B]">
                            Order Summary
                        </h2>


                        <div className="mt-6 space-y-4">


                            {/* Items */}

                            <div className="flex justify-between text-gray-600">

                                <span>
                                    Items
                                </span>

                                <span>
                                    {cartCount}
                                </span>

                            </div>


                            {/* Subtotal */}

                            <div className="flex justify-between text-gray-600">

                                <span>
                                    Subtotal
                                </span>

                                <span>
                                    ₹{cartTotal.toLocaleString("en-IN")}
                                </span>

                            </div>


                            {/* Tax */}

                            <div className="flex justify-between text-gray-600">

                                <span>
                                    Taxes
                                </span>

                                <span>
                                    Included
                                </span>

                            </div>


                            <div className="border-t border-[#E8E1D7] pt-4">

                                <div className="flex justify-between items-center">

                                    <span className="text-lg font-semibold">
                                        Total
                                    </span>

                                    <span className="text-2xl font-black text-[#B88A4A]">
                                        ₹{cartTotal.toLocaleString("en-IN")}
                                    </span>

                                </div>

                            </div>

                        </div>


                        {/* Order Type */}

                        <div className="mt-6 rounded-2xl border border-[#D4AF7C]/30 bg-[#D4AF7C]/10 p-4">

                            <p className="text-sm font-semibold text-[#8B6A3E]">
                                Order Type
                            </p>

                            <p className="font-bold mt-1">
                                🍽️ Dine-In
                            </p>

                        </div>


                        {/* Out of stock notice in summary */}
                        {hasUnavailableItems && (
                            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700">
                                <div className="flex items-start gap-2">
                                    <FiAlertTriangle size={15} className="shrink-0 text-rose-600 mt-0.5" />
                                    <p className="leading-relaxed">
                                        Your cart contains unavailable items. Remove them to enable checkout.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Checkout */}
                        <button
                            type="button"
                            onClick={handleProceedToCheckout}
                            disabled={hasUnavailableItems || availabilityLoading}
                            aria-disabled={hasUnavailableItems || availabilityLoading}
                            className={`mt-6 w-full rounded-xl py-3.5 text-lg font-bold transition ${
                                hasUnavailableItems || availabilityLoading
                                    ? "cursor-not-allowed bg-[#EEEAE3] text-[#AAA49B] shadow-none"
                                    : "bg-[#0B0B0B] text-white shadow-lg shadow-black/10 hover:bg-[#2B1F14] active:scale-[0.98]"
                            }`}
                        >
                            {availabilityLoading ? (
                                <span className="inline-flex items-center justify-center gap-2">
                                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#AAA49B] border-t-transparent" />
                                    Checking availability...
                                </span>
                            ) : hasUnavailableItems ? (
                                "Remove unavailable items"
                            ) : (
                                "Proceed to Checkout →"
                            )}
                        </button>


                        {/* Continue Shopping */}

                        <button
                            onClick={() =>
                                navigate("/menu")
                            }
                            className="mt-3 w-full rounded-xl border border-[#D8D0C4] py-3 font-semibold text-[#2B1F14] hover:border-[#D4AF7C] hover:bg-[#D4AF7C]/10"
                        >
                            Continue Shopping
                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default Cart;