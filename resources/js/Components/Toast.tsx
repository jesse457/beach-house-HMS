import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, X } from 'lucide-react'

interface ToastProps {
  message: string | null
  visible: boolean
  onClose: () => void
}

export default function Toast({ message, visible, onClose }: ToastProps) {
  useEffect(() => {
    if (visible && message) {
      const timer = setTimeout(onClose, 2500)
      return () => clearTimeout(timer)
    }
  }, [visible, message, onClose])

  return (
    <AnimatePresence>
      {visible && message && (
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
        >
          <div className="pointer-events-auto flex items-center gap-3 bg-[#2D5016] text-[#F5F2E8] px-5 py-3.5 rounded-2xl shadow-2xl border border-[#6B9E3F]/30 max-w-sm">
            <div className="shrink-0 w-10 h-10 rounded-full bg-[#6B9E3F]/20 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-[#6B9E3F]" />
            </div>
            <p className="text-sm font-semibold leading-snug">{message}</p>
            <button
              onClick={onClose}
              className="shrink-0 p-1 rounded-full hover:bg-white/10 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
