import { useEffect, useState, useCallback } from "react";
import { FiX, FiStar, FiEdit2, FiTrash2, FiMessageSquare, FiCheck } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function ReviewModal({ item, isOpen, onClose, onReviewSubmitted }) {
    const { user } = useAuth();

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ rating: 0, numReviews: 0 });

    // Customer review eligibility & existing review
    const [canReview, setCanReview] = useState(false);
    const [eligibleOrderId, setEligibleOrderId] = useState(null);
    const [myReview, setMyReview] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Form state
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const menuId = item?._id;

    const fetchReviewsAndStatus = useCallback(async () => {
        if (!menuId) return;

        try {
            setLoading(true);

            // 1. Fetch public reviews
            const res = await api.get(`/review/menu/${menuId}`);
            setReviews(res.data?.reviews || []);
            setStats({
                rating: res.data?.rating || 0,
                numReviews: res.data?.numReviews !== undefined ? res.data.numReviews : (res.data?.reviews?.length || 0)
            });

            // 2. If authenticated, fetch customer review status
            if (user) {
                try {
                    const myRes = await api.get(`/review/my/${menuId}`);
                    setCanReview(myRes.data?.canReview || false);
                    setEligibleOrderId(myRes.data?.eligibleOrderId || null);
                    if (myRes.data?.review) {
                        setMyReview(myRes.data.review);
                        setRating(myRes.data.review.rating || 5);
                        setComment(myRes.data.review.comment || "");
                    } else {
                        setMyReview(null);
                        setRating(5);
                        setComment("");
                    }
                } catch {
                    // Ignore auth check error
                }
            }
        } catch (err) {
            console.error("Failed to load reviews:", err);
            toast.error(err.response?.data?.message || "Failed to load reviews");
        } finally {
            setLoading(false);
        }
    }, [menuId, user]);

    useEffect(() => {
        if (isOpen && menuId) {
            fetchReviewsAndStatus();
            setIsEditing(false);
        }
    }, [isOpen, menuId, fetchReviewsAndStatus]);

    // Handle Escape key
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

    if (!isOpen || !item) return null;

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!rating || rating < 1 || rating > 5) {
            toast.error("Please select a rating between 1 and 5 stars");
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                menuId,
                rating,
                comment: comment.trim(),
                orderId: eligibleOrderId || undefined
            };

            const res = await api.post("/review", payload);
            toast.success(res.data?.message || "Review submitted successfully");

            setIsEditing(false);
            await fetchReviewsAndStatus();

            if (onReviewSubmitted) {
                onReviewSubmitted({
                    menuId,
                    rating: res.data?.menuStats?.rating ?? rating,
                    numReviews: res.data?.menuStats?.numReviews
                });
            }
        } catch (err) {
            console.error("Failed to submit review:", err);
            toast.error(err.response?.data?.message || "Failed to submit review");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteReview = async () => {
        if (!myReview?._id) return;
        if (!window.confirm("Are you sure you want to delete your review?")) return;

        try {
            setDeleting(true);
            const res = await api.delete(`/review/${myReview._id}`);
            toast.success(res.data?.message || "Review deleted successfully");

            setMyReview(null);
            setRating(5);
            setComment("");
            setIsEditing(false);
            await fetchReviewsAndStatus();

            if (onReviewSubmitted) {
                onReviewSubmitted({
                    menuId,
                    rating: res.data?.menuStats?.rating ?? 0,
                    numReviews: res.data?.menuStats?.numReviews ?? 0
                });
            }
        } catch (err) {
            console.error("Failed to delete review:", err);
            toast.error(err.response?.data?.message || "Failed to delete review");
        } finally {
            setDeleting(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="relative flex flex-col w-full max-w-2xl max-h-[90vh] bg-[#FDFBF7] rounded-3xl border border-[#E8E0D4] shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#E8E0D4] bg-white">
                    <div className="flex items-center gap-3.5">
                        {item.image ? (
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-14 h-14 rounded-2xl object-cover border border-[#E8E0D4]"
                            />
                        ) : (
                            <div className="w-14 h-14 rounded-2xl bg-[#F5EFE6] flex items-center justify-center text-2xl border border-[#E8E0D4]">
                                🍽️
                            </div>
                        )}
                        <div>
                            {item.category?.name && (
                                <p className="text-xs font-bold uppercase tracking-wider text-[#B88A4A]">
                                    {item.category.name}
                                </p>
                            )}
                            <h2 className="text-xl sm:text-2xl font-black text-[#0B0B0B] leading-tight">
                                {item.name}
                            </h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className="flex items-center text-[#D4AF7C] text-sm font-bold">
                                    <span className="text-base mr-1">★</span>
                                    {stats.rating > 0 ? Number(stats.rating).toFixed(1) : "New"}
                                </div>
                                <span className="text-xs text-[#756F66]">
                                    • {stats.numReviews} {stats.numReviews === 1 ? "review" : "reviews"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close modal"
                        className="p-2.5 rounded-full text-gray-500 hover:text-black hover:bg-gray-100 transition"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Modal Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

                    {/* Customer Review Form / Status */}
                    {user && (canReview || myReview) && (
                        <div className="rounded-2xl border border-[#D4AF7C]/40 bg-white p-5 shadow-xs">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-base font-bold text-[#0B0B0B] flex items-center gap-2">
                                    <span className="text-[#D4AF7C]">★</span>
                                    {myReview ? (isEditing ? "Edit Your Review" : "Your Review") : "Write a Review"}
                                </h3>

                                {myReview && !isEditing && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(true)}
                                            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border border-[#DED5C7] text-[#756F66] hover:text-[#0B0B0B] hover:border-[#0B0B0B] transition"
                                        >
                                            <FiEdit2 size={12} />
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleDeleteReview}
                                            disabled={deleting}
                                            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition"
                                        >
                                            <FiTrash2 size={12} />
                                            {deleting ? "Deleting..." : "Delete"}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* View Existing Review if not editing */}
                            {myReview && !isEditing ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-1 text-[#D4AF7C]">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <FiStar
                                                key={star}
                                                size={16}
                                                className={star <= myReview.rating ? "fill-[#D4AF7C] text-[#D4AF7C]" : "text-gray-300"}
                                            />
                                        ))}
                                        <span className="text-xs font-bold text-[#0B0B0B] ml-1.5">
                                            {myReview.rating} / 5
                                        </span>
                                    </div>
                                    {myReview.comment ? (
                                        <p className="text-sm text-[#2B1F14] leading-relaxed bg-[#FDFBF7] p-3 rounded-xl border border-[#E8E0D4]">
                                            "{myReview.comment}"
                                        </p>
                                    ) : (
                                        <p className="text-xs italic text-[#756F66]">
                                            (No written comment provided)
                                        </p>
                                    )}
                                    <p className="text-[11px] text-[#9A9184]">
                                        Reviewed on {formatDate(myReview.createdAt)}
                                    </p>
                                </div>
                            ) : (
                                /* Review Form */
                                <form onSubmit={handleSubmitReview} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-[#756F66] mb-1.5">
                                            Select Rating
                                        </label>
                                        <div className="flex items-center gap-1.5">
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
                                                        aria-label={`${star} star`}
                                                    >
                                                        <FiStar
                                                            size={24}
                                                            className={active ? "fill-[#D4AF7C] text-[#D4AF7C]" : "text-gray-300 hover:text-[#D4AF7C]"}
                                                        />
                                                    </button>
                                                );
                                            })}
                                            <span className="text-sm font-extrabold text-[#0B0B0B] ml-2">
                                                {hoverRating || rating} / 5
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-1">
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
                                            placeholder="What made this dish special? Flavours, presentation, portion size..."
                                            rows={3}
                                            className="w-full p-3 text-sm rounded-xl border border-[#DED5C7] bg-[#FDFBF7] text-[#0B0B0B] placeholder:text-gray-400 focus:outline-none focus:border-[#D4AF7C] focus:ring-2 focus:ring-[#D4AF7C]/20 transition"
                                        />
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B0B0B] text-white text-xs sm:text-sm font-bold hover:bg-[#2B1F14] disabled:opacity-50 transition shadow-sm"
                                        >
                                            {submitting ? (
                                                "Saving..."
                                            ) : (
                                                <>
                                                    <FiCheck size={14} />
                                                    {myReview ? "Update Review" : "Submit Review"}
                                                </>
                                            )}
                                        </button>

                                        {isEditing && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setRating(myReview?.rating || 5);
                                                    setComment(myReview?.comment || "");
                                                }}
                                                className="px-4 py-2.5 rounded-xl border border-[#DED5C7] text-xs sm:text-sm font-semibold text-[#756F66] hover:bg-gray-100 transition"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {/* Unauthenticated or Ineligible Notice */}
                    {!user && (
                        <div className="p-4 rounded-2xl border border-dashed border-[#DED5C7] bg-white/70 text-center text-xs text-[#756F66]">
                            Sign in to review dishes you have ordered and enjoyed.
                        </div>
                    )}

                    {user && !canReview && !myReview && (
                        <div className="p-4 rounded-2xl border border-dashed border-[#DED5C7] bg-white/70 text-center text-xs text-[#756F66]">
                            Verified Diner Reviews: You can review this dish after ordering and receiving it.
                        </div>
                    )}

                    {/* Reviews List */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-[#0B0B0B] flex items-center gap-2">
                                <FiMessageSquare size={16} className="text-[#B88A4A]" />
                                Customer Reviews ({reviews.length})
                            </h3>
                        </div>

                        {loading ? (
                            <div className="py-8 text-center">
                                <div className="inline-block animate-spin rounded-full h-7 w-7 border-2 border-[#D4AF7C] border-t-transparent mb-2" />
                                <p className="text-xs text-[#756F66]">Loading reviews...</p>
                            </div>
                        ) : reviews.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-[#DED5C7] bg-white p-8 text-center">
                                <div className="text-3xl mb-2">✨</div>
                                <h4 className="font-bold text-sm text-[#0B0B0B]">No reviews yet</h4>
                                <p className="text-xs text-[#756F66] mt-1 max-w-sm mx-auto">
                                    Be the first to order and review this dish after your meal is delivered!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3.5">
                                {reviews.map((rev) => {
                                    const isMine = user && rev.user?._id === (user.id || user._id);
                                    return (
                                        <div
                                            key={rev._id}
                                            className="p-4 rounded-2xl bg-white border border-[#E8E0D4] shadow-2xs space-y-2 transition hover:border-[#D4AF7C]/40"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-full bg-[#0B0B0B] text-[#D4AF7C] text-xs font-bold flex items-center justify-center">
                                                        {(rev.user?.fullName || "G").charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-xs font-bold text-[#0B0B0B]">
                                                                {rev.user?.fullName || "Verified Diner"}
                                                            </p>
                                                            {isMine && (
                                                                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-[#0B0B0B] text-[#D4AF7C]">
                                                                    You
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-[#9A9184]">
                                                            {formatDate(rev.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center text-[#D4AF7C]">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <FiStar
                                                            key={star}
                                                            size={13}
                                                            className={star <= rev.rating ? "fill-[#D4AF7C] text-[#D4AF7C]" : "text-gray-200"}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            {rev.comment && (
                                                <p className="text-xs sm:text-sm text-[#2B1F14] leading-relaxed pt-1">
                                                    {rev.comment}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-[#E8E0D4] bg-[#FDFBF7] flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 rounded-xl bg-white border border-[#DED5C7] text-xs sm:text-sm font-bold text-[#2B1F14] hover:bg-gray-100 transition shadow-2xs"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ReviewModal;

