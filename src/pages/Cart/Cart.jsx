import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
// import api from "../../services/api";
// import toast from "react-hot-toast";

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


    // =========================================
    // Checkout
    // =========================================

    // const handleCheckout = async () => {

    //     // Empty cart protection
    //     if (cartItems.length === 0) {

    //         toast.error(
    //             "Your cart is empty"
    //         );

    //         return;

    //     }


    //     // Authentication protection
    //     const token =
    //         localStorage.getItem("token");

    //     if (!token) {

    //         toast.error(
    //             "Please login before checkout"
    //         );

    //         navigate("/login");

    //         return;

    //     }


    //     try {

    //         const orderData = {

    //             items: cartItems.map(item => ({

    //                 menu: item._id,
    //                 quantity: item.quantity

    //             })),

    //             orderType: "Dine-In"

    //         };


    //         const response =
    //             await api.post(
    //                 "/order",
    //                 orderData
    //             );


    //         toast.success(
    //             response.data.message ||
    //             "Order placed successfully"
    //         );


    //         clearCart();

    //         navigate("/orders");

    //     } catch (error) {

    //         console.error(
    //             "Checkout Error:",
    //             error
    //         );


    //         // Invalid/expired token
    //         if (error.response?.status === 401) {

    //             toast.error(
    //                 "Session expired. Please login again."
    //             );

    //             localStorage.removeItem("token");

    //             navigate("/login");

    //             return;

    //         }


    //         toast.error(
    //             error.response?.data?.message ||
    //             "Checkout failed"
    //         );

    //     }

    // };


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

                <h1 className="mt-1 text-4xl font-black text-[#0B0B0B] md:text-5xl">
                    Your Cart
                </h1>

                <p className="mt-2 text-[#756F66]">
                    {cartCount} item
                    {cartCount !== 1 ? "s" : ""} in your cart
                </p>

            </div>


            {/* ================================= */}
            {/* Main Layout */}
            {/* ================================= */}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">


                {/* ================================= */}
                {/* Cart Items */}
                {/* ================================= */}

                <div className="lg:col-span-2 space-y-5">


                    {cartItems.map(item => (

                        <div
                            key={item._id}
                            className="rounded-3xl border border-[#D8D0C4] bg-white p-5 shadow-sm transition-all hover:border-[#D4AF7C]/50 hover:shadow-lg"                        >

                            <div className="flex flex-col sm:flex-row gap-5">


                                {/* Image */}

                                <div className="w-full sm:w-32 h-28 flex-shrink-0">

                                    <img
                                        src={getFoodImage(item)}
                                        alt={item.name}
                                        className="w-full h-full object-cover rounded-xl"
                                    />

                                </div>


                                {/* Details */}

                                <div className="flex-1">

                                    <div className="flex justify-between gap-4">

                                        <div>

                                            <h2 className="text-xl font-black text-[#0B0B0B]">
                                                {item.name}
                                            </h2>


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
                                            {item.isVeg
                                                ? "VEG"
                                                : "NON-VEG"}
                                        </span>

                                    </div>


                                    {/* Price */}

                                    <p className="mt-2 text-sm text-[#756F66]">
                                        ₹{Number(item.price).toLocaleString("en-IN")}
                                        {" "}per item
                                    </p>


                                    {/* Bottom */}

                                    <div className="flex flex-wrap items-center justify-between gap-4 mt-5">


                                        {/* Quantity */}

                                        <div className="flex items-center overflow-hidden rounded-xl border border-[#D8D0C4]">

                                            <button
                                                onClick={() =>
                                                    decreaseQuantity(
                                                        item._id
                                                    )
                                                }
                                                className="h-10 w-10 bg-[#F3EFE8] text-lg font-bold text-[#2B1F14] hover:bg-[#D4AF7C]/20"
                                            >
                                                −
                                            </button>


                                            <span className="w-12 text-center font-bold">
                                                {item.quantity}
                                            </span>


                                            <button
                                                onClick={() =>
                                                    increaseQuantity(
                                                        item._id
                                                    )
                                                }
                                                className="h-10 w-10 bg-[#F3EFE8] text-lg font-bold text-[#2B1F14] hover:bg-[#D4AF7C]/20"
                                            >
                                                +
                                            </button>

                                        </div>


                                        {/* Item Total */}

                                        <p className="text-xl font-black text-[#0B0B0B]">

                                            ₹
                                            {(
                                                Number(item.price) *
                                                item.quantity
                                            ).toLocaleString("en-IN")}

                                        </p>


                                        {/* Remove */}

                                        <button
                                            onClick={() =>
                                                removeFromCart(
                                                    item._id
                                                )
                                            }
                                            className="text-sm font-semibold text-red-500 hover:text-red-700"
                                        >
                                            Remove
                                        </button>

                                    </div>

                                </div>

                            </div>

                        </div>

                    ))}


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


                        {/* Checkout */}

                        <button
                            onClick={() => navigate("/checkout")}
                            className="mt-6 w-full rounded-xl bg-[#0B0B0B] py-3.5 text-lg font-bold text-white shadow-lg shadow-black/10 transition hover:bg-[#2B1F14] active:scale-[0.98]"
                        >
                            Proceed to Checkout →
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