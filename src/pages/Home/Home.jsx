import { Link } from "react-router-dom";
import {
    FiArrowRight,
    FiCalendar,
    FiCamera,
    FiCheckCircle,
    FiClock,
    FiMapPin,
    FiShoppingBag,
    FiStar,
} from "react-icons/fi";

const features = [
    {
        icon: FiShoppingBag,
        title: "Pre-order your meal",
        text: "Choose your dishes before you arrive and spend less time waiting.",
    },
    {
        icon: FiCalendar,
        title: "Reserve a table",
        text: "Pick a date, time, and table that works for your dining plans.",
    },
    {
        icon: FiCamera,
        title: "Preview in AR",
        text: "See selected dishes in 3D before you decide what to order.",
    },
];

function Home() {
    return (
        <main className="lux-page overflow-hidden bg-[#F8F5EE]">

            {/* ================= HERO ================= */}
            <section className="relative">
                <div className="pointer-events-none absolute -right-32 -top-24 h-80 w-80 rounded-full bg-[#D4AF7C]/15 blur-3xl" />
                <div className="pointer-events-none absolute -left-32 top-52 h-80 w-80 rounded-full bg-[#E6C894]/20 blur-3xl" />

                <div className="lux-container relative grid items-center gap-10 py-10 sm:gap-12 sm:py-12 lg:min-h-[620px] lg:grid-cols-[1.08fr_.92fr] lg:py-20">

                    {/* LEFT CONTENT */}
                    <div className="max-w-2xl">

                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D4AF7C]/40 bg-[#D4AF7C]/10 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8B6A3E]">
                            <FiStar size={14} />
                            Modern dining, reimagined
                        </div>

                        <h1 className="text-[2.65rem] font-black leading-[1.05] tracking-tight text-[#0B0B0B] sm:text-6xl lg:text-7xl">
                            Great food.
                            <span className="block text-[#B88A4A]">
                                Better moments.
                            </span>
                        </h1>

                        <p className="mt-5 max-w-xl text-base leading-7 text-[#625C54] sm:mt-6 sm:text-lg sm:leading-8">
                            LUX brings your restaurant experience together in one
                            place. Explore the menu, reserve your table, pre-order
                            your meal, and enjoy a smoother dining experience.
                        </p>

                        {/* BUTTONS */}
                        <div className="mt-9 flex flex-col gap-3 sm:flex-row">

                            <Link
                                to="/menu"
                                className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-[#0B0B0B] px-6 font-bold text-white shadow-xl shadow-black/10 hover:-translate-y-0.5 hover:bg-[#2B1F14]"
                            >
                                Explore the menu
                                <FiArrowRight />
                            </Link>

                            <Link
                                to="/reservations"
                                className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl border border-[#D4AF7C]/50 bg-white px-6 font-bold text-[#2B1F14] shadow-sm hover:-translate-y-0.5 hover:border-[#D4AF7C] hover:bg-[#D4AF7C]/10"
                            >
                                <FiCalendar />
                                Reserve a table
                            </Link>

                        </div>

                        {/* TRUST POINTS */}
                        <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm font-medium text-[#756F66]">
                            <span className="flex items-center gap-2">
                                <FiCheckCircle className="text-green-600" />
                                Freshly prepared
                            </span>

                            <span className="flex items-center gap-2">
                                <FiClock className="text-[#B88A4A]" />
                                Easy pre-ordering
                            </span>

                            <span className="flex items-center gap-2">
                                <FiMapPin className="text-[#B88A4A]" />
                                Dine-in ready
                            </span>
                        </div>
                    </div>

                    {/* RIGHT PREMIUM CARD */}
                    <div className="relative mx-auto w-full max-w-[500px]">

                        <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-[#D4AF7C]/30 via-[#E6C894]/15 to-transparent blur-2xl" />

                        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#0B0B0B] via-[#171717] to-[#2B1F14] p-5 shadow-2xl shadow-black/20">

                            <div className="rounded-[2rem] border border-[#D4AF7C]/20 bg-white/[0.045] p-6 backdrop-blur">

                                <div className="flex items-center justify-between">

                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF7C]">
                                            Tonight at LUX
                                        </p>

                                        <p className="mt-2 text-xl font-black leading-tight text-white sm:text-2xl">
                                            Your table is waiting.
                                        </p>
                                    </div>

                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#D4AF7C]/30 bg-[#D4AF7C]/15 text-[#D4AF7C] shadow-lg shadow-[#D4AF7C]/10">
                                        ✦
                                    </div>

                                </div>

                                {/* GOLD FEATURE CARD */}
                                <div className="mt-8 rounded-3xl bg-gradient-to-br from-[#D4AF7C] via-[#C49A61] to-[#8F6839] p-7 text-[#0B0B0B] shadow-xl shadow-[#D4AF7C]/10">

                                    <p className="text-sm font-semibold text-[#3C2B19]">
                                        Featured experience
                                    </p>

                                    <p className="mt-2 text-3xl font-black leading-tight sm:text-4xl">
                                        Dine smarter.
                                    </p>

                                    <p className="mt-2 max-w-xs text-sm leading-6 text-[#3C2B19]/80">
                                        Scan, explore, order, and relax. LUX keeps
                                        the whole journey simple.
                                    </p>

                                    <Link
                                        to="/menu"
                                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0B0B0B] px-4 py-3 text-sm font-bold text-white shadow-lg hover:bg-[#2B1F14]"
                                    >
                                        Start exploring
                                        <FiArrowRight />
                                    </Link>

                                </div>

                                {/* FEATURE PILLS */}
                                <div className="mt-5 grid grid-cols-3 gap-3">
                                    {["3D dishes", "Quick order", "Easy booking"].map(
                                        (item) => (
                                            <div
                                                key={item}
                                                className="rounded-2xl border border-[#D4AF7C]/15 bg-white/[0.045] px-3 py-4 text-center text-xs font-semibold text-[#D8D1C7]"
                                            >
                                                {item}
                                            </div>
                                        )
                                    )}
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= WHY LUX ================= */}
            <section className="lux-container pb-12 pt-2 sm:pb-16 sm:pt-4 lg:pb-24">

                <div className="mb-9 max-w-2xl">
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#B88A4A]">
                        Why LUX
                    </p>

                    <h2 className="mt-2 text-3xl font-black tracking-tight text-[#0B0B0B] sm:text-4xl">
                        Everything you need for a better visit.
                    </h2>
                </div>

                <div className="grid gap-5 md:grid-cols-3">

                    {features.map(({ icon: Icon, title, text }) => (
                        <div
                            key={title}
                            className="group rounded-3xl border border-[#D8D0C4] bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-[#D4AF7C]/60 hover:shadow-xl hover:shadow-[#2B1F14]/5 sm:p-7"
                        >

                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D4AF7C]/10 text-[#B88A4A] transition-colors group-hover:bg-[#0B0B0B] group-hover:text-[#D4AF7C]">
                                <Icon size={22} />
                            </div>

                            <h3 className="mt-6 text-xl font-extrabold text-[#0B0B0B]">
                                {title}
                            </h3>

                            <p className="mt-2 text-sm leading-7 text-[#756F66]">
                                {text}
                            </p>

                        </div>
                    ))}

                </div>
            </section>

            {/* ================= FINAL CTA ================= */}
            <section className="lux-container pb-20">

                <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0B0B0B] via-[#151515] to-[#2B1F14] px-7 py-10 text-white shadow-2xl shadow-black/15 sm:px-10 lg:flex lg:items-center lg:justify-between lg:px-14">

                    <div>
                        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#D4AF7C]">
                            Ready when you are
                        </p>

                        <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                            Find your next favourite dish.
                        </h2>

                        <p className="mt-3 max-w-xl text-sm leading-7 text-[#B9B3AA]">
                            Browse the latest menu and build your order in a few taps.
                        </p>
                    </div>

                    <Link
                        to="/menu"
                        className="mt-7 inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#D4AF7C] px-6 py-3.5 font-bold text-[#0B0B0B] shadow-lg shadow-[#D4AF7C]/10 hover:-translate-y-0.5 hover:bg-[#E6C894] lg:mt-0"
                    >
                        View menu
                        <FiArrowRight />
                    </Link>

                </div>
            </section>

        </main>
    );
}

export default Home;