import { FiClock, FiEye, FiMinus, FiPlus } from "react-icons/fi";
import toast from "react-hot-toast";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";

function getFoodImage(item) {
    // If an image is already stored in MongoDB, use it.
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

    // Local fallback for any future menu item.
    return "/images/food/tomato-soup.jpg";
}

function getFoodModel(item) {
    if (item.model3D) return item.model3D;

    const name = (item.name || "").toLowerCase().trim();

    if (name.includes("cappuccino") || name.includes("coffee")) {
        return "/models/coffee_cup.glb";
    }

    if (
        name.includes("pizza") ||
        (name.includes("cheese") && name.includes("tomato"))
    ) {
        return "/models/pizza_30cm.glb";
    }

    if (
        name.includes("chocolate pastry") ||
        name.includes("pastry") ||
        name.includes("cake")
    ) {
        return "/models/chocolate_ pastry_20cm.glb";
    }

    if (name.includes("pepsi")) {
        return "/models/pepsi.glb";
    }

    return null;
}

function MenuCard({ item }) {
    const {
        cartItems,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
    } = useCart();
    const navigate = useNavigate();

    const cartItem = cartItems?.find(
        (cartEntry) => cartEntry._id === item._id
    );
    const quantity = cartItem ? Number(cartItem.quantity || 0) : 0;

    const available = Boolean(item.isAvailable);
    const foodImage = getFoodImage(item);
    const foodModel = getFoodModel(item);

    const categoryName = (item.category?.name || "")
        .trim()
        .toLowerCase();

    const isBeverage = [
        "beverage",
        "beverages",
        "drink",
        "drinks",
    ].includes(categoryName);

    const handleViewAR = (e) => {
        e?.stopPropagation();
        if (!foodModel) return;
        navigate(
            `/ar-test?model=${encodeURIComponent(
                foodModel
            )}&name=${encodeURIComponent(item.name)}`
        );
    };

    const handleAddToCart = (e) => {
        e.stopPropagation();
        if (!available) return;

        try {
            addToCart(item);

            toast.success(`${item.name} added to cart`, {
                id: `cart-${item._id}`,
                style: {
                    background: "#0B0B0B",
                    color: "#FFF6E9",
                    border: "1px solid rgba(212, 175, 124, 0.4)",
                    borderRadius: "14px",
                    padding: "12px 18px",
                    fontSize: "14px",
                    fontWeight: "600",
                    boxShadow:
                        "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 0 15px rgba(212, 175, 124, 0.15)",
                },
                iconTheme: {
                    primary: "#D4AF7C",
                    secondary: "#0B0B0B",
                },
            });
        } catch (error) {
            console.error("Failed to add item to cart:", error);
        }
    };

    const handleDecrease = (e) => {
        e.stopPropagation();
        try {
            decreaseQuantity(item._id);
        } catch (error) {
            console.error("Failed to decrease quantity:", error);
        }
    };

    const handleIncrease = (e) => {
        e.stopPropagation();
        if (!available) return;
        try {
            increaseQuantity(item._id);
        } catch (error) {
            console.error("Failed to increase quantity:", error);
        }
    };

    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#D8D0C4] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF7C]/60 hover:shadow-xl hover:shadow-[#2B1F14]/8">

            {/* ================= IMAGE ================= */}
            <div className="relative aspect-[3/2] overflow-hidden bg-[#EFEAE2]">

                <img
                    src={foodImage}
                    alt={item.name}
                    loading="lazy"
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                            "/images/food/tomato-soup.jpg";
                    }}
                    className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.04]"
                />

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/25 to-transparent opacity-60" />

                {/* BADGES */}
                <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">

                    {item.category?.name && !isBeverage && (
                        <span
                            className={`rounded-full px-3 py-1.5 text-xs font-bold shadow-sm backdrop-blur ${
                                item.isVeg
                                    ? "bg-green-50/95 text-green-700"
                                    : "bg-red-50/95 text-red-700"
                            }`}
                        >
                            {item.isVeg
                                ? "● VEG"
                                : "● NON-VEG"}
                        </span>
                    )}

                    {item.rating > 0 && (
                        <span className="rounded-full border border-white/70 bg-white/95 px-3 py-1.5 text-xs font-bold text-[#2B1F14] shadow-sm backdrop-blur">
                            ★ {item.rating}
                        </span>
                    )}
                </div>

                {/* UNAVAILABLE */}
                {!available && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#0B0B0B]/40 backdrop-blur-[1px]">
                        <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-[#2B1F14] shadow-lg">
                            Currently unavailable
                        </span>
                    </div>
                )}
            </div>

            {/* ================= CONTENT ================= */}
            <div className="flex flex-1 flex-col p-5">

                {item.category?.name && (
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#B88A4A]">
                        {item.category.name}
                    </p>
                )}

                <h2 className="mt-1.5 text-xl font-extrabold text-[#0B0B0B]">
                    {item.name}
                </h2>

                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#756F66]">
                    {item.description ||
                        "Prepared fresh for a memorable dining experience."}
                </p>

                {/* META */}
                <div className="mt-4 flex min-h-6 items-center gap-4 text-xs font-medium text-[#756F66]">

                    {item.preparationTime && (
                        <span className="flex items-center gap-1.5">
                            <FiClock />
                            {item.preparationTime} min
                        </span>
                    )}

                    {item.isVeg && !isBeverage && (
                        <span className="font-semibold text-green-600">
                            Vegetarian
                        </span>
                    )}
                </div>

                {/* ================= BOTTOM ================= */}
                <div className="mt-auto pt-5">

                    <div className="mb-4 flex items-end justify-between border-t border-[#E8E1D7] pt-4">

                        {/* PRICE */}
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9A9389]">
                                Price
                            </p>

                            <p className="mt-0.5 text-2xl font-black text-[#0B0B0B]">
                                ₹
                                {Number(item.price).toLocaleString(
                                    "en-IN"
                                )}
                            </p>
                        </div>

                        {/* AR BUTTON */}
                        {foodModel && available && (
                            <button
                                onClick={handleViewAR}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-[#D8D0C4] px-3 py-2 text-xs font-bold text-[#4B443C] hover:border-[#D4AF7C] hover:bg-[#D4AF7C]/10 hover:text-[#8B6A3E]"
                            >
                                <FiEye size={15} />
                                View in AR
                            </button>
                        )}
                    </div>

                    {/* ADD TO CART / QUANTITY STEPPER */}
                    {!available && quantity === 0 ? (
                        <button
                            type="button"
                            disabled
                            aria-label={`${item.name} is unavailable`}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#EEEAE3] py-3.5 text-sm font-bold text-[#AAA49B] cursor-not-allowed"
                        >
                            <FiPlus size={17} />
                            Unavailable
                        </button>
                    ) : quantity > 0 ? (
                        <div
                            role="group"
                            aria-label={`Quantity selector for ${item.name}`}
                            className="flex h-12 w-full items-center justify-between rounded-xl border border-[#D4AF7C]/40 bg-[#FAF7F2] p-1 shadow-sm transition-all duration-200"
                        >
                            <button
                                type="button"
                                onClick={handleDecrease}
                                aria-label={`Decrease quantity of ${item.name}`}
                                className="flex h-10 w-11 items-center justify-center rounded-lg bg-white text-[#2B1F14] shadow-sm transition hover:bg-[#D4AF7C]/20 hover:text-[#0B0B0B] active:scale-95"
                            >
                                <FiMinus size={16} />
                            </button>

                            <div className="flex items-center gap-1.5 px-2">
                                <span className="text-xs font-semibold text-[#8B6A3E]">
                                    Qty:
                                </span>
                                <span
                                    aria-live="polite"
                                    className="text-base font-black text-[#0B0B0B]"
                                >
                                    {quantity}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={handleIncrease}
                                disabled={!available}
                                aria-label={`Increase quantity of ${item.name}`}
                                className={`flex h-10 w-11 items-center justify-center rounded-lg text-base font-bold shadow-sm transition ${
                                    available
                                        ? "bg-[#0B0B0B] text-[#D4AF7C] hover:bg-[#2B1F14] active:scale-95"
                                        : "cursor-not-allowed bg-[#EEEAE3] text-[#AAA49B]"
                                }`}
                            >
                                <FiPlus size={16} />
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            aria-label={`Add ${item.name} to cart`}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B0B0B] py-3.5 text-sm font-bold text-white shadow-lg shadow-black/10 transition hover:bg-[#2B1F14] active:scale-[.99]"
                        >
                            <FiPlus size={17} />
                            Add to cart
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}

export default MenuCard;