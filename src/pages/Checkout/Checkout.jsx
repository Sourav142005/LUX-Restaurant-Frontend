import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";



import { useCart } from "../../context/CartContext";

import api from "../../services/api";



function Checkout() {

    const navigate = useNavigate();



    const {

        cartItems,

        cartTotal,

        cartCount,

        clearCart,

        dineInContext,

        clearDineInContext,

        clearCartAndDineInContext

    } = useCart();



    // ======================================================

    // State

    // ======================================================



    const [orderType, setOrderType] = useState("Dine-In");



    const [reservations, setReservations] = useState([]);



    const [selectedReservation, setSelectedReservation] =

        useState("");



    const [loadingReservations, setLoadingReservations] =

        useState(false);



    const [placingOrder, setPlacingOrder] =

        useState(false);



    const [paymentLoading, setPaymentLoading] =

        useState(false);



    // ======================================================

    // Fetch My Reservations

    // ======================================================



    const fetchReservations = async () => {

        try {

            setLoadingReservations(true);



            const response =

                await api.get("/reservation/my");



            const allReservations =

                response.data?.reservations || [];



            const usableReservations =

                allReservations.filter(

                    (reservation) =>

                        reservation.status === "Confirmed"

                );



            setReservations(

                usableReservations

            );



        } catch (error) {

            console.error(

                "❌ Reservation Fetch Error:",

                error

            );



            toast.error(

                error.response?.data?.message ||

                "Failed to load reservations"

            );



            setReservations([]);



        } finally {

            setLoadingReservations(false);

        }

    };



    // ======================================================

    // Load Reservations When Dine-In

    // ======================================================



    useEffect(() => {



        if (

            orderType === "Dine-In" &&

            dineInContext?.type === "Walk-In"

        ) {



            setSelectedReservation("");



            return;



        }





        if (orderType === "Dine-In") {



            if (

                dineInContext?.type === "Reservation" &&

                dineInContext?.reservationId

            ) {



                setSelectedReservation(

                    dineInContext.reservationId

                );



            }



            fetchReservations();



        } else {



            setSelectedReservation("");



        }



    }, [orderType, dineInContext]);



    // ======================================================

    // Format Date

    // ======================================================



    const formatDate = (date) => {

        if (!date) {

            return "";

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



    // ======================================================

    // Get Reservation State

    // ======================================================



    const getReservationState = (reservation) => {

        const now = new Date();



        const reservationDate =

            new Date(

                reservation.reservationDate

            );



        if (isNaN(reservationDate.getTime())) {

            return "past";

        }



        const currentDateString =

            `${now.getFullYear()}-${String(

                now.getMonth() + 1

            ).padStart(2, "0")}-${String(

                now.getDate()

            ).padStart(2, "0")}`;



        const reservationDateString =

            `${reservationDate.getUTCFullYear()}-${String(

                reservationDate.getUTCMonth() + 1

            ).padStart(2, "0")}-${String(

                reservationDate.getUTCDate()

            ).padStart(2, "0")}`;



        if (

            reservationDateString <

            currentDateString

        ) {

            return "past";

        }



        if (

            reservationDateString >

            currentDateString

        ) {

            return "future";

        }



        const currentTime =

            `${String(

                now.getHours()

            ).padStart(2, "0")}:${String(

                now.getMinutes()

            ).padStart(2, "0")}`;



        if (

            currentTime >= reservation.startTime &&

            currentTime < reservation.endTime

        ) {

            return "active";

        }



        if (

            currentTime < reservation.startTime

        ) {

            return "future";

        }



        return "past";

    };



    // ======================================================

    // Selected Reservation Data

    // ======================================================



    const selectedReservationData =

        reservations.find(

            (reservation) =>

                reservation._id ===

                selectedReservation

        );



    // ======================================================

    // Dine-In Context

    // ======================================================



    const isWalkInOrder =

        orderType === "Dine-In" &&

        dineInContext?.type === "Walk-In" &&

        Boolean(

            dineInContext?.tableId

        );



    const walkInTableId =

        isWalkInOrder

            ? dineInContext.tableId

            : null;



    const isReservationOrder =

        orderType === "Dine-In" &&

        !isWalkInOrder;



    // ======================================================

    // Load Razorpay SDK

    // ======================================================



    const loadRazorpay = () => {

        return new Promise((resolve) => {



            const scriptUrl =

                "https://checkout.razorpay.com/v1/checkout.js";



            const existingScript =

                document.querySelector(

                    `script[src="${scriptUrl}"]`

                );



            if (existingScript) {



                if (window.Razorpay) {

                    resolve(true);

                } else {



                    existingScript.addEventListener(

                        "load",

                        () => resolve(true),

                        { once: true }

                    );



                    existingScript.addEventListener(

                        "error",

                        () => resolve(false),

                        { once: true }

                    );

                }



                return;

            }



            const script =

                document.createElement("script");



            script.src = scriptUrl;

            script.async = true;



            script.onload = () => {

                console.log(

                    "✅ Razorpay SDK loaded"

                );



                resolve(true);

            };



            script.onerror = () => {

                console.error(

                    "❌ Failed to load Razorpay SDK"

                );



                resolve(false);

            };



            document.body.appendChild(script);

        });

    };



    // ======================================================

    // Place Order + Payment

    // ======================================================



    const handlePlaceOrder = async () => {



        // ==================================================

        // Prevent Duplicate Clicks

        // ==================================================



        if (

            placingOrder ||

            paymentLoading

        ) {

            return;

        }



        // ==================================================

        // Validate Cart

        // ==================================================



        if (

            !cartItems ||

            cartItems.length === 0

        ) {



            toast.error(

                "Your cart is empty"

            );



            navigate("/menu");



            return;

        }



        // ==================================================

        // Validate Login

        // ==================================================



        const token =

            localStorage.getItem("token");



        if (!token) {



            toast.error(

                "Please login before placing an order"

            );



            navigate("/login");



            return;

        }



        // ==================================================

        // Validate Dine-In Context

        // ==================================================



        if (

            orderType === "Dine-In" &&

            !isWalkInOrder &&

            !selectedReservation

        ) {



            toast.error(

                "Please select a reservation"

            );



            return;

        }





        // ==================================================

        // Validate Walk-In QR Context

        // ==================================================



        if (

            isWalkInOrder &&

            !walkInTableId

        ) {



            toast.error(

                "Please scan a valid Walk-In table QR code"

            );



            navigate("/menu");



            return;

        }



        // ==================================================

        // Validate Selected Reservation

        // ==================================================



        if (

            orderType === "Dine-In" &&

            selectedReservationData

        ) {



            const reservationState =

                getReservationState(

                    selectedReservationData

                );



            if (

                reservationState === "past"

            ) {



                toast.error(

                    "This reservation has already ended. Please select another reservation."

                );



                setSelectedReservation("");



                return;

            }

        }



        try {



            // ==================================================

            // STEP 1 - Create Restaurant Order

            // ==================================================



            setPlacingOrder(true);



            console.log(

                "================================="

            );



            console.log(

                "1️⃣ CREATING RESTAURANT ORDER"

            );



            console.log(

                "================================="

            );



            const orderData = {



                items: cartItems.map(

                    (item) => ({

                        menu: item._id,

                        quantity: item.quantity

                    })

                ),



                orderType,



                reservation:

                    orderType === "Dine-In" &&

                    !isWalkInOrder

                        ? selectedReservation

                        : null,



                table:

                    isWalkInOrder

                        ? walkInTableId

                        : null

            };



            console.log(

                "Order data:",

                orderData

            );



            const orderResponse =

                await api.post(

                    "/order",

                    orderData

                );



            console.log(

                "Restaurant order response:",

                orderResponse.data

            );



            const createdOrder =

                orderResponse.data?.order;



            // ==================================================

            // Validate Created Order

            // ==================================================



            if (

                !createdOrder ||

                !createdOrder._id

            ) {



                console.error(

                    "❌ Backend did not return order._id",

                    createdOrder

                );



                throw new Error(

                    "Restaurant order was created but order ID was not returned"

                );

            }



            // ==================================================

            // IMPORTANT: Convert ID to String

            // ==================================================



            const restaurantOrderId =

                createdOrder._id.toString();



            console.log(

                "================================="

            );



            console.log(

                "✅ RESTAURANT ORDER CREATED"

            );



            console.log(

                "Restaurant Order ID:",

                restaurantOrderId

            );



            console.log(

                "Order ID Type:",

                typeof restaurantOrderId

            );



            console.log(

                "Created Order:",

                createdOrder

            );



            console.log(

                "================================="

            );



            // ==================================================

            // WALK-IN ORDER

            // ==================================================

            //

            // Walk-In customers pay at the restaurant after

            // completing their meal, so Razorpay is skipped.

            //

            // ==================================================



            if (isWalkInOrder) {



                clearCartAndDineInContext();



                setPaymentLoading(false);

                setPlacingOrder(false);



                toast.success(

                    "Walk-in order placed successfully"

                );



                navigate(

                    "/orders",

                    {

                        replace: true

                    }

                );



                return;

            }





            // ==================================================

            // STEP 2 - Load Razorpay

            // ==================================================



            console.log(

                "2️⃣ Loading Razorpay..."

            );



            const razorpayLoaded =

                await loadRazorpay();



            if (!razorpayLoaded) {



                throw new Error(

                    "Failed to load Razorpay. Please check your internet connection."

                );

            }



            // ==================================================

            // STEP 3 - Create Razorpay Payment Order

            // ==================================================



            console.log(

                "================================="

            );



            console.log(

                "3️⃣ CREATING RAZORPAY PAYMENT ORDER"

            );



            console.log(

                "Restaurant Order ID being sent:",

                restaurantOrderId

            );



            console.log(

                "Payment URL:",

                `/order/${restaurantOrderId}/payment`

            );



            console.log(

                "================================="

            );



            setPaymentLoading(true);



            const paymentResponse =

                await api.post(

                    `/order/${restaurantOrderId}/payment`

                );



            const paymentData =

                paymentResponse.data;



            console.log(

                "💳 Razorpay payment data:",

                paymentData

            );



            // ==================================================

            // Validate Backend Response

            // ==================================================



            if (

                !paymentData?.success

            ) {



                throw new Error(

                    paymentData?.message ||

                    "Failed to create payment"

                );

            }



            if (

                !paymentData.key ||

                !paymentData.razorpayOrderId ||

                !paymentData.amount

            ) {



                console.error(

                    "❌ Invalid payment data:",

                    paymentData

                );



                throw new Error(

                    "Invalid Razorpay payment data received from server"

                );

            }



            // ==================================================

            // Extract Payment Data

            // ==================================================



            const razorpayOrderId =

                paymentData.razorpayOrderId;



            const razorpayAmount =

                paymentData.amount;



            const razorpayCurrency =

                paymentData.currency || "INR";



            console.log(

                "✅ Razorpay Order ID:",

                razorpayOrderId

            );



            console.log(

                "✅ Razorpay Amount:",

                razorpayAmount

            );



            console.log(

                "✅ Razorpay Currency:",

                razorpayCurrency

            );



            // ==================================================

            // STEP 4 - Razorpay Checkout

            // ==================================================



            console.log(

                "4️⃣ Opening Razorpay checkout..."

            );



            const options = {



                key:

                    paymentData.key,



                amount:

                    razorpayAmount,



                currency:

                    razorpayCurrency,



                name:

                    "LUX Restaurant",



                description:

                    "Restaurant Order Payment",



                order_id:

                    razorpayOrderId,



                // ==================================================

                // Payment Success

                // ==================================================



                handler:

                    async function (response) {



                        console.log(

                            "================================="

                        );



                        console.log(

                            "5️⃣ RAZORPAY PAYMENT SUCCESS"

                        );



                        console.log(

                            "================================="

                        );



                        console.log(

                            "Full Razorpay response:",

                            response

                        );



                        try {



                            // ==================================================

                            // Validate Razorpay Response

                            // ==================================================



                            if (

                                !response?.razorpay_order_id ||

                                !response?.razorpay_payment_id ||

                                !response?.razorpay_signature

                            ) {



                                console.error(

                                    "❌ Incomplete Razorpay response:",

                                    response

                                );



                                throw new Error(

                                    "Incomplete Razorpay payment response"

                                );

                            }



                            console.log(

                                "Payment ID:",

                                response.razorpay_payment_id

                            );



                            console.log(

                                "Razorpay Order ID:",

                                response.razorpay_order_id

                            );



                            // ==================================================

                            // Verify Payment

                            // ==================================================



                            console.log(

                                "================================="

                            );



                            console.log(

                                "🔐 VERIFYING PAYMENT"

                            );



                            console.log(

                                "Restaurant Order ID:",

                                restaurantOrderId

                            );



                            console.log(

                                "Verification URL:",

                                `/order/${restaurantOrderId}/payment/verify`

                            );



                            console.log(

                                "================================="

                            );

                            console.log("=================================");

                            console.log("🔐 SENDING PAYMENT VERIFICATION");

                            console.log("Restaurant Order ID:", restaurantOrderId);

                            console.log("Razorpay Order ID:", response.razorpay_order_id);

                            console.log("Razorpay Payment ID:", response.razorpay_payment_id);

                            console.log("Razorpay Signature:", response.razorpay_signature);

                            console.log("=================================");



                            const verifyResponse =

                                await api.post(

                                    `/order/${restaurantOrderId}/payment/verify`,

                                    {

                                        razorpay_order_id:

                                            response.razorpay_order_id,



                                        razorpay_payment_id:

                                            response.razorpay_payment_id,



                                        razorpay_signature:

                                            response.razorpay_signature

                                    }

                                );



                            console.log(

                                "Backend verification response:",

                                verifyResponse.data

                            );



                            // ==================================================

                            // Check Verification

                            // ==================================================



                            if (

                                !verifyResponse.data?.success

                            ) {



                                throw new Error(

                                    verifyResponse.data?.message ||

                                    "Payment verification failed"

                                );

                            }



                            console.log(

                                "================================="

                            );



                            console.log(

                                "✅ PAYMENT VERIFIED SUCCESSFULLY"

                            );



                            console.log(

                                "Restaurant Order ID:",

                                restaurantOrderId

                            );



                            console.log(

                                "================================="

                            );



                            // ==================================================

                            // Clear Cart + Dine-In Context

                            // ==================================================



                            clearCart();



                            clearDineInContext();



                            // ==================================================

                            // Reset Loading

                            // ==================================================



                            setPaymentLoading(false);



                            setPlacingOrder(false);



                            // ==================================================

                            // Success

                            // ==================================================



                            toast.success(

                                "Payment successful! Order placed."

                            );



                            // ==================================================

                            // Redirect

                            // ==================================================



                            navigate(

                                "/orders",

                                {

                                    replace: true

                                }

                            );



                        } catch (error) {



                            console.error(

                                "❌ Payment Verification Error:",

                                error

                            );



                            console.error(

                                "Backend response:",

                                error.response?.data

                            );



                            setPaymentLoading(false);



                            setPlacingOrder(false);



                            toast.error(

                                error.response?.data?.message ||

                                error.message ||

                                "Payment verification failed"

                            );

                        }

                    },



                // ==================================================

                // Modal Closed

                // ==================================================



                modal: {



                    ondismiss:

                        function () {



                            console.log(

                                "Payment modal closed"

                            );



                            setPaymentLoading(

                                false

                            );



                            setPlacingOrder(

                                false

                            );



                            toast.error(

                                "Payment cancelled"

                            );

                        }

                },



                // ==================================================

                // Theme

                // ==================================================



                theme: {

                    color: "#D4AF7C"

                }

            };



            // ==================================================

            // Check Razorpay

            // ==================================================



            if (!window.Razorpay) {



                throw new Error(

                    "Razorpay SDK is not available"

                );

            }



            // ==================================================

            // Create Razorpay Instance

            // ==================================================



            console.log(

                "Creating Razorpay instance..."

            );



            const razorpay =

                new window.Razorpay(

                    options

                );



            // ==================================================

            // Payment Failed

            // ==================================================



            razorpay.on(

                "payment.failed",

                function (response) {



                    console.error(

                        "❌ Razorpay Payment Failed:",

                        response

                    );



                    setPaymentLoading(

                        false

                    );



                    setPlacingOrder(

                        false

                    );



                    toast.error(

                        response.error?.description ||

                        "Payment failed"

                    );

                }

            );



            // ==================================================

            // Open Razorpay

            // ==================================================



            console.log(

                "🚀 Opening Razorpay..."

            );



            razorpay.open();



        } catch (error) {



            console.error(

                "❌ Place Order / Payment Error:",

                error

            );



            console.error(

                "Backend response:",

                error.response?.data

            );



            toast.error(

                error.response?.data?.message ||

                error.message ||

                "Failed to start payment"

            );



            setPaymentLoading(false);



            setPlacingOrder(false);

        }

    };



    const getFoodImage = (item) => {

        if (item.image) return item.image;



        const imageMap = {

            "Tomato Soup": "/images/food/tomato-soup.jpg",

            "Cappuccino": "/images/food/cappuccino.jpg",

            "Classic Cheese & Tomato Pizza":

                "/images/food/cheese-tomato-pizza.jpg",

            "Chocolate Pastry": "/images/food/chocolate-pastry.jpg",

            Pepsi: "/images/food/pepsi.jpg",

        };



        return imageMap[item.name] || "/images/food/placeholder.jpg";

    };

    // ======================================================

    // Empty Cart

    // ======================================================



    if (

        !cartItems ||

        cartItems.length === 0

    ) {



        return (

            <div className="lux-container py-20 text-center">



                <div className="rounded-3xl border border-[#D8D0C4] bg-white p-12 shadow-sm">



                    <div className="text-6xl mb-4">

                        🛒

                    </div>



                    <h1 className="text-3xl font-black text-[#0B0B0B]">

                        Your cart is empty

                    </h1>



                    <p className="mt-2 text-[#756F66]">

                        Add some delicious items

                        before checking out.

                    </p>



                    <button

                        onClick={() =>

                            navigate("/menu")

                        }

                        className="mt-6 rounded-xl bg-[#0B0B0B] px-6 py-3 font-semibold text-white shadow-lg shadow-black/10 transition hover:bg-[#2B1F14]"

                    >

                        Browse Menu

                    </button>



                </div>



            </div>

        );

    }



    // ======================================================

    // Main Checkout UI

    // ======================================================



    return (



        <div className="lux-container py-10">



            {/* Header */}



            <div className="mb-8">



                <p className="text-[#B88A4A] font-bold uppercase tracking-[0.18em] text-xs">

                    LUX Restaurant

                </p>



                <h1 className="mt-2 text-4xl font-black tracking-tight text-[#0B0B0B]">

                    Checkout

                </h1>



                <p className="mt-2 text-[#756F66]">

                    Review your order before placing it.

                </p>



            </div>



            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">



                {/* ==================================================

                    LEFT

                ================================================== */}



                <div className="lg:col-span-2 space-y-6">



                    {/* ==================================================

                        ORDER TYPE

                    ================================================== */}



                    <div className="rounded-3xl border border-[#D8D0C4] bg-white p-6 shadow-sm">



                        <h2 className="text-2xl font-black text-[#0B0B0B]">

                            Order Type

                        </h2>



                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">



                            {/* DINE-IN */}



                            <button

                                type="button"

                                onClick={() =>

                                    setOrderType("Dine-In")

                                }

                                disabled={

                                    placingOrder ||

                                    paymentLoading

                                }

                                className={`p-5 rounded-xl border-2 text-left transition ${

                                    orderType === "Dine-In"

                                        ? "border-orange-500 bg-orange-50"

                                        : "border-gray-200 hover:border-gray-300"

                                } disabled:opacity-50`}

                            >



                                <div className="text-3xl">

                                    🍽️

                                </div>



                                <p className="font-bold mt-3">

                                    Dine-In

                                </p>



                                <p className="mt-1 text-sm text-[#756F66]">

                                    Eat at the restaurant

                                </p>



                            </button>



                            {/* TAKEAWAY */}



                            <button

                                type="button"

                                onClick={() =>

                                    setOrderType("Takeaway")

                                }

                                disabled={

                                    placingOrder ||

                                    paymentLoading

                                }

                                className={`p-5 rounded-xl border-2 text-left transition ${

                                    orderType === "Takeaway"

                                        ? "border-orange-500 bg-orange-50"

                                        : "border-gray-200 hover:border-gray-300"

                                } disabled:opacity-50`}

                            >



                                <div className="text-3xl">

                                    🥡

                                </div>



                                <p className="font-bold mt-3">

                                    Takeaway

                                </p>



                                <p className="mt-1 text-sm text-[#756F66]">

                                    Pick up your order

                                </p>



                            </button>



                            {/* DELIVERY */}



                            <button

                                type="button"

                                onClick={() =>

                                    setOrderType("Delivery")

                                }

                                disabled={

                                    placingOrder ||

                                    paymentLoading

                                }

                                className={`p-5 rounded-xl border-2 text-left transition ${

                                    orderType === "Delivery"

                                        ? "border-orange-500 bg-orange-50"

                                        : "border-gray-200 hover:border-gray-300"

                                } disabled:opacity-50`}

                            >



                                <div className="text-3xl">

                                    🛵

                                </div>



                                <p className="font-bold mt-3">

                                    Delivery

                                </p>



                                <p className="mt-1 text-sm text-[#756F66]">

                                    Get it delivered

                                </p>



                            </button>



                        </div>



                    </div>



                    {/* ==================================================

                        RESERVATION SELECTION

                    ================================================== */}



                    {isReservationOrder && (



                        <div className="rounded-3xl border border-[#D8D0C4] bg-white p-6 shadow-sm">



                            <div className="flex justify-between items-center">



                                <div>



                                    <h2 className="text-2xl font-black text-[#0B0B0B]">

                                        Choose Your Reservation

                                    </h2>



                                    <p className="text-gray-500 mt-1">

                                        Select the reservation

                                        for this order.

                                    </p>



                                </div>



                                <button

                                    type="button"

                                    onClick={

                                        fetchReservations

                                    }

                                    disabled={

                                        loadingReservations ||

                                        placingOrder ||

                                        paymentLoading

                                    }

                                    className="font-semibold text-[#B88A4A] transition hover:text-[#8B6A3E] disabled:opacity-50"

                                >

                                    ↻ Refresh

                                </button>



                            </div>



                            {loadingReservations ? (



                                <div className="text-center py-10">



                                    <p className="text-gray-500">

                                        Loading reservations...

                                    </p>



                                </div>



                            ) : reservations.length === 0 ? (



                                <div className="mt-6 rounded-2xl border border-[#E8D7A9] bg-[#FBF6E8] p-6 text-center">



                                    <div className="text-4xl">

                                        🪑

                                    </div>



                                    <p className="font-semibold text-yellow-700 mt-3">

                                        No confirmed reservation

                                    </p>



                                    <p className="text-sm text-yellow-600 mt-1">

                                        Create a reservation

                                        before placing a

                                        Dine-In order.

                                    </p>



                                    <button

                                        type="button"

                                        onClick={() =>

                                            navigate(

                                                "/reservations?returnTo=checkout"

                                            )

                                        }

                                        className="mt-5 rounded-xl bg-[#0B0B0B] px-6 py-3 font-semibold text-white shadow-lg shadow-black/10 transition hover:bg-[#2B1F14]"

                                    >

                                        + Make a New Reservation

                                    </button>



                                </div>



                            ) : (



                                <div className="space-y-4 mt-6">



                                    {reservations.map(

                                        (reservation) => {



                                            const state =

                                                getReservationState(

                                                    reservation

                                                );



                                            const selected =

                                                selectedReservation ===

                                                reservation._id;



                                            const isPast =

                                                state === "past";



                                            return (



                                                <button

                                                    key={

                                                        reservation._id

                                                    }

                                                    type="button"

                                                    disabled={

                                                        isPast ||

                                                        placingOrder ||

                                                        paymentLoading

                                                    }

                                                    onClick={() => {



                                                        if (isPast) {



                                                            toast.error(

                                                                "This reservation has already ended."

                                                            );



                                                            return;

                                                        }



                                                        setSelectedReservation(

                                                            reservation._id

                                                        );

                                                    }}

                                                    className={`w-full text-left p-5 rounded-xl border-2 transition ${

                                                        isPast

                                                            ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"

                                                            : selected

                                                            ? "border-orange-500 bg-orange-50"

                                                            : "border-gray-200 hover:border-orange-300"

                                                    } disabled:cursor-not-allowed`}

                                                >



                                                    <div className="flex justify-between items-start gap-4">



                                                        <div>



                                                            <p className="font-bold text-lg">



                                                                Table{" "}



                                                                {

                                                                    reservation

                                                                        .table

                                                                        ?.tableNumber

                                                                }



                                                            </p>



                                                            <p className="text-gray-600 mt-1">



                                                                {formatDate(

                                                                    reservation.reservationDate

                                                                )}



                                                            </p>



                                                            <p className="text-gray-600">



                                                                {

                                                                    reservation.startTime

                                                                }



                                                                {" - "}



                                                                {

                                                                    reservation.endTime

                                                                }



                                                            </p>



                                                            <p className="mt-1 text-sm text-[#756F66]">



                                                                {

                                                                    reservation.guests

                                                                }



                                                                {" "}

                                                                guests



                                                            </p>



                                                        </div>



                                                        <div className="text-right">



                                                            {state ===

                                                            "active" ? (



                                                                <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">

                                                                    Active Now

                                                                </span>



                                                            ) : state ===

                                                            "future" ? (



                                                                <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">

                                                                    Upcoming

                                                                </span>



                                                            ) : (



                                                                <span className="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">

                                                                    Past

                                                                </span>



                                                            )}



                                                        </div>



                                                    </div>



                                                    {selected && (



                                                        <div className="mt-4 rounded-xl border border-[#D4AF7C]/40 bg-[#F8F5EE] p-3">



                                                            <p className="font-semibold text-[#8B6A3E]">

                                                                ✓ Reservation selected

                                                            </p>



                                                            <p className="mt-1 text-sm text-[#756F66]">



                                                                {state ===

                                                                "active"

                                                                    ? "Your order will be placed for your current table."

                                                                    : "Your order will be scheduled for this reservation."}



                                                            </p>



                                                        </div>



                                                    )}



                                                </button>

                                            );

                                        }

                                    )}



                                </div>



                            )}



                            {reservations.length > 0 && (



                                <button

                                    type="button"

                                    onClick={() =>

                                        navigate(

                                            "/reservations?returnTo=checkout"

                                        )

                                    }

                                    disabled={

                                        placingOrder ||

                                        paymentLoading

                                    }

                                    className="mt-5 w-full rounded-xl border-2 border-dashed border-[#D8D0C4] py-4 font-semibold text-[#756F66] transition hover:border-[#D4AF7C] hover:bg-[#F8F5EE] disabled:opacity-50"

                                >

                                    + Make a New Reservation

                                </button>



                            )}



                        </div>



                    )}



                    {/* ==================================================

                        WALK-IN TABLE

                    ================================================== */}



                    {isWalkInOrder && (



                        <div className="rounded-3xl border border-[#D8D0C4] bg-white p-6 shadow-sm">



                            <div className="flex items-center justify-between gap-4">



                                <div>



                                    <p className="text-sm font-bold uppercase tracking-[0.15em] text-green-600">

                                        Walk-In Dining

                                    </p>



                                    <h2 className="mt-1 text-2xl font-black text-[#0B0B0B]">

                                        Table QR Verified

                                    </h2>



                                    <p className="mt-2 text-[#756F66]">

                                        Your table was identified from the QR code.

                                    </p>



                                </div>



                                <div className="rounded-xl bg-green-100 px-4 py-3 font-bold text-green-700 whitespace-nowrap">

                                    ✓ QR Verified

                                </div>



                            </div>



                            <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">



                                <p className="text-green-700 font-semibold">

                                    Walk-In ordering is active

                                </p>



                                <p className="text-green-600 text-sm mt-1">

                                    Table ID: {walkInTableId}

                                </p>



                                <p className="text-green-600 text-sm mt-2">

                                    You will pay at the restaurant after completing your meal.

                                </p>



                            </div>



                        </div>



                    )}





                    {/* ==================================================

                        ITEMS

                    ================================================== */}



                    <div className="rounded-3xl border border-[#D8D0C4] bg-white p-6 shadow-sm">



                        <h2 className="mb-5 text-2xl font-black text-[#0B0B0B]">

                            Your Items

                        </h2>



                        <div className="space-y-4">



                            {cartItems.map(

                                (item) => (



                                    <div

                                        key={item._id}

                                        className="flex items-center justify-between gap-4 border-b last:border-b-0 pb-4 last:pb-0"

                                    >



                                        <div className="flex items-center gap-4">



                                            <img

                                                src={getFoodImage(item)}

                                                alt={item.name}

                                                className="w-16 h-16 object-cover rounded-lg"

                                            />



                                            <div>



                                                <p className="font-bold text-[#0B0B0B]">

                                                    {item.name}

                                                </p>



                                                <p className="text-sm text-gray-500">

                                                    ₹{item.price} ×{" "}

                                                    {item.quantity}

                                                </p>



                                            </div>



                                        </div>



                                        <p className="font-black text-[#0B0B0B]">



                                            ₹

                                            {(

                                                Number(

                                                    item.price

                                                ) *

                                                item.quantity

                                            ).toLocaleString(

                                                "en-IN"

                                            )}



                                        </p>



                                    </div>



                                )

                            )}



                        </div>



                    </div>



                </div>



                {/* ==================================================

                    SUMMARY

                ================================================== */}



                <div>



                    <div className="rounded-3xl border border-[#D8D0C4] bg-white p-6 shadow-sm lg:sticky lg:top-6">



                        <h2 className="text-2xl font-black text-[#0B0B0B]">

                            Order Summary

                        </h2>



                        <div className="space-y-4 mt-6">



                            <div className="flex justify-between text-gray-600">



                                <span>

                                    Items

                                </span>



                                <span>

                                    {cartCount}

                                </span>



                            </div>



                            <div className="flex justify-between text-gray-600">



                                <span>

                                    Order Type

                                </span>



                                <span className="font-medium">

                                    {orderType}

                                </span>



                            </div>



                            {isReservationOrder &&

                                selectedReservationData && (



                                    <>

                                        <div className="flex justify-between text-gray-600">



                                            <span>

                                                Table

                                            </span>



                                            <span className="font-medium">



                                                Table{" "}



                                                {

                                                    selectedReservationData

                                                        .table

                                                        ?.tableNumber

                                                }



                                            </span>



                                        </div>



                                        <div className="flex justify-between text-gray-600">



                                            <span>

                                                Reservation

                                            </span>



                                            <span className="font-medium">



                                                {

                                                    selectedReservationData

                                                        .startTime

                                                }



                                                {" - "}



                                                {

                                                    selectedReservationData

                                                        .endTime

                                                }



                                            </span>



                                        </div>

                                    </>



                                )}



                            {isWalkInOrder && (



                                <>



                                    <div className="flex justify-between text-gray-600">



                                        <span>

                                            Dining

                                        </span>



                                        <span className="font-medium text-green-600">

                                            Walk-In

                                        </span>



                                    </div>



                                    <div className="flex justify-between text-gray-600">



                                        <span>

                                            Table

                                        </span>



                                        <span className="font-medium">

                                            QR Assigned

                                        </span>



                                    </div>



                                    <div className="flex justify-between text-gray-600">



                                        <span>

                                            Payment

                                        </span>



                                        <span className="font-medium">

                                            At Restaurant

                                        </span>



                                    </div>



                                </>



                            )}



                            <div className="border-t pt-4">



                                <div className="flex justify-between items-center">



                                    <span className="text-lg font-semibold">

                                        Total

                                    </span>



                                    <span className="text-2xl font-black text-[#B88A4A]">



                                        ₹

                                        {Number(

                                            cartTotal

                                        ).toLocaleString(

                                            "en-IN"

                                        )}



                                    </span>



                                </div>



                            </div>



                        </div>



                        {/* ==================================================

                            PAYMENT BUTTON

                        ================================================== */}



                        <button

                            type="button"

                            onClick={

                                handlePlaceOrder

                            }

                            disabled={

                                placingOrder ||

                                paymentLoading ||

                                (

                                    orderType === "Dine-In" &&

                                    (

                                        (

                                            isReservationOrder &&

                                            !selectedReservation

                                        ) ||

                                        (

                                            isWalkInOrder &&

                                            !walkInTableId

                                        )

                                    )

                                )

                            }

                            className="mt-7 w-full rounded-xl bg-[#0B0B0B] py-3.5 text-lg font-bold text-white shadow-lg shadow-black/10 transition hover:bg-[#2B1F14] hover:shadow-xl disabled:cursor-not-allowed disabled:bg-gray-300"

                        >



                            {paymentLoading

                                ? "Opening Payment..."

                                : placingOrder

                                ? "Creating Order..."

                                : isWalkInOrder

                                ? "Place Walk-In Order →"

                                : "Proceed to Payment →"}



                        </button>



                        {/* ==================================================

                            BACK TO CART

                        ================================================== */}



                        <button

                            type="button"

                            onClick={() =>

                                navigate("/cart")

                            }

                            disabled={

                                placingOrder ||

                                paymentLoading

                            }

                            className="mt-3 w-full rounded-xl border-2 border-[#D4AF7C] py-3 font-semibold text-[#8B6A3E] transition hover:bg-[#F8F5EE] disabled:opacity-50"

                        >

                            Back to Cart

                        </button>



                    </div>



                </div>



            </div>



        </div>

    );

}



export default Checkout;