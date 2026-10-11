
import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState
} from "react";

const CartContext = createContext();

const GUEST_CART_KEY = "lux-cart";

const getUserCartKey = (userId) => `lux-cart-user:${userId}`;

const readCart = (key) => {
    try {
        const savedCart = localStorage.getItem(key);
        const parsedCart = savedCart ? JSON.parse(savedCart) : [];

        return Array.isArray(parsedCart) ? parsedCart : [];
    } catch (error) {
        console.error("Failed to load cart:", error);
        return [];
    }
};

const getStoredUserId = () => {
    try {
        const storedUser = localStorage.getItem("user");

        if (!storedUser || storedUser === "undefined") {
            return null;
        }

        const user = JSON.parse(storedUser);
        return user?._id || user?.id || null;
    } catch {
        return null;
    }
};

// Merge guest items with saved user items.
// Matching menu items have their quantities combined.
const mergeCarts = (savedItems, guestItems) => {
    const merged = [...savedItems];

    guestItems.forEach((guestItem) => {
        const existing = merged.find(
            (item) => item._id === guestItem._id
        );

        if (existing) {
            existing.quantity =
                Number(existing.quantity || 0) +
                Number(guestItem.quantity || 1);
        } else {
            merged.push({ ...guestItem });
        }
    });

    return merged;
};

export const CartProvider = ({ children }) => {
    const [cartStorageKey, setCartStorageKey] = useState(() => {
        const userId = getStoredUserId();

        return userId
            ? getUserCartKey(userId)
            : GUEST_CART_KEY;
    });

    const [cartItems, setCartItems] = useState(() =>
        readCart(
            getStoredUserId()
                ? getUserCartKey(getStoredUserId())
                : GUEST_CART_KEY
        )
    );

    const [dineInContext, setDineInContext] = useState(() => {
        try {
            const savedContext = localStorage.getItem(
                "lux-dine-in-context"
            );

            return savedContext ? JSON.parse(savedContext) : null;
        } catch (error) {
            console.error("Failed to load dine-in context:", error);
            return null;
        }
    });

    // Persist the current cart to its active storage key.
    useEffect(() => {
        localStorage.setItem(
            cartStorageKey,
            JSON.stringify(cartItems)
        );
    }, [cartItems, cartStorageKey]);

    // Persist dine-in context.
    useEffect(() => {
        if (dineInContext) {
            localStorage.setItem(
                "lux-dine-in-context",
                JSON.stringify(dineInContext)
            );
        } else {
            localStorage.removeItem("lux-dine-in-context");
        }
    }, [dineInContext]);

    // Switch between guest and user-specific carts.
    const setCartUser = (userId) => {
        if (userId) {
            const nextKey = getUserCartKey(userId);

            if (nextKey === cartStorageKey) {
                return;
            }

            // Save the current guest cart before switching.
            const guestItems = cartItems;

            if (cartStorageKey === GUEST_CART_KEY) {
                localStorage.setItem(
                    GUEST_CART_KEY,
                    JSON.stringify(guestItems)
                );
            }

            const savedUserItems = readCart(nextKey);

            // Keep guest items when logging in and restore
            // any cart previously saved for this user.
            const combinedItems = mergeCarts(
                savedUserItems,
                guestItems
            );

            localStorage.setItem(
                nextKey,
                JSON.stringify(combinedItems)
            );

            // Remove the shared guest cart so another user
            // cannot inherit these items later.
            localStorage.removeItem(GUEST_CART_KEY);

            setCartItems(combinedItems);
            setCartStorageKey(nextKey);
        } else {
            // Logout: clear the visible cart and switch to
            // guest storage without deleting the user's cart.
            setCartItems([]);
            setCartStorageKey(GUEST_CART_KEY);
        }
    };

    const addToCart = (item) => {
        setCartItems((currentItems) => {
            const existingItem = currentItems.find(
                (cartItem) => cartItem._id === item._id
            );

            if (existingItem) {
                return currentItems.map((cartItem) =>
                    cartItem._id === item._id
                        ? {
                              ...cartItem,
                              quantity: cartItem.quantity + 1
                          }
                        : cartItem
                );
            }

            return [...currentItems, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (id) => {
        setCartItems((currentItems) =>
            currentItems.filter((item) => item._id !== id)
        );
    };

    const increaseQuantity = (id) => {
        setCartItems((currentItems) =>
            currentItems.map((item) =>
                item._id === id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
        );
    };

    const decreaseQuantity = (id) => {
        setCartItems((currentItems) =>
            currentItems
                .map((item) =>
                    item._id === id
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                )
                .filter((item) => item.quantity > 0)
        );
    };

    // Clear the current cart. The active cart's storage is
    // updated automatically by the persistence effect.
    const clearCart = () => {
        setCartItems([]);
    };

    const clearCartAndDineInContext = () => {
        setCartItems([]);
        setDineInContext(null);
    };

    const setWalkInContext = (tableId) => {
        setDineInContext({
            type: "Walk-In",
            tableId
        });
    };

    const setReservationContext = (reservationId) => {
        setDineInContext({
            type: "Reservation",
            reservationId
        });
    };

    const clearDineInContext = () => {
        setDineInContext(null);
    };

    const cartTotal = useMemo(
        () =>
            cartItems.reduce(
                (total, item) =>
                    total +
                    Number(item.price || 0) *
                        Number(item.quantity || 0),
                0
            ),
        [cartItems]
    );

    const cartCount = useMemo(
        () =>
            cartItems.reduce(
                (total, item) =>
                    total + Number(item.quantity || 0),
                0
            ),
        [cartItems]
    );

    const uniqueCartItems = cartItems.length;

    return (
        <CartContext.Provider
            value={{
                cartItems,
                cartCount,
                uniqueCartItems,
                cartTotal,
                addToCart,
                removeFromCart,
                increaseQuantity,
                decreaseQuantity,
                clearCart,

                // Cart identity
                setCartUser,

                // Dine-in context
                dineInContext,
                setDineInContext,
                setWalkInContext,
                setReservationContext,
                clearDineInContext,
                clearCartAndDineInContext
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
