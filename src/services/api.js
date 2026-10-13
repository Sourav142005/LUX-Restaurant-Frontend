import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

// Add JWT automatically to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercept 401 responses for session expiry recovery
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const url = error.config?.url || "";
            // Do not treat login or password verification failures as session expiry
            const isAuthEndpoint =
                url.includes("/auth/login") ||
                url.includes("/auth/register") ||
                url.includes("/auth/verify-phone") ||
                url.includes("/auth/resend-phone-otp") ||
                url.includes("/auth/forgot-password") ||
                url.includes("/auth/reset-password");

            if (!isAuthEndpoint) {
                const hadToken = !!localStorage.getItem("token");
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                // Notify auth context to update React state
                window.dispatchEvent(
                    new CustomEvent("lux:auth-expired", {
                        detail: {
                            message:
                                error.response?.data?.message ||
                                "Your session has expired. Please sign in again."
                        }
                    })
                );

                if (hadToken) {
                    toast.error(
                        "Your session has expired. Please sign in again.",
                        { id: "lux-session-expired" }
                    );
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;
