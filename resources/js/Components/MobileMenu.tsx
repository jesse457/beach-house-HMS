import React, { useState } from 'react'
import { Link } from '@inertiajs/react'
import { Menu, X } from 'lucide-react'

export default function MobileMenu({ user, isAdmin }: { user: any | null; isAdmin: boolean }) {
    const [open, setOpen] = useState(false)

    return (
        <div className="md:hidden">
            <button
                onClick={() => setOpen(!open)}
                className="p-2 rounded-lg hover:bg-[#2D5016]/10 text-[#2D5016]"
            >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {open && (
                <div className="absolute inset-x-0 top-16 bg-[#F5F2E8] border-b border-[#2D5016]/15 shadow-lg p-4 flex flex-col gap-1 text-sm font-medium z-50">
                    {[
                        { href: '/rooms', label: 'Rooms' },
                        { href: '/services', label: 'Services' },
                        { href: '/gallery', label: 'Gallery' },
                        { href: '/team', label: 'Our Team' },
                        { href: '/location', label: 'Location' },
                        { href: '/#contact', label: 'Contact' },
                    ].map(({ href, label }) => (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setOpen(false)}
                            className="py-2.5 px-3 rounded-lg hover:bg-[#2D5016]/10 text-neutral-700 hover:text-[#2D5016]"
                        >
                            {label}
                        </Link>
                    ))}
                    <hr className="border-[#2D5016]/15 my-1" />
                    {user ? (
                        <>
                            {isAdmin && (
                                <Link href="/admin" onClick={() => setOpen(false)} className="py-2.5 px-3 rounded-lg text-[#2D5016] font-semibold">
                                    Admin Panel
                                </Link>
                            )}
                            <Link href="/dashboard" onClick={() => setOpen(false)} className="py-2.5 px-3 rounded-lg hover:bg-[#2D5016]/10">
                                My Bookings
                            </Link>
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="w-full text-left py-2.5 px-3 rounded-lg text-red-600 hover:bg-red-50"
                            >
                                Sign Out
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/login" onClick={() => setOpen(false)} className="py-2.5 px-3 rounded-lg hover:bg-[#2D5016]/10">
                                Sign In
                            </Link>
                            <Link href="/signup" onClick={() => setOpen(false)} className="py-2.5 px-3 rounded-lg bg-[#2D5016] text-[#F5F2E8] font-semibold text-center mt-1">
                                Book Now
                            </Link>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
