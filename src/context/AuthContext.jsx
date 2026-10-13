
import { createContext, useContext, useEffect, useState } from "react";
import { useCart } from "./CartContext";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => {
        const storedToken = localStorage.getItem("token");
        if (!storedToken || storedToken === "undefined" || storedToken === "null") {
            return null;
        }
        return storedToken;
    });

    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");

        if (!storedUser || storedUser === "undefined") {
            return null;
        }

        try {
            return JSON.parse(storedUser);
        } catch {
            return null;
        }
    });

    const { clearCart, setCartUser } = useCart();

    useEffect(() => {
        const handleAuthExpired = () => {
            clearCart();
            setCartUser(null);
            setToken(null);
            setUser(null);
        };

        window.addEventListener("lux:auth-expired", handleAuthExpired);
        return () => {
            window.removeEventListener("lux:auth-expired", handleAuthExpired);
        };
    }, [clearCart, setCartUser]);

    const login = (jwtToken, userData) => {
        localStorage.setItem("token", jwtToken);
        localStorage.setItem("user", JSON.stringify(userData));

        setToken(jwtToken);
        setUser(userData);

        setCartUser(userData?._id || userData?.id);
    };

    const logout = () => {
        clearCart();
        setCartUser(null);

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                login,
                logout,
                isAuthenticated: !!token
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
