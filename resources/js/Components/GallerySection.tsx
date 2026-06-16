import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface GalleryItem {
    id: number | string;
    url: string;
    thumbnail: string;
    title: string;
    category: string;
    type: "image" | "video";
}

interface GalleryProps {
    items: GalleryItem[];
    galleryLink?: string;
}

const GallerySection = ({ items = [], galleryLink = "/gallery" }: GalleryProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const paginate = useCallback((newDirection: number) => {
        if (items.length === 0) return;
        setDirection(newDirection);
        setCurrentIndex((prevIndex) => (prevIndex + newDirection + items.length) % items.length);
    }, [items.length]);

    useEffect(() => {
        if (!isAutoPlaying || items.length === 0) return;
        const timer = setInterval(() => paginate(1), 6000);
        return () => clearInterval(timer);
    }, [isAutoPlaying, paginate, items.length]);

    // ── EMPTY STATE UI ──
    if (items.length === 0) {
        return (
            <section className="py-24 bg-[#F5F2E8]">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <span className="text-[#6B9E3F] text-xs font-semibold uppercase tracking-[0.2em]">
                            Gallery
                        </span>
                        <h2 className="mt-3 text-4xl font-bold text-[#2D5016]">
                            A Visual Preview
                        </h2>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center border border-[#2D5016]/10 rounded-[2rem] p-16 bg-[#EAE6D6]/40 shadow-sm"
                    >
                        <div className="p-4 bg-[#2D5016]/10 rounded-full mb-4 text-[#2D5016]">
                            <ImageIcon size={40} strokeWidth={1} />
                        </div>
                        <h3 className="text-lg font-bold text-[#2D5016]">No Media Available</h3>
                        <p className="text-neutral-500 mt-2 text-center max-w-xs text-sm">
                            Our physical spaces are currently being photographed. Check back soon.
                        </p>
                    </motion.div>
                </div>
            </section>
        );
    }

    const currentItem = items[currentIndex];
    const padNumber = (num: number) => String(num + 1).padStart(2, '0');

    return (
        <section className="relative min-h-[85vh] lg:min-h-[90vh] bg-[#2D5016] flex items-center py-20 lg:py-0 overflow-hidden">
            {/* Background Texture Blur */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#6B9E3F]/15 blur-[120px] pointer-events-none" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

                    {/* ── LEFT COLUMN: EDITORIAL CONTENT & CONTROLS ── */}
                    <div className="lg:col-span-5 flex flex-col justify-between h-full py-4 text-center lg:text-left">
                        <div>
                            <span className="text-[#C8DBA8] text-xs font-semibold uppercase tracking-[0.25em]">
                                Experience
                            </span>

                            <h2 className="mt-3 text-4xl sm:text-5xl font-bold text-[#F5F2E8] tracking-tight leading-[1.15]">
                                Natural <br className="hidden lg:block"/>
                                <span className="text-[#C8DBA8] italic font-normal">Sanctuary</span>
                            </h2>

                            {/* Divider Line */}
                            <div className="w-16 h-[1px] bg-[#C8DBA8]/30 my-8 mx-auto lg:mx-0" />

                            {/* Slide Dynamic Counter */}
                            <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                                <span className="text-2xl font-light text-[#F5F2E8] tracking-widest">
                                    {padNumber(currentIndex)}
                                </span>
                                <span className="h-[1px] w-8 bg-[#C8DBA8]/40" />
                                <span className="text-sm font-medium text-[#C8DBA8]/60">
                                    {padNumber(items.length - 1)}
                                </span>
                            </div>

                            {/* Staggered Title and Description Box */}
                            <div className="min-h-[140px] flex flex-col justify-start">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentIndex}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -15 }}
                                        transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                                    >
                                        <span className="text-xs font-semibold tracking-wider text-[#6B9E3F] uppercase bg-[#F5F2E8]/10 rounded-full px-3 py-1.5">
                                            {currentItem.category}
                                        </span>
                                        <h3 className="mt-4 text-xl sm:text-2xl font-bold text-[#F5F2E8]">
                                            {currentItem.title}
                                        </h3>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Controls & CTA wrapper */}
                        <div className="mt-8 flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
                            {/* Direction Arrows */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => { paginate(-1); setIsAutoPlaying(false); }}
                                    className="h-12 w-12 flex items-center justify-center rounded-full border border-[#C8DBA8]/20 text-[#F5F2E8] hover:bg-[#F5F2E8]/10 hover:border-[#F5F2E8] transition-all"
                                    aria-label="Previous Slide"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    onClick={() => { paginate(1); setIsAutoPlaying(false); }}
                                    className="h-12 w-12 flex items-center justify-center rounded-full border border-[#C8DBA8]/20 text-[#F5F2E8] hover:bg-[#F5F2E8]/10 hover:border-[#F5F2E8] transition-all"
                                    aria-label="Next Slide"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>

                            {/* Link Button */}
                            <Link
                                href={galleryLink}
                                className="group inline-flex items-center gap-2.5 text-sm font-semibold text-[#F5F2E8] hover:text-[#C8DBA8] transition-colors"
                            >
                                Explore Full Gallery
                                <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    {/* ── RIGHT COLUMN: FLOATING ARCHITECTURAL CANVAS ── */}
                    <div className="lg:col-span-7 relative h-[380px] sm:h-[480px] lg:h-[550px] w-full">
                        {/* Decorative Background Offset Layer */}
                        <div className="absolute inset-4 rounded-[2rem] sm:rounded-[2.5rem] bg-[#1E360F] translate-x-4 translate-y-4 -z-10 shadow-2xl" />

                        {/* Active Image Deck Viewport */}
                        <div className="absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden bg-[#1E360F] shadow-xl">
                            <AnimatePresence initial={false} custom={direction} mode="popLayout">
                                <motion.div
                                    key={currentIndex}
                                    custom={direction}
                                    variants={{
                                        enter: (dir) => ({
                                            x: dir > 0 ? "100%" : "-100%",
                                            scale: 1.05,
                                            opacity: 0.8
                                        }),
                                        center: {
                                            x: 0,
                                            scale: 1,
                                            opacity: 1,
                                            transition: {
                                                x: { type: "spring", stiffness: 300, damping: 32 },
                                                opacity: { duration: 0.35 },
                                                scale: { duration: 0.5, ease: "easeOut" }
                                            }
                                        },
                                        exit: (dir) => ({
                                            x: dir > 0 ? "-35%" : "35%",
                                            scale: 0.98,
                                            opacity: 0,
                                            transition: {
                                                x: { type: "spring", stiffness: 300, damping: 32 },
                                                opacity: { duration: 0.3 }
                                            }
                                        })
                                    }}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
                                    drag="x"
                                    dragConstraints={{ left: 0, right: 0 }}
                                    dragElastic={0.35}
                                    onDragEnd={(e, info) => {
                                        const swipeDistance = info.offset.x;
                                        if (swipeDistance < -60) {
                                            paginate(1);
                                            setIsAutoPlaying(false);
                                        } else if (swipeDistance > 60) {
                                            paginate(-1);
                                            setIsAutoPlaying(false);
                                        }
                                    }}
                                >
                                    {currentItem.type === 'video' ? (
                                        <video
                                            src={currentItem.url}
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                            className="w-full h-full object-cover select-none pointer-events-none"
                                        />
                                    ) : (
                                        <motion.img
                                            animate={{ scale: [1, 1.05] }}
                                            transition={{ duration: 6, ease: "easeOut" }}
                                            src={currentItem.url}
                                            alt={currentItem.title}
                                            className="w-full h-full object-cover select-none pointer-events-none"
                                        />
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default GallerySection;
