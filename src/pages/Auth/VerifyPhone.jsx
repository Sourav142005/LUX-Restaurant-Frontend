import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
    ArrowLeft,
    CheckCircle2,
    Loader2,
    MessageSquare,
    RefreshCw,
    ShieldCheck,
} from "lucide-react";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const getSafeRedirect = (target) => {
    if (!target) return "/";
    const trimmed = target.trim();
    if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return "/";
    const lower = trimmed.toLowerCase();
    if (
        lower === "/login" ||
        lower.startsWith("/login?") ||
        lower === "/register" ||
        lower.startsWith("/register?") ||
        lower === "/verify-phone" ||
        lower.startsWith("/verify-phone?") ||
        lower === "/forgot-password" ||
        lower.startsWith("/forgot-password?") ||
        lower === "/reset-password" ||
        lower.startsWith("/reset-password?") ||
        lower.startsWith("/reset-password/")
    ) {
        return "/";
    }
    return trimmed;
};

function VerifyPhone() {

    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const { login } = useAuth();

    const returnTo = location.state?.returnTo || searchParams.get("returnTo");

    const [phone, setPhone] = useState(
        location.state?.phone || ""
    );

    const [otp, setOtp] = useState("");

    const [loading, setLoading] = useState(false);

    const [resending, setResending] = useState(false);

    const [resendCooldown, setResendCooldown] = useState(0);


    // ==================================================
    // RESEND COUNTDOWN
    // ==================================================

    useEffect(() => {

        if (resendCooldown <= 0) {
            return;
        }

        const timer = setInterval(() => {

            setResendCooldown((previous) =>
                previous - 1
            );

        }, 1000);

        return () => clearInterval(timer);

    }, [resendCooldown]);


    // ==================================================
    // VERIFY OTP
    // ==================================================

    const handleVerify = async (e) => {

        e.preventDefault();

        if (!phone) {
            toast.error("Phone number is missing");
            return;
        }

        if (!/^\d{6}$/.test(otp)) {
            toast.error("Please enter the 6-digit OTP");
            return;
        }

        try {

            setLoading(true);

            const response = await api.post(
                "/auth/verify-phone",
                {
                    phone,
                    otp,
                }
            );

            if (response.data?.success) {

                login(
                    response.data.token,
                    response.data.user
                );

                toast.success(
                    "Phone verified successfully!"
                );

                navigate(getSafeRedirect(returnTo), { replace: true });

            }

        } catch (error) {

            console.error(
                "Verify OTP Error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Invalid or expired OTP"
            );

        } finally {

            setLoading(false);

        }
    };


    // ==================================================
    // RESEND OTP
    // ==================================================

    const handleResend = async () => {

        if (!phone) {
            toast.error("Phone number is missing");
            return;
        }

        if (resendCooldown > 0) {
            return;
        }

        try {

            setResending(true);

            const response = await api.post(
                "/auth/resend-phone-otp",
                {
                    phone,
                }
            );

            if (response.data?.success) {

                toast.success(
                    "New OTP generated"
                );

                setOtp("");

                setResendCooldown(60);

            }

        } catch (error) {

            console.error(
                "Resend OTP Error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Unable to resend OTP"
            );

        } finally {

            setResending(false);

        }
    };


    // ==================================================
    // DISPLAY PHONE
    // ==================================================

    const maskedPhone = phone
        ? `+91 ${phone.slice(0, 2)}•••••${phone.slice(-3)}`
        : "your phone number";


    // ==================================================
    // UI
    // ==================================================

    return (

        <div className="min-h-[calc(100vh-80px)] bg-[#F8F5EE] px-4 py-10 sm:px-6 lg:px-8">

            <div className="mx-auto flex min-h-[calc(100vh-160px)] w-full max-w-6xl items-center justify-center">

                <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[#D8D0C4] bg-white shadow-2xl shadow-black/[0.08] lg:grid-cols-2">


                    {/* =========================================
                        LEFT PANEL
                    ========================================= */}

                    <div className="hidden min-h-[620px] bg-[#0B0B0B] p-12 lg:flex lg:flex-col lg:justify-between">

                        <img
                            src="/images/lux-logo.png"
                            alt="LUX Restaurant"
                            className="h-16 w-fit object-contain"
                        />


                        <div>

                            <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-[#D4AF7C]">
                                Secure Verification
                            </p>

                            <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-white">
                                Verify your
                                <br />
                                <span className="text-[#D4AF7C]">
                                    phone.
                                </span>
                            </h1>

                            <p className="mt-6 max-w-md text-sm leading-7 text-white/50">
                                One quick verification keeps your
                                LUX account secure and gives you
                                seamless access to reservations,
                                orders and your dining experience.
                            </p>

                            <div className="mt-8 h-px w-20 bg-[#D4AF7C]" />

                        </div>


                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/30">

                            <ShieldCheck size={15} />

                            Secure LUX Account

                        </div>

                    </div>


                    {/* =========================================
                        RIGHT PANEL
                    ========================================= */}

                    <div className="flex min-h-[620px] items-center justify-center p-7 sm:p-10 lg:p-14">

                        <div className="w-full max-w-md">


                            {/* Icon */}

                            <div className="flex justify-center">

                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0B0B0B] text-[#D4AF7C] shadow-lg shadow-black/10">

                                    <MessageSquare
                                        size={28}
                                    />

                                </div>

                            </div>


                            {/* Header */}

                            <div className="mt-7 text-center">

                                <p className="text-xs font-black uppercase tracking-[0.25em] text-[#B58A52]">
                                    Phone Verification
                                </p>

                                <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0B0B0B] sm:text-4xl">
                                    Enter your OTP
                                </h2>

                                <p className="mt-4 text-sm leading-6 text-[#777067]">

                                    Enter the 6-digit code sent to

                                    <span className="ml-1 font-black text-[#0B0B0B]">
                                        {maskedPhone}
                                    </span>

                                </p>

                            </div>


                            {/* OTP FORM */}

                            <form
                                onSubmit={handleVerify}
                                className="mt-9"
                            >

                                <label
                                    htmlFor="otp"
                                    className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#4A443D]"
                                >
                                    Verification Code
                                </label>


                                <input
                                    id="otp"
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => {

                                        const value =
                                            e.target.value
                                                .replace(/\D/g, "")
                                                .slice(0, 6);

                                        setOtp(value);

                                    }}
                                    placeholder="000000"
                                    className="h-16 w-full rounded-2xl border border-[#D8D0C4] bg-[#FCFBF8] px-5 text-center text-3xl font-black tracking-[0.4em] text-[#0B0B0B] outline-none transition-all placeholder:text-[#C8C0B6] focus:border-[#D4AF7C] focus:bg-white focus:ring-4 focus:ring-[#D4AF7C]/10"
                                />


                                <button
                                    type="submit"
                                    disabled={
                                        loading ||
                                        otp.length !== 6
                                    }
                                    className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#0B0B0B] text-sm font-black text-white shadow-lg shadow-black/10 transition-all hover:bg-[#2B1F14] disabled:cursor-not-allowed disabled:opacity-50"
                                >

                                    {loading ? (
                                        <>
                                            <Loader2
                                                size={18}
                                                className="animate-spin"
                                            />

                                            Verifying...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2
                                                size={18}
                                            />

                                            Verify & Continue
                                        </>
                                    )}

                                </button>

                            </form>


                            {/* Resend */}

                            <div className="mt-7 text-center">

                                <p className="text-sm text-[#777067]">
                                    Didn't receive the code?
                                </p>

                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={
                                        resending ||
                                        resendCooldown > 0
                                    }
                                    className="mt-3 inline-flex items-center gap-2 text-sm font-black text-[#9A6F3D] transition-colors hover:text-[#0B0B0B] disabled:cursor-not-allowed disabled:opacity-50"
                                >

                                    <RefreshCw
                                        size={15}
                                        className={
                                            resending
                                                ? "animate-spin"
                                                : ""
                                        }
                                    />

                                    {resending
                                        ? "Sending..."
                                        : resendCooldown > 0
                                            ? `Resend in ${resendCooldown}s`
                                            : "Resend OTP"
                                    }

                                </button>

                            </div>


                            {/* Back */}

                            <div className="mt-8 border-t border-[#E8E1D8] pt-6 text-center">

                                <Link
                                    to="/register"
                                    className="inline-flex items-center gap-2 text-sm font-bold text-[#777067] transition-colors hover:text-[#0B0B0B]"
                                >

                                    <ArrowLeft
                                        size={16}
                                    />

                                    Back to registration

                                </Link>

                            </div>


                            {/* Development message */}

                            <div className="mt-6 rounded-2xl border border-[#D4AF7C]/30 bg-[#FCF8F0] px-4 py-3 text-center">

                                <p className="text-[11px] leading-5 text-[#806E58]">
                                    Development mode — your OTP is
                                    displayed in the backend terminal.
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}


export default VerifyPhone;