import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
    FiBookmark,
    FiPlus,
    FiTrash2,
    FiEdit2,
    FiShoppingBag,
    FiCheck,
    FiAlertCircle,
    FiMinus,
    FiArrowRight,
    FiRotateCcw,
    FiFolder
} from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../services/api";
import { useCart } from "../../context/CartContext";

export default function RegularOrders() {
    const { addBatchToCart } = useCart();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const urlCollectionId = searchParams.get("collectionId");

    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Selected collection for detail view
    const [selectedCollectionId, setSelectedCollectionId] = useState(null);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState("");
    const [creating, setCreating] = useState(false);

    const [renamingCollection, setRenamingCollection] = useState(null);
    const [renamedName, setRenamedName] = useState("");
    const [renaming, setRenaming] = useState(false);

    // Reorder state
    const [reorderingId, setReorderingId] = useState(null);

    const fetchCollections = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await api.get("/regular-orders");
            const data = res.data?.collections || [];
            setCollections(data);
            if (urlCollectionId && data.some((c) => c._id === urlCollectionId)) {
                setSelectedCollectionId(urlCollectionId);
            } else if (data.length > 0 && !selectedCollectionId) {
                setSelectedCollectionId(data[0]._id);
            }
        } catch (err) {
            console.error("Failed to fetch regular orders:", err);
            setError(err.response?.data?.message || "Failed to load regular orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCollections();
    }, []);

    const activeCollection = collections.find((c) => c._id === selectedCollectionId) || collections[0];

    // ==========================================
    // Handlers
    // ==========================================

    const handleCreateCollection = async (e) => {
        e.preventDefault();
        const trimmed = newCollectionName.trim();
        if (!trimmed) {
            toast.error("Please enter a collection name");
            return;
        }

        try {
            setCreating(true);
            const res = await api.post("/regular-orders", { name: trimmed });
            toast.success(`Collection "${trimmed}" created!`, {
                style: {
                    background: "#0B0B0B",
                    color: "#FFF6E9",
                    border: "1px solid rgba(212, 175, 124, 0.4)",
                    borderRadius: "14px"
                }
            });
            setCollections((prev) => [res.data.collection, ...prev]);
            setSelectedCollectionId(res.data.collection._id);
            setNewCollectionName("");
            setShowCreateModal(false);
        } catch (err) {
            console.error("Failed to create collection:", err);
            toast.error(err.response?.data?.message || "Failed to create collection");
        } finally {
            setCreating(false);
        }
    };

    const handleRenameCollection = async (e) => {
        e.preventDefault();
        if (!renamingCollection) return;
        const trimmed = renamedName.trim();
        if (!trimmed) {
            toast.error("Collection name cannot be empty");
            return;
        }

        try {
            setRenaming(true);
            const res = await api.put(`/regular-orders/${renamingCollection._id}`, {
                name: trimmed
            });
            toast.success("Collection renamed successfully");
            setCollections((prev) =>
                prev.map((c) => (c._id === renamingCollection._id ? res.data.collection : c))
            );
            setRenamingCollection(null);
            setRenamedName("");
        } catch (err) {
            console.error("Failed to rename collection:", err);
            toast.error(err.response?.data?.message || "Failed to rename collection");
        } finally {
            setRenaming(false);
        }
    };

    const handleDeleteCollection = async (collection) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${collection.name}"? This cannot be undone.`
        );
        if (!confirmed) return;

        try {
            await api.delete(`/regular-orders/${collection._id}`);
            toast.success(`"${collection.name}" deleted`);
            setCollections((prev) => {
                const remaining = prev.filter((c) => c._id !== collection._id);
                if (selectedCollectionId === collection._id) {
                    setSelectedCollectionId(remaining[0]?._id || null);
                }
                return remaining;
            });
        } catch (err) {
            console.error("Failed to delete collection:", err);
            toast.error(err.response?.data?.message || "Failed to delete collection");
        }
    };

    const handleUpdateQuantity = async (collectionId, menuId, newQty) => {
        if (newQty < 1 || newQty > 99) return;
        try {
            const res = await api.put(`/regular-orders/${collectionId}/items/${menuId}`, {
                quantity: newQty
            });
            setCollections((prev) =>
                prev.map((c) => (c._id === collectionId ? res.data.collection : c))
            );
        } catch (err) {
            console.error("Failed to update quantity:", err);
            toast.error(err.response?.data?.message || "Failed to update quantity");
        }
    };

    const handleRemoveDish = async (collectionId, menuId, dishName) => {
        try {
            const res = await api.delete(`/regular-orders/${collectionId}/items/${menuId}`);
            toast.success(`Removed ${dishName || "dish"} from collection`);
            setCollections((prev) =>
                prev.map((c) => (c._id === collectionId ? res.data.collection : c))
            );
        } catch (err) {
            console.error("Failed to remove dish:", err);
            toast.error(err.response?.data?.message || "Failed to remove dish");
        }
    };

    // ==========================================
    // Quick Reorder (Add All to Cart)
    // ==========================================
    const handleQuickReorder = async (collection) => {
        if (!collection.items || collection.items.length === 0) {
            toast.error("This collection is empty. Add dishes before reordering.");
            return;
        }

        try {
            setReorderingId(collection._id);

            // Validate against backend live database
            const res = await api.post(`/regular-orders/${collection._id}/reorder`);
            const { availableItems, unavailableItems, summary } = res.data;

            if (availableItems.length === 0) {
                toast.error("None of the dishes in this collection are currently available.", {
                    duration: 5000,
                    style: {
                        background: "#0B0B0B",
                        color: "#FFF6E9",
                        border: "1px solid rgba(239, 68, 68, 0.4)",
                        borderRadius: "14px"
                    }
                });
                return;
            }

            // Add available items to CartContext
            addBatchToCart(availableItems);

            // Display clear feedback
            if (unavailableItems.length > 0) {
                const unavailableNames = unavailableItems.map((u) => u.name).join(", ");
                toast(
                    (t) => (
                        <div>
                            <p className="font-bold text-white">
                                Added {summary.availableCount} {summary.availableCount === 1 ? "dish" : "dishes"} to cart!
                            </p>
                            <p className="text-xs text-[#E6C894] mt-1">
                                Note: {unavailableNames} {unavailableItems.length === 1 ? "is" : "are"} currently unavailable and {unavailableItems.length === 1 ? "was" : "were"} skipped.
                            </p>
                        </div>
                    ),
                    {
                        duration: 6000,
                        style: {
                            background: "#0B0B0B",
                            color: "#FFF6E9",
                            border: "1px solid rgba(212, 175, 124, 0.5)",
                            borderRadius: "14px",
                            padding: "14px 18px"
                        },
                        icon: "⚡"
                    }
                );
            } else {
                toast.success(
                    `Added all ${summary.availableCount} dishes from "${collection.name}" to cart!`,
                    {
                        duration: 4000,
                        style: {
                            background: "#0B0B0B",
                            color: "#FFF6E9",
                            border: "1px solid rgba(212, 175, 124, 0.5)",
                            borderRadius: "14px",
                            padding: "14px 18px"
                        },
                        iconTheme: {
                            primary: "#D4AF7C",
                            secondary: "#0B0B0B"
                        }
                    }
                );
            }
        } catch (err) {
            console.error("Quick reorder error:", err);
            toast.error(err.response?.data?.message || "Failed to prepare reorder");
        } finally {
            setReorderingId(null);
        }
    };

    // Calculate collection live total
    const calculateCollectionTotal = (col) => {
        if (!col?.items) return 0;
        return col.items.reduce((total, it) => {
            const price = Number(it.menu?.price || 0);
            const qty = Number(it.quantity || 1);
            return total + price * qty;
        }, 0);
    };

    return (
        <div className="lux-container py-10">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#0B0B0B] text-[#D4AF7C] mb-2 shadow-xs">
                        <FiBookmark size={13} className="text-[#D4AF7C]" />
                        Customer Favourites
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-[#0B0B0B] tracking-tight">
                        My Regular Orders
                    </h1>
                    <p className="text-[#756F66] text-sm sm:text-base mt-1">
                        Save your favourite meal sets and reorder them with a single tap.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        to="/menu"
                        className="rounded-xl border border-[#D8D0C4] bg-white px-4 py-2.5 text-xs font-bold text-[#0B0B0B] shadow-xs hover:border-[#D4AF7C] hover:bg-[#FDFBF7] transition"
                    >
                        Browse Menu
                    </Link>
                    <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B0B0B] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-black/10 hover:bg-[#2B1F14] transition active:scale-95"
                    >
                        <FiPlus size={16} /> New Collection
                    </button>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="py-20 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#D4AF7C] border-t-transparent mb-3" />
                    <p className="text-sm font-medium text-[#756F66]">
                        Loading your regular order collections...
                    </p>
                </div>
            )}

            {/* Error */}
            {!loading && error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center mb-8">
                    <p className="text-sm font-semibold text-red-700">{error}</p>
                    <button
                        type="button"
                        onClick={fetchCollections}
                        className="mt-3 text-xs font-bold text-red-800 underline hover:no-underline"
                    >
                        Tap to retry
                    </button>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && collections.length === 0 && (
                <div className="rounded-3xl border border-dashed border-[#DED5C7] bg-[#FAF7F2]/60 p-12 text-center max-w-xl mx-auto my-8">
                    <div className="text-4xl mb-3">🔖</div>
                    <h2 className="text-xl font-bold text-[#0B0B0B]">
                        No Regular Orders Saved Yet
                    </h2>
                    <p className="text-sm text-[#756F66] mt-2 leading-relaxed">
                        Create collections like "My Breakfast", "Friday Treat", or "Healthy Lunch" to reorder your regular combinations anytime.
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B0B0B] px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-[#2B1F14] transition"
                        >
                            <FiPlus size={16} /> Create First Collection
                        </button>
                        <Link
                            to="/menu"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#D8D0C4] bg-white px-5 py-3 text-sm font-bold text-[#0B0B0B] shadow-xs hover:border-[#D4AF7C] transition"
                        >
                            Explore Menu <FiArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            )}

            {/* Populated Layout */}
            {!loading && !error && collections.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left: Collections Sidebar List */}
                    <div className="lg:col-span-4 space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-xs font-black uppercase tracking-[0.15em] text-[#5F584F]">
                                Collections ({collections.length})
                            </span>
                        </div>

                        <div className="space-y-2.5">
                            {collections.map((col) => {
                                const isSelected = col._id === activeCollection?._id;
                                const itemCount = col.items?.length || 0;
                                const total = calculateCollectionTotal(col);

                                return (
                                    <div
                                        key={col._id}
                                        onClick={() => setSelectedCollectionId(col._id)}
                                        className={`group cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                                            isSelected
                                                ? "border-[#D4AF7C] bg-white shadow-md shadow-[#2B1F14]/5 ring-1 ring-[#D4AF7C]/30"
                                                : "border-[#E8E1D7] bg-[#FCFBF8] hover:border-[#D4AF7C]/60 hover:bg-white"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="font-bold text-[#0B0B0B] text-base group-hover:text-[#8B6A3E] transition-colors">
                                                    {col.name}
                                                </h3>
                                                <p className="text-xs text-[#756F66] mt-1">
                                                    {itemCount} {itemCount === 1 ? "dish" : "dishes"} • ₹{total.toLocaleString("en-IN")}
                                                </p>
                                            </div>

                                            {isSelected && (
                                                <span className="rounded-full bg-[#D4AF7C]/20 p-1 text-[#8B6A3E]">
                                                    <FiCheck size={14} />
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right: Active Collection Details & Quick Reorder */}
                    <div className="lg:col-span-8">
                        {activeCollection && (
                            <div className="rounded-3xl border border-[#D4AF7C]/40 bg-white p-6 sm:p-8 shadow-sm">
                                {/* Collection Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E8E1D7]">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-2xl font-black text-[#0B0B0B]">
                                                {activeCollection.name}
                                            </h2>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setRenamingCollection(activeCollection);
                                                    setRenamedName(activeCollection.name);
                                                }}
                                                title="Rename collection"
                                                className="text-gray-400 hover:text-black transition p-1"
                                            >
                                                <FiEdit2 size={15} />
                                            </button>
                                        </div>
                                        <p className="text-xs text-[#756F66] mt-1">
                                            Created on {new Date(activeCollection.createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric"
                                            })}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2.5">
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteCollection(activeCollection)}
                                            title="Delete collection"
                                            className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-red-600 hover:bg-red-100 transition"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleQuickReorder(activeCollection)}
                                            disabled={reorderingId === activeCollection._id || (activeCollection.items?.length || 0) === 0}
                                            className="inline-flex items-center gap-2 rounded-xl bg-[#0B0B0B] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-black/10 hover:bg-[#2B1F14] active:scale-95 transition disabled:opacity-50"
                                        >
                                            {reorderingId === activeCollection._id ? (
                                                <>
                                                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#D4AF7C] border-t-transparent" />
                                                    Checking Menu...
                                                </>
                                            ) : (
                                                <>
                                                    <FiShoppingBag size={15} className="text-[#D4AF7C]" />
                                                    Add All to Cart
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Dishes List */}
                                <div className="mt-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xs font-black uppercase tracking-[0.12em] text-[#5F584F]">
                                            Dishes in this Collection ({activeCollection.items?.length || 0})
                                        </h3>
                                        <Link
                                            to={`/menu?collectionId=${activeCollection._id}&collectionName=${encodeURIComponent(activeCollection.name)}`}
                                            className="text-xs font-bold text-[#8B6A3E] hover:underline"
                                        >
                                            + Add more dishes from Menu
                                        </Link>
                                    </div>

                                    {(!activeCollection.items || activeCollection.items.length === 0) ? (
                                        <div className="rounded-2xl border border-dashed border-[#DED5C7] bg-[#FAF7F2]/50 p-8 text-center">
                                            <p className="text-sm text-[#756F66]">
                                                This collection has no dishes saved yet.
                                            </p>
                                            <Link
                                                to={`/menu?collectionId=${activeCollection._id}&collectionName=${encodeURIComponent(activeCollection.name)}`}
                                                className="mt-3 inline-block rounded-xl bg-[#0B0B0B] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#2B1F14]"
                                            >
                                                Browse Menu to Add Dishes
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {activeCollection.items.map((it) => {
                                                const dish = it.menu;
                                                const isUnavailable = dish ? !dish.isAvailable : true;
                                                const dishId = dish?._id || it.menu;

                                                return (
                                                    <div
                                                        key={`col-item-${it._id || dishId}`}
                                                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4 transition ${
                                                            isUnavailable
                                                                ? "border-amber-200 bg-amber-50/40"
                                                                : "border-[#E8E1D7] bg-[#FCFBF8] hover:border-[#D4AF7C]/60 hover:bg-white"
                                                        }`}
                                                    >
                                                        {/* Dish info */}
                                                        <div className="flex items-center gap-3.5">
                                                            {dish?.image ? (
                                                                <img
                                                                    src={dish.image}
                                                                    alt={dish.name || "Dish"}
                                                                    className="h-14 w-14 rounded-xl object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 text-2xl">
                                                                    🍽️
                                                                </div>
                                                            )}

                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <h4 className="font-bold text-[#0B0B0B] text-base">
                                                                        {dish?.name || "Dish removed from menu"}
                                                                    </h4>
                                                                    {isUnavailable && (
                                                                        <span className="rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                                                            Currently Unavailable
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs font-semibold text-[#8B6A3E] mt-0.5">
                                                                    {dish?.price ? `₹${Number(dish.price).toLocaleString("en-IN")}` : "Price N/A"}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Stepper & Remove */}
                                                        <div className="flex items-center justify-between sm:justify-end gap-4">
                                                            {/* Quantity Stepper */}
                                                            <div className="flex items-center gap-2 rounded-xl border border-[#D8D0C4] bg-white px-2.5 py-1 shadow-xs">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleUpdateQuantity(activeCollection._id, dishId, it.quantity - 1)}
                                                                    disabled={it.quantity <= 1}
                                                                    className="text-gray-500 hover:text-black disabled:opacity-30 p-0.5"
                                                                    aria-label="Decrease quantity"
                                                                >
                                                                    <FiMinus size={13} />
                                                                </button>
                                                                <span className="text-xs font-black min-w-4 text-center">
                                                                    {it.quantity}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleUpdateQuantity(activeCollection._id, dishId, it.quantity + 1)}
                                                                    disabled={it.quantity >= 99}
                                                                    className="text-gray-500 hover:text-black disabled:opacity-30 p-0.5"
                                                                    aria-label="Increase quantity"
                                                                >
                                                                    <FiPlus size={13} />
                                                                </button>
                                                            </div>

                                                            {/* Subtotal */}
                                                            <span className="text-sm font-bold text-[#0B0B0B] min-w-16 text-right">
                                                                ₹{Number((dish?.price || 0) * it.quantity).toLocaleString("en-IN")}
                                                            </span>

                                                            {/* Remove */}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveDish(activeCollection._id, dishId, dish?.name)}
                                                                title="Remove from collection"
                                                                className="text-gray-400 hover:text-red-600 p-1 transition"
                                                            >
                                                                <FiTrash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Collection Summary & Quick Reorder Footer */}
                                    {activeCollection.items && activeCollection.items.length > 0 && (
                                        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-[#FAF7F2] p-5 border border-[#E8E1D7]">
                                            <div>
                                                <span className="text-xs font-medium text-[#756F66]">
                                                    Estimated Collection Total (using current prices)
                                                </span>
                                                <p className="text-2xl font-black text-[#0B0B0B] mt-0.5">
                                                    ₹{calculateCollectionTotal(activeCollection).toLocaleString("en-IN")}
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleQuickReorder(activeCollection)}
                                                disabled={reorderingId === activeCollection._id}
                                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B0B0B] px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-black/10 hover:bg-[#2B1F14] active:scale-95 transition disabled:opacity-50"
                                            >
                                                {reorderingId === activeCollection._id ? (
                                                    "Checking availability..."
                                                ) : (
                                                    <>
                                                        <FiShoppingBag size={16} className="text-[#D4AF7C]" />
                                                        ⚡ Quick Reorder — Add All to Cart
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Create Collection Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-in fade-in duration-150">
                    <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[#D4AF7C]/40 bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between pb-4 border-b border-[#E8E1D7]">
                            <h3 className="text-lg font-black text-[#0B0B0B]">
                                Create New Collection
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-400 hover:text-black text-2xl font-bold p-1"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleCreateCollection} className="mt-5 space-y-4">
                            <div>
                                <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.12em] text-[#5F584F]">
                                    Collection Name
                                </label>
                                <input
                                    type="text"
                                    value={newCollectionName}
                                    onChange={(e) => setNewCollectionName(e.target.value)}
                                    placeholder="e.g. My Breakfast, Weekend Favourites"
                                    maxLength={60}
                                    autoFocus
                                    className="w-full rounded-xl border border-[#D8D0C4] bg-[#FCFBF8] px-4 py-3 text-sm text-[#0B0B0B] outline-none transition focus:border-[#D4AF7C] focus:ring-2 focus:ring-[#D4AF7C]/20"
                                />
                                <p className="text-[11px] text-[#756F66] mt-1">
                                    Up to 60 characters. Must be unique to your account.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={creating || !newCollectionName.trim()}
                                    className="flex-1 rounded-xl bg-[#0B0B0B] py-3 text-sm font-bold text-white shadow-md hover:bg-[#2B1F14] transition disabled:opacity-50"
                                >
                                    {creating ? "Creating..." : "Create Collection"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="rounded-xl border border-[#D8D0C4] bg-[#F8F5EE] px-5 py-3 text-sm font-bold text-[#5F584F] hover:bg-white transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Rename Collection Modal */}
            {renamingCollection && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-in fade-in duration-150">
                    <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[#D4AF7C]/40 bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between pb-4 border-b border-[#E8E1D7]">
                            <h3 className="text-lg font-black text-[#0B0B0B]">
                                Rename Collection
                            </h3>
                            <button
                                type="button"
                                onClick={() => setRenamingCollection(null)}
                                className="text-gray-400 hover:text-black text-2xl font-bold p-1"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleRenameCollection} className="mt-5 space-y-4">
                            <div>
                                <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.12em] text-[#5F584F]">
                                    New Name
                                </label>
                                <input
                                    type="text"
                                    value={renamedName}
                                    onChange={(e) => setRenamedName(e.target.value)}
                                    maxLength={60}
                                    autoFocus
                                    className="w-full rounded-xl border border-[#D8D0C4] bg-[#FCFBF8] px-4 py-3 text-sm text-[#0B0B0B] outline-none transition focus:border-[#D4AF7C] focus:ring-2 focus:ring-[#D4AF7C]/20"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={renaming || !renamedName.trim()}
                                    className="flex-1 rounded-xl bg-[#0B0B0B] py-3 text-sm font-bold text-white shadow-md hover:bg-[#2B1F14] transition disabled:opacity-50"
                                >
                                    {renaming ? "Saving..." : "Save Name"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRenamingCollection(null)}
                                    className="rounded-xl border border-[#D8D0C4] bg-[#F8F5EE] px-5 py-3 text-sm font-bold text-[#5F584F] hover:bg-white transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

