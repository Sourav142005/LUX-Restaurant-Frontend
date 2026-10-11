
import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { Toaster } from "react-hot-toast";

import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <CartProvider>
            <AuthProvider>
                <App />
                <Toaster
                    position="top-right"
                    reverseOrder={false}
                />
            </AuthProvider>
        </CartProvider>
    </React.StrictMode>
);
