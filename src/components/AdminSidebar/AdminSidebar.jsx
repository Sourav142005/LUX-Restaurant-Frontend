import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function AdminSidebar() {
    const { logout } = useAuth();

    const links = [
        {
            name: "Dashboard",
            path: "/admin/dashboard",
            icon: "⌂"
        },
        {
            name: "Orders",
            path: "/admin/orders",
            icon: "▣"
        },
        {
            name: "Menu",
            path: "/admin/menu",
            icon: "☷"
        },
        {
            name: "Categories",
            path: "/admin/categories",
            icon: "◈"
        },
        {
            name: "Tables",
            path: "/admin/tables",
            icon: "▦"
        },
        {
            name: "Reservations",
            path: "/admin/reservations",
            icon: "◷"
        },
        {
            name: "Users",
            path: "/admin/users",
            icon: "♙"
        }
    ];

    return (
        <aside className="fixed inset-y-0 left-0 z-50 flex h-screen w-72 flex-col overflow-hidden border-r border-white/[0.06] bg-[#090909] text-white shadow-2xl">

            {/* =========================================
                BACKGROUND ACCENTS
            ========================================= */}

            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#D4AF7C]/[0.07] blur-3xl" />

            <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-[#D4AF7C]/[0.04] blur-3xl" />


            {/* =========================================
                BRAND
            ========================================= */}

            <div className="relative px-6 pb-7 pt-7">

                <div className="flex items-center gap-4">

                    {/* Logo */}

                    <div className="group relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#D4AF7C]/30 bg-[#111111] shadow-lg shadow-black/30">

                        <div className="absolute inset-0 bg-[#D4AF7C]/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                        <img
                            src="/images/lux-logo.png"
                            alt="LUX"
                            className="relative h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />

                    </div>


                    {/* Brand text */}

                    <div>

                        <h1 className="text-[22px] font-black tracking-[0.22em] text-white">
                            LUX
                        </h1>

                        <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.28em] text-[#D4AF7C]">
                            Restaurant
                        </p>

                    </div>

                </div>


                {/* Admin badge */}

                <div className="mt-7 flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.025] px-4 py-3">

                    <div className="flex items-center gap-3">

                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4AF7C] text-xs font-black text-[#0B0B0B]">
                            A
                        </div>

                        <div>

                            <p className="text-xs font-bold text-white">
                                Administrator
                            </p>

                            <p className="mt-0.5 text-[10px] text-white/40">
                                Control Center
                            </p>

                        </div>

                    </div>


                    {/* Live indicator */}

                    <div className="flex items-center gap-1.5">

                        <span className="relative flex h-2 w-2">

                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />

                            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />

                        </span>

                        <span className="text-[9px] font-bold uppercase tracking-wider text-green-400">
                            Live
                        </span>

                    </div>

                </div>

            </div>


            {/* =========================================
                DIVIDER
            ========================================= */}

            <div className="mx-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />


            {/* =========================================
                NAVIGATION
            ========================================= */}

            <nav className="relative flex-1 px-4 py-7">

                <div className="mb-4 px-3">

                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/30">
                        Management
                    </p>

                </div>


                <div className="space-y-1.5">

                    {links.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) =>
                                `group relative flex items-center gap-3 rounded-2xl px-3 py-3 transition-all duration-200 ${
                                    isActive
                                        ? "bg-[#D4AF7C]/[0.12] text-[#D4AF7C]"
                                        : "text-white/55 hover:bg-white/[0.045] hover:text-white"
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>

                                    {/* Active glow/indicator */}

                                    {isActive && (
                                        <span className="absolute -left-4 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-[#D4AF7C] shadow-[0_0_14px_rgba(212,175,124,0.65)]" />
                                    )}


                                    {/* Icon */}

                                    <span
                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[17px] transition-all duration-200 ${
                                            isActive
                                                ? "bg-[#D4AF7C] font-black text-[#0B0B0B] shadow-lg shadow-[#D4AF7C]/10"
                                                : "bg-white/[0.035] text-white/45 group-hover:bg-white/[0.07] group-hover:text-[#D4AF7C]"
                                        }`}
                                    >
                                        {link.icon}
                                    </span>


                                    {/* Name */}

                                    <span className="flex-1 text-[13px] font-semibold">
                                        {link.name}
                                    </span>


                                    {/* Active arrow */}

                                    {isActive && (
                                        <span className="text-xs font-bold text-[#D4AF7C]">
                                            →
                                        </span>
                                    )}

                                </>
                            )}
                        </NavLink>
                    ))}

                </div>

            </nav>


            {/* =========================================
                BOTTOM AREA
            ========================================= */}

            <div className="relative px-4 pb-5">

                {/* Restaurant status */}

                <div className="mb-4 rounded-2xl border border-[#D4AF7C]/10 bg-[#D4AF7C]/[0.035] p-4">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#D4AF7C]/70">
                                System Status
                            </p>

                            <p className="mt-1 text-xs font-semibold text-white/70">
                                All systems operational
                            </p>

                        </div>

                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-green-400/20 bg-green-400/10">

                            <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.6)]" />

                        </div>

                    </div>

                </div>


                {/* Logout */}

                <button
                    onClick={logout}
                    className="group flex w-full items-center gap-3 rounded-2xl border border-red-500/10 bg-red-500/[0.035] px-4 py-3.5 text-left transition-all duration-200 hover:border-red-500/25 hover:bg-red-500/[0.08]"
                >

                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-sm text-red-400 transition-colors group-hover:bg-red-500/15">
                        ↪
                    </span>

                    <div className="flex-1">

                        <p className="text-xs font-bold text-red-400">
                            Sign Out
                        </p>

                        <p className="mt-0.5 text-[9px] text-red-400/40">
                            End admin session
                        </p>

                    </div>

                    <span className="text-sm text-red-400/40 transition-transform duration-200 group-hover:translate-x-1">
                        →
                    </span>

                </button>


                {/* Version */}

                <p className="mt-4 text-center text-[8px] font-semibold uppercase tracking-[0.25em] text-white/20">
                    LUX Management • v1.0
                </p>

            </div>

        </aside>
    );
}

export default AdminSidebar;