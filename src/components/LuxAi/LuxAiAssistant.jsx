import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
    FiMic,
    FiMicOff,
    FiSend,
    FiX,
    FiVolume2,
    FiVolumeX,
    FiShoppingBag,
    FiCheck,
    FiRotateCcw,
    FiArrowRight,
    FiEye,
    FiClock,
    FiAlertCircle
} from "react-icons/fi";
import { Sparkles, Bot } from "lucide-react";
import api from "../../services/api";
import { useCart } from "../../context/CartContext";

// Initial assistant introduction
const INITIAL_MESSAGES = [
    {
        id: "welcome-1",
        sender: "ai",
        text: "Welcome to LUX! I'm LUX AI, your personal dining concierge and hands-free voice assistant.\n\nI can recommend dishes from our live menu, answer questions about prices & preparation times, or take your order by voice or text.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestedPrompts: [
            "What can I eat under ₹300?",
            "Recommend vegetarian dishes",
            "What goes well with cheese pizza?",
            "Add 1 Pizza and 2 Cappuccinos",
            "Cappuccino price & prep time"
        ]
    }
];

// Helper to remove markdown characters for clean text-to-speech playback
function cleanSpeechText(text) {
    if (!text) return "";
    return text
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/₹/g, "Rupees ")
        .replace(/•/g, "")
        .replace(/#+/g, "")
        .replace(/`+/g, "")
        .replace(/\n+/g, " ")
        .trim();
}

function LuxAiAssistant() {
    const navigate = useNavigate();
    const { addMultipleToCart } = useCart();

    // UI state
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState(INITIAL_MESSAGES);
    const [loading, setLoading] = useState(false);
    const [pendingOrder, setPendingOrder] = useState(null);

    // Voice states
    const [isListening, setIsListening] = useState(false);
    const [liveTranscript, setLiveTranscript] = useState("");
    const [speechSupported, setSpeechSupported] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll chat to latest message
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, loading, isOpen]);

    // Check browser speech recognition support
    useEffect(() => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
            setSpeechSupported(true);
            try {
                const recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = true;
                recognition.lang = "en-US";

                recognition.onstart = () => {
                    setIsListening(true);
                    setLiveTranscript("");
                };

                recognition.onresult = (event) => {
                    let interim = "";
                    let final = "";

                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        const transcriptPart = event.results[i][0].transcript;
                        if (event.results[i].isFinal) {
                            final += transcriptPart;
                        } else {
                            interim += transcriptPart;
                        }
                    }

                    const currentText = final || interim;
                    setLiveTranscript(currentText);
                    setInput(currentText);
                };

                recognition.onerror = (event) => {
                    console.warn("Speech recognition error:", event.error);
                    setIsListening(false);
                    setLiveTranscript("");

                    if (event.error === "not-allowed") {
                        toast.error("Microphone access was denied. Please allow mic permissions in your browser settings.", {
                            icon: "🎙️"
                        });
                    } else if (event.error !== "no-speech") {
                        toast.error(`Voice recognition error: ${event.error}`);
                    }
                };

                recognition.onend = () => {
                    setIsListening(false);
                };

                recognitionRef.current = recognition;
            } catch (err) {
                console.warn("Speech recognition initialization failed:", err);
                setSpeechSupported(false);
            }
        } else {
            setSpeechSupported(false);
        }

        // Cleanup on unmount
        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.abort();
                } catch (e) {}
            }
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    // Stop speaking when chat closes
    useEffect(() => {
        if (!isOpen && window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    }, [isOpen]);

    // Push-to-talk toggle
    const toggleListening = () => {
        if (!speechSupported) {
            toast("Voice recognition is not supported in this browser. Please use keyboard input.", {
                icon: "ℹ️"
            });
            return;
        }

        if (isSpeaking && window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current?.start();
            } catch (err) {
                // If already running, abort and start fresh
                recognitionRef.current?.abort();
                setTimeout(() => {
                    try {
                        recognitionRef.current?.start();
                    } catch (e) {
                        toast.error("Could not start microphone.");
                    }
                }, 100);
            }
        }
    };

    // Text to speech playback
    const speakText = (text) => {
        if (!voiceEnabled || !window.speechSynthesis) return;

        window.speechSynthesis.cancel();
        const cleaned = cleanSpeechText(text);
        if (!cleaned) return;

        const utterance = new SpeechSynthesisUtterance(cleaned);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        // Try to pick a natural English voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(
            (v) =>
                v.lang.startsWith("en") &&
                (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha"))
        ) || voices.find((v) => v.lang.startsWith("en"));

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    const stopSpeaking = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    // Send customer message to AI backend
    const handleSendMessage = async (textToSend = input) => {
        const messageText = (textToSend || "").trim();
        if (!messageText || loading) return;

        // Stop active speech recognition or audio playback
        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
        stopSpeaking();

        // Append user message
        const userMsg = {
            id: `user-${Date.now()}`,
            sender: "user",
            text: messageText,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLiveTranscript("");
        setLoading(true);

        try {
            const response = await api.post("/ai/chat", {
                message: messageText,
                context: {
                    pendingOrder
                }
            });

            const data = response.data;
            const replyText = data.reply || "I'm here to assist you with the LUX menu.";
            const action = data.action || "NONE";

            const aiMsg = {
                id: `ai-${Date.now()}`,
                sender: "ai",
                text: replyText,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                action,
                proposedItems: data.proposedItems || [],
                recommendedDishes: data.recommendedDishes || []
            };

            // Handle action state updates
            if (action === "PROPOSE_CART_ADD" && data.proposedItems?.length > 0) {
                setPendingOrder(data.proposedItems);
            } else if (action === "CONFIRM_CART_ADD" && data.itemsToCart?.length > 0) {
                // Actually add to cart
                for (const item of data.itemsToCart) {
                    addMultipleToCart(item, item.quantity || 1);
                }
                const count = data.itemsToCart.reduce((sum, i) => sum + (i.quantity || 1), 0);
                toast.success(`Added ${count} item${count > 1 ? "s" : ""} to your cart!`, {
                    icon: "🛒"
                });
                setPendingOrder(null);
            } else if (action === "CANCEL_CART_ADD") {
                setPendingOrder(null);
                toast("Order request cancelled", { icon: "✕" });
            }

            setMessages((prev) => [...prev, aiMsg]);

            // Speak response if voice is active
            speakText(replyText);
        } catch (error) {
            console.error("AI Assistant error:", error);
            const errorMsg = {
                id: `error-${Date.now()}`,
                sender: "ai",
                isError: true,
                text: "I encountered a momentary connection issue. Please tap 'Retry' or try again in a few moments.",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                retryMessage: messageText
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    // Confirm order directly from button
    const handleConfirmOrder = () => {
        if (!pendingOrder || pendingOrder.length === 0) return;

        for (const item of pendingOrder) {
            addMultipleToCart(item, item.quantity || 1);
        }

        const totalItems = pendingOrder.reduce((sum, i) => sum + (i.quantity || 1), 0);
        const totalCost = pendingOrder.reduce((sum, i) => sum + i.price * (i.quantity || 1), 0);

        toast.success(`Added ${totalItems} item${totalItems > 1 ? "s" : ""} to your cart!`, {
            icon: "🛒"
        });

        const confirmMsg = {
            id: `ai-confirm-${Date.now()}`,
            sender: "ai",
            text: `Perfect! I've placed ${totalItems} items (Total: ₹${totalCost.toLocaleString("en-IN")}) directly into your cart. You can review your cart anytime or proceed to checkout!`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            action: "ORDER_COMPLETED",
            confirmedItems: pendingOrder
        };

        setPendingOrder(null);
        setMessages((prev) => [...prev, confirmMsg]);
        speakText(confirmMsg.text);
    };

    // Cancel order directly from button
    const handleCancelOrder = () => {
        setPendingOrder(null);
        toast("Order request cancelled", { icon: "✕" });

        const cancelMsg = {
            id: `ai-cancel-${Date.now()}`,
            sender: "ai",
            text: "Understood, order proposal cancelled. Your cart remains untouched. What else can I assist you with?",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };

        setMessages((prev) => [...prev, cancelMsg]);
    };

    // Quick add recommended dish
    const handleAddDish = (dish) => {
        addMultipleToCart(dish, 1);
        toast.success(`Added ${dish.name} to cart!`, { icon: "🛒" });
    };

    // Clear chat history
    const handleClearChat = () => {
        stopSpeaking();
        setMessages(INITIAL_MESSAGES);
        setPendingOrder(null);
        toast("Conversation reset", { icon: "🔄" });
    };

    return (
        <>
            {/* ================= FLOATING TRIGGER BUTTON ================= */}
            <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] right-4 sm:bottom-6 sm:right-6 z-50">
                <button
                    onClick={() => setIsOpen((prev) => !prev)}
                    aria-label="Open LUX AI Assistant"
                    className={`group relative flex items-center gap-2 sm:gap-2.5 rounded-full px-3.5 py-2.5 sm:px-4 sm:py-3.5 shadow-2xl transition-all duration-300 touch-manipulation ${
                        isOpen
                            ? "bg-[#0B0B0B] text-[#D4AF7C] ring-2 ring-[#D4AF7C]/60"
                            : "bg-[#0B0B0B] text-white hover:bg-[#1a1a1a] hover:ring-2 hover:ring-[#D4AF7C]/50 hover:shadow-[#D4AF7C]/20"
                    }`}
                >
                    {/* Glowing gold pulse ring when idle */}
                    <span className="absolute -inset-0.5 -z-10 rounded-full bg-gradient-to-r from-[#D4AF7C]/40 to-[#B88A4A]/20 opacity-75 blur-sm transition group-hover:opacity-100" />

                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1A1A1A] border border-[#D4AF7C]/40 text-[#D4AF7C]">
                        {isOpen ? <FiX size={18} /> : <Sparkles size={16} className="animate-pulse" />}
                    </div>

                    <div className="text-left pr-1">
                        <span className="block text-xs font-black tracking-widest text-[#D4AF7C] uppercase">
                            LUX AI
                        </span>
                        <span className="block text-[9px] sm:text-[10px] font-medium text-gray-400">
                            {isOpen ? "Close Assistant" : "Voice & Food Concierge"}
                        </span>
                    </div>
                </button>
            </div>

            {/* ================= CHAT PANEL ================= */}
            {isOpen && (
                <div
                    role="dialog"
                    aria-label="LUX AI Chat Window"
                    className="fixed bottom-0 right-0 z-50 flex h-[92vh] w-full flex-col overflow-hidden bg-white shadow-2xl border-t border-[#D8D0C4] sm:bottom-24 sm:right-6 sm:h-[640px] sm:max-h-[85vh] sm:w-[420px] sm:rounded-3xl sm:border sm:border-[#D8D0C4]/80"
                >
                    {/* ===== HEADER ===== */}
                    <div className="flex items-center justify-between border-b border-[#2B1F14]/10 bg-[#0B0B0B] px-5 py-4 text-white">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2B1F14] to-[#141414] border border-[#D4AF7C]/50 text-[#D4AF7C] shadow-sm">
                                <Bot size={20} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-extrabold tracking-wider text-white text-base">
                                        LUX AI
                                    </h3>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#D4AF7C]/15 px-2 py-0.5 text-[10px] font-bold text-[#D4AF7C]">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        LIVE
                                    </span>
                                </div>
                                <p className="text-[11px] text-gray-400">
                                    Dining Concierge • Voice Ordering
                                </p>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-1">
                            {/* Stop active speech button */}
                            {isSpeaking && (
                                <button
                                    onClick={stopSpeaking}
                                    title="Stop voice playback"
                                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-950/60 border border-red-500/40 text-red-400 hover:bg-red-900 transition"
                                >
                                    <FiVolumeX size={15} />
                                </button>
                            )}

                            {/* Voice Mute Toggle */}
                            <button
                                onClick={() => {
                                    setVoiceEnabled((prev) => !prev);
                                    if (voiceEnabled) stopSpeaking();
                                }}
                                title={voiceEnabled ? "Mute voice replies" : "Enable voice replies"}
                                className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
                                    voiceEnabled
                                        ? "text-[#D4AF7C] hover:bg-[#1a1a1a]"
                                        : "text-gray-500 hover:bg-[#1a1a1a]"
                                }`}
                            >
                                {voiceEnabled ? <FiVolume2 size={16} /> : <FiVolumeX size={16} />}
                            </button>

                            {/* Reset Chat */}
                            <button
                                onClick={handleClearChat}
                                title="Reset conversation"
                                className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-[#1a1a1a] transition"
                            >
                                <FiRotateCcw size={15} />
                            </button>

                            {/* Close */}
                            <button
                                onClick={() => setIsOpen(false)}
                                title="Close"
                                className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-[#1a1a1a] transition"
                            >
                                <FiX size={18} />
                            </button>
                        </div>
                    </div>

                    {/* ===== MESSAGES CONTAINER ===== */}
                    <div className="flex-1 overflow-y-auto bg-[#FBF9F5] p-4 space-y-4">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex flex-col ${
                                    msg.sender === "user" ? "items-end" : "items-start"
                                }`}
                            >
                                {/* Message Bubble */}
                                <div
                                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                                        msg.sender === "user"
                                            ? "bg-[#0B0B0B] text-white rounded-br-none border border-[#D4AF7C]/30"
                                            : msg.isError
                                            ? "bg-red-50 border border-red-200 text-red-800 rounded-bl-none"
                                            : "bg-white text-[#2B1F14] border border-[#E8E0D4] rounded-bl-none"
                                    }`}
                                >
                                    {/* Text with preserved line breaks */}
                                    <div className="whitespace-pre-line font-normal">
                                        {msg.text}
                                    </div>

                                    {/* Error Retry button */}
                                    {msg.isError && msg.retryMessage && (
                                        <button
                                            onClick={() => handleSendMessage(msg.retryMessage)}
                                            className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition"
                                        >
                                            <FiRotateCcw size={12} />
                                            Retry
                                        </button>
                                    )}

                                    {/* ===== ORDER PROPOSAL CONFIRMATION CARD ===== */}
                                    {msg.action === "PROPOSE_CART_ADD" && msg.proposedItems?.length > 0 && (
                                        <div className="mt-3 rounded-xl border border-[#D4AF7C]/50 bg-[#FAF7F0] p-3.5 shadow-sm">
                                            <div className="flex items-center justify-between border-b border-[#E8E0D4] pb-2">
                                                <span className="text-xs font-bold uppercase tracking-wider text-[#B88A4A]">
                                                    Order Confirmation
                                                </span>
                                                <span className="text-xs font-extrabold text-[#0B0B0B]">
                                                    {msg.proposedItems.length} dish{msg.proposedItems.length > 1 ? "es" : ""}
                                                </span>
                                            </div>

                                            <div className="mt-2 divide-y divide-[#EFEAE2]">
                                                {msg.proposedItems.map((item, idx) => (
                                                    <div
                                                        key={`${item._id || idx}`}
                                                        className="flex items-center justify-between py-1.5 text-xs"
                                                    >
                                                        <span className="font-semibold text-[#2B1F14]">
                                                            {item.quantity}× {item.name}
                                                        </span>
                                                        <span className="font-bold text-[#0B0B0B]">
                                                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-2.5 flex items-center justify-between border-t border-[#E8E0D4] pt-2">
                                                <span className="text-xs font-bold text-[#756F66]">
                                                    Total Price:
                                                </span>
                                                <span className="text-sm font-black text-[#0B0B0B]">
                                                    ₹
                                                    {msg.proposedItems
                                                        .reduce((sum, i) => sum + i.price * i.quantity, 0)
                                                        .toLocaleString("en-IN")}
                                                </span>
                                            </div>

                                            {/* Action buttons */}
                                            {pendingOrder && (
                                                <div className="mt-3 grid grid-cols-2 gap-2">
                                                    <button
                                                        onClick={handleCancelOrder}
                                                        className="flex items-center justify-center gap-1 rounded-xl border border-[#D8D0C4] bg-white py-2 text-xs font-semibold text-[#4B443C] hover:bg-[#F0E9DD] transition"
                                                    >
                                                        <FiX size={14} />
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={handleConfirmOrder}
                                                        className="flex items-center justify-center gap-1 rounded-xl bg-[#0B0B0B] py-2 text-xs font-bold text-[#D4AF7C] border border-[#D4AF7C]/40 hover:bg-[#1A1A1A] transition shadow-sm"
                                                    >
                                                        <FiCheck size={14} />
                                                        Confirm & Add
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* ===== ORDER COMPLETED BADGE ===== */}
                                    {msg.action === "ORDER_COMPLETED" && (
                                        <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 p-2.5">
                                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                                                <FiCheck className="text-emerald-600" size={16} />
                                                Items added to Cart!
                                            </div>
                                            <Link
                                                to="/cart"
                                                onClick={() => setIsOpen(false)}
                                                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-900 underline hover:text-emerald-700"
                                            >
                                                View Cart <FiArrowRight size={12} />
                                            </Link>
                                        </div>
                                    )}

                                    {/* ===== RECOMMENDED DISH CARDS ===== */}
                                    {msg.recommendedDishes?.length > 0 && msg.action !== "PROPOSE_CART_ADD" && (
                                        <div className="mt-3 space-y-2">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-[#9A9389]">
                                                Featured from Menu:
                                            </p>
                                            <div className="grid grid-cols-1 gap-2">
                                                {msg.recommendedDishes.map((dish) => (
                                                    <div
                                                        key={dish._id || dish.name}
                                                        className="flex items-center justify-between rounded-xl border border-[#E8E0D4] bg-white p-2.5 shadow-2xs hover:border-[#D4AF7C]/60 transition"
                                                    >
                                                        <div className="flex items-center gap-2.5 overflow-hidden">
                                                            {dish.image ? (
                                                                <img
                                                                    src={dish.image}
                                                                    alt={dish.name}
                                                                    className="h-10 w-10 rounded-lg object-cover border border-[#EFEAE2]"
                                                                />
                                                            ) : (
                                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FAF7F0] border border-[#E8E0D4] text-base">
                                                                    🍽️
                                                                </div>
                                                            )}
                                                            <div className="truncate">
                                                                <p className="truncate text-xs font-bold text-[#0B0B0B]">
                                                                    {dish.name}
                                                                </p>
                                                                <div className="flex items-center gap-2 text-[10px] text-[#756F66]">
                                                                    <span className="font-bold text-[#0B0B0B]">
                                                                        ₹{dish.price}
                                                                    </span>
                                                                    {dish.preparationTime && (
                                                                        <span className="flex items-center gap-0.5">
                                                                            <FiClock size={9} />
                                                                            {dish.preparationTime}m
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-1.5 pl-2">
                                                            {dish.model3D && (
                                                                <button
                                                                    onClick={() => {
                                                                        setIsOpen(false);
                                                                        navigate(
                                                                            `/ar-test?model=${encodeURIComponent(
                                                                                dish.model3D
                                                                            )}&name=${encodeURIComponent(dish.name)}`
                                                                        );
                                                                    }}
                                                                    title="View in 3D AR"
                                                                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#D8D0C4] text-[#4B443C] hover:border-[#D4AF7C] hover:bg-[#D4AF7C]/10 transition"
                                                                >
                                                                    <FiEye size={13} />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleAddDish(dish)}
                                                                title="Add to Cart"
                                                                className="flex items-center gap-1 rounded-lg bg-[#0B0B0B] px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-[#2B1F14] transition"
                                                            >
                                                                + Add
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Timestamp */}
                                <span className="mt-1 px-1 text-[10px] text-[#9A9389]">
                                    {msg.timestamp}
                                </span>

                                {/* Suggested Prompts (shown on initial welcome message) */}
                                {msg.suggestedPrompts && messages.length === 1 && (
                                    <div className="mt-2.5 flex flex-wrap gap-1.5 pl-1">
                                        {msg.suggestedPrompts.map((prompt, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleSendMessage(prompt)}
                                                className="rounded-full border border-[#D8D0C4] bg-white px-3 py-1.5 text-xs font-semibold text-[#4B443C] hover:border-[#D4AF7C] hover:bg-[#FAF7F0] hover:text-[#0B0B0B] transition shadow-2xs"
                                            >
                                                {prompt}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Typing / Thinking Indicator */}
                        {loading && (
                            <div className="flex items-start">
                                <div className="flex items-center gap-1.5 rounded-2xl bg-white border border-[#E8E0D4] px-4 py-3 shadow-sm rounded-bl-none">
                                    <span className="h-2 w-2 rounded-full bg-[#D4AF7C] animate-bounce" />
                                    <span
                                        className="h-2 w-2 rounded-full bg-[#D4AF7C] animate-bounce"
                                        style={{ animationDelay: "150ms" }}
                                    />
                                    <span
                                        className="h-2 w-2 rounded-full bg-[#D4AF7C] animate-bounce"
                                        style={{ animationDelay: "300ms" }}
                                    />
                                    <span className="ml-2 text-xs font-medium text-[#756F66]">
                                        Thinking...
                                    </span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* ===== LIVE VOICE TRANSCRIPTION BANNER ===== */}
                    {isListening && (
                        <div className="border-t border-amber-200 bg-amber-50/95 px-4 py-2.5 text-xs text-amber-900 flex items-center justify-between animate-pulse">
                            <div className="flex items-center gap-2">
                                <span className="flex h-2.5 w-2.5 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
                                </span>
                                <span className="font-semibold">
                                    {liveTranscript ? `“${liveTranscript}”` : "Listening... Speak your request now"}
                                </span>
                            </div>
                            <button
                                onClick={toggleListening}
                                className="font-bold text-red-600 hover:text-red-800 underline ml-2"
                            >
                                Stop
                            </button>
                        </div>
                    )}

                    {/* Speech active speaking bar */}
                    {isSpeaking && (
                        <div className="border-t border-emerald-200 bg-emerald-50 px-4 py-2 text-xs text-emerald-900 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FiVolume2 className="animate-bounce text-emerald-600" size={14} />
                                <span className="font-medium">Speaking response...</span>
                            </div>
                            <button
                                onClick={stopSpeaking}
                                className="font-bold text-emerald-800 hover:text-emerald-950 underline"
                            >
                                Stop Speaking
                            </button>
                        </div>
                    )}

                    {/* ===== INPUT BAR ===== */}
                    <div className="border-t border-[#E8E0D4] bg-white p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSendMessage();
                            }}
                            className="flex items-center gap-2"
                        >
                            {/* Push-to-talk Voice Button */}
                            <button
                                type="button"
                                onClick={toggleListening}
                                title={
                                    !speechSupported
                                        ? "Voice input not supported in this browser"
                                        : isListening
                                        ? "Stop listening"
                                        : "Hands-free Push to Talk"
                                }
                                disabled={!speechSupported}
                                className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all ${
                                    !speechSupported
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : isListening
                                        ? "bg-red-600 text-white shadow-lg shadow-red-500/30 scale-105"
                                        : "bg-[#FAF7F0] border border-[#D8D0C4] text-[#2B1F14] hover:border-[#D4AF7C] hover:bg-[#D4AF7C]/15 hover:text-[#0B0B0B]"
                                }`}
                            >
                                {isListening ? (
                                    <FiMicOff size={19} className="animate-pulse" />
                                ) : (
                                    <FiMic size={19} />
                                )}
                            </button>

                            {/* Text Input Field */}
                            <div className="relative flex-1">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={
                                        isListening
                                            ? "Listening to voice..."
                                            : "Ask about menu, budget, or 'Add 1 pizza'..."
                                    }
                                    disabled={loading}
                                    maxLength={500}
                                    className="w-full rounded-2xl border border-[#D8D0C4] bg-[#FAF7F0] px-4 py-2.5 text-sm text-[#0B0B0B] placeholder-gray-400 transition focus:border-[#D4AF7C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF7C]/20"
                                />
                            </div>

                            {/* Send Button */}
                            <button
                                type="submit"
                                disabled={!input.trim() || loading}
                                title="Send Message"
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0B0B0B] text-[#D4AF7C] border border-[#D4AF7C]/40 transition hover:bg-[#1A1A1A] hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-sm"
                            >
                                <FiSend size={17} />
                            </button>
                        </form>

                        {/* Hint footer */}
                        <div className="mt-2 flex items-center justify-between px-1 text-[10px] text-gray-400">
                            <span>
                                {speechSupported
                                    ? "🎙️ Tap mic for hands-free voice ordering"
                                    : "Type requests or menu questions above"}
                            </span>
                            <span>Live Menu Connected</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default LuxAiAssistant;

