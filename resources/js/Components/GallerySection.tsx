import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

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
}

const GallerySection = ({ items }: GalleryProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

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
                                autoPlay muted loop
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <img
                                src={items[currentIndex].url}
                                alt=""
                                className="w-full h-full object-cover"
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* ── HERO-STYLE GRADIENT OVERLAY ── */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#2D5016]/95 via-[#2D5016]/70 to-[#1a3009]/80 z-10" />

            {/* ── DECORATIVE BLUR BLOBS (Matching Hero) ── */}
            <div className="absolute top-20 right-10 w-96 h-96 rounded-full bg-[#6B9E3F]/20 blur-3xl pointer-events-none z-10" />
            <div className="absolute bottom-20 left-10 w-64 h-64 rounded-full bg-[#F5F2E8]/10 blur-3xl pointer-events-none z-10" />

            {/* ── CONTENT ── */}
            <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full py-20">
                <div className="max-w-3xl">
                    <motion.div
                        key={`cat-${currentIndex}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 bg-[#F5F2E8]/15 border border-[#F5F2E8]/25 rounded-full px-4 py-1.5 text-[#C8DBA8] text-xs font-medium mb-6 backdrop-blur-sm"
                    >
                        <span className="h-2 w-2 rounded-full bg-[#6B9E3F]" />
                        {items[currentIndex].category}
                    </motion.div>

                    <motion.h2
                        key={`title-${currentIndex}`}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="text-4xl sm:text-6xl font-bold text-[#F5F2E8] leading-[1.1] tracking-tight mb-8 italic"
                    >
                        {items[currentIndex].title}
                    </motion.h2>

                    {/* ── CONTROLS ── */}
                    <div className="flex items-center gap-6">
                        <div className="flex gap-3">
                            <button
                                onClick={() => { paginate(-1); setIsAutoPlaying(false); }}
                                className="h-14 w-14 flex items-center justify-center rounded-xl border border-[#F5F2E8]/30 text-[#F5F2E8] hover:bg-[#F5F2E8]/10 transition-all backdrop-blur-sm"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={() => { paginate(1); setIsAutoPlaying(false); }}
                                className="h-14 w-14 flex items-center justify-center rounded-xl border border-[#F5F2E8]/30 text-[#F5F2E8] hover:bg-[#F5F2E8]/10 transition-all backdrop-blur-sm"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>

                        {/* ── THUMBNAIL TRACKER ── */}
                        <div className="hidden sm:flex gap-2">
                            {items.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => { setCurrentIndex(idx); setIsAutoPlaying(false); }}
                                    className={`h-1.5 rounded-full transition-all duration-500 ${currentIndex === idx ? 'w-8 bg-[#6B9E3F]' : 'w-2 bg-white/20'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── PROGRESS BAR ── */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 z-30">
                <motion.div
                    key={currentIndex}
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 6, ease: "linear" }}
                    className="h-full bg-[#6B9E3F]"
                />
            </div>
        </section>
    );
};

export default GallerySection;
