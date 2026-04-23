import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause, ArrowRight } from 'lucide-react';

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
    galleryLink?: string; // Added prop for the gallery page URL
}

const GallerySection = ({ items, galleryLink = "/gallery" }: GalleryProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const[isAutoPlaying, setIsAutoPlaying] = useState(true);

    const slideVariants = {
        enter: (direction: number) => ({
            opacity: 0,
            scale: 1.1,
            filter: "blur(10px)"
        }),
        center: {
            zIndex: 1,
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            transition: {
                opacity: { duration: 0.8 },
                scale: { duration: 1.2, ease: "easeOut" },
                filter: { duration: 0.8 }
            }
        },
        exit: (direction: number) => ({
            zIndex: 0,
            opacity: 0,
            scale: 0.95,
            transition: { duration: 0.8 }
        })
    };

    const paginate = useCallback((newDirection: number) => {
        setDirection(newDirection);
        setCurrentIndex((prevIndex) => (prevIndex + newDirection + items.length) % items.length);
    }, [items.length]);

    useEffect(() => {
        if (!isAutoPlaying) return;
        const timer = setInterval(() => paginate(1), 6000);
        return () => clearInterval(timer);
    }, [isAutoPlaying, paginate]);

    if (!items.length) return null;

    return (
        <section className="relative min-h-[80vh] flex items-center bg-[#2D5016] overflow-hidden">
            {/* ── BACKGROUND MEDIA ── */}
            <div className="absolute inset-0">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="absolute inset-0"
                    >
                        {items[currentIndex].type === 'video' ? (
                            <video
                                src={items[currentIndex].url}
                                autoPlay muted loop playsInline
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <img
                                src={items[currentIndex].url}
                                alt={items[currentIndex].title}
                                className="w-full h-full object-cover"
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* ── HERO-STYLE GRADIENT OVERLAY ── */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#2D5016]/95 via-[#2D5016]/70 to-[#1a3009]/80 z-10" />

            {/* ── DECORATIVE BLUR BLOBS ── */}
            <div className="absolute top-20 right-10 w-96 h-96 rounded-full bg-[#6B9E3F]/20 blur-3xl pointer-events-none z-10" />
            <div className="absolute bottom-20 left-10 w-64 h-64 rounded-full bg-[#F5F2E8]/10 blur-3xl pointer-events-none z-10" />

            {/* ── CONTENT ── */}
            <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full py-20 mt-10">
                <div className="max-w-4xl">
                    {/* Category Badge */}
                    <motion.div
                        key={`cat-${currentIndex}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-[#F5F2E8]/15 border border-[#F5F2E8]/25 rounded-full px-4 py-1.5 text-[#C8DBA8] text-xs font-medium mb-6 backdrop-blur-sm shadow-sm"
                    >
                        <span className="h-2 w-2 rounded-full bg-[#6B9E3F] animate-pulse" />
                        {items[currentIndex].category}
                    </motion.div>

                    {/* Title */}
                    <motion.h2
                        key={`title-${currentIndex}`}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease:[0.22, 1, 0.36, 1] }}
                        className="text-4xl sm:text-5xl lg:text-7xl font-bold text-[#F5F2E8] leading-[1.1] tracking-tight mb-12 italic drop-shadow-lg"
                    >
                        {items[currentIndex].title}
                    </motion.h2>

                    {/* ── CONTROLS & CTA ROW ── */}
                    <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-10">

                        {/* Interactive Controls */}
                        <div className="flex items-center gap-4 sm:gap-6">
                            {/* Navigation Buttons */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { paginate(-1); setIsAutoPlaying(false); }}
                                    aria-label="Previous slide"
                                    className="h-12 w-12 sm:h-14 sm:w-14 flex items-center justify-center rounded-xl border border-[#F5F2E8]/30 text-[#F5F2E8] hover:bg-[#F5F2E8]/20 hover:scale-105 transition-all backdrop-blur-sm"
                                >
                                    <ChevronLeft size={24} />
                                </button>

                                {/* Play/Pause Toggle */}
                                <button
                                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                                    aria-label={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}
                                    className="h-12 w-12 sm:h-14 sm:w-14 flex items-center justify-center rounded-xl border border-[#F5F2E8]/30 text-[#F5F2E8] hover:bg-[#F5F2E8]/20 hover:scale-105 transition-all backdrop-blur-sm"
                                >
                                    {isAutoPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                                </button>

                                <button
                                    onClick={() => { paginate(1); setIsAutoPlaying(false); }}
                                    aria-label="Next slide"
                                    className="h-12 w-12 sm:h-14 sm:w-14 flex items-center justify-center rounded-xl border border-[#F5F2E8]/30 text-[#F5F2E8] hover:bg-[#F5F2E8]/20 hover:scale-105 transition-all backdrop-blur-sm"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </div>

                            <div className="hidden sm:block w-px h-10 bg-[#F5F2E8]/20" />

                            {/* ── IMAGE THUMBNAIL TRACKER ── */}
                            <div className="hidden sm:flex gap-3 items-center">
                                {items.map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => { setCurrentIndex(idx); setIsAutoPlaying(false); }}
                                        className={`relative overflow-hidden rounded-lg transition-all duration-500 border-2 ${
                                            currentIndex === idx
                                                ? 'w-16 h-12 border-[#6B9E3F] opacity-100 shadow-[0_0_15px_rgba(107,158,63,0.5)]'
                                                : 'w-10 h-8 border-transparent opacity-40 hover:opacity-100 hover:w-12'
                                        }`}
                                    >
                                        <img
                                            src={item.thumbnail}
                                            alt={`Go to slide ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        {item.type === 'video' && (
                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                <Play size={12} className="text-white" fill="currentColor" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ── GALLERY LINK CTA ── */}
                        <a
                            href={galleryLink}
                            className="group inline-flex items-center justify-center gap-3 bg-[#6B9E3F] text-[#F5F2E8] px-8 py-3.5 sm:py-4 rounded-xl font-semibold hover:bg-[#588531] transition-all duration-300 shadow-lg hover:shadow-[#6B9E3F]/25"
                        >
                            View Full Gallery
                            <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                        </a>

                    </div>
                </div>
            </div>

            {/* ── SMART PROGRESS BAR ── */}
            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-black/20 z-30">
                {isAutoPlaying && (
                    <motion.div
                        key={currentIndex} // Retriggers animation on slide change
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 6, ease: "linear" }}
                        className="h-full bg-[#6B9E3F] shadow-[0_0_10px_#6B9E3F]"
                    />
                )}
            </div>
        </section>
    );
};

export default GallerySection;
