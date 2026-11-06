import { useEffect, useState } from "react";
import { FiX, FiStar, FiCheck, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../services/api";

function RateDishModal({ isOpen, onClose, dish, orderId, onReviewSubmitted }) {
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [existingReview, setExistingReview] = useState(null);
    const [loadingExisting, setLoadingExisting] = useState(true);

    const menuId = dish?._id || dish?.menu?._id;
    const dishName = dish?.name || dish?.menu?.name || "Dish";
    const dishImage = dish?.image || dish?.menu?.image;

    useEffect(() => {
        const fetchExisting = async () => {
            if (!menuId || !isOpen) return;
            try {
                setLoadingExisting(true);
                const res = await api.get(`/review/my/${menuId}`);
                if (res.data?.review) {
                    setExistingReview(res.data.review);
                    setRating(res.data.review.rating || 5);
                    setComment(res.data.review.comment || "");
                } else {
                    setExistingReview(null);
                    setRating(5);
                    setComment("");
                }
            } catch {
                // Ignore
            } finally {
                setLoadingExisting(false);
            }
        };

        if (isOpen) {
            fetchExisting();
        }
    }, [menuId, isOpen]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            window.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        }
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "auto";
        };
    }, [isOpen, onClose]);

    if (!isOpen || !dish) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rating || rating < 1 || rating > 5) {
            toast.error("Please choose a star rating from 1 to 5");
            return;
        }

        try {
            setSubmitting(true);
            const res = await api.post("/review", {
                menuId,
                orderId,
                rating,
                comment: comment.trim()
            });

            toast.success(res.data?.message || "Thank you for reviewing!");
            if (onReviewSubmitted) {
                onReviewSubmitted(res.data?.review);
            }
            onClose();
        } catch (err) {
            console.error("Failed to submit review:", err);
            toast.error(err.response?.data?.message || "Failed to submit review");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!existingReview?._id) return;
        if (!window.confirm("Are you sure you want to delete this review?")) return;

        try {
            setDeleting(true);
            await api.delete(`/review/${existingReview._id}`);
            toast.success("Review deleted successfully");
            if (onReviewSubmitted) {
                onReviewSubmitted(null);
            }
            onClose();
        } catch (err) {
            console.error("Failed to delete review:", err);
            toast.error(err.response?.data?.message || "Failed to delete review");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="relative w-full max-w-lg bg-[#FDFBF7] rounded-3xl border border-[#E8E0D4] shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-[#E8E0D4] bg-white">
                    <div className="flex items-center gap-3">
                        {dishImage ? (
                            <img
                                src={dishImage}
                                alt={dishName}
                                className="w-12 h-12 rounded-xl object-cover border border-[#E8E0D4]"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-xl bg-[#F5EFE6] flex items-center justify-center text-xl">
                                🍽️
                            </div>
                        )}
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-[#B88A4A]">
                                Verified Order Item
                            </p>
                            <h3 className="text-lg font-black text-[#0B0B0B] leading-tight">
                                {dishName}
                            </h3>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="p-2 rounded-full text-gray-500 hover:text-black hover:bg-gray-100 transition"
                    >
                        <FiX size={18} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
                    {loadingExisting ? (
                        <div className="py-6 text-center text-xs text-[#756F66]">
                            Loading review details...
                        </div>
                    ) : (
                        <>
                            {/* Star Selector */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#756F66] mb-2">
                                    Your Rating
                                </label>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => {
                                        const active = hoverRating ? star <= hoverRating : star <= rating;
                                        return (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                className="p-1 focus:outline-none transition transform hover:scale-110"
                                            >
                                                <FiStar
                                                    size={28}
                                                    className={active ? "fill-[#D4AF7C] text-[#D4AF7C]" : "text-gray-300 hover:text-[#D4AF7C]"}
                                                />
                                            </button>
                                        );
                                    })}
                                    <span className="text-base font-black text-[#0B0B0B] ml-2">
                                        {hoverRating || rating} / 5
                                    </span>
                                </div>
                            </div>

                            {/* Comment */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#756F66]">
                                        Your Review (Optional)
                                    </label>
                                    <span className={`text-xs ${comment.length > 480 ? "text-red-500 font-bold" : "text-gray-400"}`}>
                                        {comment.length} / 500
                                    </span>
                                </div>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value.slice(0, 500))}
                                    placeholder="Share your experience with this dish..."
                                    rows={4}
                                    className="w-full p-3 text-sm rounded-xl border border-[#DED5C7] bg-white text-[#0B0B0B] placeholder:text-gray-400 focus:outline-none focus:border-[#D4AF7C] focus:ring-2 focus:ring-[#D4AF7C]/20 transition"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-2">
                                {existingReview ? (
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition"
                                    >
                                        <FiTrash2 size={13} />
                                        {deleting ? "Deleting..." : "Delete Review"}
                                    </button>
                                ) : (
                                    <div />
                                )}

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2.5 rounded-xl border border-[#DED5C7] text-xs font-semibold text-[#756F66] hover:bg-gray-100 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B0B0B] text-white text-xs font-bold hover:bg-[#2B1F14] disabled:opacity-50 transition shadow-sm"
                                    >
                                        <FiCheck size={14} />
                                        {submitting ? "Saving..." : existingReview ? "Update Review" : "Submit Review"}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
}

export default RateDishModal;

