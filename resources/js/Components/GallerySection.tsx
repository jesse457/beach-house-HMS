import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause, ArrowRight, Image as ImageIcon } from 'lucide-react';

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
            <section className="py-24 bg-[#EAE6D6]">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Reusing Amenities Header Style */}
                    <div className="text-center mb-14">
                        <span className="text-[#6B9E3F] text-sm font-semibold uppercase tracking-widest">
                            Gallery
                        </span>
                        <h2 className="mt-3 text-4xl font-bold text-[#2D5016]">
                            Everything You Need
                        </h2>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center border-2 border-dashed border-[#2D5016]/20 rounded-3xl p-20 bg-[#F5F2E8]/50"
                    >
                        <div className="p-4 bg-[#2D5016]/10 rounded-full mb-4 text-[#2D5016]">
                            <ImageIcon size={48} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-bold text-[#2D5016]">No Media Yet</h3>
                        <p className="text-[#2D5016]/60 mt-2 text-center max-w-md">
                            Our gallery is currently being curated. Check back soon to see photos and videos of our beautiful space.
                        </p>
                    </motion.div>
                </div>
            </section>
        );
    }

    // ── MAIN GALLERY UI ──
    return (
        <section className="relative min-h-[90vh] flex flex-col bg-[#2D5016] overflow-hidden">

            {/* ── SHARED HEADER (Integrated into Section) ── */}
            <div className="relative z-30 pt-16 px-4 sm:px-6 lg:px-8 text-center sm:text-left mx-auto max-w-7xl w-full">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <span className="text-[#C8DBA8] text-xs font-semibold uppercase tracking-[0.2em]">
                        Experience
                    </span>
                    <h2 className="mt-2 text-4xl sm:text-5xl font-bold text-[#F5F2E8] italic">
                        Everything You Need
                    </h2>
                </motion.div>
            </div>

            {/* ── BACKGROUND MEDIA ── */}
            <div className="absolute inset-0 pt-20">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={{
                            enter: { opacity: 0, scale: 1.1 },
                            center: { opacity: 1, scale: 1, transition: { duration: 1 } },
                            exit: { opacity: 0, scale: 0.95, transition: { duration: 0.8 } }
                        }}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="absolute inset-0"
                    >
                        {items[currentIndex].type === 'video' ? (
                            <video src={items[currentIndex].url} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                        ) : (
                            <img src={items[currentIndex].url} alt="" className="w-full h-full object-cover" />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#2D5016] via-[#2D5016]/40 to-[#2D5016]/90 z-10" />

            {/* ── BOTTOM CONTENT AREA ── */}
            <div className="relative z-20 mt-auto mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full pb-20">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                    <div className="max-w-2xl">
                        {/* Slide Category Badge */}
                        <motion.div
                            key={`cat-${currentIndex}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 bg-[#F5F2E8]/10 border border-[#F5F2E8]/20 rounded-full px-4 py-1.5 text-[#C8DBA8] text-xs font-medium mb-4 backdrop-blur-md"
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-[#6B9E3F]" />
                            {items[currentIndex].category}
                        </motion.div>

                        <motion.h3
                            key={`title-${currentIndex}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-2xl sm:text-4xl font-bold text-[#F5F2E8] mb-8"
                        >
                            {items[currentIndex].title}
                        </motion.h3>

                        {/* Controls */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => { paginate(-1); setIsAutoPlaying(false); }}
                                className="h-12 w-12 flex items-center justify-center rounded-xl border border-white/20 text-white hover:bg-white/10 transition-all backdrop-blur-md"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                                className="h-12 w-12 flex items-center justify-center rounded-xl border border-white/20 text-white hover:bg-white/10 transition-all backdrop-blur-md"
                            >
                                {isAutoPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                            </button>
                            <button
                                onClick={() => { paginate(1); setIsAutoPlaying(false); }}
                                className="h-12 w-12 flex items-center justify-center rounded-xl border border-white/20 text-white hover:bg-white/10 transition-all backdrop-blur-md"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    {/* View All CTA */}
                    <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={galleryLink}
                        className="group flex items-center gap-3 bg-[#6B9E3F] text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:bg-[#5a8634] transition-all"
                    >
                        View Full Gallery
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </motion.a>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 z-30">
                {isAutoPlaying && (
                    <motion.div
                        key={currentIndex}
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 6, ease: "linear" }}
                        className="h-full bg-[#6B9E3F]"
                    />
                )}
            </div>
        </section>
    );
};

export default GallerySection;
