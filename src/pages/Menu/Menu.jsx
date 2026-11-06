import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Link,
    useSearchParams
} from "react-router-dom";

import {
    FiSearch,
    FiX,
    FiRotateCcw,
    FiTrendingUp,
    FiAward,
    FiBookmark
} from "react-icons/fi";

import toast from "react-hot-toast";

import api from "../../services/api";

import MenuCard from "../../components/MenuCard/MenuCard";
import ReviewModal from "../../components/Reviews/ReviewModal";
import SaveToCollectionModal from "../../components/RegularOrders/SaveToCollectionModal";

import {
    useCart
} from "../../context/CartContext";


function Menu() {

    // =========================================
    // URL Parameters
    // =========================================

    const [searchParams] =
        useSearchParams();


    // =========================================
    // Cart Context
    // =========================================

    const {
        dineInContext,
        setWalkInContext,
        clearDineInContext
    } = useCart();


    // =========================================
    // Menu State
    // =========================================

    const [menus, setMenus] =
        useState([]);


    const [loading, setLoading] =
        useState(true);


    const [error, setError] =
        useState("");


    // =========================================
    // Most Ordered Dishes State (Milestone 1)
    // =========================================

    const [mostOrdered, setMostOrdered] =
        useState([]);

    const [mostOrderedLoading, setMostOrderedLoading] =
        useState(true);

    const [mostOrderedError, setMostOrderedError] =
        useState("");


    // =========================================
    // Seasonal Specials State (Milestone 3)
    // =========================================

    const [seasonalSpecials, setSeasonalSpecials] =
        useState([]);

    const [specialsLoading, setSpecialsLoading] =
        useState(true);

    const [specialsError, setSpecialsError] =
        useState("");


    // =========================================
    // QR Table State
    // =========================================

    const [tableLoading, setTableLoading] =
        useState(false);


    const [tableError, setTableError] =
        useState("");


    const [walkInTable, setWalkInTable] =
        useState(null);


    // =========================================
    // Reviews Modal State (Milestone 2)
    // =========================================

    const [selectedReviewItem, setSelectedReviewItem] =
        useState(null);

    const handleReviewSubmitted = ({ menuId, rating, numReviews }) => {
        setMenus(prev =>
            prev.map(m => (m._id === menuId ? { ...m, rating, numReviews } : m))
        );
        setMostOrdered(prev =>
            prev.map(m => (m._id === menuId ? { ...m, rating, numReviews } : m))
        );
        setSeasonalSpecials(prev =>
            prev.map(m => (m._id === menuId ? { ...m, rating, numReviews } : m))
        );
    };


    // =========================================
    // Regular Orders State (Milestone 4)
    // =========================================

    const [selectedSaveItem, setSelectedSaveItem] = useState(null);

    // Collection Mode State (Milestone 4 UX Workflow)
    const targetCollectionId = searchParams.get("collectionId");
    const targetCollectionNameParam = searchParams.get("collectionName");

    const [targetCollection, setTargetCollection] = useState(null);

    useEffect(() => {
        if (!targetCollectionId) {
            setTargetCollection(null);
            return;
        }

        let isMounted = true;
        const fetchTargetCollection = async () => {
            try {
                const res = await api.get(`/regular-orders/${targetCollectionId}`);
                if (isMounted && res.data?.collection) {
                    setTargetCollection(res.data.collection);
                }
            } catch (err) {
                console.error("Failed to fetch target collection:", err);
                if (isMounted && targetCollectionNameParam) {
                    setTargetCollection({
                        _id: targetCollectionId,
                        name: targetCollectionNameParam,
                        items: []
                    });
                }
            }
        };

        fetchTargetCollection();
        return () => {
            isMounted = false;
        };
    }, [targetCollectionId, targetCollectionNameParam]);

    const handleAddToTargetCollection = async (item, quantity = 1) => {
        if (!targetCollectionId) return;
        const colName = targetCollection?.name || targetCollectionNameParam || "Collection";
        try {
            const res = await api.post(`/regular-orders/${targetCollectionId}/items`, {
                menuId: item._id,
                quantity: Math.max(1, quantity)
            });

            toast.success(`${item.name} added to ${colName}`, {
                style: {
                    background: "#0B0B0B",
                    color: "#FFF6E9",
                    border: "1px solid rgba(212, 175, 124, 0.4)",
                    borderRadius: "14px",
                    padding: "12px 18px",
                    fontWeight: "600"
                },
                iconTheme: {
                    primary: "#D4AF7C",
                    secondary: "#0B0B0B"
                }
            });

            if (res.data?.collection) {
                setTargetCollection(res.data.collection);
            } else {
                setTargetCollection((prev) => ({
                    ...prev,
                    items: [...(prev?.items || []), { menu: item, quantity }]
                }));
            }
        } catch (err) {
            console.error("Failed to add dish to collection:", err);
            toast.error(err.response?.data?.message || `Failed to add ${item.name} to collection`);
        }
    };

    const handleUpdateTargetCollectionQuantity = async (item, newQty) => {
        if (!targetCollectionId) return;
        const colName = targetCollection?.name || targetCollectionNameParam || "Collection";
        if (newQty < 1) {
            try {
                await api.delete(`/regular-orders/${targetCollectionId}/items/${item._id}`);
                toast.success(`Removed ${item.name} from ${colName}`);
                setTargetCollection((prev) => ({
                    ...prev,
                    items: (prev?.items || []).filter((it) => {
                        const mId = it.menu?._id || it.menu;
                        return mId !== item._id;
                    })
                }));
            } catch (err) {
                console.error("Failed to remove dish:", err);
                toast.error(err.response?.data?.message || "Failed to remove dish");
            }
            return;
        }

        try {
            const res = await api.put(`/regular-orders/${targetCollectionId}/items/${item._id}`, {
                quantity: newQty
            });
            if (res.data?.collection) {
                setTargetCollection(res.data.collection);
            } else {
                setTargetCollection((prev) => ({
                    ...prev,
                    items: (prev?.items || []).map((it) => {
                        const mId = it.menu?._id || it.menu;
                        return mId === item._id ? { ...it, quantity: newQty } : it;
                    })
                }));
            }
        } catch (err) {
            console.error("Failed to update quantity:", err);
            toast.error(err.response?.data?.message || "Failed to update quantity");
        }
    };


    // =========================================
    // Filters
    // =========================================

    const [search, setSearch] =
        useState("");


    const [categoryFilter, setCategoryFilter] =
        useState("All");


    const [vegFilter, setVegFilter] =
        useState("All");


    // =========================================
    // Fetch Menu
    // =========================================

    const fetchMenus = async () => {

        try {

            setLoading(true);

            setError("");


            const response =
                await api.get("/menu");


            setMenus(
                response.data.menus || []
            );

        } catch (error) {

            console.error(
                "Menu Fetch Error:",
                error
            );


            setError(
                error.response?.data?.message ||
                "Failed to load menu"
            );

        } finally {

            setLoading(false);

        }

    };


    // =========================================
    // Fetch Most Ordered Dishes (Milestone 1)
    // =========================================

    const fetchMostOrdered = async () => {

        try {

            setMostOrderedLoading(true);

            setMostOrderedError("");


            const response =
                await api.get("/menu/most-ordered");


            setMostOrdered(
                response.data?.dishes || []
            );

        } catch (err) {

            console.error(
                "Most Ordered Fetch Error:",
                err
            );


            setMostOrderedError(
                err.response?.data?.message ||
                "Failed to load most ordered dishes"
            );

        } finally {

            setMostOrderedLoading(false);

        }

    };


    // =========================================
    // Fetch Seasonal Specials (Milestone 3)
    // =========================================

    const fetchSeasonalSpecials = async () => {

        try {

            setSpecialsLoading(true);

            setSpecialsError("");


            const response =
                await api.get("/menu/seasonal-specials");


            setSeasonalSpecials(
                response.data?.specials || []
            );

        } catch (err) {

            console.error(
                "Seasonal Specials Fetch Error:",
                err
            );


            setSpecialsError(
                err.response?.data?.message ||
                "Failed to load seasonal specials"
            );

        } finally {

            setSpecialsLoading(false);

        }

    };


    // =========================================
    // Verify Walk-In Table
    // =========================================

    const verifyWalkInTable = async (
        tableId
    ) => {

        try {

            setTableLoading(true);

            setTableError("");


            // -----------------------------------------
            // Get all tables
            // -----------------------------------------

            const response =
                await api.get("/table");


            const tables =
                response.data?.tables || [];


            // -----------------------------------------
            // Find QR table
            // -----------------------------------------

            const table =
                tables.find(
                    currentTable =>
                        currentTable._id ===
                        tableId
                );


            // -----------------------------------------
            // Table Not Found
            // -----------------------------------------

            if (!table) {

                setWalkInTable(null);

                clearDineInContext();


                setTableError(
                    "Table not found. Please scan a valid table QR code."
                );

                return;

            }


            // -----------------------------------------
            // Check Table Type
            // -----------------------------------------

            if (
                table.tableType !==
                "Walk-In"
            ) {

                setWalkInTable(null);

                clearDineInContext();


                setTableError(
                    "This QR code is not for a Walk-In table."
                );

                return;

            }


            // -----------------------------------------
            // Check Table Status
            // -----------------------------------------

            if (
                table.status !==
                "Available"
            ) {

                setWalkInTable(null);

                clearDineInContext();


                setTableError(
                    `Table ${table.tableNumber} is currently not available.`
                );

                return;

            }


            // -----------------------------------------
            // Valid Walk-In Table
            // -----------------------------------------

            setWalkInTable(
                table
            );


            // -----------------------------------------
            // Save Walk-In Context
            // -----------------------------------------

            setWalkInContext(
                table._id
            );


        } catch (error) {

            console.error(
                "Walk-In Table Verification Error:",
                error
            );


            setWalkInTable(null);


            clearDineInContext();


            setTableError(
                error.response?.data?.message ||
                "Unable to verify table."
            );

        } finally {

            setTableLoading(false);

        }

    };


    // =========================================
    // Initial Load
    // =========================================

    useEffect(() => {

        fetchMenus();
        fetchMostOrdered();
        fetchSeasonalSpecials();

    }, []);


    // =========================================
    // Handle QR Table
    // =========================================

    useEffect(() => {

        const tableId =
            searchParams.get("table");


        // -----------------------------------------
        // No table parameter
        // -----------------------------------------

        if (!tableId) {

            /*
             * Do NOT automatically clear an existing
             * dine-in context here.
             *
             * This allows the customer to move from
             * Menu → Cart → Checkout without losing
             * the Walk-In table.
             */

            return;

        }


        // -----------------------------------------
        // Verify QR table
        // -----------------------------------------

        verifyWalkInTable(
            tableId
        );


    }, [searchParams]);


    // =========================================
    // Get Categories
    // =========================================

    const categories = useMemo(() => {

        const categoryMap =
            new Map();


        menus.forEach(menu => {

            if (
                menu.category?._id
            ) {

                categoryMap.set(

                    menu.category._id,

                    menu.category.name

                );

            }

        });


        return Array.from(
            categoryMap.entries()
        );

    }, [menus]);

    const categoryCounts = useMemo(() => {

        const counts = { All: menus.length };

        menus.forEach(menu => {

            const catId = menu.category?._id;

            if (catId) {
                counts[catId] = (counts[catId] || 0) + 1;
            }

        });

        return counts;

    }, [menus]);


    // =========================================
    // Filter Menu
    // =========================================

    const filteredMenus = useMemo(() => {

        const searchText =
            search
                .trim()
                .toLowerCase();


        return menus.filter(
            menu => {

                const name =
                    menu.name
                        ?.toLowerCase() ||
                    "";


                const description =
                    menu.description
                        ?.toLowerCase() ||
                    "";


                const categoryName =
                    menu.category?.name
                        ?.toLowerCase() ||
                    "";


                const matchesSearch =

                    !searchText ||

                    name.includes(
                        searchText
                    ) ||

                    description.includes(
                        searchText
                    ) ||

                    categoryName.includes(
                        searchText
                    );


                const matchesCategory =

                    categoryFilter ===
                    "All" ||

                    menu.category?._id ===
                    categoryFilter;


                const matchesVeg =

                    vegFilter ===
                    "All" ||

                    (
                        vegFilter ===
                        "Veg" &&
                        menu.isVeg
                    ) ||

                    (
                        vegFilter ===
                        "Non-Veg" &&
                        !menu.isVeg
                    );


                return (

                    matchesSearch &&

                    matchesCategory &&

                    matchesVeg

                );

            }
        );

    }, [
        menus,
        search,
        categoryFilter,
        vegFilter
    ]);


    // =========================================
    // Loading Menu
    // =========================================

    if (loading) {

        return (

            <div className="max-w-7xl mx-auto px-4 py-20">

                <div className="text-center">

                    <div className="text-5xl mb-4">
                        🍽️
                    </div>

                    <p className="text-gray-500 text-lg">
                        Loading our menu...
                    </p>

                </div>

            </div>

        );

    }


    // =========================================
    // Menu Error
    // =========================================

    if (error) {

        return (

            <div className="max-w-7xl mx-auto px-4 py-20">

                <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">

                    <div className="text-4xl mb-3">
                        ⚠️
                    </div>

                    <h2 className="text-xl font-bold text-red-700">
                        Unable to load menu
                    </h2>

                    <p className="text-red-600 mt-2">
                        {error}
                    </p>

                    <button
                        onClick={fetchMenus}
                        className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white hover:bg-red-700"
                    >
                        Try Again
                    </button>

                </div>

            </div>

        );

    }


    // =========================================
    // Main UI
    // =========================================

    return (

        <div className="lux-container py-10">


            {/* ================================= */}
            {/* Header */}
            {/* ================================= */}

            <div className="mb-6 sm:mb-8">

                <div>

                    <p className="text-[#B88A4A] font-bold uppercase tracking-[0.18em] text-xs sm:text-sm">
                        LUX Restaurant
                    </p>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mt-1 text-[#0B0B0B]">
                        Our Menu
                    </h1>

                    <p className="text-[#756F66] mt-1 sm:mt-2 text-sm sm:text-base">
                        Discover delicious dishes prepared for you.
                    </p>

                </div>

            </div>


            {/* ================================= */}
            {/* Collection Mode Banner (Milestone 4) */}
            {/* ================================= */}

            {targetCollectionId && (
                <div className="mb-8 rounded-3xl border border-[#D4AF7C] bg-gradient-to-r from-[#0B0B0B] via-[#1F1912] to-[#0B0B0B] p-5 sm:p-6 text-white shadow-xl shadow-black/10">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-start sm:items-center gap-3.5">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#D4AF7C]/20 border border-[#D4AF7C]/40 text-[#D4AF7C] shadow-inner">
                                <FiBookmark size={22} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="inline-block rounded-full bg-[#D4AF7C] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#0B0B0B]">
                                        Collection Mode
                                    </span>
                                    <span className="text-xs text-[#D8D0C4]">
                                        {targetCollection?.items?.length || 0} {(targetCollection?.items?.length || 0) === 1 ? "dish" : "dishes"} saved
                                    </span>
                                </div>
                                <h2 className="mt-1 text-xl sm:text-2xl font-black text-[#FFFDF9] tracking-tight">
                                    Adding dishes to: <span className="text-[#D4AF7C]">{targetCollection?.name || targetCollectionNameParam || "Collection"}</span>
                                </h2>
                                <p className="mt-0.5 text-xs text-[#B8AEA2]">
                                    Click "+ Add to {targetCollection?.name || targetCollectionNameParam || "Collection"}" on any dish below. Tap "Back to Collection" when done.
                                </p>
                            </div>
                        </div>

                        <Link
                            to={`/regular-orders?collectionId=${targetCollectionId}`}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D4AF7C] hover:bg-[#E2C296] px-5 py-3 text-xs font-black text-[#0B0B0B] uppercase tracking-wider transition shadow-md shadow-black/20 self-stretch sm:self-auto whitespace-nowrap active:scale-95"
                        >
                            <span>← Back to {targetCollection?.name || targetCollectionNameParam || "Collection"}</span>
                        </Link>
                    </div>
                </div>
            )}


            {/* ================================= */}
            {/* Walk-In Table Banner */}
            {/* ================================= */}

            {tableLoading && (

                <div className="mb-8 bg-blue-50 border border-blue-200 rounded-2xl p-5">

                    <div className="flex items-center gap-3">

                        <div className="text-2xl">
                            🪑
                        </div>

                        <div>

                            <p className="font-semibold text-blue-700">
                                Verifying your table...
                            </p>

                            <p className="text-sm text-blue-600 mt-1">
                                Please wait while we confirm your Walk-In table.
                            </p>

                        </div>

                    </div>

                </div>

            )}


            {walkInTable && !tableLoading && (

                <div className="mb-8 bg-green-50 border border-green-200 rounded-2xl p-5">

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                        <div className="flex items-center gap-3">

                            <div className="text-3xl">
                                🪑
                            </div>

                            <div>

                                <p className="text-green-700 font-bold text-lg">
                                    Table {walkInTable.tableNumber}
                                </p>

                                <p className="text-green-600 text-sm">
                                    Walk-In ordering
                                </p>

                            </div>

                        </div>


                        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">

                            ✓ Table Available

                        </div>

                    </div>

                </div>

            )}


            {tableError && (

                <div className="mb-8 bg-red-50 border border-red-200 rounded-2xl p-5">

                    <div className="flex items-start gap-3">

                        <div className="text-2xl">
                            ⚠️
                        </div>

                        <div>

                            <p className="font-semibold text-red-700">
                                Walk-In Table Error
                            </p>

                            <p className="text-sm text-red-600 mt-1">
                                {tableError}
                            </p>

                        </div>

                    </div>

                </div>

            )}


            {/* ================================= */}
            {/* Seasonal Specials (Milestone 3)   */}
            {/* ================================= */}

            {!specialsLoading && !specialsError && seasonalSpecials.length > 0 && (
                <section aria-labelledby="seasonal-specials-heading" className="mb-10">

                    <div className="rounded-3xl border border-[#D4AF7C]/40 bg-gradient-to-b from-[#FFFDF9] via-[#FAF6ED] to-[#F5ECE0]/70 p-5 sm:p-7 shadow-sm shadow-[#2B1F14]/5">

                        {/* Section Header */}
                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 pb-5 border-b border-[#D4AF7C]/30 mb-6">
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#0B0B0B] text-[#D4AF7C] mb-2 shadow-xs">
                                    <span>✨</span>
                                    Chef's Seasonal Curation
                                </div>
                                <h2 id="seasonal-specials-heading" className="text-2xl sm:text-3xl font-black text-[#0B0B0B] tracking-tight">
                                    Seasonal Specials
                                </h2>
                                <p className="text-[#756F66] text-sm sm:text-base mt-1">
                                    Exquisite limited-time creations crafted for the season.
                                </p>
                            </div>

                            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#0B0B0B] text-[#D4AF7C] border border-[#D4AF7C]/40 self-start sm:self-auto shadow-xs">
                                {seasonalSpecials.length} Limited-Time {seasonalSpecials.length === 1 ? "Special" : "Specials"}
                            </span>
                        </div>

                        {/* Populated Specials Grid */}
                        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {seasonalSpecials.map((special) => (
                                <MenuCard
                                    key={`seasonal-special-${special._id}`}
                                    item={special}
                                    onOpenReviews={setSelectedReviewItem}
                                    onSaveToCollection={setSelectedSaveItem}
                                    targetCollection={targetCollection}
                                    onAddToTargetCollection={handleAddToTargetCollection}
                                    onUpdateTargetCollectionQuantity={handleUpdateTargetCollectionQuantity}
                                />
                            ))}
                        </div>

                    </div>

                </section>
            )}


            {/* ================================= */}
            {/* Most Ordered Dishes (Milestone 1) */}
            {/* ================================= */}

            <section aria-labelledby="most-ordered-heading" className="mb-10">

                <div className="rounded-3xl border border-[#E8E0D4] bg-gradient-to-b from-[#FDFBF7] via-[#FBF7EF] to-[#F5EFE6]/60 p-5 sm:p-7 shadow-sm shadow-[#2B1F14]/5">

                    {/* Section Header */}
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 pb-5 border-b border-[#E8E0D4]/80 mb-6">
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#0B0B0B] text-[#D4AF7C] mb-2">
                                <FiTrendingUp size={13} className="text-[#D4AF7C]" />
                                Trending Favourites
                            </div>
                            <h2 id="most-ordered-heading" className="text-2xl sm:text-3xl font-black text-[#0B0B0B] tracking-tight">
                                Most Ordered This Week
                            </h2>
                            <p className="text-[#756F66] text-sm sm:text-base mt-1">
                                Customer favourites from the last 7 days.
                            </p>
                        </div>

                        {mostOrdered.length > 0 && (
                            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-[#DED5C7] text-[#756F66] self-start sm:self-auto shadow-xs">
                                Top {mostOrdered.length} Popular {mostOrdered.length === 1 ? "Dish" : "Dishes"}
                            </span>
                        )}
                    </div>

                    {/* Loading State */}
                    {mostOrderedLoading && (
                        <div className="py-12 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#D4AF7C] border-t-transparent mb-3" />
                            <p className="text-sm font-medium text-[#756F66]">
                                Loading this week's favourites...
                            </p>
                        </div>
                    )}

                    {/* Error State */}
                    {!mostOrderedLoading && mostOrderedError && (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-center">
                            <p className="text-sm text-amber-800">
                                Could not load trending dishes right now.
                            </p>
                            <button
                                type="button"
                                onClick={fetchMostOrdered}
                                className="mt-2 text-xs font-bold text-[#B88A4A] hover:underline"
                            >
                                Tap to retry
                            </button>
                        </div>
                    )}

                    {/* Empty State */}
                    {!mostOrderedLoading && !mostOrderedError && mostOrdered.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-[#DED5C7] bg-white/70 p-8 sm:p-10 text-center">
                            <div className="text-3xl sm:text-4xl mb-2">✨</div>
                            <h3 className="text-base sm:text-lg font-bold text-[#0B0B0B]">
                                No orders recorded in the last 7 days yet
                            </h3>
                            <p className="text-xs sm:text-sm text-[#756F66] mt-1 max-w-md mx-auto">
                                The kitchen is warming up! Popular dishes will automatically appear here as qualifying orders are placed this week.
                            </p>
                        </div>
                    )}

                    {/* Populated Most Ordered Grid */}
                    {!mostOrderedLoading && !mostOrderedError && mostOrdered.length > 0 && (
                        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {mostOrdered.map((dish, index) => (
                                <div key={`most-ordered-${dish._id}`} className="flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-2.5 px-1 gap-2">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#0B0B0B] text-[#D4AF7C] border border-[#D4AF7C]/30 shadow-xs">
                                            <FiAward size={12} className="text-[#D4AF7C]" />
                                            #{index + 1} Most Ordered
                                        </span>
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white text-[#2B1F14] border border-[#E8E0D4] shadow-xs">
                                            🔥 {dish.totalQuantityOrdered} {dish.totalQuantityOrdered === 1 ? "portion" : "portions"} ordered
                                        </span>
                                    </div>
                                    <div className="flex-1 flex flex-col">
                                        <MenuCard
                                            item={dish}
                                            onOpenReviews={setSelectedReviewItem}
                                            onSaveToCollection={setSelectedSaveItem}
                                            targetCollection={targetCollection}
                                            onAddToTargetCollection={handleAddToTargetCollection}
                                            onUpdateTargetCollectionQuantity={handleUpdateTargetCollectionQuantity}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>

            </section>


            {/* ================================= */}
            {/* Search / Filters */}
            {/* ================================= */}

            <div className="mb-6 rounded-2xl sm:rounded-3xl border border-[#E8E0D4] bg-white/95 p-4 sm:p-5 shadow-sm shadow-[#2B1F14]/5 backdrop-blur-sm">

                {/* Top Row: Search Input + Diet Switcher */}
                <div className="flex flex-col md:flex-row md:items-center gap-3 sm:gap-4">

                    {/* Search */}
                    <div className="relative flex-1">
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#B88A4A]">
                            <FiSearch size={18} />
                        </span>

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search dishes, flavours, ingredients..."
                            className="w-full rounded-xl sm:rounded-2xl border border-[#DED5C7] bg-[#FBF7EF]/50 py-3 pl-11 pr-10 text-sm sm:text-base text-[#2B1F14] outline-none transition placeholder:text-[#9A9184] hover:bg-[#FBF7EF] focus:border-[#D4AF7C] focus:bg-white focus:ring-4 focus:ring-[#D4AF7C]/15"
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-200/80 text-gray-600 transition hover:bg-gray-300 hover:text-black"
                                aria-label="Clear search"
                            >
                                <FiX size={13} />
                            </button>
                        )}
                    </div>

                    {/* Food Type Segmented Switcher */}
                    <div className="inline-flex w-full sm:w-auto items-center rounded-xl sm:rounded-2xl border border-[#E8E0D4] bg-[#F5EFE6]/70 p-1">
                        <button
                            type="button"
                            onClick={() => setVegFilter("All")}
                            className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition ${
                                vegFilter === "All"
                                    ? "bg-white text-[#0B0B0B] shadow-sm"
                                    : "text-gray-600 hover:text-[#0B0B0B]"
                            }`}
                        >
                            All Types
                        </button>

                        <button
                            type="button"
                            onClick={() => setVegFilter("Veg")}
                            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition ${
                                vegFilter === "Veg"
                                    ? "bg-white text-emerald-800 shadow-sm"
                                    : "text-gray-600 hover:text-[#0B0B0B]"
                            }`}
                        >
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span>Veg</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setVegFilter("Non-Veg")}
                            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition ${
                                vegFilter === "Non-Veg"
                                    ? "bg-white text-rose-800 shadow-sm"
                                    : "text-gray-600 hover:text-[#0B0B0B]"
                            }`}
                        >
                            <span className="h-2 w-2 rounded-full bg-rose-500" />
                            <span>Non-Veg</span>
                        </button>
                    </div>

                </div>

                {/* Bottom Row: Quick Category Pills */}
                {categories.length > 0 && (
                    <div className="mt-3.5 pt-3.5 border-t border-[#EFE7DA]">
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            <button
                                type="button"
                                onClick={() => setCategoryFilter("All")}
                                className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                                    categoryFilter === "All"
                                        ? "bg-[#0B0B0B] text-white shadow-sm"
                                        : "border border-[#DED5C7] bg-[#FBF7EF]/50 text-gray-700 hover:border-[#D4AF7C] hover:bg-white"
                                }`}
                            >
                                All ({menus.length})
                            </button>

                            {categories.map(([id, name]) => {
                                const count = categoryCounts[id] || 0;
                                const isSelected = categoryFilter === id;
                                return (
                                    <button
                                        key={id}
                                        type="button"
                                        onClick={() => setCategoryFilter(id)}
                                        className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                                            isSelected
                                                ? "bg-[#0B0B0B] text-white shadow-sm"
                                                : "border border-[#DED5C7] bg-[#FBF7EF]/50 text-gray-700 hover:border-[#D4AF7C] hover:bg-white"
                                        }`}
                                    >
                                        {name}{" "}
                                        <span className={isSelected ? "text-white/60" : "text-gray-400"}>
                                            ({count})
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

            </div>


            {/* ================================= */}
            {/* Result Header & Active Filter Bar */}
            {/* ================================= */}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">

                <div className="flex items-center gap-2 flex-wrap">

                    <p className="text-sm text-[#756F66]">
                        Showing{" "}
                        <span className="font-bold text-[#0B0B0B]">
                            {filteredMenus.length}
                        </span>{" "}
                        of{" "}
                        <span className="font-bold text-[#0B0B0B]">
                            {menus.length}
                        </span>{" "}
                        dishes
                    </p>

                    {search && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#F5EFE6] text-[#2B1F14] border border-[#E8E0D4]">
                            "{search}"
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                className="hover:text-black"
                                aria-label="Remove search filter"
                            >
                                <FiX size={12} />
                            </button>
                        </span>
                    )}

                    {vegFilter !== "All" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#F5EFE6] text-[#2B1F14] border border-[#E8E0D4]">
                            {vegFilter === "Veg" ? "🟢 Vegetarian" : "🔴 Non-Vegetarian"}
                            <button
                                type="button"
                                onClick={() => setVegFilter("All")}
                                className="hover:text-black"
                                aria-label="Remove food type filter"
                            >
                                <FiX size={12} />
                            </button>
                        </span>
                    )}

                    {categoryFilter !== "All" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#F5EFE6] text-[#2B1F14] border border-[#E8E0D4]">
                            {categories.find(([id]) => id === categoryFilter)?.[1] || "Category"}
                            <button
                                type="button"
                                onClick={() => setCategoryFilter("All")}
                                className="hover:text-black"
                                aria-label="Remove category filter"
                            >
                                <FiX size={12} />
                            </button>
                        </span>
                    )}

                </div>


                {(search ||
                    categoryFilter !== "All" ||
                    vegFilter !== "All") && (

                    <button
                        type="button"
                        onClick={() => {
                            setSearch("");
                            setCategoryFilter("All");
                            setVegFilter("All");
                        }}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#B88A4A] hover:text-[#8B6A3E] transition"
                    >
                        <FiRotateCcw size={13} />
                        Clear all filters
                    </button>

                )}

            </div>


            {/* ================================= */}
            {/* Menu */}
            {/* ================================= */}

            {filteredMenus.length === 0 ? (

                <div className="rounded-3xl border border-[#D8D0C4] bg-white p-12 text-center shadow-sm">

                    <div className="text-6xl mb-4">
                        🍽️
                    </div>

                    <h2 className="text-2xl font-black text-[#0B0B0B]">
                        No dishes found
                    </h2>

                    <p className="mt-2 text-[#756F66]">
                        Try another search or change your filters.
                    </p>

                    <button
                        onClick={() => {

                            setSearch("");

                            setCategoryFilter(
                                "All"
                            );

                            setVegFilter(
                                "All"
                            );

                        }}
                        className="mt-5 rounded-xl bg-[#0B0B0B] px-5 py-2.5 font-semibold text-white hover:bg-[#2B1F14]"
                    >
                        Show All Dishes
                    </button>

                </div>

            ) : (

                <div className="grid gap-7 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

                    {filteredMenus.map(
                        item => (

                            <MenuCard
                                key={item._id}
                                item={item}
                                onOpenReviews={setSelectedReviewItem}
                                onSaveToCollection={setSelectedSaveItem}
                                targetCollection={targetCollection}
                                onAddToTargetCollection={handleAddToTargetCollection}
                                onUpdateTargetCollectionQuantity={handleUpdateTargetCollectionQuantity}
                            />

                        )
                    )}

                </div>

            )}

            {/* ================================= */}
            {/* Dish Reviews Modal (Milestone 2) */}
            {/* ================================= */}

            <ReviewModal
                item={selectedReviewItem}
                isOpen={!!selectedReviewItem}
                onClose={() => setSelectedReviewItem(null)}
                onReviewSubmitted={handleReviewSubmitted}
            />

            {/* ================================= */}
            {/* Save to Collection Modal (Milestone 4) */}
            {/* ================================= */}

            <SaveToCollectionModal
                dish={selectedSaveItem}
                onClose={() => setSelectedSaveItem(null)}
            />

        </div>

    );

}


export default Menu;