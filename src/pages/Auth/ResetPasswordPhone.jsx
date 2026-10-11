
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
    ArrowLeft,
    CheckCircle2,
    Eye,
    EyeOff,
    KeyRound,
    Loader2,
    LockKeyhole,
    ShieldCheck,
} from "lucide-react";

import api from "../../services/api";

function ResetPasswordPhone() {
    const navigate = useNavigate();
    const location = useLocation();

    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const phone = location.state?.phone || "";

    const maskedPhone = phone
        ? `+91 ${phone.slice(0, 2)}•••••${phone.slice(-3)}`
        : "your registered phone number";

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!phone) {
            toast.error("Phone number is missing. Start recovery again.");
            navigate("/forgot-password");
            return;
        }

        if (!/^\d{6}$/.test(otp)) {
            toast.error("Enter the 6-digit OTP");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            setLoading(true);

            const response = await api.post(
                "/auth/reset-password-phone",
                {
                    phone,
                    otp,
                    password,
                }
            );

            if (response.data?.success) {
                toast.success("Password reset successfully!");
                navigate("/login", { replace: true });
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Unable to reset password"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[#F8F5EE] px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-[#D8D0C4] bg-white shadow-2xl shadow-black/[0.08] lg:grid-cols-2">

                <div className="relative hidden min-h-[680px] overflow-hidden bg-[#0B0B0B] lg:flex">
                    <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#D4AF7C]/10 blur-3xl" />
                    <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-[#D4AF7C]/10 blur-3xl" />

                    <div className="relative z-10 flex w-full flex-col justify-between p-12">
                        <img
                            src="/images/lux-logo.png"
                            alt="LUX Restaurant"
                            className="h-16 w-auto object-contain"
                        />

                        <div className="max-w-md">
                            <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-[#D4AF7C]">
                                Secure Account Recovery
                            </p>

                            <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-white">
                                A fresh start.
                                <span className="mt-2 block text-[#D4AF7C]">
                                    A secure account.
                                </span>
                            </h1>

                            <p className="mt-6 text-sm leading-7 text-white/50">
                                Verify your registered mobile number
                                and choose a new password to get back
                                to your LUX dining experience.
                            </p>

                            <div className="mt-8 h-px w-20 bg-[#D4AF7C]" />
                        </div>

                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/30">
                            <ShieldCheck size={16} />
                            Secure LUX Account
                        </div>
                    </div>
                </div>

                <div className="flex min-h-[680px] items-center justify-center p-7 sm:p-10 lg:p-14">
                    <div className="w-full max-w-md">

                        <div className="mb-8 flex justify-center lg:hidden">
                            <img
                                src="/images/lux-logo.png"
                                alt="LUX Restaurant"
                                className="h-16 w-auto object-contain"
                            />
                        </div>

                        <div className="flex justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0B0B0B] text-[#D4AF7C] shadow-lg shadow-black/10">
                                <KeyRound size={28} />
                            </div>
                        </div>

                        <div className="mt-7 text-center">
                            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#B58A52]">
                                Reset Password
                            </p>

                            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0B0B0B] sm:text-4xl">
                                Create a new password
                            </h2>

                            <p className="mt-4 text-sm leading-6 text-[#777067]">
                                Enter the OTP for{" "}
                                <span className="font-black text-[#0B0B0B]">
                                    {maskedPhone}
                                </span>{" "}
                                and choose a new password.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                            <div>
                                <label
                                    htmlFor="reset-otp"
                                    className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#4A443D]"
                                >
                                    6-Digit OTP
                                </label>

                                <input
                                    id="reset-otp"
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) =>
                                        setOtp(
                                            e.target.value
                                                .replace(/\D/g, "")
                                                .slice(0, 6)
                                        )
                                    }
                                    placeholder="000000"
                                    required
                                    className="h-14 w-full rounded-2xl border border-[#D8D0C4] bg-[#FCFBF8] px-4 text-center text-2xl font-black tracking-[0.4em] text-[#0B0B0B] outline-none transition-all placeholder:text-[#C8C0B6] focus:border-[#D4AF7C] focus:bg-white focus:ring-4 focus:ring-[#D4AF7C]/10"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="new-password"
                                    className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#4A443D]"
                                >
                                    New Password
                                </label>

                                <div className="relative">
                                    <LockKeyhole
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9186]"
                                    />

                                    <input
                                        id="new-password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="At least 6 characters"
                                        autoComplete="new-password"
                                        minLength={6}
                                        required
                                        className="h-14 w-full rounded-2xl border border-[#D8D0C4] bg-[#FCFBF8] pl-12 pr-12 text-sm text-[#0B0B0B] outline-none transition-all placeholder:text-[#AAA39A] focus:border-[#D4AF7C] focus:bg-white focus:ring-4 focus:ring-[#D4AF7C]/10"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8C847A] hover:text-[#B58A52]"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="confirm-password"
                                    className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#4A443D]"
                                >
                                    Confirm New Password
                                </label>

                                <div className="relative">
                                    <LockKeyhole
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A9186]"
                                    />

                                    <input
                                        id="confirm-password"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Re-enter new password"
                                        autoComplete="new-password"
                                        required
                                        className="h-14 w-full rounded-2xl border border-[#D8D0C4] bg-[#FCFBF8] pl-12 pr-12 text-sm text-[#0B0B0B] outline-none transition-all placeholder:text-[#AAA39A] focus:border-[#D4AF7C] focus:bg-white focus:ring-4 focus:ring-[#D4AF7C]/10"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(!showConfirmPassword)
                                        }
                                        aria-label={
                                            showConfirmPassword
                                                ? "Hide confirm password"
                                                : "Show confirm password"
                                        }
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8C847A] hover:text-[#B58A52]"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#0B0B0B] text-sm font-black text-white shadow-lg shadow-black/10 transition-all hover:bg-[#2B1F14] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Resetting Password...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={18} />
                                        Reset Password
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-7 rounded-2xl border border-[#D4AF7C]/30 bg-[#FCF8F0] px-4 py-3">
                            <p className="text-center text-[11px] leading-5 text-[#806E58]">
                                Use a new password you haven't used for this account before.
                            </p>
                        </div>

                        <div className="mt-8 border-t border-[#E8E1D8] pt-6 text-center">
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 text-sm font-black text-[#9A6F3D] transition-colors hover:text-[#0B0B0B]"
                            >
                                <ArrowLeft size={16} />
                                Return to Login
                            </Link>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResetPasswordPhone;
