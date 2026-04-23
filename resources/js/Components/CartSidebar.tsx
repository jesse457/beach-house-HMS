// Components/CartSidebar.tsx
import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom' // <-- Import this
import { motion } from 'framer-motion'
import { X, Trash2, ShoppingBag } from 'lucide-react'
import { useCart } from '../Context/CartContext'
import { Link } from '@inertiajs/react'

export default function CartSidebar({ onClose }: { onClose: () => void }) {
    const { items, removeFromCart, totalPrice, totalItems } = useCart()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        // Lock background body scrolling when sidebar is open
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    },[]);

    // Prevent rendering on the server (hydration mismatch) and before mount
    if (!mounted) return null;

    // Use createPortal to teleport the fixed modal to the document.body
    return createPortal(
        <motion.div className="fixed inset-0 z-[100] overflow-hidden">

            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
            />

            {/* Sidebar Panel */}
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute right-0 top-0 h-full w-full max-w-md bg-[#F5F2E8] shadow-2xl flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-[#2D5016]/10 flex items-center justify-between bg-white/50">
                    <h2 className="text-xl font-bold text-[#2D5016]">Your Bookings ({totalItems})</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-black/5 rounded-full transition-colors"
                    >
                        <X size={20}/>
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-300">
                                <ShoppingBag size={32} />
                            </div>
                            <p className="text-gray-500 font-medium">Your selection is empty.</p>
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 bg-white border border-[#2D5016]/20 text-[#2D5016] font-bold rounded-xl hover:bg-[#2D5016]/5 transition-colors"
                            >
                                Browse Rooms
                            </button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="flex gap-4 bg-white p-3 rounded-2xl shadow-sm border border-[#2D5016]/5">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-20 h-20 object-cover rounded-xl shrink-0"
                                />
                                <div className="flex-1 flex flex-col justify-center">
                                    <h4 className="font-bold text-[#2D5016] text-sm leading-tight">{item.name}</h4>
                                    <p className="text-[#6B9E3F] font-bold text-sm mt-1">${item.price_per_night} <span className="text-gray-400 text-xs font-normal">/ night</span></p>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="mt-2 text-xs text-red-500 flex items-center gap-1 hover:text-red-700 transition-colors w-max"
                                    >
                                        <Trash2 size={12} /> Remove
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="p-6 bg-white border-t border-[#2D5016]/10 space-y-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
                        <div className="flex justify-between items-end">
                            <span className="text-gray-500 font-medium">Estimated Total</span>
                            <span className="text-3xl font-black text-[#2D5016]">
                                ${totalPrice.toFixed(2)}
                            </span>
                        </div>

                        <Link
                            href="/checkout"
                            onClick={onClose}
                            className="flex justify-center items-center w-full py-4 text-lg bg-[#2D5016] text-white rounded-xl font-bold hover:bg-[#1e380f] transition-all shadow-lg shadow-[#2D5016]/20 hover:shadow-[#2D5016]/40 active:scale-[0.98]"
                        >
                            Proceed to Checkout
                        </Link>
                    </div>
                )}
            </motion.div>
        </motion.div>,
        document.body // <-- This is where we tell React to render it
    )
}
