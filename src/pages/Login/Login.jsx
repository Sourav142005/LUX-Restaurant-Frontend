
import { useState } from "react";
import toast from "react-hot-toast";
import {
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    Phone,
    ArrowRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        identifier: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        const identifier = formData.identifier.trim();

        if (!identifier || !formData.password) {
            toast.error("Please enter your email or phone and password.");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post("/auth/login", {
                identifier,
                password: formData.password,
            });

            login(
                response.data.token,
                response.data.user
            );

            toast.success("Welcome back to LUX!");
            navigate("/");
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Login failed"
            );
        } finally {
            setLoading(false);
        }
    };

    const isEmail = formData.identifier.includes("@");

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[#F8F5EE] px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-[#D8D0C4] bg-white shadow-2xl shadow-black/[0.08] lg:grid-cols-2">

                {/* LEFT — BRAND PANEL */}
                <div className="relative hidden min-h-[650px] overflow-hidden bg-[#0B0B0B] lg:flex">
                    <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#D4AF7C]/10 blur-3xl" />
                    <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-[#D4AF7C]/10 blur-3xl" />

                    <div className="relative z-10 flex w-full flex-col justify-between p-12">
                        <div>
                            <img
                                src="/images/lux-logo.png"
                                alt="LUX Restaurant"
                                className="h-16 w-auto object-contain"
                            />
                        </div>

                        <div className="max-w-md">
                            <p className="mb-4 text-xs font-bold uppercase tracking-[0.35em] text-[#D4AF7C]">
                                Welcome to LUX
                            </p>

                            <h2 className="text-5xl font-black leading-[1.05] tracking-tight text-white">
                                An experience
                                <br />
                                worth returning to.
                            </h2>

                            <p className="mt-6 max-w-sm text-sm leading-7 text-white/55">
                                Sign in to manage your reservations, orders,
                                and dining experience with LUX Restaurant.
                            </p>

                            <div className="mt-8 h-px w-20 bg-[#D4AF7C]" />
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
                            <span>LUX Restaurant</span>
                            <span>Fine Dining</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT — LOGIN */}
                <div className="flex min-h-[650px] items-center justify-center p-7 sm:p-10 lg:p-14">
                    <div className="w-full max-w-md">

                        {/* Mobile logo */}
                        <div className="mb-10 flex justify-center lg:hidden">
                            <img
                                src="/images/lux-logo.png"
                                alt="LUX Restaurant"
                                className="h-16 w-auto object-contain"
                            />
                        </div>

                        {/* Header */}
                        <div className="mb-9">
                            <p className="mb-3 text-xs font-black uppercase tracking-[0.3em] text-[#B58A52]">
                                Member Access
                            </p>

                            <h1 className="text-4xl font-black tracking-tight text-[#0B0B0B] sm:text-5xl">
                                Welcome back.
                            </h1>

                            <p className="mt-3 text-sm leading-6 text-[#6F685F]">
                                Sign in with your email or phone number.
                            </p>
                        </div>

                        {/* Login form */}
                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* Email or phone */}
                            <div>
                                <label
                                    htmlFor="identifier"
                                    className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#4A443D]"
                                >
                                    Email or Phone Number
                                </label>

                                <div className="relative">
                                    {isEmail ? (
                                        <Mail
                                            size={18}
                                            strokeWidth={1.8}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9186]"
                                        />
                                    ) : (
                                        <Phone
                                            size={18}
                                            strokeWidth={1.8}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9186]"
                                        />
                                    )}

                                    <input
                                        id="identifier"
                                        type="text"
                                        name="identifier"
                                        placeholder="Email or 10-digit phone number"
                                        value={formData.identifier}
                                        onChange={handleChange}
                                        required
                                        autoComplete="username"
                                        maxLength={254}
                                        className="h-14 w-full rounded-2xl border border-[#D8D0C4] bg-[#FCFBF8] pl-12 pr-4 text-sm text-[#0B0B0B] outline-none transition-all placeholder:text-[#AAA39A] focus:border-[#D4AF7C] focus:bg-white focus:ring-4 focus:ring-[#D4AF7C]/10"
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
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        autoComplete="current-password"
                                        className="h-14 w-full rounded-2xl border border-[#D8D0C4] bg-[#FCFBF8] pl-12 pr-12 text-sm text-[#0B0B0B] outline-none transition-all placeholder:text-[#AAA39A] focus:border-[#D4AF7C] focus:bg-white focus:ring-4 focus:ring-[#D4AF7C]/10"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
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

                            {/* Forgot password */}
                            <div className="mt-2 flex justify-end">
                                <Link
                                    to="/forgot-password"
                                    className="text-xs font-bold text-[#9A6F3D] transition-colors hover:text-[#0B0B0B]"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="group mt-3 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#0B0B0B] px-6 text-sm font-black text-white shadow-lg shadow-black/10 transition-all duration-200 hover:bg-[#2B1F14] hover:shadow-xl hover:shadow-black/15 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight
                                            size={18}
                                            className="transition-transform duration-200 group-hover:translate-x-1"
                                        />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Register link */}
                        <div className="mt-7 text-center">
                            <p className="text-sm text-[#777067]">
                                Don't have an account?{" "}
                                <Link
                                    to="/register"
                                    className="font-black text-[#9A6F3D] transition-colors hover:text-[#0B0B0B]"
                                >
                                    Create one
                                </Link>
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="mt-6 border-t border-[#E8E1D8] pt-5 text-center">
                            <p className="text-xs leading-5 text-[#8A8278]">
                                By signing in, you agree to the terms and
                                policies of LUX Restaurant.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
