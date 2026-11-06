import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiBookmark, FiPlus, FiCheck, FiX, FiMinus } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function SaveToCollectionModal({ dish, onClose, onSaved }) {
    const { isAuthenticated } = useAuth();
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addingToId, setAddingToId] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [newCollectionName, setNewCollectionName] = useState("");
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        const fetchCollections = async () => {
            try {
                setLoading(true);
                const res = await api.get("/regular-orders");
                setCollections(res.data?.collections || []);
            } catch (err) {
                console.error("Failed to fetch collections:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCollections();
    }, [isAuthenticated]);

    if (!dish) return null;

    const dishId = dish._id || dish.id;

    // Check if dish is in collection
    const isDishInCollection = (col) => {
        return col.items?.some((it) => {
            const mId = it.menu?._id || it.menu;
            return mId && mId.toString() === dishId?.toString();
        });
    };

    const handleAddToCollection = async (collection) => {
        try {
            setAddingToId(collection._id);
            const res = await api.post(`/regular-orders/${collection._id}/items`, {
                menuId: dishId,
                quantity: Math.max(1, quantity)
            });

            toast.success(`Added ${dish.name} to "${collection.name}"`, {
                style: {
                    background: "#0B0B0B",
                    color: "#FFF6E9",
                    border: "1px solid rgba(212, 175, 124, 0.4)",
                    borderRadius: "14px"
                }
            });

            // Update local collections state
            setCollections((prev) =>
                prev.map((c) => (c._id === collection._id ? res.data.collection : c))
            );
            onSaved?.(collection);
        } catch (err) {
            console.error("Failed to add to collection:", err);
            toast.error(err.response?.data?.message || "Failed to add to collection");
        } finally {
            setAddingToId(null);
        }
    };

    const handleCreateAndAdd = async (e) => {
        e.preventDefault();
        const trimmed = newCollectionName.trim();
        if (!trimmed) {
            toast.error("Please enter a collection name");
            return;
        }

        try {
            setCreating(true);
            const res = await api.post("/regular-orders", {
                name: trimmed,
                items: [
                    {
                        menuId: dishId,
                        quantity: Math.max(1, quantity)
                    }
                ]
            });

            toast.success(`Created "${trimmed}" and saved ${dish.name}!`, {
                style: {
                    background: "#0B0B0B",
                    color: "#FFF6E9",
                    border: "1px solid rgba(212, 175, 124, 0.4)",
                    borderRadius: "14px"
                }
            });

            setCollections((prev) => [res.data.collection, ...prev]);
            setNewCollectionName("");
            onSaved?.(res.data.collection);
        } catch (err) {
            console.error("Failed to create collection:", err);
            toast.error(err.response?.data?.message || "Failed to create collection");
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#D4AF7C]/40 bg-white p-6 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#E8E1D7]">
                    <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B0B0B] text-[#D4AF7C] shadow-sm">
                            <FiBookmark size={18} />
                        </span>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B88A4A]">
                                My Regular Orders
                            </span>
                            <h3 className="text-lg font-black text-[#0B0B0B]">
                                Save to Collection
                            </h3>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close dialog"
                        className="rounded-full p-1 text-gray-400 hover:text-black transition"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Dish preview */}
                <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-[#E8E1D7] bg-[#FAF7F2] p-3.5">
                    <div className="flex items-center gap-3">
                        {dish.image ? (
                            <img
                                src={dish.image}
                                alt={dish.name}
                                className="h-12 w-12 rounded-xl object-cover"
                            />
                        ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-xl">
                                🍽️
                            </div>
                        )}
                        <div>
                            <h4 className="font-bold text-[#0B0B0B] text-sm leading-tight">
                                {dish.name}
                            </h4>
                            <p className="text-xs font-semibold text-[#8B6A3E] mt-0.5">
                                ₹{Number(dish.price || 0).toLocaleString("en-IN")}
                            </p>
                        </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 rounded-xl border border-[#D4AF7C]/40 bg-white px-2 py-1 shadow-xs">
                        <button
                            type="button"
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            className="text-[#5F584F] hover:text-black p-0.5"
                            aria-label="Decrease quantity"
                        >
                            <FiMinus size={14} />
                        </button>
                        <span className="text-xs font-black min-w-4 text-center">
                            {quantity}
                        </span>
                        <button
                            type="button"
                            onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                            className="text-[#5F584F] hover:text-black p-0.5"
                            aria-label="Increase quantity"
                        >
                            <FiPlus size={14} />
                        </button>
                    </div>
                </div>

                {!isAuthenticated ? (
                    <div className="mt-6 rounded-2xl border border-dashed border-[#D4AF7C]/60 bg-[#FAF7F2] p-6 text-center">
                        <p className="text-sm text-[#756F66] mb-3">
                            Please sign in to save dishes to your regular order collections.
                        </p>
                        <Link
                            to="/login"
                            className="inline-flex rounded-xl bg-[#0B0B0B] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#2B1F14] transition"
                        >
                            Sign In
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Collections list */}
                        <div className="mt-5">
                            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#5F584F] mb-2.5">
                                Your Saved Collections
                            </p>

                            {loading ? (
                                <div className="py-6 text-center">
                                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#D4AF7C] border-t-transparent" />
                                </div>
                            ) : collections.length === 0 ? (
                                <p className="text-xs text-[#756F66] italic py-2">
                                    You don't have any collections yet. Create your first one below!
                                </p>
                            ) : (
                                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                                    {collections.map((col) => {
                                        const alreadyIn = isDishInCollection(col);
                                        const isAdding = addingToId === col._id;

                                        return (
                                            <div
                                                key={col._id}
                                                className="flex items-center justify-between rounded-xl border border-[#E8E1D7] bg-[#FCFBF8] p-3 transition hover:border-[#D4AF7C]/60 hover:bg-white"
                                            >
                                                <div>
                                                    <p className="text-sm font-bold text-[#0B0B0B]">
                                                        {col.name}
                                                    </p>
                                                    <p className="text-[11px] text-[#756F66]">
                                                        {col.items?.length || 0} {col.items?.length === 1 ? "dish" : "dishes"}
                                                    </p>
                                                </div>

                                                {alreadyIn ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-700">
                                                        <FiCheck size={12} /> Saved
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAddToCollection(col)}
                                                        disabled={isAdding}
                                                        className="inline-flex items-center gap-1 rounded-xl bg-[#0B0B0B] px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#2B1F14] active:scale-95 disabled:opacity-50"
                                                    >
                                                        {isAdding ? "Adding..." : "+ Add"}
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Create new collection inline */}
                        <form onSubmit={handleCreateAndAdd} className="mt-5 border-t border-[#E8E1D7] pt-4">
                            <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.12em] text-[#5F584F]">
                                Or Create New Collection
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newCollectionName}
                                    onChange={(e) => setNewCollectionName(e.target.value)}
                                    placeholder="e.g. My Breakfast, Weekend Favourites"
                                    maxLength={60}
                                    className="flex-1 rounded-xl border border-[#D8D0C4] bg-[#FCFBF8] px-3.5 py-2.5 text-xs text-[#0B0B0B] outline-none transition placeholder:text-[#A69E94] focus:border-[#D4AF7C] focus:ring-2 focus:ring-[#D4AF7C]/15"
                                />
                                <button
                                    type="submit"
                                    disabled={creating || !newCollectionName.trim()}
                                    className="rounded-xl bg-[#0B0B0B] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#2B1F14] disabled:opacity-50"
                                >
                                    {creating ? "Creating..." : "Save"}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

