import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import api from "../../../services/api";

function AdminMenu() {

    const [menus, setMenus] = useState([]);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [editingMenu, setEditingMenu] = useState(null);

    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [vegFilter, setVegFilter] = useState("All");
    const [specialFilter, setSpecialFilter] = useState("All");

    const [managingSpecial, setManagingSpecial] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        isVeg: true,
        preparationTime: "",
        model3D: "",
        isSeasonalSpecial: false,
        specialStartDate: "",
        specialEndDate: ""
    });

    // =========================================
    // Special Date Helpers (Asia/Kolkata)
    // =========================================

    const formatDateForInput = (dateVal) => {
        if (!dateVal) return "";
        try {
            const d = new Date(dateVal);
            if (isNaN(d.getTime())) return "";
            return new Intl.DateTimeFormat("en-CA", {
                timeZone: "Asia/Kolkata",
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }).format(d);
        } catch {
            return "";
        }
    };

    const formatSpecialDateDisplay = (dateVal) => {
        if (!dateVal) return "None";
        try {
            const d = new Date(dateVal);
            if (isNaN(d.getTime())) return "None";
            return new Intl.DateTimeFormat("en-IN", {
                timeZone: "Asia/Kolkata",
                day: "numeric",
                month: "short",
                year: "numeric"
            }).format(d);
        } catch {
            return "None";
        }
    };

    const getSpecialStatus = (menuItem) => {
        if (!menuItem.isSeasonalSpecial) return "Not a Special";
        const now = new Date();
        if (menuItem.specialEndDate && new Date(menuItem.specialEndDate) < now) {
            return "Expired";
        }
        if (menuItem.specialStartDate && new Date(menuItem.specialStartDate) > now) {
            return "Scheduled";
        }
        return "Active";
    };


    // =========================================
    // Fetch Categories
    // =========================================

    const fetchCategories = async () => {

        try {

            const response = await api.get("/category");

            setCategories(response.data.categories || []);

        } catch (error) {

            console.error("Category Error:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to load categories"
            );

        }

    };


    // =========================================
    // Fetch Menu
    // =========================================

    const fetchMenus = async () => {

        try {

            setLoading(true);

            const response = await api.get("/menu");

            setMenus(response.data.menus || []);

        } catch (error) {

            console.error("Menu Error:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to load menu"
            );

        } finally {

            setLoading(false);

        }

    };


    // =========================================
    // Initial Load
    // =========================================

    useEffect(() => {

        fetchMenus();
        fetchCategories();

    }, []);


    // =========================================
    // Handle Input
    // =========================================

    const handleChange = (e) => {

        const {
            name,
            value,
            type,
            checked
        } = e.target;

        setFormData({
            ...formData,
            [name]:
                type === "checkbox"
                    ? checked
                    : value
        });

    };


    // =========================================
    // Reset Form
    // =========================================

    const resetForm = () => {

        setFormData({
            name: "",
            description: "",
            price: "",
            category: "",
            isVeg: true,
            preparationTime: "",
            model3D: "",
            isSeasonalSpecial: false,
            specialStartDate: "",
            specialEndDate: ""
        });

        setEditingMenu(null);
        setShowForm(false);

    };


    // =========================================
    // Add Menu
    // =========================================

    const handleAdd = () => {

        setEditingMenu(null);

        setFormData({
            name: "",
            description: "",
            price: "",
            category: "",
            isVeg: true,
            preparationTime: "",
            model3D: "",
            isSeasonalSpecial: false,
            specialStartDate: "",
            specialEndDate: ""
        });

        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    };


    // =========================================
    // Edit Menu
    // =========================================

    const handleEdit = (menu) => {

        setEditingMenu(menu);

        setFormData({
            name: menu.name || "",
            description: menu.description || "",
            price: menu.price || "",
            category:
                menu.category?._id ||
                menu.category ||
                "",
            isVeg: menu.isVeg ?? true,
            preparationTime:
                menu.preparationTime || "",
            model3D: menu.model3D || "",
            isSeasonalSpecial: Boolean(menu.isSeasonalSpecial),
            specialStartDate: formatDateForInput(menu.specialStartDate),
            specialEndDate: formatDateForInput(menu.specialEndDate)
        });

        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    };


    // =========================================
    // Submit
    // =========================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            if (!formData.name.trim()) {

                toast.error("Please enter menu name");

                return;

            }

            if (!formData.description.trim()) {

                toast.error("Please enter description");

                return;

            }

            if (!formData.price || Number(formData.price) <= 0) {

                toast.error("Please enter a valid price");

                return;

            }

            if (!formData.category) {

                toast.error("Please select a category");

                return;

            }


            if (formData.isSeasonalSpecial && formData.specialStartDate && formData.specialEndDate) {
                if (new Date(formData.specialEndDate) < new Date(formData.specialStartDate)) {
                    toast.error("Special expiry date cannot be earlier than start date");
                    return;
                }
            }

            const payload = {
                ...formData,
                specialStartDate:
                    formData.isSeasonalSpecial && formData.specialStartDate
                        ? formData.specialStartDate
                        : null,
                specialEndDate:
                    formData.isSeasonalSpecial && formData.specialEndDate
                        ? formData.specialEndDate
                        : null
            };

            if (editingMenu) {

                await api.put(
                    `/menu/${editingMenu._id}`,
                    payload
                );

                toast.success(
                    "Menu updated successfully"
                );

            } else {

                await api.post(
                    "/menu",
                    payload
                );

                toast.success(
                    "Menu item created successfully"
                );

            }

            resetForm();

            await fetchMenus();

        } catch (error) {

            console.error("Save Menu Error:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to save menu item"
            );

        }

    };


    // =========================================
    // Delete
    // =========================================

    const handleDelete = async (menuId) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this menu item?"
        );

        if (!confirmed) {
            return;
        }

        try {

            await api.delete(
                `/menu/${menuId}`
            );

            toast.success(
                "Menu item deleted successfully"
            );

            await fetchMenus();

        } catch (error) {

            console.error(
                "Delete Menu Error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to delete menu item"
            );

        }

    };

    // =========================================
    // Toggle Availability
    // =========================================

    const handleToggleAvailability = async (menu) => {
        try {
            await api.put(`/menu/${menu._id}`, {
                isAvailable: !menu.isAvailable
            });

            toast.success(
                menu.isAvailable
                    ? "Menu item disabled"
                    : "Menu item enabled"
            );

            await fetchMenus();

        } catch (error) {
            console.error(
                "Toggle Availability Error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to update availability"
            );
        }
    };

    // =========================================
    // Seasonal Special Management (Milestone 3)
    // =========================================

    const handleOpenManageSpecial = (menu) => {
        setManagingSpecial({
            menu,
            isSeasonalSpecial: Boolean(menu.isSeasonalSpecial),
            specialStartDate: formatDateForInput(menu.specialStartDate),
            specialEndDate: formatDateForInput(menu.specialEndDate),
            isSubmitting: false
        });
    };

    const handleSaveSeasonalSpecial = async (e) => {
        e.preventDefault();
        if (!managingSpecial) return;

        const { menu, isSeasonalSpecial, specialStartDate, specialEndDate } = managingSpecial;

        if (isSeasonalSpecial && specialStartDate && specialEndDate) {
            if (new Date(specialEndDate) < new Date(specialStartDate)) {
                toast.error("Special expiry date cannot be earlier than start date");
                return;
            }
        }

        try {
            setManagingSpecial(prev => ({ ...prev, isSubmitting: true }));

            await api.put(`/menu/${menu._id}/seasonal-special`, {
                isSeasonalSpecial,
                specialStartDate: isSeasonalSpecial && specialStartDate ? specialStartDate : null,
                specialEndDate: isSeasonalSpecial && specialEndDate ? specialEndDate : null
            });

            toast.success(
                isSeasonalSpecial
                    ? "Seasonal special updated successfully"
                    : "Special status removed"
            );

            setManagingSpecial(null);
            await fetchMenus();

        } catch (error) {
            console.error("Save Seasonal Special Error:", error);
            toast.error(
                error.response?.data?.message ||
                "Failed to update seasonal special"
            );
            setManagingSpecial(prev => ({ ...prev, isSubmitting: false }));
        }
    };

    const handleRemoveSeasonalSpecial = async (menuId) => {
        try {
            setManagingSpecial(prev => ({ ...prev, isSubmitting: true }));

            await api.put(`/menu/${menuId}/seasonal-special`, {
                isSeasonalSpecial: false,
                specialStartDate: null,
                specialEndDate: null
            });

            toast.success("Seasonal special removed");
            setManagingSpecial(null);
            await fetchMenus();

        } catch (error) {
            console.error("Remove Seasonal Special Error:", error);
            toast.error(
                error.response?.data?.message ||
                "Failed to remove seasonal special"
            );
            setManagingSpecial(prev => ({ ...prev, isSubmitting: false }));
        }
    };


    // =========================================
    // Filter Menu
    // =========================================

    const filteredMenus = useMemo(() => {

        return menus.filter(menu => {

            const searchText =
                search.trim().toLowerCase();

            const menuName =
                menu.name?.toLowerCase() || "";

            const description =
                menu.description?.toLowerCase() || "";

            const categoryName =
                menu.category?.name?.toLowerCase() || "";


            const matchesSearch =
                !searchText ||
                menuName.includes(searchText) ||
                description.includes(searchText) ||
                categoryName.includes(searchText);


            const matchesCategory =
                categoryFilter === "All" ||
                menu.category?._id === categoryFilter;


            const matchesVeg =
                vegFilter === "All" ||
                (vegFilter === "Veg" && menu.isVeg) ||
                (vegFilter === "Non-Veg" && !menu.isVeg);

            const specialStatus = getSpecialStatus(menu);
            const matchesSpecial =
                specialFilter === "All" ||
                (specialFilter === "All Specials" && menu.isSeasonalSpecial) ||
                (specialFilter === "Active" && specialStatus === "Active") ||
                (specialFilter === "Scheduled" && specialStatus === "Scheduled") ||
                (specialFilter === "Expired" && specialStatus === "Expired") ||
                (specialFilter === "Regular" && !menu.isSeasonalSpecial);

            return (
                matchesSearch &&
                matchesCategory &&
                matchesVeg &&
                matchesSpecial
            );

        });

    }, [
        menus,
        search,
        categoryFilter,
        vegFilter,
        specialFilter
    ]);


    // =========================================
    // Statistics
    // =========================================

    const statistics = useMemo(() => {

        const veg = menus.filter(
            menu => menu.isVeg
        ).length;

        const nonVeg = menus.filter(
            menu => !menu.isVeg
        ).length;

        const activeSpecials = menus.filter(
            menu => getSpecialStatus(menu) === "Active"
        ).length;

        return {
            total: menus.length,
            veg,
            nonVeg,
            categories: categories.length,
            activeSpecials
        };

    }, [menus, categories]);


    // =========================================
    // Loading
    // =========================================

    if (loading) {

        return (

            <div className="flex justify-center items-center min-h-[400px]">

                <p className="text-lg text-gray-500">
                    Loading menu...
                </p>

            </div>

        );

    }


    // =========================================
    // Page
    // =========================================

    return (

        <div className="space-y-7 pb-12">


            {/* ================================= */}
            {/* Header */}
            {/* ================================= */}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                <div>

                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0B0B0B] text-[#D4AF7C] shadow-lg shadow-black/10">
                            ☷
                        </div>

                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#B88A4A]">
                                LUX Management
                            </p>

                            <h1 className="mt-1 text-3xl font-black tracking-tight text-[#0B0B0B]">
                                Menu Management
                            </h1>

                            <p className="mt-1 text-sm text-[#756F66]">
                                Add, edit and manage restaurant dishes
                            </p>
                        </div>
                    </div>

                </div>


                <div className="flex gap-3">

                    <button
                        onClick={fetchMenus}
                        className="rounded-xl border border-[#D8D0C4] bg-white px-5 py-3 font-bold text-[#0B0B0B] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D4AF7C] hover:bg-[#F8F5EE] hover:shadow-md active:scale-[0.98]"
                    >
                        ↻ Refresh
                    </button>

                    <button
                        onClick={handleAdd}
                        className="rounded-xl bg-[#0B0B0B] px-5 py-3 font-bold text-white shadow-lg shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#2B1F14] hover:shadow-xl active:scale-[0.98]"
                    >
                        + Add Menu
                    </button>

                </div>

            </div>


            {/* ================================= */}
            {/* Statistics */}
            {/* ================================= */}

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

                <div className="rounded-3xl border border-[#D8D0C4] bg-white p-6 shadow-sm">

                    <p className="text-sm font-medium text-[#756F66]">
                        Total Items
                    </p>

                    <p className="text-3xl font-bold mt-1">
                        {statistics.total}
                    </p>

                </div>


                <div className="bg-green-50 border border-green-100 rounded-xl p-5">

                    <p className="text-green-700">
                        Vegetarian
                    </p>

                    <p className="text-3xl font-bold mt-1">
                        {statistics.veg}
                    </p>

                </div>


                <div className="bg-red-50 border border-red-100 rounded-xl p-5">

                    <p className="text-red-700">
                        Non-Vegetarian
                    </p>

                    <p className="text-3xl font-bold mt-1">
                        {statistics.nonVeg}
                    </p>

                </div>


                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">

                    <p className="text-blue-700">
                        Categories
                    </p>

                    <p className="text-3xl font-bold mt-1">
                        {statistics.categories}
                    </p>

                </div>


                <div className="bg-[#FAF6ED] border border-[#D4AF7C]/40 rounded-xl p-5">

                    <p className="text-[#8F6B2C] font-semibold text-sm">
                        ✨ Active Specials
                    </p>

                    <p className="text-3xl font-bold mt-1 text-[#0B0B0B]">
                        {statistics.activeSpecials}
                    </p>

                </div>

            </div>


            {/* ================================= */}
            {/* Add / Edit Form */}
            {/* ================================= */}

            {showForm && (

                <div className="overflow-hidden rounded-3xl border border-[#D8D0C4] bg-white p-6 shadow-sm md:p-7">

                    <div className="flex justify-between items-center mb-6">

                        <div>

                            <h2 className="text-2xl font-black text-[#0B0B0B]">

                                {editingMenu
                                    ? "Edit Menu Item"
                                    : "Add Menu Item"}

                            </h2>

                            <p className="mt-1 text-sm text-[#756F66]">

                                {editingMenu
                                    ? "Update dish information"
                                    : "Add a new dish to your menu"}

                            </p>

                        </div>


                        <button
                            onClick={resetForm}
                            className="text-gray-500 hover:text-black text-2xl"
                        >
                            ×
                        </button>

                    </div>


                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 md:grid-cols-2 gap-5"
                    >


                        {/* Name */}

                        <div>

                            <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#5F584F]">
                                Dish Name
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Paneer Tikka"
                                className="w-full rounded-xl border border-[#D8D0C4] bg-[#FCFBF8] px-4 py-3 text-[#0B0B0B] outline-none transition-all placeholder:text-[#A69E94] focus:border-[#D4AF7C] focus:ring-4 focus:ring-[#D4AF7C]/10"
                                required
                            />

                        </div>


                        {/* Price */}

                        <div>

                            <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#5F584F]">
                                Price
                            </label>

                            <div className="relative">

                                <span className="absolute left-4 top-3 text-gray-500">
                                    ₹
                                </span>

                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="0"
                                    min="1"
                                    className="w-full border rounded-lg pl-8 pr-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
                                    required
                                />

                            </div>

                        </div>


                        {/* Category */}

                        <div>

                            <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#5F584F]">
                                Category
                            </label>

                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-4 py-3"
                                required
                            >

                                <option value="">
                                    Select Category
                                </option>

                                {categories.map(category => (

                                    <option
                                        key={category._id}
                                        value={category._id}
                                    >
                                        {category.name}
                                    </option>

                                ))}

                            </select>

                        </div>


                        {/* Preparation Time */}

                        <div>

                            <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#5F584F]">
                                Preparation Time
                            </label>

                            <div className="relative">

                                <input
                                    type="number"
                                    name="preparationTime"
                                    value={formData.preparationTime}
                                    onChange={handleChange}
                                    placeholder="Minutes"
                                    min="0"
                                    className="w-full border rounded-lg px-4 py-3 pr-20 outline-none focus:ring-2 focus:ring-orange-400"
                                />

                                <span className="absolute right-4 top-3 text-gray-500">
                                    min
                                </span>

                            </div>

                        </div>

                        {/* 3D / AR Model */}

                        <div>
                            <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#5F584F]">
                                3D / AR Model
                            </label>

                            <input
                                type="text"
                                name="model3D"
                                value={formData.model3D}
                                onChange={handleChange}
                                placeholder="/models/pizza.glb"
                                className="w-full rounded-xl border border-[#D8D0C4] bg-[#FCFBF8] px-4 py-3 text-[#0B0B0B] outline-none transition-all placeholder:text-[#A69E94] focus:border-[#D4AF7C] focus:ring-4 focus:ring-[#D4AF7C]/10"
                            />

                            <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-[#B88A4A]">
                                Enter the GLB model path from the public folder
                            </p>
                        </div>

                        {/* Description */}

                        <div className="md:col-span-2">

                            <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#5F584F]">
                                Description
                            </label>

                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the dish..."
                                className="w-full rounded-xl border border-[#D8D0C4] bg-[#FCFBF8] px-4 py-3 text-[#0B0B0B] outline-none transition-all placeholder:text-[#A69E94] focus:border-[#D4AF7C] focus:ring-4 focus:ring-[#D4AF7C]/10"
                                rows="4"
                                required
                            />

                        </div>


                        {/* Vegetarian */}

                        <div className="md:col-span-2">

                            <label className="inline-flex items-center gap-3 cursor-pointer">

                                <input
                                    type="checkbox"
                                    name="isVeg"
                                    checked={formData.isVeg}
                                    onChange={handleChange}
                                    className="h-5 w-5 accent-[#D4AF7C]"
                                />

                                <span className="font-bold text-[#0B0B0B]">
                                    Vegetarian dish
                                </span>

                            </label>

                        </div>


                        {/* Seasonal Special (Milestone 3) */}

                        <div className="md:col-span-2 rounded-2xl border border-[#D4AF7C]/40 bg-[#FCFBF8] p-5">

                            <div className="flex items-center justify-between">

                                <label className="inline-flex items-center gap-3 cursor-pointer">

                                    <input
                                        type="checkbox"
                                        name="isSeasonalSpecial"
                                        checked={formData.isSeasonalSpecial}
                                        onChange={handleChange}
                                        className="h-5 w-5 accent-[#D4AF7C]"
                                    />

                                    <div>
                                        <span className="font-bold text-[#0B0B0B] text-base">
                                            ✨ Mark as Seasonal Special
                                        </span>
                                        <p className="text-xs text-[#756F66]">
                                            Feature this dish in the customer Seasonal Specials curation
                                        </p>
                                    </div>

                                </label>

                                {formData.isSeasonalSpecial && (
                                    <span className="rounded-full border border-[#D4AF7C] bg-[#FAF6ED] px-3 py-1 text-xs font-black text-[#8F6B2C]">
                                        Seasonal Special
                                    </span>
                                )}

                            </div>

                            {formData.isSeasonalSpecial && (
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#D8D0C4]/60 pt-4">

                                    <div>
                                        <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#5F584F]">
                                            Special Start Date (Optional)
                                        </label>
                                        <input
                                            type="date"
                                            name="specialStartDate"
                                            value={formData.specialStartDate}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-[#D8D0C4] bg-white px-4 py-2.5 text-sm text-[#0B0B0B] outline-none transition-all focus:border-[#D4AF7C] focus:ring-4 focus:ring-[#D4AF7C]/10"
                                        />
                                        <p className="mt-1 text-[11px] text-[#756F66]">
                                            Leave blank to activate immediately
                                        </p>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#5F584F]">
                                            Special Expiry Date (Optional)
                                        </label>
                                        <input
                                            type="date"
                                            name="specialEndDate"
                                            value={formData.specialEndDate}
                                            onChange={handleChange}
                                            className="w-full rounded-xl border border-[#D8D0C4] bg-white px-4 py-2.5 text-sm text-[#0B0B0B] outline-none transition-all focus:border-[#D4AF7C] focus:ring-4 focus:ring-[#D4AF7C]/10"
                                        />
                                        <p className="mt-1 text-[11px] text-[#756F66]">
                                            Leave blank for an indefinite special
                                        </p>
                                    </div>

                                </div>
                            )}

                        </div>


                        {/* Buttons */}

                        <div className="md:col-span-2 flex gap-3 pt-2">

                            <button
                                type="submit"
                                className="rounded-xl bg-[#0B0B0B] px-6 py-3 font-bold text-white shadow-md shadow-black/10 transition-all duration-200 hover:bg-[#2B1F14] hover:-translate-y-0.5 active:scale-[0.98]"
                            >

                                {editingMenu
                                    ? "Update Menu"
                                    : "Add Menu"}

                            </button>


                            <button
                                type="button"
                                onClick={resetForm}
                                className="rounded-xl border border-[#D8D0C4] bg-[#F8F5EE] px-6 py-3 font-bold text-[#5F584F] transition-all duration-200 hover:border-[#D4AF7C] hover:bg-white active:scale-[0.98]"
                            >
                                Cancel
                            </button>

                        </div>

                    </form>

                </div>

            )}


            {/* ================================= */}
            {/* Filters */}
            {/* ================================= */}

            <div className="rounded-3xl border border-[#D8D0C4] bg-white p-6 shadow-sm">

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">


                    {/* Search */}

                    <div>

                        <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#5F584F]">
                            Search
                        </label>

                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search dishes..."
                            className="w-full rounded-xl border border-[#D8D0C4] bg-[#FCFBF8] px-4 py-3 text-[#0B0B0B] outline-none transition-all placeholder:text-[#A69E94] focus:border-[#D4AF7C] focus:ring-4 focus:ring-[#D4AF7C]/10"
                        />

                    </div>


                    {/* Category */}

                    <div>

                        <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#5F584F]">
                            Category
                        </label>

                        <select
                            value={categoryFilter}
                            onChange={(e) =>
                                setCategoryFilter(e.target.value)
                            }
                            className="w-full border rounded-lg px-4 py-3"
                        >

                            <option value="All">
                                All Categories
                            </option>

                            {categories.map(category => (

                                <option
                                    key={category._id}
                                    value={category._id}
                                >
                                    {category.name}
                                </option>

                            ))}

                        </select>

                    </div>


                    {/* Veg Filter */}

                    <div>

                        <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#5F584F]">
                            Food Type
                        </label>

                        <select
                            value={vegFilter}
                            onChange={(e) =>
                                setVegFilter(e.target.value)
                            }
                            className="w-full border rounded-lg px-4 py-3"
                        >

                            <option value="All">
                                All
                            </option>

                            <option value="Veg">
                                Vegetarian
                            </option>

                            <option value="Non-Veg">
                                Non-Vegetarian
                            </option>

                        </select>

                    </div>


                    {/* Special Filter (Milestone 3) */}

                    <div>

                        <label className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#5F584F]">
                            Special Status
                        </label>

                        <select
                            value={specialFilter}
                            onChange={(e) =>
                                setSpecialFilter(e.target.value)
                            }
                            className="w-full border rounded-lg px-4 py-3"
                        >

                            <option value="All">
                                All Items
                            </option>

                            <option value="All Specials">
                                All Specials
                            </option>

                            <option value="Active">
                                ✨ Active Specials
                            </option>

                            <option value="Scheduled">
                                ⏳ Scheduled Specials
                            </option>

                            <option value="Expired">
                                ⌛ Expired Specials
                            </option>

                            <option value="Regular">
                                Regular Dishes
                            </option>

                        </select>

                    </div>

                </div>

            </div>


            {/* ================================= */}
            {/* Result Count */}
            {/* ================================= */}

            <div>

                <p className="text-sm font-medium text-[#756F66]">

                    Showing{" "}
                    <span className="font-black text-[#0B0B0B]">
                        {filteredMenus.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-black text-[#0B0B0B]">
                        {menus.length}
                    </span>{" "}
                    menu items

                </p>

            </div>


            {/* ================================= */}
            {/* Menu List */}
            {/* ================================= */}

            {filteredMenus.length === 0 ? (

                <div className="rounded-3xl border border-[#D8D0C4] bg-white p-12 text-center shadow-sm">

                    <div className="text-5xl mb-4">
                        🍽️
                    </div>

                    <h2 className="text-xl font-black text-[#0B0B0B]">
                        No menu items found
                    </h2>

                    <p className="mt-1 text-sm text-[#756F66]">
                        Try changing your filters or add a new dish.
                    </p>

                </div>

            ) : (

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                    {filteredMenus.map(menu => {

                        const categoryName = (menu.category?.name || "").trim().toLowerCase();

                            const isBeverage = [
                                "beverage",
                                "beverages",
                                "drink",
                                "drinks",
                            ].includes(categoryName);

                             return (

                        <div
                            key={menu._id}
                            className="group overflow-hidden rounded-3xl border border-[#D8D0C4] bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#D4AF7C]/70 hover:shadow-xl hover:shadow-black/[0.05]"
                        >

                            {/* Top */}

                            <div className="flex items-start justify-between gap-3">

                                <div>

                                    <h2 className="text-xl font-black tracking-tight text-[#0B0B0B]">
                                        {menu.name}
                                    </h2>

                                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-[#B88A4A]">
                                        {menu.category?.name || "Unknown Category"}
                                    </p>

                                </div>

                                {!isBeverage && (
                                    <span
                                        className={`rounded-full border px-3 py-1.5 text-[10px] font-black tracking-wide ${
                                            menu.isVeg
                                                ? "border-green-200 bg-green-50 text-green-700"
                                                : "border-red-200 bg-red-50 text-red-700"
                                        }`}
                                    >
                                        {menu.isVeg ? "VEG" : "NON-VEG"}
                                    </span>
                                )}

                            </div>

                            {/* Description */}

                            <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#756F66]">
                                {menu.description}
                            </p>

                            {/* Price */}

                            <div className="mt-5 flex items-center justify-between">

                                <p className="text-2xl font-black text-[#0B0B0B]">
                                    ₹{menu.price}
                                </p>

                                {menu.preparationTime ? (

                                    <span className="text-xs font-bold text-[#8B8175]">
                                        ⏱ {menu.preparationTime} min
                                    </span>

                                ) : (

                                    <span className="text-sm text-gray-400">
                                        Time N/A
                                    </span>

                                )}

                            </div>

                            {/* Availability & Special Status */}

                            <div className="mt-4 flex flex-wrap items-center gap-2">

                                <span
                                    className={`inline-flex rounded-full border px-3 py-1.5 text-[10px] font-black tracking-wide ${
                                        menu.isAvailable
                                            ? "border-green-200 bg-green-50 text-green-700"
                                            : "border-gray-200 bg-gray-100 text-gray-600"
                                    }`}
                                >
                                    {menu.isAvailable
                                        ? "AVAILABLE"
                                        : "UNAVAILABLE"}
                                </span>

                                {(() => {
                                    const status = getSpecialStatus(menu);
                                    if (status === "Active") {
                                        return (
                                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[10px] font-black tracking-wide text-emerald-800 shadow-xs">
                                                <span>✨</span> SPECIAL: ACTIVE
                                            </span>
                                        );
                                    }
                                    if (status === "Scheduled") {
                                        return (
                                            <span className="inline-flex items-center gap-1 rounded-full border border-sky-300 bg-sky-50 px-2.5 py-1 text-[10px] font-black tracking-wide text-sky-800 shadow-xs">
                                                <span>⏳</span> SPECIAL: SCHEDULED
                                            </span>
                                        );
                                    }
                                    if (status === "Expired") {
                                        return (
                                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[10px] font-black tracking-wide text-amber-800 shadow-xs">
                                                <span>⌛</span> SPECIAL: EXPIRED
                                            </span>
                                        );
                                    }
                                    return (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[10px] font-semibold text-gray-500">
                                            Not a Special
                                        </span>
                                    );
                                })()}

                            </div>

                            {menu.isSeasonalSpecial && (menu.specialStartDate || menu.specialEndDate) && (
                                <p className="mt-2 text-xs font-medium text-[#756F66]">
                                    📅 {formatSpecialDateDisplay(menu.specialStartDate)} → {formatSpecialDateDisplay(menu.specialEndDate)}
                                </p>
                            )}

                            {/* Actions */}

                            <div className="mt-5 flex gap-2">

                                <button
                                    onClick={() => handleEdit(menu)}
                                    className="flex-1 rounded-xl bg-[#0B0B0B] py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#2B1F14] active:scale-[0.98]"
                                >
                                    Edit
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleOpenManageSpecial(menu)}
                                    className={`rounded-xl px-3 py-2.5 text-xs font-bold transition-all duration-200 active:scale-[0.98] ${
                                        menu.isSeasonalSpecial
                                            ? "border border-[#D4AF7C] bg-[#FAF6ED] text-[#8F6B2C] hover:bg-[#F5ECE0]"
                                            : "border border-[#D8D0C4] bg-[#F8F5EE] text-[#5F584F] hover:border-[#D4AF7C] hover:bg-white"
                                    }`}
                                    title="Configure Seasonal Special"
                                >
                                    ✨ Special
                                </button>

                                <button
                                    onClick={() => handleToggleAvailability(menu)}
                                    className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all duration-200 active:scale-[0.98] ${
                                        menu.isAvailable
                                            ? "border border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            : "bg-green-600 text-white hover:bg-green-700 hover:-translate-y-0.5"
                                    }`}
                                >
                                    {menu.isAvailable ? "Disable" : "Enable"}
                                </button>

                            </div>

                            <div className="mt-3">

                                <button
                                    onClick={() => handleDelete(menu._id)}
                                    className="w-full rounded-xl border border-red-200 bg-red-50 py-2.5 font-bold text-red-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-100 active:scale-[0.98]"
                                >
                                    Delete
                                </button>

                            </div>

                        </div>
                            );

                        })}

                </div>

            )}

            {/* ================================= */}
            {/* Quick Special Management Modal    */}
            {/* ================================= */}

            {managingSpecial && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-[#D4AF7C]/40 bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between pb-4 border-b border-[#D8D0C4]">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B88A4A]">
                                    Seasonal Special Management
                                </span>
                                <h3 className="text-xl font-black text-[#0B0B0B] mt-0.5">
                                    {managingSpecial.menu.name}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setManagingSpecial(null)}
                                className="text-gray-400 hover:text-black text-2xl font-bold leading-none p-1"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSaveSeasonalSpecial} className="mt-5 space-y-5">
                            <div className="rounded-2xl border border-[#D4AF7C]/40 bg-[#FAF6ED]/70 p-4">
                                <label className="inline-flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={managingSpecial.isSeasonalSpecial}
                                        onChange={(e) =>
                                            setManagingSpecial((prev) => ({
                                                ...prev,
                                                isSeasonalSpecial: e.target.checked
                                            }))
                                        }
                                        className="h-5 w-5 accent-[#D4AF7C]"
                                    />
                                    <div>
                                        <span className="font-bold text-[#0B0B0B] text-base">
                                            Mark as Seasonal Special
                                        </span>
                                        <p className="text-xs text-[#756F66]">
                                            Feature this dish in the customer Seasonal Specials section
                                        </p>
                                    </div>
                                </label>
                            </div>

                            {managingSpecial.isSeasonalSpecial && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.1em] text-[#5F584F]">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            value={managingSpecial.specialStartDate}
                                            onChange={(e) =>
                                                setManagingSpecial((prev) => ({
                                                    ...prev,
                                                    specialStartDate: e.target.value
                                                }))
                                            }
                                            className="w-full rounded-xl border border-[#D8D0C4] bg-[#FCFBF8] px-3.5 py-2.5 text-sm text-[#0B0B0B] outline-none focus:border-[#D4AF7C] focus:ring-2 focus:ring-[#D4AF7C]/20"
                                        />
                                        <p className="mt-1 text-[11px] text-[#756F66]">
                                            Optional (starts immediately)
                                        </p>
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.1em] text-[#5F584F]">
                                            Expiry Date
                                        </label>
                                        <input
                                            type="date"
                                            value={managingSpecial.specialEndDate}
                                            onChange={(e) =>
                                                setManagingSpecial((prev) => ({
                                                    ...prev,
                                                    specialEndDate: e.target.value
                                                }))
                                            }
                                            className="w-full rounded-xl border border-[#D8D0C4] bg-[#FCFBF8] px-3.5 py-2.5 text-sm text-[#0B0B0B] outline-none focus:border-[#D4AF7C] focus:ring-2 focus:ring-[#D4AF7C]/20"
                                        />
                                        <p className="mt-1 text-[11px] text-[#756F66]">
                                            Optional (never expires)
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Live computed preview */}
                            <div className="rounded-xl bg-[#F8F5EE] p-3 text-xs flex items-center justify-between">
                                <span className="text-[#756F66] font-medium">Computed Special Status:</span>
                                <span className="font-bold">
                                    {!managingSpecial.isSeasonalSpecial
                                        ? "Not a Special"
                                        : managingSpecial.specialEndDate &&
                                          new Date(managingSpecial.specialEndDate + "T23:59:59.999+05:30") < new Date()
                                        ? "⌛ Expired"
                                        : managingSpecial.specialStartDate &&
                                          new Date(managingSpecial.specialStartDate + "T00:00:00.000+05:30") > new Date()
                                        ? "⏳ Scheduled"
                                        : "✨ Active Special"}
                                </span>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={managingSpecial.isSubmitting}
                                    className="flex-1 rounded-xl bg-[#0B0B0B] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#2B1F14] disabled:opacity-50"
                                >
                                    {managingSpecial.isSubmitting ? "Saving..." : "Save Special"}
                                </button>

                                {managingSpecial.menu.isSeasonalSpecial && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSeasonalSpecial(managingSpecial.menu._id)}
                                        disabled={managingSpecial.isSubmitting}
                                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                                    >
                                        Remove Special
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => setManagingSpecial(null)}
                                    className="rounded-xl border border-[#D8D0C4] bg-[#F8F5EE] px-4 py-3 text-sm font-bold text-[#5F584F] transition hover:bg-white"
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

export default AdminMenu;