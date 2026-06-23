import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import SEO from '../../Components/SEO';
import Breadcrumbs from '../../Components/Breadcrumbs';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play, X, ChevronLeft, ChevronRight, CheckCircle2,
    Image as ImageIcon, Wifi, Tv, Wind, Coffee, Utensils,
    Calendar, ArrowLeft, ShieldCheck, Clock
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
// Heroicons for amenity icon resolution (matches Filament DB format)
import * as OutlineIcons from '@heroicons/react/24/outline';
import * as SolidIcons from '@heroicons/react/24/solid';
import * as MiniIcons from '@heroicons/react/20/solid';
import Layout from '../../Layouts/Layout';
import { useCart } from '../../Context/CartContext';

// ─── TYPES ──────────────────────────────────────────────────────────────────
interface RoomProps {
    room: {
        id: number;
        slug?: string;
        room_number: string;
        type_name?: string | null;
        description?: string | null;
        price: string;
        pictures: string[];
        videos: { url: string; thumbnail?: string | null }[];
        amenities: { name: string; icon: string; description?: string | null }[];
    };
}

// ─── REVEAL ANIMATION ───────────────────────────────────────────────────────
const Reveal = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
  >
    {children}
  </motion.div>
);

// ─── SMART AMENITY ICON RESOLVER ──────────────────────────────────────────
function AmenityIcon({ iconName, amenityName, size = 20 }: { iconName: string; amenityName: string; size?: number }) {
    // 1. Resolve by Heroicon format (DB stores e.g. "heroicon-o-wifi")
    if (iconName && iconName.startsWith('heroicon')) {
        let IconSet: any = OutlineIcons;
        if (iconName.startsWith('heroicon-s-')) IconSet = SolidIcons;
        else if (iconName.startsWith('heroicon-m-')) IconSet = MiniIcons;

        const cleanName = iconName.replace(/^(heroicon-o-|heroicon-s-|heroicon-m-|heroicon-c-|heroicon-)/, '');
        const pascalName = cleanName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
        const IconComponent = IconSet[`${pascalName}Icon`] || OutlineIcons[`${pascalName}Icon`];
        if (IconComponent) return <IconComponent style={{ width: size, height: size }} />;
    }

    // 2. Fallback: match by amenity name keywords (Lucide icons)
    const normalizedName = amenityName.toLowerCase();
    if (normalizedName.includes('wifi')) return <Wifi size={size} />;
    if (normalizedName.includes('tv')) return <Tv size={size} />;
    if (normalizedName.includes('air') || normalizedName.includes('ac')) return <Wind size={size} />;
    if (normalizedName.includes('breakfast') || normalizedName.includes('dining')) return <Utensils size={size} />;
    if (normalizedName.includes('coffee') || normalizedName.includes('tea')) return <Coffee size={size} />;

    // 3. Absolute fallback
    return <CheckCircle2 size={size} />;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function RoomShow({ room }: RoomProps) {
    const [active, setActive] = useState(0);
    const [lightbox, setLightbox] = useState(false);

    // Initialize Cart Context
    const { items, addToCart, removeFromCart } = useCart();
    const isInCart = items.some(item => item.id === room.id);

    // Safe fallbacks for data
    const title = room.type_name || 'Standard Room';
    const description = room.description || 'Enjoy a comfortable stay in our beautifully appointed room.';
    const pictures = room.pictures && room.pictures.length > 0 ? room.pictures : [];
    const videos = room.videos && room.videos.length > 0 ? room.videos : [];

    // Combine media (handling potential null thumbnails from the controller)
    const allMedia = [
        ...pictures.map(src => ({ type: 'image' as const, src, thumb: src })),
        ...videos.map(v => ({
            type: 'video' as const,
            src: v.url,
            thumb: v.thumbnail || pictures[0] || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80'
        }))
    ];

    // If completely no media, inject visual placeholder
    if (allMedia.length === 0) {
        allMedia.push({
            type: 'image',
            src: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80',
            thumb: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80'
        });
    }

    const current = allMedia[active] || allMedia[0];

    const next = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setActive((prev) => (prev + 1) % allMedia.length);
    };

    const prev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setActive((prev) => (prev - 1 + allMedia.length) % allMedia.length);
    };

    // Handle Cart Logic
    const handleCartToggle = () => {
        if (isInCart) {
            removeFromCart(room.id);
        } else {
            const numericPrice = parseFloat(room.price.replace(/,/g, ''));
            addToCart({
                id: room.id,
                name: `${title} (Room ${room.room_number})`,
                price_per_night: numericPrice,
                image: pictures[0] || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80'
            });
        }
    };

    return (
        <Layout>
            <div className="bg-[#F5F2E8] min-h-screen pb-28 md:pb-20 relative">
                <SEO
                    title={`${title} - Room ${room.room_number}`}
                    description={description}
                    canonical={window.location.origin + '/rooms/' + (room.slug || room.id)}
                    ogImage={pictures[0]}
                    jsonLd={[
                        {
                            '@context': 'https://schema.org',
                            '@type': 'Product',
                            name: `${title} - Room ${room.room_number}`,
                            description: description,
                            image: pictures,
                            offers: {
                                '@type': 'Offer',
                                price: room.price.replace(/,/g, ''),
                                priceCurrency: 'XAF',
                                availability: room.is_occupied
                                    ? 'https://schema.org/InStock'
                                    : 'https://schema.org/InStock',
                                url: window.location.href,
                            },
                        },
                        {
                            '@context': 'https://schema.org',
                            '@type': 'BreadcrumbList',
                            itemListElement: [
                                { '@type': 'ListItem', position: 1, name: 'Home', item: window.location.origin + '/' },
                                { '@type': 'ListItem', position: 2, name: 'Rooms', item: window.location.origin + '/rooms' },
                                { '@type': 'ListItem', position: 3, name: `${title} - Room ${room.room_number}` },
                            ],
                        },
                    ]}
                />

                {/* ── BACK NAVIGATION HERO HEADER ── */}
                <div className="bg-[#2D5016] pt-24 pb-6">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Breadcrumbs
                            items={[
                                { label: 'Home', href: '/' },
                                { label: 'Rooms', href: '/rooms' },
                                { label: `${title} - Room ${room.room_number}` },
                            ]}
                        />
                        <Link
                            href="/rooms"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-[#C8DBA8] hover:text-[#F5F2E8] transition-colors mb-4 group"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Back to all rooms
                        </Link>
                    </div>
                </div>

                {/* ── RESPONSIVE GALLERY SECTION ── */}
                <div className="bg-[#2D5016] pb-8 md:pb-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 h-auto md:h-[500px]">

                            {/* Main Display Frame */}
                            <div
                                className="md:col-span-3 relative rounded-2xl md:rounded-3xl overflow-hidden bg-black cursor-pointer group shadow-lg aspect-[4/3] sm:aspect-video md:aspect-auto md:h-full"
                                onClick={() => setLightbox(true)}
                            >
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={active}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 w-full h-full flex items-center justify-center"
                                    >
                                        {current.type === 'video' ? (
                                            <video src={current.src} poster={current.thumb} autoPlay muted loop playsInline className="w-full h-full object-cover md:object-cover" />
                                        ) : (
                                            <img src={current.src} className="w-full h-full object-contain sm:object-cover md:object-cover" alt={`${title} - Room ${room.room_number}`} />
                                        )}
                                    </motion.div>
                                </AnimatePresence>

                                {/* Navigation Arrows */}
                                {allMedia.length > 1 && (
                                    <>
                                        <button
                                            onClick={prev}
                                            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 md:p-3 rounded-full bg-black/50 hover:bg-black/75 text-[#F5F2E8] md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10"
                                        >
                                            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </button>
                                        <button
                                            onClick={next}
                                            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 md:p-3 rounded-full bg-black/50 hover:bg-black/75 text-[#F5F2E8] md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10"
                                        >
                                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </button>
                                        <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 px-2.5 sm:px-3.5 py-1 sm:py-1.5 bg-black/60 backdrop-blur-md rounded-full text-[#F5F2E8] text-[10px] sm:text-xs font-bold tracking-wider">
                                            {active + 1} / {allMedia.length}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Thumbnails list (Horizontal carousel on mobile, Vertical stack on desktop) */}
                            <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-hidden md:overflow-y-auto pb-1 md:pb-0 pr-0 md:pr-2 snap-x snap-mandatory scrollbar-none scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0">
                                {allMedia.map((media, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActive(i)}
                                        className={`relative rounded-lg sm:rounded-xl overflow-hidden h-14 w-20 sm:h-16 sm:w-24 md:w-full md:h-28 shrink-0 snap-start border-2 transition-all duration-300 bg-black/20 ${
                                            active === i
                                                ? 'border-[#6B9E3F] scale-95 shadow-md'
                                                : 'border-transparent opacity-60 hover:opacity-100'
                                        }`}
                                    >
                                        <img src={media.thumb} className="w-full h-full object-cover" alt={`${title} Room ${room.room_number} view ${i + 1}`} />
                                        {media.type === 'video' && (
                                            <span className="absolute inset-0 m-auto h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-black/40 flex items-center justify-center text-white backdrop-blur-xs">
                                                <Play className="fill-white translate-x-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── ROOM DETAILS & INFRASTRUCTURE ── */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 md:mt-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">

                        {/* Left Column: Room Context */}
                        <div className="lg:col-span-2 space-y-8">
                            <Reveal>
                                <div>
                                    <span className="inline-block bg-[#2D5016]/10 text-[#2D5016] px-3.5 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-3">
                                        Suite {room.room_number}
                                    </span>
                                    <h1 className="text-4xl md:text-5xl font-serif italic text-[#2D5016] leading-tight">
                                        {title}
                                    </h1>
                                    <p className="text-base md:text-lg text-neutral-600 leading-relaxed mt-6 whitespace-pre-line bg-white/50 p-6 rounded-2xl border border-[#2D5016]/5">
                                        {description}
                                    </p>
                                </div>
                            </Reveal>

                            {/* Amenities Highlight Grid */}
                            <Reveal>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-serif text-[#2D5016] mb-6">
                                        In-Suite Luxuries & Amenities
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {room.amenities && room.amenities.length > 0 ? (
                                            room.amenities.map((amenity, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-[#2D5016]/10 shadow-xs hover:shadow-md transition-shadow"
                                                >
                                                    <div className="p-2.5 bg-[#F5F2E8] rounded-xl text-[#6B9E3F] shrink-0 border border-[#2D5016]/5">
                                                        <AmenityIcon iconName={amenity.icon} amenityName={amenity.name} size={22} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-[#2D5016] text-sm md:text-base">
                                                            {amenity.name}
                                                        </h4>
                                                        {amenity.description && (
                                                            <p className="text-xs text-neutral-500 mt-1 leading-normal">
                                                                {amenity.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-neutral-500 italic col-span-full bg-white p-6 rounded-2xl text-center">
                                                Premium standard amenities included.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Reveal>

                            {/* Booking Policy & Support Cards */}
                            <Reveal>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#2D5016]/10 pt-8">
                                    <div className="flex items-center gap-3">
                                        <Clock className="text-[#6B9E3F]" size={20} />
                                        <div>
                                            <p className="text-xs font-black uppercase text-[#2D5016] tracking-wider">Flexible Stay</p>
                                            <p className="text-xs text-neutral-500">Check-in from 2:00 PM</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck className="text-[#6B9E3F]" size={20} />
                                        <div>
                                            <p className="text-xs font-black uppercase text-[#2D5016] tracking-wider">Secure Booking</p>
                                            <p className="text-xs text-neutral-500">Encrypted payment path</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Calendar className="text-[#6B9E3F]" size={20} />
                                        <div>
                                            <p className="text-xs font-black uppercase text-[#2D5016] tracking-wider">Cancellation</p>
                                            <p className="text-xs text-neutral-500">Free up to 48h prior</p>
                                        </div>
                                    </div>
                                </div>
                            </Reveal>
                        </div>

                        {/* Right Column: Desktop Booking Widget */}
                        <div className="lg:col-span-1">
                            <div className="hidden lg:block bg-white p-8 rounded-[2rem] shadow-lg border border-[#2D5016]/10 sticky top-28">
                                <span className="block text-neutral-400 text-xs uppercase font-extrabold tracking-widest mb-2">Price per night</span>
                                <div className="flex items-baseline gap-1.5 mb-6">
                                    <span className="text-xs font-bold text-[#6B9E3F] uppercase">FCFA</span>
                                    <span className="text-4xl font-serif italic font-bold text-[#2D5016]">{room.price}</span>
                                    <span className="text-neutral-400 text-xs ml-1">Excl. Taxes</span>
                                </div>

                                <button
                                    onClick={handleCartToggle}
                                    className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-md ${
                                        isInCart
                                        ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 shadow-none'
                                        : 'bg-[#2D5016] text-[#F5F2E8] hover:bg-[#3d691e] hover:shadow-lg shadow-[#2D5016]/20'
                                    }`}
                                >
                                    {isInCart ? 'Remove from Cart' : 'Reserve This Room'}
                                </button>

                                <p className="text-center text-xs text-neutral-400 mt-4 leading-normal">
                                    Secure checkout via our dynamic booking planner.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* ── STICKY MOBILE BOOKING BAR (Conversion Catalyst) ── */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#2D5016]/10 px-6 py-4 flex items-center justify-between shadow-2xl">
                    <div>
                        <span className="block text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Per Night</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-[10px] text-[#6B9E3F] font-bold">FCFA</span>
                            <span className="text-2xl font-serif italic text-[#2D5016] font-bold">{room.price}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleCartToggle}
                        className={`px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
                            isInCart
                            ? 'bg-red-50 text-red-600 border border-red-200'
                            : 'bg-[#2D5016] text-[#F5F2E8]'
                        }`}
                    >
                        {isInCart ? 'Remove' : 'Reserve Suite'}
                    </button>
                </div>

                {/* ── LIGHTBOX (Video / Image Viewer) ── */}
                <AnimatePresence>
                    {lightbox && current.src !== '/images/placeholder.jpg' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] bg-black/98 flex flex-col items-center justify-center p-4 md:p-10 backdrop-blur-md"
                            onClick={() => setLightbox(false)}
                        >
                            <button
                                className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-[110]"
                                onClick={() => setLightbox(false)}
                            >
                                <X size={40} strokeWidth={1.5} />
                            </button>

                            {/* Slide Navigation inside Lightbox */}
                            <div className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 z-[110]">
                                <button
                                    onClick={prev}
                                    className="p-4 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all border border-white/10"
                                >
                                    <ChevronLeft size={32} />
                                </button>
                            </div>
                            <div className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 z-[110]">
                                <button
                                    onClick={next}
                                    className="p-4 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all border border-white/10"
                                >
                                    <ChevronRight size={32} />
                                </button>
                            </div>

                            {/* Lightbox Content Window */}
                            <div className="relative max-w-6xl w-full max-h-[75vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
                                {current.type === 'video' ? (
                                    <video src={current.src} controls autoPlay className="max-h-[75vh] max-w-full rounded-xl outline-none" />
                                ) : (
                                    <img src={current.src} className="max-h-[75vh] max-w-full object-contain rounded-xl" alt={`Enlarged view of ${title} - Room ${room.room_number}`} />
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Layout>
    );
}
