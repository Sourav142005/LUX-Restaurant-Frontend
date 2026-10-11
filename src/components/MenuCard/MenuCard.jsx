import { FiClock, FiEye, FiPlus } from "react-icons/fi";
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

function MenuCard({ item }) {
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const available = Boolean(item.isAvailable);
    const foodImage = getFoodImage(item);

    const categoryName = (item.category?.name || "")
        .trim()
        .toLowerCase();

    const isBeverage = [
        "beverage",
        "beverages",
        "drink",
        "drinks",
    ].includes(categoryName);

    const handleViewAR = () => {
        navigate(
            `/ar-test?model=${encodeURIComponent(
                item.model3D
            )}&name=${encodeURIComponent(item.name)}`
        );
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
                        {item.model3D && available && (
                            <button
                                onClick={handleViewAR}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-[#D8D0C4] px-3 py-2 text-xs font-bold text-[#4B443C] hover:border-[#D4AF7C] hover:bg-[#D4AF7C]/10 hover:text-[#8B6A3E]"
                            >
                                <FiEye size={15} />
                                View in AR
                            </button>
                        )}
                    </div>

                    {/* ADD TO CART */}
                    <button
                        onClick={() => addToCart(item)}
                        disabled={!available}
                        className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition ${
                            available
                                ? "bg-[#0B0B0B] text-white shadow-lg shadow-black/10 hover:bg-[#2B1F14] active:scale-[.99]"
                                : "cursor-not-allowed bg-[#EEEAE3] text-[#AAA49B]"
                        }`}
                    >
                        <FiPlus size={17} />

                        {available
                            ? "Add to cart"
                            : "Unavailable"}
                    </button>
                </div>
            </div>
        </article>
    );
}

export default MenuCard;