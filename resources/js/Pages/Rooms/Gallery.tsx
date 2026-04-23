import React, { useState, useEffect, useCallback } from 'react'
import { Head } from '@inertiajs/react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, ChevronLeft, ChevronRight, Images, Video } from 'lucide-react'

// Import your persistent Layout
import Layout from '../../Layouts/Layout'

// ─── TYPES ──────────────────────────────────────────────────────────────────
interface GalleryItem {
  id: string; // IDs like 'gal-1' or 'room-5-pic-0'
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  title: string;
  category: string; // This matches the RoomType name
  description?: string;
}

interface Room {
  id: number;
  name: string;
}

interface GalleryProps {
  items: GalleryItem[];
  rooms: Room[];
  dbCategories: string[]; // Dynamic categories from RoomType model
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

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function Gallery({ items = [], rooms = [], dbCategories = [] }: GalleryProps) {
  const [tab, setTab] = useState<'all' | 'photos' | 'videos'>('all')
  const [activeCategory, setActiveCategory] = useState('All')
  const [lightbox, setLightbox] = useState<{ item: GalleryItem; index: number } | null>(null)

  // Combine hardcoded general categories with dynamic RoomTypes
  const allCategories = ['All', ...dbCategories];

  // Media Filtering Logic
  const photos = items.filter((i) => i.type === 'image')
  const videos = items.filter((i) => i.type === 'video')

  const baseItems = tab === 'photos' ? photos : tab === 'videos' ? videos : items

  const filtered = baseItems.filter((item) =>
    activeCategory === 'All' || item.category === activeCategory
  )

  // Lightbox Navigation
  const goNext = useCallback(() => {
    if (!lightbox) return
    const nextIdx = (lightbox.index + 1) % filtered.length
    setLightbox({ item: filtered[nextIdx], index: nextIdx })
  }, [lightbox, filtered])

  const goPrev = useCallback(() => {
    if (!lightbox) return
    const prevIdx = (lightbox.index - 1 + filtered.length) % filtered.length
    setLightbox({ item: filtered[prevIdx], index: prevIdx })
  }, [lightbox, filtered])

  // Key Bindings
  useEffect(() => {
    if (!lightbox) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox, goNext, goPrev])

  // Prevent background scroll when Lightbox is open
  useEffect(() => {
    document.body.style.overflow = lightbox ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightbox])

  return (
    <Layout>
      <Head title="Gallery | Visual Tour of LuxeStay" />

      <main className="min-h-screen bg-[#F5F2E8]">
        {/* ── HERO SECTION ─────────────────────────────────────────────────── */}
        <section className="relative bg-[#2D5016] py-28 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-15"
            style={{ backgroundImage: "url('/images/beach-day.jpg')" }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#F5F2E8] to-transparent" />
          <div className="relative mx-auto max-w-4xl px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <span className="text-[#6B9E3F] text-sm font-semibold uppercase tracking-widest">Visual Tour</span>
              <h1 className="mt-3 text-5xl sm:text-6xl font-bold text-[#F5F2E8] leading-tight">Gallery</h1>
              <p className="mt-5 text-[#C8DBA8] text-lg max-w-xl mx-auto">
                Explore our stunning rooms, lush grounds, and premium amenities.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24">
          {/* ── TAB SWITCHER (All / Photos / Videos) ───────────────────────── */}
          <Reveal className="pt-10 pb-2">
            <div className="flex items-center gap-2 bg-white rounded-2xl p-1.5 border border-[#2D5016]/10 w-fit shadow-sm">
              {[
                { key: 'all', label: 'All Media', count: items.length, icon: null },
                { key: 'photos', label: 'Photos', count: photos.length, icon: Images },
                { key: 'videos', label: 'Videos', count: videos.length, icon: Video },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => { setTab(t.key as any); setActiveCategory('All') }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    tab === t.key ? 'bg-[#2D5016] text-[#F5F2E8]' : 'text-neutral-500 hover:text-[#2D5016]'
                  }`}
                >
                  {t.icon && <t.icon className="h-4 w-4" />}
                  {t.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ml-1 ${
                    tab === t.key ? 'bg-[#F5F2E8]/20 text-[#C8DBA8]' : 'bg-[#2D5016]/10 text-[#2D5016]'
                  }`}>
                    {t.count}
                  </span>
                </button>
              ))}
            </div>
          </Reveal>

          {/* ── CATEGORY FILTER ──────────────────────────────────────────── */}
          <Reveal className="py-5">
            <div className="flex flex-wrap gap-2">
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeCategory === cat
                      ? 'bg-[#2D5016] text-[#F5F2E8] shadow-md'
                      : 'bg-white border border-[#2D5016]/15 text-neutral-600 hover:border-[#2D5016] hover:text-[#2D5016]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </Reveal>

          {/* ── MEDIA GRID ───────────────────────────────────────────────── */}
          <div className="mt-8">
            <AnimatePresence mode="wait">
              {filtered.length > 0 ? (
                <motion.div
                    key={`${tab}-${activeCategory}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                >
                    {filtered.map((item, i) => (
                    item.type === 'video' ? (
                        <VideoCard key={item.id} item={item} index={i} onClick={() => setLightbox({ item, index: i })} />
                    ) : (
                        <GalleryCard key={item.id} item={item} index={i} onClick={() => setLightbox({ item, index: i })} />
                    )
                    ))}
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
                    <p className="text-neutral-400">No media found in this category.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── LIGHTBOX ───────────────────────────────────────────────────── */}
        <AnimatePresence>
          {lightbox && (
            <Lightbox
              item={lightbox.item}
              index={lightbox.index}
              total={filtered.length}
              onClose={() => setLightbox(null)}
              onNext={goNext}
              onPrev={goPrev}
            />
          )}
        </AnimatePresence>
      </main>
    </Layout>
  )
}

// ── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function GalleryCard({ item, index, onClick }: { item: GalleryItem; index: number; onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index % 12) * 0.05 }}
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="group relative rounded-2xl overflow-hidden cursor-pointer bg-[#EAE6D6] h-64 border border-[#2D5016]/10 shadow-sm"
    >
      <img
        src={item.url}
        alt={item.title}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-5 flex flex-col justify-end">
        <p className="text-white font-bold text-base leading-tight">{item.title}</p>
        <p className="text-[#6B9E3F] text-xs font-semibold uppercase tracking-wider mt-1">{item.category}</p>
      </div>
    </motion.div>
  )
}

function VideoCard({ item, index, onClick }: { item: GalleryItem; index: number; onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index % 12) * 0.05 }}
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="group relative rounded-2xl overflow-hidden cursor-pointer bg-black h-64 border border-[#2D5016]/10 shadow-sm"
    >
      <img
        src={item.thumbnail || item.url}
        className="w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-110 transition-all duration-700"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-16 w-16 rounded-full bg-[#2D5016] flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform duration-300">
          <Play fill="currentColor" size={28} className="ml-1" />
        </div>
      </div>
      <div className="absolute bottom-5 left-5">
        <p className="text-white font-bold text-base">{item.title}</p>
        <span className="text-[10px] tracking-[0.2em] uppercase font-black text-[#6B9E3F]">Video Tour</span>
      </div>
    </motion.div>
  )
}

function Lightbox({ item, index, total, onClose, onNext, onPrev }: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/98 flex items-center justify-center p-4 md:p-10 backdrop-blur-md"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-[110]"
        onClick={onClose}
      >
        <X size={40} strokeWidth={1.5} />
      </button>

      {/* Navigation */}
      <div className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 z-[110]">
        <button
          onClick={(e) => { e.stopPropagation(); onPrev() }}
          className="p-4 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all border border-white/10"
        >
          <ChevronLeft size={32}/>
        </button>
      </div>
      <div className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 z-[110]">
        <button
          onClick={(e) => { e.stopPropagation(); onNext() }}
          className="p-4 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all border border-white/10"
        >
          <ChevronRight size={32}/>
        </button>
      </div>

      {/* Content */}
      <div className="relative max-w-6xl w-full h-full flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
        <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full flex flex-col items-center justify-center"
        >
            {item.type === 'video' ? (
            <video src={item.url} controls autoPlay className="max-h-[70vh] w-auto rounded-lg shadow-2xl" />
            ) : (
            <img src={item.url} className="max-h-[70vh] w-auto rounded-lg shadow-2xl object-contain" />
            )}

            <div className="mt-8 text-center max-w-2xl">
                <h3 className="text-3xl font-bold text-white tracking-tight">{item.title}</h3>
                <p className="text-white/50 mt-3 text-lg leading-relaxed">{item.description}</p>
                <div className="mt-6 inline-flex items-center gap-3">
                    <span className="h-px w-8 bg-[#6B9E3F]"></span>
                    <span className="text-xs font-black text-[#6B9E3F] uppercase tracking-[0.3em]">
                        {index + 1} / {total}
                    </span>
                    <span className="h-px w-8 bg-[#6B9E3F]"></span>
                </div>
            </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
