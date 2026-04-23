// Components/CartIcon.tsx
import React, { useState } from 'react'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '../Context/CartContext'
import CartSidebar from './CartSidebar' // We will create this next
import { AnimatePresence } from 'framer-motion'

export default function CartIcon() {
    const { totalItems } = useCart()
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="relative p-2 text-[#2D5016] hover:bg-[#2D5016]/5 rounded-full transition-colors"
            >
                <ShoppingBag size={24} />
                {totalItems > 0 && (
                    <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#6B9E3F] text-[10px] font-bold text-white shadow-sm">
                        {totalItems}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && <CartSidebar onClose={() => setIsOpen(false)} />}
            </AnimatePresence>
        </>
    )
}
