import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../../../services/api";

const inputClass = "w-full rounded-xl border border-[#D8D0C4] bg-[#FCFBF8] px-4 py-3 text-[#0B0B0B] outline-none transition-all placeholder:text-[#A69E94] focus:border-[#D4AF7C] focus:ring-4 focus:ring-[#D4AF7C]/10";
const primaryButton = "rounded-xl bg-[#0B0B0B] px-5 py-3 font-bold text-white shadow-lg shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#2B1F14] hover:shadow-xl active:scale-[0.98]";

function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [search, setSearch] = useState("");
    const [formData, setFormData] = useState({ name: "", description: "" });

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await api.get("/category");
            setCategories(response.data.categories || []);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const resetForm = () => {
        setFormData({ name: "", description: "" });
        setEditingCategory(null);
        setShowForm(false);
    };

    const openAddForm = () => {
        setEditingCategory(null);
        setFormData({ name: "", description: "" });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const openEditForm = (category) => {
        setEditingCategory(category);
        setFormData({ name: category.name || "", description: category.description || "" });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const saveCategory = async (event) => {
        event.preventDefault();
        if (!formData.name.trim()) return toast.error("Please enter a category name");
        if (!formData.description.trim()) return toast.error("Please enter a category description");
        try {
            if (editingCategory) {
                await api.put(`/category/${editingCategory._id}`, formData);
                toast.success("Category updated successfully");
            } else {
                await api.post("/category", formData);
                toast.success("Category created successfully");
            }
            resetForm();
            await fetchCategories();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to save category");
        }
    };

    const deleteCategory = async (categoryId) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return;
        try {
            await api.delete(`/category/${categoryId}`);
            toast.success("Category deleted successfully");
            await fetchCategories();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to delete category");
        }
    };

    const filteredCategories = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return categories;
        return categories.filter((category) =>
            category.name?.toLowerCase().includes(term) || category.description?.toLowerCase().includes(term)
        );
    }, [categories, search]);

    if (loading) return <div className="flex min-h-[400px] items-center justify-center"><p className="text-sm font-bold uppercase tracking-[0.18em] text-[#8B8175]">Loading categories…</p></div>;

    return (
        <div className="space-y-7 pb-12">
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0B0B0B] text-xl text-[#D4AF7C] shadow-lg shadow-black/10">◈</div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#B88A4A]">LUX Management</p>
                        <h1 className="mt-1 text-3xl font-black tracking-tight text-[#0B0B0B]">Categories</h1>
                        <p className="mt-1 text-sm text-[#756F66]">Organize every part of your restaurant menu</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button onClick={fetchCategories} className="rounded-xl border border-[#D8D0C4] bg-white px-5 py-3 font-bold text-[#0B0B0B] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D4AF7C] hover:bg-[#F8F5EE] hover:shadow-md active:scale-[0.98]">↻ Refresh</button>
                    <button onClick={openAddForm} className={primaryButton}>+ Add Category</button>
                </div>
            </header>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-[#D8D0C4] bg-white p-6 shadow-sm"><p className="text-sm font-medium text-[#756F66]">Total Categories</p><p className="mt-1 text-3xl font-black text-[#0B0B0B]">{categories.length}</p></div>
                <div className="rounded-3xl border border-[#D4AF7C]/30 bg-[#D4AF7C]/10 p-6 shadow-sm"><p className="text-sm font-medium text-[#8A642F]">Showing</p><p className="mt-1 text-3xl font-black text-[#0B0B0B]">{filteredCategories.length}</p></div>
            </section>

            {showForm && (
                <section className="rounded-3xl border border-[#D8D0C4] bg-white p-6 shadow-sm md:p-7">
                    <div className="mb-6 flex items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B88A4A]">Category details</p><h2 className="mt-1 text-2xl font-black text-[#0B0B0B]">{editingCategory ? "Edit Category" : "Add Category"}</h2><p className="mt-1 text-sm text-[#756F66]">{editingCategory ? "Update the category information below." : "Create a new section for your restaurant menu."}</p></div><button onClick={resetForm} aria-label="Close form" className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#D8D0C4] text-2xl text-[#756F66] transition hover:border-[#D4AF7C] hover:bg-[#F8F5EE] hover:text-[#0B0B0B]">×</button></div>
                    <form onSubmit={saveCategory} className="grid gap-5 md:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)]">
                        <div><label htmlFor="category-name" className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#5F584F]">Category name</label><input id="category-name" type="text" name="name" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} placeholder="e.g. Starters" className={inputClass} required /></div>
                        <div><label htmlFor="category-description" className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#5F584F]">Description</label><textarea id="category-description" name="description" value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} placeholder="A short description of the dishes in this category…" rows="3" className={`${inputClass} resize-y`} required /></div>
                        <div className="flex flex-wrap gap-3 md:col-span-2"><button type="submit" className={primaryButton}>{editingCategory ? "Save Changes" : "Create Category"}</button><button type="button" onClick={resetForm} className="rounded-xl border border-[#D8D0C4] bg-white px-6 py-3 font-bold text-[#5F584F] transition hover:bg-[#F8F5EE]">Cancel</button></div>
                    </form>
                </section>
            )}

            <section className="rounded-3xl border border-[#D8D0C4] bg-white p-5 shadow-sm"><label htmlFor="category-search" className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#5F584F]">Find a category</label><div className="relative"><span aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A69E94]">⌕</span><input id="category-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by category name or description…" className={`${inputClass} pl-10`} /></div></section>
            <p className="text-sm font-medium text-[#756F66]">Showing <span className="font-black text-[#0B0B0B]">{filteredCategories.length}</span> of <span className="font-black text-[#0B0B0B]">{categories.length}</span> categories</p>

            {filteredCategories.length === 0 ? (
                <section className="rounded-3xl border border-dashed border-[#D8D0C4] bg-white p-12 text-center shadow-sm"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D4AF7C]/15 text-2xl text-[#8A642F]">◈</div><h2 className="mt-5 text-xl font-black text-[#0B0B0B]">No categories found</h2><p className="mt-1 text-sm text-[#756F66]">Try another search or create your first category.</p>{!search && <button onClick={openAddForm} className={`${primaryButton} mt-5`}>+ Add Category</button>}</section>
            ) : (
                <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filteredCategories.map((category) => (
                        <article key={category._id} className="group rounded-3xl border border-[#D8D0C4] bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#D4AF7C]/70 hover:shadow-xl hover:shadow-black/[0.05]"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#B88A4A]">Menu category</p><h2 className="mt-1 text-xl font-black tracking-tight text-[#0B0B0B]">{category.name}</h2></div><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0B0B0B] text-lg text-[#D4AF7C] shadow-lg shadow-black/10">◈</div></div><p className="mt-5 min-h-[72px] text-sm leading-6 text-[#756F66]">{category.description}</p><div className="mt-6 flex gap-3 border-t border-[#E8E1D7] pt-5"><button onClick={() => openEditForm(category)} className="flex-1 rounded-xl bg-[#0B0B0B] py-2.5 font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#2B1F14] active:scale-[0.98]">Edit</button><button onClick={() => deleteCategory(category._id)} className="flex-1 rounded-xl border border-red-200 bg-red-50 py-2.5 font-bold text-red-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-100 active:scale-[0.98]">Delete</button></div></article>
                    ))}
                </section>
            )}
        </div>
    );
}

export default AdminCategories;
