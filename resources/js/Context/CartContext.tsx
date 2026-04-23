import React, { createContext, useContext, useState, useEffect } from 'react';

export interface RoomItem {
    id: number | string;
    name: string;
    price_per_night: string | number;
    image?: string;
}

interface CartContextType {
    items: RoomItem[];
    addToCart: (room: RoomItem) => void;
    removeFromCart: (roomId: number | string) => void;
    clearCart: () => void;
    isHydrated: boolean;
    totalPrice: number;
    totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const [items, setItems] = useState<RoomItem[]>([]);
    const [isHydrated, setIsHydrated] = useState(false);

    // Hydrate from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('bhb_cart');
        if (saved) {
            try {
                setItems(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
        setIsHydrated(true);
    },[]);

    // Save to localStorage on change
    useEffect(() => {
        if (isHydrated) {
            localStorage.setItem('bhb_cart', JSON.stringify(items));
        }
    }, [items, isHydrated]);

    const addToCart = (room: RoomItem) => {
        setItems(prev => {
            if (prev.find(i => i.id === room.id)) return prev;
            return [...prev, room];
        });
    };

    const removeFromCart = (roomId: number | string) => {
        setItems(prev => prev.filter(i => i.id !== roomId));
    };

    const clearCart = () => setItems([]);

    const totalItems = items.length;

    const totalPrice = items.reduce((acc, i) => {
        const price = typeof i.price_per_night === 'string'
            ? parseFloat(i.price_per_night)
            : i.price_per_night;
        return acc + (price || 0);
    }, 0);
const value = React.useMemo(() => ({
        items,
        isHydrated,
        addToCart,
        removeFromCart,
        clearCart,
        totalPrice,
        totalItems
    }), [items, isHydrated]);
    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};


export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    return {
        items: [],
        isHydrated: false, // Fallback
        totalItems: 0,
        totalPrice: 0,
        addToCart: () => {},
        removeFromCart: () => {},
        clearCart: () => {}
    };
  }
  return context;
};
