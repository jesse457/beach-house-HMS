import React, { useRef, useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import SEO from "../Components/SEO";
import {
    motion,
    useScroll,
    useTransform,
    AnimatePresence,
    Variants,
} from "framer-motion";
import {
    ArrowRight,
    Star,
    ChevronDown,
    Play,
    Pause,
    ChevronLeft,
    ChevronRight,
    Users,
    Check,
    Leaf,
    Utensils,
    Trophy,
} from "lucide-react";

// Heroicons for amenity icon resolution (matches Filament DB format)
import * as OutlineIcons from '@heroicons/react/24/outline';
import * as SolidIcons from '@heroicons/react/24/solid';
import * as MiniIcons from '@heroicons/react/20/solid';

import Layout from "../Layouts/Layout";
import GallerySection from "../Components/GallerySection";
import AmenitiesSection from "../Components/AmenitiesSection";

// ─── TYPES ──────────────────────────────────────────────────────────────────
interface Room {
    id: number | string;
    slug?: string;
    name: string;
    description?: string;
    price_per_night: number;
    capacity: number;
    available: boolean;
    images?: string[];
    video_url?: string;
    amenities?: { name: string; icon: string }[];
}

interface Testimonial {
    id: number | string;
    author_name: string;
    content: string;
    rating: number;
}

interface GalleryItem {
    id: number | string;
    url: string;
    thumbnail: string;
    title: string;
    category: string;
    type: "image" | "video";
}

interface Amenity {
    id: number;
    name: string;
    icon: string;
    description?: string;
}

interface HomeProps {
    rooms: Room[];
    testimonials?: Testimonial[];
    featuredGallery: GalleryItem[];
    amenities: Amenity[];
}

// ─── REVEAL COMPONENTS ──────────────────────────────────────────────────────
interface RevealProps {
    children: React.ReactNode;
    direction?: "up" | "down" | "left" | "right";
    delay?: number;
    duration?: number;
    className?: string;
}

const Reveal = ({
    children,
    direction = "up",
    delay = 0.2,
    duration = 0.5,
    className = "",
}: RevealProps) => {
    const directions = {
        up: { y: 40, x: 0 },
        down: { y: -40, x: 0 },
        left: { x: 40, y: 0 },
        right: { x: -40, y: 0 },
    };

    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, ...directions[direction] }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
            {children}
        </motion.div>
    );
};

const StaggerContainer = ({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    const variants: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 },
        },
    };
    return (
        <motion.div
            variants={variants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

const StaggerItem = ({ children }: { children: React.ReactNode }) => {
    const variants: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    };
    return <motion.div variants={variants}>{children}</motion.div>;
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function Home({
    rooms = [],
    testimonials = [],
    featuredGallery = [],
    amenities = [],
}: HomeProps) {
    const heroRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"],
    });
    const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    return (
        <Layout>
            <SEO
                title="Beach House Botaland | Luxury Beach Resort in Limbe, Cameroon"
                description="Experience luxury at Beach House Botaland, a Mediterranean-style beach resort on a private peninsula in Limbe, Cameroon. Book your stay with ocean views, fine dining, spa, and premium amenities."
                canonical={window.location.origin + '/'}
                ogImage={rooms[0]?.images?.[0]}
                jsonLd={[
                    {
                        '@context': 'https://schema.org',
                        '@type': 'Hotel',
                        name: 'Beach House Botaland',
                        description: 'A Contemporary Mediterranean Style hotel resort set on a 4000Sqm private peninsula with spectacular views of the Atlantic Ocean.',
                        url: window.location.origin,
                        telephone: '+237 679447430',
                        address: {
                            '@type': 'PostalAddress',
                            addressLocality: 'Limbe',
                            addressRegion: 'Southwest',
                            addressCountry: 'CM',
                        },
                        priceRange: '$$$',
                        image: rooms[0]?.images?.[0],
                    },
                    {
                        '@context': 'https://schema.org',
                        '@type': 'LocalBusiness',
                        name: 'Beach House Botaland',
                        description: 'Mediterranean-style beach resort in Limbe, Cameroon.',
                        url: window.location.origin,
                        telephone: '+237 679447430',
                        address: {
                            '@type': 'PostalAddress',
                            addressLocality: 'Limbe',
                            addressRegion: 'Southwest',
                            addressCountry: 'CM',
                        },
                    },
                ]}
            />

            <main className="overflow-x-hidden">
                {/* ── HERO ─────────────────────────────────────────────────────────── */}
                <section
                    ref={heroRef}
                    className="relative min-h-screen flex items-center bg-[#2D5016] overflow-hidden"
                >
                    <motion.div
                        style={{
                            y: heroY,
                            backgroundImage: "url('images/beach-day2.webp')",
                        }}
                        className="absolute inset-0 bg-cover bg-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#2D5016]/90 via-[#2D5016]/70 to-[#1a3009]/80" />

                    {/* Decorative Blurs */}
                    <div className="absolute top-20 right-10 w-96 h-96 rounded-full bg-[#6B9E3F]/20 blur-3xl pointer-events-none" />
                    <div className="absolute bottom-20 left-10 w-64 h-64 rounded-full bg-[#F5F2E8]/10 blur-3xl pointer-events-none" />

                    <motion.div
                        style={{ opacity: heroOpacity }}
                        className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-32 w-full"
                    >
                        <div className="max-w-3xl">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="inline-flex items-center gap-2 bg-[#F5F2E8]/15 border border-[#F5F2E8]/25 rounded-full px-4 py-1.5 text-[#C8DBA8] text-sm font-medium mb-6 backdrop-blur-sm"
                            >
                                <span className="h-2 w-2 rounded-full bg-[#6B9E3F] animate-pulse" />
                                Now Accepting Bookings
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.8,
                                    delay: 0.2,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                                className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#F5F2E8] leading-[1.05] tracking-tight"
                            >
                                The Bota Beach House
                                <br />
                                <span className="text-[#C8DBA8]">
                                   Your Relaxing Escape
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.35 }}
                                className="mt-6 text-lg text-[#C8DBA8]/80 leading-relaxed max-w-xl"
                            >
                                The property is set on a 4000Sqm private peninsular with spectacular views of the Ocean and Scattered Islands, enhanced by impressive views of Mount Cameroon. The Beach house is a Contemporary Mediterranean Style hotel resort.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.5 }}
                                className="mt-10 flex flex-wrap gap-4"
                            >
                                <Link
                                    href="/rooms"
                                    className="group inline-flex items-center gap-2 bg-[#F5F2E8] text-[#2D5016] font-semibold px-7 py-3.5 rounded-xl hover:bg-white transition-all duration-200 shadow-lg shadow-black/20"
                                >
                                    Explore Rooms
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <a
                                    href="#story"
                                    className="inline-flex items-center gap-2 border border-[#F5F2E8]/30 text-[#F5F2E8] font-semibold px-7 py-3.5 rounded-xl hover:bg-[#F5F2E8]/10 transition-all duration-200 backdrop-blur-sm"
                                >
                                    Our Story
                                </a>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.7 }}
                                className="mt-16 flex gap-10"
                            >
                                {/* {[
                                    { value: "15+", label: "Luxury Rooms" },
                                    { value: "4.8★", label: "Guest Rating" },
                                    { value: "10k+", label: "Happy Guests" },
                                ].map(({ value, label }) => (
                                    <div key={label}>
                                        <div className="text-3xl font-bold text-[#F5F2E8]">
                                            {value}
                                        </div>
                                        <div className="text-sm text-[#C8DBA8]/70 mt-0.5">
                                            {label}
                                        </div>
                                    </div>
                                ))} */}
                            </motion.div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[#C8DBA8]/50"
                    >
                        <span className="text-xs tracking-widest uppercase">
                            Scroll
                        </span>
                        <motion.div
                            animate={{ y: [0, 6, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                            <ChevronDown className="h-4 w-4" />
                        </motion.div>
                    </motion.div>
                </section>

                {/* ── MARQUEE STRIP ────────────────────────────────────────────────── */}
                <div className="bg-[#3D6B1F] py-3 overflow-hidden border-y border-white/5">
                    <motion.div
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        className="flex gap-12 whitespace-nowrap"
                    >
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex gap-12 text-[#C8DBA8] text-sm font-medium"
                            >
                                {[
                                    "Free WiFi",
                                    "Free Parking",
                                    "Swimming Pool",
                                    "24/7 Electricity Supply",
                                    "Party/Meeting Hall",
                                    "Spa & Wellness",
                                    "Fine Dining",
                                    "Fitness Center",
                                    "24/7 Security",
                                    "Airport Pick-up",
                                    "Room Service",
                                ].map((item) => (
                                    <span
                                        key={item}
                                        className="flex items-center gap-3"
                                    >
                                        <span className="h-1.5 w-1.5 rounded-full bg-[#6B9E3F]" />
                                        {item}
                                    </span>
                                ))}
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* ── STORY / ABOUT ────────────────────────────────────────────────── */}
                {/* <section id="story" className="py-28 bg-[#F5F2E8]">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <Reveal direction="right">
                                <div className="relative">
                                    <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-xl">
                                        <img
                                            src="images/beach.webp"
                                            alt="Beach House interior"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{
                                            delay: 0.4,
                                            duration: 0.5,
                                        }}
                                        className="absolute -bottom-6 -right-6 bg-[#2D5016] text-[#F5F2E8] rounded-2xl p-5 shadow-2xl"
                                    >
                                        <div className="text-4xl font-bold">
                                            12+
                                        </div>
                                        <div className="text-[#C8DBA8] text-sm mt-0.5">
                                            Years of Excellence
                                        </div>
                                    </motion.div>
                                </div>
                            </Reveal>

                            <Reveal direction="left" delay={0.15}>
                                <div>
                                    <span className="text-[#6B9E3F] text-sm font-semibold uppercase tracking-widest">
                                        Our Story
                                    </span>
                                    <h2 className="mt-3 text-4xl lg:text-5xl font-bold text-[#2D5016] leading-tight">
                                        Crafted for those who appreciate the finer things
                                    </h2>
                                    <p className="mt-5 text-neutral-600 leading-relaxed">
                                        Founded in 1999, Beach House was born from a simple belief — that every guest deserves to feel at home [2]. We blend contemporary design with warm, genuine hospitality [2].
                                    </p>
                                    <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8">
                                        {[
                                            {
                                                icon: Leaf,
                                                title: "Eco-Conscious",
                                                desc: "Sustainable practices",
                                            },
                                            {
                                                icon: Utensils,
                                                title: "Farm-to-Table",
                                                desc: "Fresh local ingredients",
                                            },
                                            {
                                                icon: Trophy,
                                                title: "Award Winning",
                                                desc: "Best Boutique Hotel 2023",
                                            },
                                            {
                                                icon: Users,
                                                title: "Community First",
                                                desc: "Supporting artisans",
                                            },
                                        ].map(({ icon: Icon, title, desc }) => (
                                            <div
                                                key={title}
                                                className="flex gap-4 items-start"
                                            >
                                                <div className="shrink-0 w-10 h-10 rounded-xl bg-[#2D5016]/10 flex items-center justify-center text-[#2D5016]">
                                                    <Icon
                                                        size={20}
                                                        strokeWidth={1.5}
                                                    />
                                                </div>

                                                <div>
                                                    <div className="font-bold text-[#2D5016] text-sm tracking-tight">
                                                        {title}
                                                    </div>
                                                    <div className="text-neutral-500 text-[11px] leading-relaxed mt-1 font-medium">
                                                        {desc}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </section> */}

                {/* ── AMENITIES & GALLERY ────────────────────────────────────────────────── */}
                <AmenitiesSection amenities={amenities} />
                <GallerySection items={featuredGallery} />

                {/* ── FEATURED ROOMS ───────────────────────────────────────────────── */}
                {rooms.length > 0 && (
                    <section className="py-28 bg-[#F5F2E8]">
                        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                            <div className="flex items-end justify-between mb-12">
                                <Reveal>
                                    <span className="text-[#6B9E3F] text-sm font-semibold uppercase tracking-widest">
                                        Accommodations
                                    </span>
                                    <h2 className="mt-3 text-4xl font-bold text-[#2D5016]">
                                        Featured Rooms
                                    </h2>
                                </Reveal>
                                <Reveal direction="left">
                                    <Link
                                        href="/rooms"
                                        className="group hidden sm:flex items-center gap-2 text-[#2D5016] font-semibold text-sm hover:gap-3 transition-all"
                                    >
                                        View all rooms
                                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </Reveal>
                            </div>

                            <div className="space-y-10">
                                {rooms.map((room, i) => (
                                    <HomeRoomCard
                                        key={room.id}
                                        room={room}
                                        index={i}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── TESTIMONIALS (Auto-hidden if empty) ─────────────────────────────────── */}
                {testimonials && testimonials.length > 0 && (
                    <section className="py-28 bg-[#EAE6D6]">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <Reveal className="text-center mb-12">
                                <span className="text-[#6B9E3F] text-sm font-semibold uppercase tracking-widest">
                                    Testimonials
                                </span>
                                <h2 className="mt-3 text-4xl font-bold text-[#2D5016]">
                                    What Our Guests Say
                                </h2>
                            </Reveal>

                            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {testimonials.map((t) => {
                                    const rating = Math.min(5, Math.max(0, Math.floor(t.rating)));
                                    return (
                                        <StaggerItem key={t.id}>
                                            <div className="bg-[#F5F2E8] h-full rounded-2xl p-7 border border-[#2D5016]/10 hover:shadow-lg transition-shadow flex flex-col justify-between">
                                                <div>
                                                    <div className="flex gap-1 mb-4">
                                                        {Array.from({ length: rating }).map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className="h-4 w-4 fill-[#3D6B1F] text-[#3D6B1F]"
                                                            />
                                                        ))}
                                                    </div>
                                                    <p className="text-neutral-600 text-sm leading-relaxed mb-5">
                                                        "{t.content}"
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3 mt-4">
                                                    <div className="h-9 w-9 rounded-full bg-[#2D5016] flex items-center justify-center text-[#F5F2E8] font-bold text-sm select-none">
                                                        {t.author_name[0]?.toUpperCase()}
                                                    </div>
                                                    <span className="font-semibold text-[#2D5016] text-sm">
                                                        {t.author_name}
                                                    </span>
                                                </div>
                                            </div>
                                        </StaggerItem>
                                    );
                                })}
                            </StaggerContainer>
                        </div>
                    </section>
                )}

                {/* ── CTA ──────────────────────────────────────────────────────────── */}
                <section className="py-28 bg-[#F5F2E8]">
                    <div className="mx-auto max-w-4xl px-4 text-center">
                        <Reveal>
                            <h2 className="text-4xl sm:text-5xl font-bold text-[#2D5016] leading-tight">
                                Your perfect stay is one click away.
                            </h2>
                            <div className="mt-10 flex justify-center gap-4 flex-wrap">
                                <Link
                                    href="/rooms"
                                    className="group inline-flex items-center gap-2 bg-[#2D5016] text-[#F5F2E8] font-semibold px-8 py-4 rounded-xl hover:bg-[#3D6B1F] transition-all shadow-lg shadow-black/10"
                                >
                                    Browse Rooms
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Link>

                            </div>
                        </Reveal>
                    </div>
                </section>
            </main>
        </Layout>
    );
}

// ─── Heroicon Resolver (matches AmenitiesSection.tsx) ─────────────────────────
function DynamicHeroIcon({ iconName, className }: { iconName: string; className: string }) {
  if (!iconName) return <OutlineIcons.InformationCircleIcon className={className} />;

  let IconSet: any = OutlineIcons;
  if (iconName.startsWith('heroicon-s-')) IconSet = SolidIcons;
  else if (iconName.startsWith('heroicon-m-')) IconSet = MiniIcons;

  const cleanName = iconName.replace(/^(heroicon-o-|heroicon-s-|heroicon-m-|heroicon-c-|heroicon-)/, '');
  const pascalName = cleanName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  const IconComponent = IconSet[`${pascalName}Icon`] || OutlineIcons[`${pascalName}Icon`];

  return IconComponent ? <IconComponent className={className} /> : <OutlineIcons.InformationCircleIcon className={className} />;
}

// ─── Home Room Card ──────────────────────────────────────────────────────────
function HomeRoomCard({ room, index }: { room: Room; index: number }) {
    const [activeImg, setActiveImg] = useState(0);
    const [showVideo, setShowVideo] = useState(false);
    const [videoPlaying, setVideoPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const FALLBACKS = [
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80",
        "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&q=80",
    ];

    const images = room.images?.length
        ? room.images
        : [FALLBACKS[index % FALLBACKS.length]];
    const isEven = index % 2 === 0;

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowVideo(false);
        setActiveImg((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowVideo(false);
        setActiveImg((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const toggleVideo = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!showVideo) {
            setShowVideo(true);
            setVideoPlaying(true);
        } else {
            if (videoPlaying) {
                videoRef.current?.pause();
                setVideoPlaying(false);
            } else {
                videoRef.current?.play();
                setVideoPlaying(true);
            }
        }
    };

    useEffect(() => {
        if (showVideo && videoRef.current) {
            videoRef.current.play().catch(() => {
                setVideoPlaying(false);
            });
        }
    }, [showVideo]);

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="bg-white rounded-3xl overflow-hidden border border-[#2D5016]/10 hover:shadow-xl transition-all"
        >
            <div
                className={`grid grid-cols-1 lg:grid-cols-2 ${isEven ? "" : "lg:grid-flow-dense"}`}
            >
                {/* Media Column */}
                <div className={`relative group/media min-h-[320px] lg:min-h-full ${isEven ? "" : "lg:col-start-2"}`}>
                    <div className="relative h-64 lg:h-full min-h-[320px] overflow-hidden bg-[#EAE6D6]">
                        <AnimatePresence mode="wait">
                            {showVideo && room.video_url ? (
                                <motion.div
                                    key="video"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-black"
                                >
                                    <video
                                        ref={videoRef}
                                        src={room.video_url}
                                        className="w-full h-full object-cover"
                                        loop
                                        playsInline
                                        controls
                                    />
                                    <button
                                        onClick={toggleVideo}
                                        className="absolute bottom-4 right-4 z-10 h-10 w-10 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors"
                                    >
                                        {videoPlaying ? (
                                            <Pause className="h-4 w-4" fill="currentColor" />
                                        ) : (
                                            <Play className="h-4 w-4 ml-0.5" fill="currentColor" />
                                        )}
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key={`img-${activeImg}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.35 }}
                                    className="absolute inset-0"
                                >
                                    <img
                                        src={images[activeImg]}
                                        alt={room.name}
                                        className="w-full h-full object-cover"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Navigation controls overlay */}
                        {images.length > 1 && !showVideo && (
                            <>
                                <button
                                    onClick={handlePrev}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90 hover:bg-white text-neutral-800 flex items-center justify-center shadow-md transition-opacity duration-200 opacity-0 group-hover/media:opacity-100"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/90 hover:bg-white text-neutral-800 flex items-center justify-center shadow-md transition-opacity duration-200 opacity-0 group-hover/media:opacity-100"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>

                                {/* Dot Indicators */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm z-10">
                                    {images.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowVideo(false);
                                                setActiveImg(idx);
                                            }}
                                            className={`h-1.5 w-1.5 rounded-full transition-all ${
                                                activeImg === idx ? "bg-white w-3" : "bg-white/50 hover:bg-white/80"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Badges */}
                        <div className="absolute top-4 left-4 z-10 bg-[#2D5016] text-[#F5F2E8] font-bold px-3 py-1.5 rounded-full text-xs shadow-md">
                            ${Number(room.price_per_night).toLocaleString()}
                            <span className="font-normal text-[#C8DBA8]"> /night</span>
                        </div>

                        {/* Video Tour Trigger Overlay */}
                        {room.video_url && (
                            <button
                                onClick={toggleVideo}
                                className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-[#2D5016] font-semibold px-2.5 py-1.5 rounded-full text-xs flex items-center gap-1 shadow-md transition-all backdrop-blur-sm"
                            >
                                {showVideo ? (
                                    <>
                                        <Pause className="h-3.5 w-3.5" /> Stop Tour
                                    </>
                                ) : (
                                    <>
                                        <Play className="h-3.5 w-3.5 fill-[#2D5016]" /> Video Tour
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Content Column */}
                <div
                    className={`p-8 flex flex-col justify-between ${isEven ? "" : "lg:col-start-1 lg:row-start-1"}`}
                >
                    <div>
                        <h3 className="text-2xl font-bold text-[#2D5016]">
                            {room.name}
                        </h3>
                        <p className="mt-4 text-neutral-600 text-sm leading-relaxed line-clamp-4">
                            {room.description}
                        </p>

                        {room.amenities && room.amenities.length > 0 && (
                            <div className="mt-6 grid grid-cols-2 gap-y-2.5 gap-x-3">
                                {room.amenities.slice(0, 6).map((a) => (
                                    <div
                                        key={a.name}
                                        className="flex items-center gap-2 text-xs text-neutral-600"
                                    >
                                        <div className="shrink-0 h-5 w-5 rounded-full bg-[#2D5016]/10 flex items-center justify-center">
                                            <DynamicHeroIcon iconName={a.icon} className="h-3 w-3 text-[#2D5016]" />
                                        </div>
                                        <span className="truncate">{a.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-[#2D5016]/10 flex items-center justify-between gap-3 flex-wrap">
                        <Link
                            href={`/rooms/${room.slug || room.id}`}
                            className={`group flex items-center gap-1.5 bg-[#2D5016] text-[#F5F2E8] text-xs font-semibold px-5 py-2.5 rounded-xl hover:bg-[#3D6B1F] transition-all ${
                                !room.available ? "pointer-events-none opacity-55" : ""
                            }`}
                        >
                            {room.available ? "Book Now" : "Unavailable"}
                            {room.available && (
                                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                            )}
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
