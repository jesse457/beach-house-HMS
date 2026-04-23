import React, { useRef, useState } from 'react'
import { Link, Head } from '@inertiajs/react'
import { motion, useScroll, useTransform, AnimatePresence, Variants } from 'framer-motion'
import {
  ArrowRight, Star, Wifi, Car, Dumbbell, Coffee, Shield, Clock, ChevronDown,
  Play, Pause, ChevronLeft, ChevronRight, Video, Users, BedDouble, Check,
} from 'lucide-react'

// Import the Layout we created earlier
import Layout from '../Layouts/Layout'
import GallerySection from '../Components/GallerySection'
import AmenitiesSection from '../Components/AmenitiesSection'

// ─── TYPES ──────────────────────────────────────────────────────────────────
interface Room {
  id: number | string;
  name: string;
  description?: string;
  price_per_night: number;
  capacity: number;
  available: boolean;
  images?: string[];
  video_url?: string;
  amenities?: string[];
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
    thumbnail: string; // Added thumbnail
    title: string;
    category: string;
    type: "image" | "video"; // Made required
}

interface Amenity {
  id: number;
  name: string;
  icon: string;
  description?: string;
}
interface HomeProps {
  rooms: Room[];
  testimonials: Testimonial[];
  featuredGallery: GalleryItem[];
    amenities: Amenity[];
}

// ─── REVEAL COMPONENTS ──────────────────────────────────────────────────────
interface RevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
  className?: string;
}

const Reveal = ({ children, direction = 'up', delay = 0.2, duration = 0.5, className = "" }: RevealProps) => {
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

const StaggerContainer = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const variants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
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
    show: { opacity: 1, y: 0 }
  };
  return <motion.div variants={variants}>{children}</motion.div>;
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function Home({ rooms = [], testimonials = [] ,featuredGallery = [],amenities=[]}: HomeProps) {
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <Layout>
      <Head title="Welcome to Beach House | Luxury & Nature" />

      <main className="overflow-x-hidden">
        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section ref={heroRef} className="relative min-h-screen flex items-center bg-[#2D5016] overflow-hidden">
          <motion.div
            style={{
              y: heroY,
              backgroundImage: "url('images/beach-day2.jpg')"
            }}
            className="absolute inset-0 bg-cover bg-center"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#2D5016]/90 via-[#2D5016]/70 to-[#1a3009]/80" />

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
                transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#F5F2E8] leading-[1.05] tracking-tight"
              >
                Where Luxury
                <br />
                <span className="text-[#C8DBA8]">Meets Nature</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35 }}
                className="mt-6 text-lg text-[#C8DBA8]/80 leading-relaxed max-w-xl"
              >
                Discover unparalleled comfort at Beach House. Premium rooms, world-class amenities, and personalized service — all surrounded by nature.
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
                <Link
                  href="#story"
                  className="inline-flex items-center gap-2 border border-[#F5F2E8]/30 text-[#F5F2E8] font-semibold px-7 py-3.5 rounded-xl hover:bg-[#F5F2E8]/10 transition-all duration-200 backdrop-blur-sm"
                >
                  Our Story
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="mt-16 flex gap-10"
              >
                {[
                  { value: '15+', label: 'Luxury Rooms' },
                  { value: '4★', label: 'Guest Rating' },
                  { value: '10k+', label: 'Happy Guests' },
                ].map(({ value, label }) => (
                  <div key={label}>
                    <div className="text-3xl font-bold text-[#F5F2E8]">{value}</div>
                    <div className="text-sm text-[#C8DBA8]/70 mt-0.5">{label}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[#C8DBA8]/50"
          >
            <span className="text-xs tracking-widest uppercase">Scroll</span>
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              <ChevronDown className="h-4 w-4" />
            </motion.div>
          </motion.div>
        </section>

        {/* ── MARQUEE STRIP ────────────────────────────────────────────────── */}
        <div className="bg-[#3D6B1F] py-3 overflow-hidden">
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="flex gap-12 whitespace-nowrap"
          >
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-12 text-[#C8DBA8] text-sm font-medium">
                {['Free WiFi','Free Parking', 'Swimming Pool','24/7 Electricty Supply','Party/Meeting Hall', 'Spa & Wellness', 'Fine Dining', 'Fitness Center', '24/7 Security', 'Airport Pick-up', 'Room Service'].map((item) => (
                  <span key={item} className="flex items-center gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#6B9E3F]" />
                    {item}
                  </span>
                ))}
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── STORY / ABOUT ────────────────────────────────────────────────── */}
        <section id="story" className="py-28 bg-[#F5F2E8]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <Reveal direction="right">
                <div className="relative">
                  <div className="aspect-[4/5] rounded-3xl overflow-hidden">

                    <img src="images/beach-night.jpg"
                      alt="Beach House interior"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="absolute -bottom-6 -right-6 bg-[#2D5016] text-[#F5F2E8] rounded-2xl p-5 shadow-2xl"
                  >
                    <div className="text-4xl font-bold">12+</div>
                    <div className="text-[#C8DBA8] text-sm mt-0.5">Years of Excellence</div>
                  </motion.div>
                </div>
              </Reveal>

              <Reveal direction="left" delay={0.15}>
                <div>
                  <span className="text-[#6B9E3F] text-sm font-semibold uppercase tracking-widest">Our Story</span>
                  <h2 className="mt-3 text-4xl lg:text-5xl font-bold text-[#2D5016] leading-tight">
                    Crafted for those who appreciate the finer things
                  </h2>
                  <p className="mt-5 text-neutral-600 leading-relaxed">
                    Founded in 1999, Beach House was born from a simple belief — that every guest deserves to feel at home. We blend contemporary design with warm hospitality.
                  </p>
                  <div className="mt-8 grid grid-cols-2 gap-5">
                    {[
                      { icon: '🌿', title: 'Eco-Conscious', desc: 'Sustainable practices' },
                      { icon: '🍃', title: 'Farm-to-Table', desc: 'Fresh local ingredients' },
                      { icon: '🏆', title: 'Award Winning', desc: 'Best Boutique Hotel 2023' },
                      { icon: '💚', title: 'Community First', desc: 'Supporting artisans' },
                    ].map(({ icon, title, desc }) => (
                      <div key={title} className="flex gap-3">
                        <span className="text-2xl">{icon}</span>
                        <div>
                          <div className="font-semibold text-[#2D5016] text-sm">{title}</div>
                          <div className="text-neutral-500 text-xs mt-0.5">{desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── AMENITIES ────────────────────────────────────────────────────── */}
       <AmenitiesSection amenities={amenities}/>
<GallerySection items={featuredGallery} />
        {/* ── FEATURED ROOMS ───────────────────────────────────────────────── */}
        {rooms.length > 0 && (
          <section className="py-28 bg-[#F5F2E8]">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-12">
                <Reveal>
                  <span className="text-[#6B9E3F] text-sm font-semibold uppercase tracking-widest">Accommodations</span>
                  <h2 className="mt-3 text-4xl font-bold text-[#2D5016]">Featured Rooms</h2>
                </Reveal>
                <Reveal direction="left">
                  <Link
                    href="/rooms"
                    className="group hidden sm:flex items-center gap-2 text-[#2D5016] font-medium text-sm hover:gap-3 transition-all"
                  >
                    View all rooms
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Reveal>
              </div>

              <div className="space-y-10">
                {rooms.map((room, i) => (
                  <HomeRoomCard key={room.id} room={room} index={i} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
        {testimonials.length > 0 && (
          <section className="py-28 bg-[#EAE6D6]">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <Reveal className="text-center mb-12">
                <span className="text-[#6B9E3F] text-sm font-semibold uppercase tracking-widest">Testimonials</span>
                <h2 className="mt-3 text-4xl font-bold text-[#2D5016]">What Our Guests Say</h2>
              </Reveal>

              <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {testimonials.map((t) => (
                  <StaggerItem key={t.id}>
                    <div className="bg-[#F5F2E8] h-full rounded-2xl p-7 border border-[#2D5016]/10 hover:shadow-lg transition-shadow">
                      <div className="flex gap-1 mb-4">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-[#3D6B1F] text-[#3D6B1F]" />
                        ))}
                      </div>
                      <p className="text-neutral-600 text-sm leading-relaxed mb-5">"{t.content}"</p>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-[#2D5016] flex items-center justify-center text-[#F5F2E8] font-bold text-sm">
                          {t.author_name[0]}
                        </div>
                        <span className="font-semibold text-[#2D5016] text-sm">{t.author_name}</span>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
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
                  className="group inline-flex items-center gap-2 bg-[#2D5016] text-[#F5F2E8] font-semibold px-8 py-4 rounded-xl hover:bg-[#3D6B1F] transition-all shadow-lg"
                >
                  Browse Rooms
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 border-2 border-[#2D5016] text-[#2D5016] font-semibold px-8 py-4 rounded-xl hover:bg-[#2D5016] hover:text-[#F5F2E8] transition-all"
                >
                  Create Account
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
    </Layout>
  )
}

// ─── Home Room Card ──────────────────────────────────────────────────────────
function HomeRoomCard({ room, index }: { room: Room; index: number }) {
  const [activeImg, setActiveImg] = useState(0)
  const [showVideo, setShowVideo] = useState(false)
  const [videoPlaying, setVideoPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const FALLBACKS = [
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80',
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&q=80',
  ]
  const images = room.images?.length ? room.images : [FALLBACKS[index % FALLBACKS.length]]
  const isEven = index % 2 === 0

  function toggleVideo() {
    if (!showVideo) {
      setShowVideo(true)
      setTimeout(() => { videoRef.current?.play(); setVideoPlaying(true) }, 100)
    } else {
      if (videoPlaying) { videoRef.current?.pause(); setVideoPlaying(false) }
      else { videoRef.current?.play(); setVideoPlaying(true) }
    }
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-3xl overflow-hidden border border-[#2D5016]/10 hover:shadow-xl transition-shadow"
    >
      <div className={`grid grid-cols-1 lg:grid-cols-2 ${isEven ? '' : 'lg:grid-flow-dense'}`}>
        {/* Media */}
        <div className={`relative ${isEven ? '' : 'lg:col-start-2'}`}>
          <div className="relative h-64 lg:h-full min-h-[280px] overflow-hidden bg-[#EAE6D6]">
            <AnimatePresence mode="wait">
              {showVideo && room.video_url ? (
                <motion.div key="video" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black">
                  <video ref={videoRef} src={room.video_url} className="w-full h-full object-cover" loop playsInline />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <button onClick={toggleVideo} className="h-12 w-12 rounded-full bg-black/50 flex items-center justify-center text-white">
                      {videoPlaying ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="h-5 w-5 ml-0.5" fill="currentColor" />}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key={`img-${activeImg}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
                  <img src={images[activeImg]} alt={room.name} className="w-full h-full object-cover" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Badges */}
            <div className="absolute top-3 left-3 bg-[#2D5016] text-[#F5F2E8] font-bold px-3 py-1.5 rounded-full text-xs">
              ${room.price_per_night}<span className="font-normal text-[#C8DBA8]">/night</span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className={`p-7 flex flex-col justify-between ${isEven ? '' : 'lg:col-start-1 lg:row-start-1'}`}>
          <div>
            <h3 className="text-xl font-bold text-[#2D5016]">{room.name}</h3>
            <p className="mt-4 text-neutral-600 text-sm leading-relaxed line-clamp-3">
              {room.description || 'A beautifully appointed room designed for your comfort and relaxation.'}
            </p>

            {room.amenities && room.amenities.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-y-1.5 gap-x-2">
                {room.amenities.slice(0, 6).map((a) => (
                  <div key={a} className="flex items-center gap-1.5 text-xs text-neutral-600">
                    <Check className="h-3 w-3 text-[#2D5016]" /> {a}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-5 border-t border-[#2D5016]/10 flex items-center justify-between gap-3 flex-wrap">
            <Link href={`/rooms/${room.id}`}>
              <button disabled={!room.available} className="group flex items-center gap-1.5 bg-[#2D5016] text-[#F5F2E8] text-xs font-semibold px-5 py-2 rounded-xl hover:bg-[#3D6B1F] transition-colors disabled:opacity-50">
                {room.available ? 'Book Now' : 'Unavailable'}
                {room.available && <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
