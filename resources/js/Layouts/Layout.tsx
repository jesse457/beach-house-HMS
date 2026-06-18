import React, { PropsWithChildren } from 'react'
import Navbar from '../Components/Navbar'
import Footer from '../Components/Footer'
import Toast from '../Components/Toast'
import { useCart } from '../Context/CartContext'

export default function Layout({ children }: PropsWithChildren) {
  const { toastMessage, toastVisible, dismissToast } = useCart()

  return (
    <div className="min-h-full flex flex-col bg-[#FAFAF0] text-neutral-900 antialiased font-sans">
      <Navbar />

      <main className="flex-1">
        {children}
      </main>

      <Footer />

      <Toast
        message={toastMessage}
        visible={toastVisible}
        onClose={dismissToast}
      />
    </div>
  )
}
