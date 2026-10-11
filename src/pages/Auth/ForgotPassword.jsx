import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
    ArrowLeft,
    ArrowRight,
    LockKeyhole,
    MessageSquare,
    Phone,
    ShieldCheck,
    Loader2,
} from "lucide-react";

import api from "../../services/api";


function ForgotPassword() {

    const navigate = useNavigate();

    const [phone, setPhone] = useState("");

    const [loading, setLoading] = useState(false);


    // ==================================================
    // SEND PASSWORD RESET OTP
    // ==================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (loading) return;

        const cleanedPhone =
            phone.replace(/\D/g, "");

        if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {

            toast.error(
                "Please enter a valid 10-digit Indian mobile number"
            );

            return;
        }

        try {

            setLoading(true);

            const response = await api.post(
                "/auth/forgot-password-phone",
                {
                    phone: cleanedPhone,
                }
            );

            if (response.data?.success) {

                toast.success(
                    "Password reset OTP generated"
                );

                navigate("/reset-password-phone", {
                    state: {
                        phone: cleanedPhone,
                    },
                });

            }

        } catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Something went wrong"
            );

        } finally {

            setLoading(false);

        }
    };


    return (

        <div className="min-h-[calc(100vh-80px)] bg-[#F8F5EE] px-4 py-10 sm:px-6 lg:px-8">

            <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-[#D8D0C4] bg-white shadow-2xl shadow-black/[0.08] lg:grid-cols-2">


                {/* ==================================================
                    LEFT BRAND PANEL
                ================================================== */}

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

                            <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-[#D4AF7C]">
                                Account Recovery
                            </p>


                            <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-white">

                                Get back to
                                <span className="block text-[#D4AF7C]">
                                    your LUX.
                                </span>

                            </h1>


                            <p className="mt-6 text-sm leading-7 text-white/50">
                                Recover your account securely using
                                your registered mobile number.
                                No email address is required.
                            </p>


                            <div className="mt-8 h-px w-20 bg-[#D4AF7C]" />


                            <div className="mt-8 grid grid-cols-2 gap-4">

                                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">

                                    <MessageSquare
                                        size={22}
                                        className="text-[#D4AF7C]"
                                    />

                                    <p className="mt-4 text-sm font-bold text-white">
                                        SMS OTP
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-white/40">
                                        Quick verification
                                    </p>

                                </div>


                                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">

                                    <LockKeyhole
                                        size={22}
                                        className="text-[#D4AF7C]"
                                    />

                                    <p className="mt-4 text-sm font-bold text-white">
                                        Secure reset
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-white/40">
                                        Protect your account
                                    </p>

                                </div>

                            </div>

                        </div>


                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/25">

                            <ShieldCheck size={15} />

                            Secure LUX Account

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    RIGHT FORM PANEL
                ================================================== */}

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


                        {/* Icon */}

                        <div className="flex justify-center">

                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0B0B0B] text-[#D4AF7C] shadow-lg shadow-black/10">

                                <LockKeyhole
                                    size={28}
                                />

                            </div>

                        </div>


                        {/* Heading */}

                        <div className="mt-7 text-center">

                            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#B58A52]">
                                Password Recovery
                            </p>


                            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0B0B0B] sm:text-4xl">
                                Forgot your password?
                            </h2>


                            <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[#777067]">
                                Enter your registered phone number
                                and we'll send you a verification OTP.
                            </p>

                        </div>


                        {/* Form */}

                        <form
                            onSubmit={handleSubmit}
                            className="mt-9"
                        >

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
                                    inputMode="numeric"
                                    name="phone"
                                    maxLength={10}
                                    placeholder="9876543210"
                                    value={phone}
                                    onChange={(e) => {

                                        const value =
                                            e.target.value
                                                .replace(/\D/g, "")
                                                .slice(0, 10);

                                        setPhone(value);

                                    }}
                                    autoComplete="tel"
                                    className="h-14 w-full rounded-2xl border border-[#D8D0C4] bg-[#FCFBF8] pl-12 pr-4 text-sm font-medium text-[#0B0B0B] outline-none transition-all placeholder:text-[#AAA39A] focus:border-[#D4AF7C] focus:bg-white focus:ring-4 focus:ring-[#D4AF7C]/10"
                                />

                            </div>


                            <button
                                type="submit"
                                disabled={
                                    loading ||
                                    phone.length !== 10
                                }
                                className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#0B0B0B] text-sm font-black text-white shadow-lg shadow-black/10 transition-all hover:bg-[#2B1F14] disabled:cursor-not-allowed disabled:opacity-50"
                            >

                                {loading ? (
                                    <>
                                        <Loader2
                                            size={18}
                                            className="animate-spin"
                                        />

                                        Sending OTP...
                                    </>
                                ) : (
                                    <>
                                        Send OTP

                                        <ArrowRight
                                            size={18}
                                        />
                                    </>
                                )}

                            </button>

                        </form>


                        {/* Security note */}

                        <div className="mt-6 rounded-2xl border border-[#D4AF7C]/30 bg-[#FCF8F0] px-4 py-3">

                            <div className="flex gap-3">

                                <ShieldCheck
                                    size={17}
                                    className="mt-0.5 shrink-0 text-[#9A6F3D]"
                                />

                                <p className="text-[11px] leading-5 text-[#806E58]">
                                    For your security, password reset
                                    verification is completed using
                                    a one-time SMS code.
                                </p>

                            </div>

                        </div>


                        {/* Back to login */}

                        <div className="mt-8 border-t border-[#E8E1D8] pt-6 text-center">

                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 text-sm font-black text-[#9A6F3D] transition-colors hover:text-[#0B0B0B]"
                            >

                                <ArrowLeft
                                    size={16}
                                />

                                Return to Login

                            </Link>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}


export default ForgotPassword;