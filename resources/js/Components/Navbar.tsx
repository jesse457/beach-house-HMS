// Components/Navbar.tsx
import React from 'react'
import { Link, usePage } from '@inertiajs/react'
import { Button } from './ui/Button'
import MobileMenu from './MobileMenu'
import CartIcon from './CartIcon'

export default function Navbar() {
    const { auth } = usePage<any>().props;
    const user = auth?.user;

    // Check if admin (adjust logic based on your actual auth structure)
    const isAdmin = user?.role === 'admin' || user?.user_metadata?.role === 'admin';

    return (
        <header className="sticky top-0 z-50 bg-[#F5F2E8]/95 backdrop-blur border-b border-[#2D5016]/15">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* LOGO */}
                    <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-[#2D5016]">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2D5016] text-[#F5F2E8] text-sm font-black">BHB</span>
                        <span className="hidden sm:inline">Beach-House-Botaland</span>
                    </Link>

                    {/* DESKTOP NAV */}
                    <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-600">
                        <Link href="/rooms" className="hover:text-[#2D5016] transition-colors">Rooms</Link>
                        <Link href="/gallery" className="hover:text-[#2D5016] transition-colors">Gallery</Link>
                        <Link href="/team" className="hover:text-[#2D5016] transition-colors">Our Team</Link>
                        <Link href="/location" className="hover:text-[#2D5016] transition-colors">Location</Link>
                    </nav>

                    {/* ACTIONS */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Cart Icon is always visible */}
                        <CartIcon />

                        <div className="hidden md:flex items-center gap-3 ml-2 border-l border-[#2D5016]/10 pl-4">
                            {user ? (
                                <>
                                    {isAdmin && (
                                        <Link href="/admin">
                                            <Button variant="ghost" size="sm">Admin</Button>
                                        </Link>
                                    )}
                                    <Link href="/dashboard">
                                        <Button variant="secondary" size="sm">Dashboard</Button>
                                    </Link>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="text-sm font-medium text-neutral-600 hover:text-[#2D5016] px-2"
                                    >
                                        Sign Out
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link href="/login">
                                        <Button variant="ghost" size="sm">Sign In</Button>
                                    </Link>
                                    <Link href="/rooms">
                                        <Button size="sm">Book Now</Button>
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Toggle */}
                        <div className="md:hidden">
                            <MobileMenu user={user} isAdmin={isAdmin} />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
