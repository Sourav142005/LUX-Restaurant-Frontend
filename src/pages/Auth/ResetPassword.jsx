import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
    Eye,
    EyeOff,
    LockKeyhole,
    ArrowRight,
    ArrowLeft,
    CheckCircle,
} from "lucide-react";

import api from "../../services/api";

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            await api.post(
                `/auth/reset-password/${token}`,
                { password }
            );

            toast.success("Password reset successful!");

            setSuccess(true);

        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Password reset failed"
            );
        } finally {
            setLoading(false);
        }
    };

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
                                Secure Your Account
                            </p>

                            <h2 className="text-5xl font-black leading-[1.05] tracking-tight text-white">
                                A fresh
                                <br />
                                start.
                            </h2>

                            <p className="mt-6 max-w-sm text-sm leading-7 text-white/55">
                                Choose a new password and continue enjoying
                                your LUX dining experience.
                            </p>

                            <div className="mt-8 h-px w-20 bg-[#D4AF7C]" />

                        </div>

                        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-white/30">
                            <span>LUX Restaurant</span>
                            <span>Fine Dining</span>
                        </div>

                    </div>
                </div>

                {/* RIGHT */}
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

                        {!success ? (
                            <>
                                <div className="mb-9">

                                    <p className="mb-3 text-xs font-black uppercase tracking-[0.3em] text-[#B58A52]">
                                        Reset Password
                                    </p>

                                    <h1 className="text-4xl font-black tracking-tight text-[#0B0B0B] sm:text-5xl">
                                        Create new password.
                                    </h1>

                                    <p className="mt-3 text-sm leading-6 text-[#6F685F]">
                                        Choose a strong new password for your
                                        LUX account.
                                    </p>

                                </div>

                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-5"
                                >

                                    {/* Password */}
                                    <div>

                                        <label
                                            htmlFor="password"
                                            className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#4A443D]"
                                        >
                                            New Password
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
                                                value={password}
                                                onChange={(e) =>
                                                    setPassword(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Enter new password"
                                                required
                                                autoComplete="new-password"
                                                className="h-14 w-full rounded-2xl border border-[#D8D0C4] bg-[#FCFBF8] pl-12 pr-12 text-sm text-[#0B0B0B] outline-none transition-all placeholder:text-[#AAA39A] focus:border-[#D4AF7C] focus:bg-white focus:ring-4 focus:ring-[#D4AF7C]/10"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword
                                                    )
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

                                        <p className="mt-2 text-[11px] text-[#8A8278]">
                                            Minimum 6 characters.
                                        </p>

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
                                                value={confirmPassword}
                                                onChange={(e) =>
                                                    setConfirmPassword(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Confirm new password"
                                                required
                                                autoComplete="new-password"
                                                className="h-14 w-full rounded-2xl border border-[#D8D0C4] bg-[#FCFBF8] pl-12 pr-12 text-sm text-[#0B0B0B] outline-none transition-all placeholder:text-[#AAA39A] focus:border-[#D4AF7C] focus:bg-white focus:ring-4 focus:ring-[#D4AF7C]/10"
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

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="group mt-3 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#0B0B0B] px-6 text-sm font-black text-white shadow-lg shadow-black/10 transition-all duration-200 hover:bg-[#2B1F14] hover:shadow-xl hover:shadow-black/15 disabled:cursor-not-allowed disabled:opacity-60"
                                    >

                                        {loading ? (
                                            <>
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                Updating Password...
                                            </>
                                        ) : (
                                            <>
                                                Reset Password
                                                <ArrowRight
                                                    size={18}
                                                    className="transition-transform duration-200 group-hover:translate-x-1"
                                                />
                                            </>
                                        )}

                                    </button>

                                </form>

                                <div className="mt-8 text-center">

                                    <Link
                                        to="/login"
                                        className="inline-flex items-center gap-2 text-sm font-bold text-[#777067] transition-colors hover:text-[#0B0B0B]"
                                    >
                                        <ArrowLeft size={16} />
                                        Back to Login
                                    </Link>

                                </div>
                            </>
                        ) : (
                            <div className="text-center">

                                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#F4EBDD] text-[#9A6F3D]">
                                    <CheckCircle
                                        size={32}
                                        strokeWidth={1.7}
                                    />
                                </div>

                                <p className="mb-3 text-xs font-black uppercase tracking-[0.3em] text-[#B58A52]">
                                    Password Updated
                                </p>

                                <h1 className="text-4xl font-black tracking-tight text-[#0B0B0B]">
                                    You're all set.
                                </h1>

                                <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-[#6F685F]">
                                    Your LUX password has been successfully
                                    updated. You can now sign in with your
                                    new password.
                                </p>

                                <button
                                    type="button"
                                    onClick={() => navigate("/login")}
                                    className="group mt-8 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#0B0B0B] px-6 text-sm font-black text-white shadow-lg shadow-black/10 transition-all duration-200 hover:bg-[#2B1F14] hover:shadow-xl"
                                >
                                    Continue to Login
                                    <ArrowRight
                                        size={18}
                                        className="transition-transform duration-200 group-hover:translate-x-1"
                                    />
                                </button>

                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
}

export default ResetPassword;