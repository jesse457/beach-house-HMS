import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, ChevronLeft, ChevronRight, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import Layout from '../../Layouts/Layout';
import { useCart } from '../../Context/CartContext';

interface RoomProps {
    room: {
        id: number;
        room_number: string;
        type_name?: string | null;
        description?: string | null;
        price: string;
        pictures: string[];
        videos: { url: string; thumbnail?: string | null }[];
        amenities: { name: string; icon: string; description?: string | null }[];
    };
}

export default function RoomShow({ room }: RoomProps) {
    const[active, setActive] = useState(0);
    const [lightbox, setLightbox] = useState(false);

    // Initialize Cart Context
    const { items, addToCart, removeFromCart } = useCart();
    const isInCart = items.some(item => item.id === room.id);

    // Safe fallbacks for data
    const title = room.type_name || 'Standard Room';
    const description = room.description || 'Enjoy a comfortable stay in our beautifully appointed room.';
    const pictures = room.pictures && room.pictures.length > 0 ? room.pictures :[];
    const videos = room.videos && room.videos.length > 0 ? room.videos : [];

    // Combine media (handling potential null thumbnails from the controller)
    const allMedia =[
        ...pictures.map(src => ({ type: 'image' as const, src, thumb: src })),
        ...videos.map(v => ({
            type: 'video' as const,
            src: v.url,
            thumb: v.thumbnail || pictures[0] || '/images/placeholder.jpg' // Fallback if video has no thumbnail
        }))
    ];

    // If there is completely no media, inject a fallback so the UI doesn't break
    if (allMedia.length === 0) {
        allMedia.push({ type: 'image', src: '/images/placeholder.jpg', thumb: '/images/placeholder.jpg' });
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
            // Controller returns '1,500.00', we must strip commas for accurate cart math
            const numericPrice = parseFloat(room.price.replace(/,/g, ''));

            addToCart({
                id: room.id,
                name: `${title} (Room ${room.room_number})`,
                price_per_night: numericPrice,
                image: pictures[0] || '/images/placeholder.jpg'
            });
        }
    };

    return (
        <Layout>
            <div className="bg-[#F5F2E8] min-h-screen pb-20">
                <Head title={`${title} - Room ${room.room_number}`} />

                {/* ── GALLERY SECTION ── */}
                <div className="bg-[#2D5016] pt-12 pb-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 h-[500px]">
                            {/* Main Viewer */}
                            <div className="md:col-span-3 relative rounded-3xl overflow-hidden bg-black cursor-pointer group flex items-center justify-center" onClick={() => setLightbox(true)}>
                                <AnimatePresence mode="wait">
                                    <motion.div key={active} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 w-full h-full flex items-center justify-center">
                                        {current.type === 'video' ? (
                                            <video src={current.src} poster={current.thumb} autoPlay muted loop className="w-full h-full object-cover" />
                                        ) : (
                                            current.src === '/images/placeholder.jpg' ? (
                                                <ImageIcon className="text-white/20 w-32 h-32" />
                                            ) : (
                                                <img src={current.src} className="w-full h-full object-cover" alt="Room View" />
                                            )
                                        )}
                                    </motion.div>
                                </AnimatePresence>

                                {allMedia.length > 1 && (
                                    <>
                                        <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity"><ChevronLeft /></button>
                                        <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight /></button>
                                        <div className="absolute bottom-6 left-6 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full text-white text-sm font-bold">
                                            {active + 1} / {allMedia.length}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Thumbnails */}
                            <div className="hidden md:flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
                                {allMedia.map((media, i) => (
                                    <button key={i} onClick={() => setActive(i)} className={`relative rounded-2xl overflow-hidden h-32 border-2 transition-all bg-black/10 ${active === i ? 'border-[#6B9E3F] scale-95' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                                        {media.thumb !== '/images/placeholder.jpg' ? (
                                            <img src={media.thumb} className="w-full h-full object-cover" alt={`Thumbnail ${i+1}`} />
                                        ) : (
                                            <ImageIcon className="absolute inset-0 m-auto text-black/20" size={32} />
                                        )}
                                        {media.type === 'video' && <Play className="absolute inset-0 m-auto text-white fill-white drop-shadow-md" size={24} />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── ROOM DETAILS SECTION ── */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Left: Info */}
                        <div className="lg:col-span-2">
                            <span className="text-[#6B9E3F] font-bold uppercase tracking-widest text-sm">Room {room.room_number}</span>
                            <h1 className="text-5xl font-bold text-[#2D5016] mt-2 mb-6">{title}</h1>
                            <p className="text-lg text-gray-700 leading-relaxed mb-10 whitespace-pre-line">{description}</p>

                            <h3 className="text-2xl font-bold text-[#2D5016] mb-6">Room Amenities</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                {room.amenities && room.amenities.length > 0 ? (
                                    room.amenities.map((amenity, idx) => {
                                        // Safely extract icon, fallback to CheckCircle2 if invalid string
                                        const IconComponent = (LucideIcons as any)[amenity.icon] || CheckCircle2;
                                        return (
                                            <div key={idx} className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                                                <div className="p-2 bg-[#F5F2E8] rounded-lg text-[#6B9E3F] shrink-0">
                                                    <IconComponent size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-[#2D5016]">{amenity.name}</h4>
                                                    {amenity.description && (
                                                        <p className="text-xs text-gray-500 mt-0.5">{amenity.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-gray-500 italic col-span-full">Standard amenities included.</p>
                                )}
                            </div>
                        </div>

                        {/* Right: Booking Card */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 sticky top-8">
                                <div className="flex justify-between items-end mb-8">
                                    <div>
                                        <span className="block text-gray-400 text-sm uppercase font-bold">Price per night</span>
                                        {/* room.price comes formatted as "1,500.00" directly from Laravel */}
                                        <span className="text-4xl font-bold text-[#2D5016]">${room.price}</span>
                                    </div>
                                    <span className="text-gray-400 pb-1">Excl. Taxes</span>
                                </div>

                                <button
                                    onClick={handleCartToggle}
                                    className={`w-full py-5 rounded-2xl font-bold text-lg transition-all shadow-lg ${
                                        isInCart
                                        ? 'bg-red-50 text-red-600 hover:bg-red-100 shadow-red-100/50 border border-red-200'
                                        : 'bg-[#2D5016] text-white hover:bg-[#1e380f] shadow-[#2D5016]/20'
                                    }`}
                                >
                                    {isInCart ? 'Remove from Cart' : 'Reserve This Room'}
                                </button>

                                <p className="text-center text-gray-400 text-sm mt-6">
                                    Free cancellation up to 48 hours before check-in.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── LIGHTBOX ── */}
                <AnimatePresence>
                    {lightbox && current.src !== '/images/placeholder.jpg' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4" onClick={() => setLightbox(false)}>
                            <button className="absolute top-8 right-8 text-white hover:text-gray-300 transition-colors"><X size={40} /></button>
                            <div className="max-w-6xl w-full" onClick={e => e.stopPropagation()}>
                                {current.type === 'video' ? (
                                    <video src={current.src} controls autoPlay className="w-full max-h-[85vh] rounded-xl outline-none" />
                                ) : (
                                    <img src={current.src} className="w-full max-h-[85vh] object-contain rounded-xl" />
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Layout>
    );
}
