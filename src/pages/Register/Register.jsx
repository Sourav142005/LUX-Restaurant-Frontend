import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
    Eye,
    EyeOff,
    UserRound,
    Mail,
    Phone,
    LockKeyhole,
    ArrowRight,
} from "lucide-react";

import api from "../../services/api";

function Register() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const returnTo = searchParams.get("returnTo");

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        if (
            !formData.fullName ||
            !formData.phone ||
            !formData.password ||
            !formData.confirmPassword
        ) {
            toast.error(
                "Please fill name, phone number and password"
            );
            return;
        }

        if (formData.password.length < 6) {
            toast.error(
                "Password must be at least 6 characters"
            );
            return;
        }

        if (
            formData.password !==
            formData.confirmPassword
        ) {
            toast.error("Passwords do not match");
            return;
        }

        try {

            setLoading(true);

            const response = await api.post(
                "/auth/register",
                {
                    fullName: formData.fullName,
                    email: formData.email.trim() || undefined,
                    phone: formData.phone,
                    password: formData.password
                }
            );

            if (response.data?.success) {

                toast.success(
                    "Account created! Verify your phone."
                );

                navigate("/verify-phone", {
                    state: {
                        phone:
                            response.data.phone ||
                            formData.phone,
                        returnTo
                    }
                });

            }

        } catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Registration failed"
            );

        } finally {

            setLoading(false);

        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[#F8F5EE] px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-[#D8D0C4] bg-white shadow-2xl shadow-black/[0.08] lg:grid-cols-2">

                {/* LEFT — BRAND PANEL */}
                <div className="relative hidden min-h-[720px] overflow-hidden bg-[#0B0B0B] lg:flex">

                    <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#D4AF7C]/10 blur-3xl" />
                    <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-[#D4AF7C]/10 blur-3xl" />

                    <div className="relative z-10 flex w-full flex-col justify-between p-12">

                        {/* Logo */}
                        <div>
                            <img
                                src="/images/lux-logo.png"
                                alt="LUX Restaurant"
                                className="h-16 w-auto object-contain"
                            />
                        </div>

                        {/* Main content */}
                        <div className="max-w-md">
                            <p className="mb-4 text-xs font-bold uppercase tracking-[0.35em] text-[#D4AF7C]">
                                Join LUX
                            </p>

                            <h2 className="text-5xl font-black leading-[1.05] tracking-tight text-white">
                                Your table
                                <br />
                                awaits.
                            </h2>

                            <p className="mt-6 max-w-sm text-sm leading-7 text-white/55">
                                Create your LUX account and make reservations,
                                order your favourite dishes, and enjoy a
                                seamless dining experience.
                            </p>

                            <div className="mt-8 h-px w-20 bg-[#D4AF7C]" />
                        </div>

                        {/* Bottom */}
                        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
                            <span>LUX Restaurant</span>
                            <span>Fine Dining</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT — REGISTER */}
                <div className="flex min-h-[720px] items-center justify-center p-7 sm:p-10 lg:p-14">
                    <div className="w-full max-w-md">

                        {/* Mobile logo */}
                        <div className="mb-9 flex justify-center lg:hidden">
                            <img
                                src="/images/lux-logo.png"
                                alt="LUX Restaurant"
                                className="h-16 w-auto object-contain"
                            />
                        </div>

                        {/* Header */}
                        <div className="mb-8">
                            <p className="mb-3 text-xs font-black uppercase tracking-[0.3em] text-[#B58A52]">
                                Create Account
                            </p>

                            <h1 className="text-4xl font-black tracking-tight text-[#0B0B0B] sm:text-5xl">
                                Join LUX.
                            </h1>

                            <p className="mt-3 text-sm leading-6 text-[#6F685F]">
                                Create your account and start your LUX
                                experience.
                            </p>
                        </div>

                        {/* Form */}
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-4"
                        >

                            {/* Full Name */}
                            <div>
                                <label
                                    htmlFor="fullName"
                                    className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#4A443D]"
                                >
                                    Full Name
                                </label>

                                <div className="relative">
                                    <UserRound
                                        size={18}
                                        strokeWidth={1.8}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9186]"
                                    />

                                    <input
                                        id="fullName"
                                        type="text"
                                        name="fullName"
                                        placeholder="Your full name"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        required
                                        autoComplete="name"
                                        className="h-13 w-full rounded-2xl border border-[#D8D0C4] bg-[#FCFBF8] pl-12 pr-4 text-sm text-[#0B0B0B] outline-none transition-all placeholder:text-[#AAA39A] focus:border-[#D4AF7C] focus:bg-white focus:ring-4 focus:ring-[#D4AF7C]/10"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#4A443D]"
                                >
                                    Email Address
                                        <span className="ml-1 text-[#9A6F3D]">
                                            (Optional)
                                        </span>
                                </label>

                                <div className="relative">
                                    <Mail
                                        size={18}
                                        strokeWidth={1.8}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9186]"
                                    />

                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        placeholder="you@example.com (optional)"
                                        value={formData.email}
                                        onChange={handleChange}
                                        autoComplete="email"
                                        className="h-13 w-full rounded-2xl border border-[#D8D0C4] bg-[#FCFBF8] pl-12 pr-4 text-sm text-[#0B0B0B] outline-none transition-all placeholder:text-[#AAA39A] focus:border-[#D4AF7C] focus:bg-white focus:ring-4 focus:ring-[#D4AF7C]/10"
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label
                                    htmlFor="phone"
                                    className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#4A443D]"
                                >
                                    Phone Number
                                </label>

                                <div className="relative">
                                    <Phone
                                        size={18}
                                        strokeWidth={1.8}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9186]"
                                    />

                                    <input
                                        id="phone"
                                        type="tel"
                                        name="phone"
                                        placeholder="Your phone number"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        autoComplete="tel"
                                        className="h-13 w-full rounded-2xl border border-[#D8D0C4] bg-[#FCFBF8] pl-12 pr-4 text-sm text-[#0B0B0B] outline-none transition-all placeholder:text-[#AAA39A] focus:border-[#D4AF7C] focus:bg-white focus:ring-4 focus:ring-[#D4AF7C]/10"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#4A443D]"
                                >
                                    Password
                                </label>

                                <div className="relative">
                                    <LockKeyhole
                                        size={18}
                                        strokeWidth={1.8}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9186]"
                                    />

                                    <input
                                        id="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="password"
                                        placeholder="Create a password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        autoComplete="new-password"
                                        className="h-13 w-full rounded-2xl border border-[#D8D0C4] bg-[#FCFBF8] pl-12 pr-12 text-sm text-[#0B0B0B] outline-none transition-all placeholder:text-[#AAA39A] focus:border-[#D4AF7C] focus:bg-white focus:ring-4 focus:ring-[#D4AF7C]/10"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8C847A] transition-colors hover:text-[#B58A52]"
                                    >
                                        {showPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#4A443D]"
                                >
                                    Confirm Password
                                </label>

                                <div className="relative">
                                    <LockKeyhole
                                        size={18}
                                        strokeWidth={1.8}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9186]"
                                    />

                                    <input
                                        id="confirmPassword"
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="confirmPassword"
                                        placeholder="Confirm your password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        autoComplete="new-password"
                                        className="h-13 w-full rounded-2xl border border-[#D8D0C4] bg-[#FCFBF8] pl-12 pr-12 text-sm text-[#0B0B0B] outline-none transition-all placeholder:text-[#AAA39A] focus:border-[#D4AF7C] focus:bg-white focus:ring-4 focus:ring-[#D4AF7C]/10"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                        aria-label={
                                            showConfirmPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8C847A] transition-colors hover:text-[#B58A52]"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Register Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="group mt-3 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#0B0B0B] px-6 text-sm font-black text-white shadow-lg shadow-black/10 transition-all duration-200 hover:bg-[#2B1F14] hover:shadow-xl hover:shadow-black/15 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        Create Account
                                        <ArrowRight
                                            size={18}
                                            className="transition-transform duration-200 group-hover:translate-x-1"
                                        />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Login Link */}
                        <div className="mt-7 text-center">
                            <p className="text-sm text-[#777067]">
                                Already have an account?{" "}
                                <Link
                                    to={
                                        returnTo
                                            ? `/login?returnTo=${encodeURIComponent(returnTo)}`
                                            : "/login"
                                    }
                                    className="font-black text-[#9A6F3D] transition-colors hover:text-[#0B0B0B]"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="mt-6 border-t border-[#E8E1D8] pt-5 text-center">
                            <p className="text-xs leading-5 text-[#8A8278]">
                                By creating an account, you agree to the terms
                                and policies of LUX Restaurant.
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;