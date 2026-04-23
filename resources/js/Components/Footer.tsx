import React from 'react'
import { Link } from '@inertiajs/react'
import { MapPin, Phone, Mail } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="bg-[#2D5016] text-[#C8DBA8]" id="contact">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2.5 mb-4">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F5F2E8] text-[#2D5016] text-sm font-black">BHB</span>
                            <span className="text-[#F5F2E8] font-bold text-xl">Beach House Botaland</span>
                        </div>
                        <p className="text-sm leading-relaxed max-w-sm text-[#C8DBA8]">
                            Experience comfort and luxury in the heart of the city. Premium rooms, world-class amenities, and personalized service.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-[#F5F2E8] font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
                        <ul className="space-y-2.5 text-sm">
                            {[
                                { href: '/rooms', label: 'Our Rooms' },
                                { href: '/services', label: 'Services' },
                                { href: '/team', label: 'Our Team' },
                                { href: '/location', label: 'Location & Map' },
                                { href: '/login', label: 'Book Now' },
                            ].map(({ href, label }) => (
                                <li key={href}>
                                    <Link href={href} className="hover:text-[#F5F2E8] transition-colors">{label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-[#F5F2E8] font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-2.5">
                                <MapPin className="h-4 w-4 mt-0.5 text-[#6B9E3F] shrink-0" />
                                <span>237 Botaland Limbe Cameroon</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <Phone className="h-4 w-4 text-[#6B9E3F]" />
                                <span>+237 679447430</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-[#F5F2E8]/10 mt-10 pt-6 text-center text-xs text-[#C8DBA8]/60">
                    © {new Date().getFullYear()} Beach House Botaland.
                </div>
            </div>
        </footer>
    )
}
