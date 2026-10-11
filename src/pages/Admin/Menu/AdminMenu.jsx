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

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        isVeg: true,
        preparationTime: "",
        model3D: ""
    });


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
            model3D: ""
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
            model3D: ""
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
            model3D: menu.model3D || ""
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


            if (editingMenu) {

                await api.put(
                    `/menu/${editingMenu._id}`,
                    formData
                );

                toast.success(
                    "Menu updated successfully"
                );

            } else {

                await api.post(
                    "/menu",
                    formData
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


            return (
                matchesSearch &&
                matchesCategory &&
                matchesVeg
            );

        });

    }, [
        menus,
        search,
        categoryFilter,
        vegFilter
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

        return {
            total: menus.length,
            veg,
            nonVeg,
            categories: categories.length
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">


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

                            {/* Availability */}

                            <div className="mt-4">

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

                            </div>

                            {/* Actions */}

                            <div className="mt-5 flex gap-3">

                                <button
                                    onClick={() => handleEdit(menu)}
                                    className="flex-1 rounded-xl bg-[#0B0B0B] py-2.5 font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#2B1F14] active:scale-[0.98]"
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() => handleToggleAvailability(menu)}
                                    className={`flex-1 rounded-xl py-2.5 font-bold transition-all duration-200 active:scale-[0.98] ${
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

        </div>

    );

}

export default AdminMenu;