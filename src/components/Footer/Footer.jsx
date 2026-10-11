import { Link } from "react-router-dom";
import { FiArrowUpRight, FiClock, FiMail, FiMapPin, FiPhone } from "react-icons/fi";

function Footer() {
    return (
        <footer className="relative mt-8 sm:mt-14 md:mt-20 overflow-hidden bg-[#090909] text-white">
            <div className="pointer-events-none absolute -right-28 -top-28 h-56 sm:h-72 w-56 sm:w-72 rounded-full bg-[#D4AF7C]/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-36 -left-28 h-60 sm:h-80 w-60 sm:w-80 rounded-full bg-[#D4AF7C]/[0.06] blur-3xl" />

            <div className="lux-container relative py-6 sm:py-8 md:py-10">
                <div className="grid gap-5 sm:gap-8 md:grid-cols-2 md:gap-x-14 md:gap-y-8">
                    {/* Brand */}
                    <section>
                        <Link to="/" className="inline-flex items-center gap-2.5 sm:gap-3" aria-label="LUX home">
                            <span className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center overflow-hidden rounded-xl border border-[#D4AF7C]/30 bg-white/[0.04] shadow-md shadow-black/30">
                                <img src="/images/lux-logo.png" alt="" className="h-full w-full object-cover" />
                            </span>
                            <span>
                                <span className="block text-xl sm:text-2xl font-black tracking-[0.22em] text-white">LUX</span>
                                <span className="block text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.28em] text-[#D4AF7C]">Restaurant</span>
                            </span>
                        </Link>

                        <p className="mt-2.5 sm:mt-4 max-w-md text-xs sm:text-sm leading-5 sm:leading-6 text-white/55">
                            A more effortless way to dine. Explore the menu, reserve your table, pre-order your meal, and enjoy every moment at LUX.
                        </p>

                        <div className="mt-3 hidden sm:flex items-center gap-2.5 text-xs font-semibold text-white/55">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#D4AF7C]/20 bg-[#D4AF7C]/10 text-[#D4AF7C] text-[10px]">✦</span>
                            Modern dining, thoughtfully made simple.
                        </div>
                    </section>

                    {/* Contact & Hours */}
                    <section>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#D4AF7C]">Visit &amp; connect</p>
                        <div className="mt-2.5 sm:mt-4 space-y-2 sm:space-y-2.5 text-xs sm:text-sm text-white/55">
                            <a href="mailto:sourav@luxrestaurant.com" className="group flex items-center gap-2.5 transition hover:text-white">
                                <FiMail className="shrink-0 text-[#D4AF7C]" size={14} />
                                <span>sourav@luxrestaurant.com</span>
                            </a>
                            <a href="tel:+917888144134" className="group flex items-center gap-2.5 transition hover:text-white">
                                <FiPhone className="shrink-0 text-[#D4AF7C]" size={14} />
                                <span>+91 7888 144 134</span>
                            </a>
                            <span className="flex items-center gap-2.5">
                                <FiClock className="shrink-0 text-[#D4AF7C]" size={14} />
                                <span>Open daily for exceptional dining</span>
                            </span>
                            <span className="flex items-center gap-2.5">
                                <FiMapPin className="shrink-0 text-[#D4AF7C]" size={14} />
                                <span>Your table is waiting at LUX</span>
                            </span>
                        </div>
                    </section>
                </div>

                {/* Bottom Bar */}
                <div className="mt-5 sm:mt-8 flex flex-col gap-2 border-t border-white/[0.08] pt-4 sm:pt-5 text-[11px] sm:text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
                    <span>© {new Date().getFullYear()} LUX Restaurant. All rights reserved.</span>
                    <span className="flex items-center gap-1.5">Crafted for better dining <FiArrowUpRight className="text-[#D4AF7C]" /></span>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
