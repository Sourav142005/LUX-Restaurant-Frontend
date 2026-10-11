
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
    FiLogOut,
    FiMenu,
    FiShoppingBag,
    FiUser,
    FiX,
    FiAlertCircle
} from "react-icons/fi";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
    const { cartCount } = useCart();
    const { isAuthenticated, logout } = useAuth();

    const [open, setOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const closeMenu = () => setOpen(false);

    const openLogoutModal = () => {
        setOpen(false);
        setShowLogoutModal(true);
    };

    const cancelLogout = () => {
        setShowLogoutModal(false);
    };

    const confirmLogout = () => {
        setShowLogoutModal(false);
        logout();
    };

    const linkClass = ({ isActive }) =>
        `relative px-1 py-2 text-sm font-medium transition-colors ${
            isActive
                ? "text-[#D4AF7C] font-semibold"
                : "text-white/70 hover:text-white"
        }`;

    const mobileLinkClass = ({ isActive }) =>
        `px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            isActive
                ? "bg-[#D4AF7C]/15 text-[#D4AF7C] font-semibold"
                : "text-white/75 hover:bg-white/[0.06] hover:text-white"
        }`;

    return (
        <>
            <header className="sticky top-0 z-50 border-b border-[#D4AF7C]/20 bg-[#0B0B0B]/95 backdrop-blur-xl text-white shadow-lg shadow-black/10">
                <nav aria-label="Main navigation" className="lux-container">
                    <div className="flex h-[72px] items-center justify-between gap-6">

                        {/* LUX BRAND */}
                        <Link
                            to="/"
                            onClick={closeMenu}
                            className="group flex items-center gap-3"
                        >
                            <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-[#D4AF7C]/50 bg-gradient-to-br from-white/10 to-transparent p-0.5 shadow-lg shadow-black/30 transition-all duration-300 group-hover:scale-105 group-hover:border-[#D4AF7C] group-hover:shadow-[0_0_15px_rgba(212,175,124,0.35)]">
                                <img
                                    src="/images/lux-logo.png"
                                    alt="LUX"
                                    className="h-full w-full rounded-lg object-cover"
                                />
                            </span>

                            <div className="flex flex-col leading-none">
                                <span className="text-2xl font-black tracking-[0.22em] bg-gradient-to-r from-[#FFF6E9] via-[#D4AF7C] to-[#E6C894] bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(212,175,124,0.35)] transition-all duration-300 group-hover:brightness-110">
                                    LUX
                                </span>
                                <span className="text-[8px] font-extrabold uppercase tracking-[0.32em] text-[#D4AF7C] mt-1 opacity-90 transition-opacity group-hover:opacity-100">
                                    RESTAURANT
                                </span>
                            </div>
                        </Link>

                        {/* DESKTOP NAVIGATION */}
                        <div className="hidden items-center gap-7 md:flex">
                            <NavLink to="/" end className={linkClass}>
                                Home
                            </NavLink>

                            <NavLink to="/menu" className={linkClass}>
                                Menu
                            </NavLink>

                            {isAuthenticated && (
                                <NavLink to="/reservations/my" className={linkClass}>
                                    My Reservations
                                </NavLink>
                            )}

                            {isAuthenticated && (
                                <NavLink to="/orders" className={linkClass}>
                                    Orders
                                </NavLink>
                            )}
                        </div>

                        {/* DESKTOP ACTIONS */}
                        <div className="hidden items-center gap-3 md:flex">
                            <Link
                                to="/reservations"
                                className="flex h-10 items-center gap-1.5 rounded-xl border border-[#D4AF7C]/40 bg-[#D4AF7C]/15 px-4 text-sm font-bold text-[#D4AF7C] shadow-sm hover:bg-[#D4AF7C] hover:text-[#0B0B0B] transition"
                            >
                                Book Table
                            </Link>

                            <Link
                                to="/cart"
                                className="relative flex h-10 items-center gap-2 rounded-xl border border-[#D4AF7C]/30 bg-white/[0.05] px-3.5 text-sm font-semibold text-white shadow-sm hover:border-[#D4AF7C] hover:bg-[#D4AF7C]/15 hover:text-[#D4AF7C] transition"
                            >
                                <FiShoppingBag size={18} className="text-[#D4AF7C]" />
                                <span>Cart</span>

                                {cartCount > 0 && (
                                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D4AF7C] px-1.5 text-[11px] font-bold text-[#0B0B0B]">
                                        {cartCount > 99 ? "99+" : cartCount}
                                    </span>
                                )}
                            </Link>

                            {isAuthenticated ? (
                                <button
                                    type="button"
                                    onClick={openLogoutModal}
                                    className="flex h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.08] px-4 text-sm font-semibold text-white transition hover:border-red-400/40 hover:bg-red-500/20 hover:text-red-300"
                                >
                                    <FiLogOut size={16} />
                                    Logout
                                </button>
                            ) : (
                                <Link
                                    to="/login"
                                    className="flex h-10 items-center gap-2 rounded-xl border border-[#D4AF7C]/40 bg-[#D4AF7C]/15 px-4 text-sm font-semibold text-[#D4AF7C] transition hover:bg-[#D4AF7C] hover:text-[#0B0B0B]"
                                >
                                    <FiUser size={16} />
                                    Sign in
                                </Link>
                            )}
                        </div>

                        {/* MOBILE ACTIONS */}
                        <div className="flex items-center gap-2 md:hidden">
                            {/* Book Table outside */}
                            <Link
                                to="/reservations"
                                onClick={closeMenu}
                                className="flex h-10 items-center gap-1 rounded-xl border border-[#D4AF7C]/40 bg-[#D4AF7C]/15 px-3 text-xs sm:text-sm font-bold text-[#D4AF7C] hover:bg-[#D4AF7C] hover:text-[#0B0B0B] transition shadow-sm"
                            >
                                <span>Book Table</span>
                            </Link>

                            {/* Cart */}
                            <Link
                                to="/cart"
                                aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
                                onClick={closeMenu}
                                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#D4AF7C]/30 bg-white/[0.05] text-white shadow-sm hover:border-[#D4AF7C] transition"
                            >
                                <FiShoppingBag size={19} className="text-[#D4AF7C]" />

                                {cartCount > 0 && (
                                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D4AF7C] px-1 text-[10px] font-bold text-[#0B0B0B]">
                                        {cartCount > 99 ? "99+" : cartCount}
                                    </span>
                                )}
                            </Link>

                            {/* Hamburger */}
                            <button
                                type="button"
                                aria-label={open ? "Close menu" : "Open menu"}
                                aria-expanded={open}
                                onClick={() => setOpen((value) => !value)}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#D4AF7C]/30 bg-white/[0.05] text-white shadow-sm hover:border-[#D4AF7C] hover:text-[#D4AF7C] transition"
                            >
                                {open ? <FiX size={21} /> : <FiMenu size={21} />}
                            </button>
                        </div>
                    </div>

                    {/* MOBILE NAVIGATION */}
                    {open && (
                        <div className="border-t border-white/10 py-4 md:hidden">
                            <div className="grid gap-1">
                                <NavLink
                                    onClick={closeMenu}
                                    to="/"
                                    end
                                    className={mobileLinkClass}
                                >
                                    Home
                                </NavLink>

                                <NavLink
                                    onClick={closeMenu}
                                    to="/menu"
                                    className={mobileLinkClass}
                                >
                                    Menu
                                </NavLink>

                                {isAuthenticated && (
                                    <>
                                        <NavLink
                                            onClick={closeMenu}
                                            to="/reservations"
                                            className={mobileLinkClass}
                                        >
                                            Book Table
                                        </NavLink>

                                        <NavLink
                                            onClick={closeMenu}
                                            to="/reservations/my"
                                            className={mobileLinkClass}
                                        >
                                            My Reservations
                                        </NavLink>
                                    </>
                                )}

                                {isAuthenticated && (
                                    <NavLink
                                        onClick={closeMenu}
                                        to="/orders"
                                        className={mobileLinkClass}
                                    >
                                        Orders
                                    </NavLink>
                                )}

                                <NavLink
                                    onClick={closeMenu}
                                    to="/cart"
                                    className={mobileLinkClass}
                                >
                                    Cart {cartCount > 0 && `(${cartCount})`}
                                </NavLink>

                                <div className="mt-2 border-t border-white/10 pt-3">
                                    {isAuthenticated ? (
                                        <button
                                            type="button"
                                            onClick={openLogoutModal}
                                            className="flex w-full items-center gap-2 rounded-xl border border-white/15 bg-white/[0.08] px-4 py-3 text-left text-sm font-semibold text-white hover:border-red-400/40 hover:bg-red-500/20 hover:text-red-300 transition"
                                        >
                                            <FiLogOut size={16} />
                                            Logout
                                        </button>
                                    ) : (
                                        <Link
                                            onClick={closeMenu}
                                            to="/login"
                                            className="flex items-center gap-2 rounded-xl border border-[#D4AF7C]/40 bg-[#D4AF7C]/15 px-4 py-3 text-sm font-semibold text-[#D4AF7C] hover:bg-[#D4AF7C] hover:text-[#0B0B0B] transition"
                                        >
                                            <FiUser size={16} />
                                            Sign in
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </nav>
            </header>

            {/* LOGOUT CONFIRMATION MODAL */}
            {showLogoutModal && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            cancelLogout();
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="logout-title"
                        aria-describedby="logout-description"
                        className="w-full max-w-md overflow-hidden rounded-2xl border border-[#E8E0D4] bg-[#F8F5EE] shadow-2xl"
                    >
                        <div className="flex justify-center pt-7">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D4AF7C]/50 bg-[#D4AF7C]/15 text-[#8F6938]">
                                <FiAlertCircle size={28} />
                            </div>
                        </div>

                        <div className="px-6 pb-6 pt-4 text-center sm:px-8">
                            <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-[#A17A45]">
                                LUX ACCOUNT
                            </p>

                            <h2
                                id="logout-title"
                                className="text-2xl font-bold text-[#0B0B0B]"
                            >
                                Confirm Logout
                            </h2>

                            <p
                                id="logout-description"
                                className="mt-3 text-sm leading-6 text-gray-600"
                            >
                                Are you sure you want to log out of your LUX
                                account?
                            </p>

                            <p className="mt-2 text-xs leading-5 text-gray-500">
                                Your saved cart will be available when you
                                sign in again.
                            </p>

                            <div className="mt-7 grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    autoFocus
                                    onClick={cancelLogout}
                                    className="rounded-xl border border-[#D8CDBB] bg-white px-4 py-3 text-sm font-semibold text-[#2B1F14] transition hover:bg-[#F0E9DD]"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={confirmLogout}
                                    className="flex items-center justify-center gap-2 rounded-xl bg-[#0B0B0B] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2B1F14]"
                                >
                                    <FiLogOut size={16} />
                                    Yes, Log Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Navbar;
