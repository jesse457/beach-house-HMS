import React, { PropsWithChildren } from 'react'
import Navbar from '../Components/Navbar' // Note: Usually uppercase 'C' in Inertia projects
import Footer from '../Components/Footer'

/**
 * In Inertia, we don't use 'next/font/google'.
 * To get the Geist font effect, add the following to your
 * root HTML file (usually app.blade.php in Laravel):
 *
 * <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/geist@1.3.0/dist/font/sans.css">
 */

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-full flex flex-col bg-[#FAFAF0] text-neutral-900 antialiased font-sans">
      {/*
          Note: Metadata is handled via the <Head /> component
          inside your individual pages, or passed via the
          Inertia root template.
      */}

      <Navbar />

      <main className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  )
}
