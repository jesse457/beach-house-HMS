import React, { useState, useEffect, useCallback } from 'react'
import { router } from '@inertiajs/react'
import SEO from '../../Components/SEO'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, ChevronLeft, ChevronRight, Images, Video, Compass } from 'lucide-react'

// Import persistent Layout
import Layout from '../../Layouts/Layout'

// ─── TYPES ──────────────────────────────────────────────────────────────────
interface GalleryItem {
  id: string; // IDs like 'gal-1' or 'room-5-pic-0'
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  title: string;
  category: string; // Matches the RoomType name
  description?: string;
}

interface Room {
  id: number;
  name: string;
}

interface PaginatorLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface GalleryProps {
  items: {
    data: GalleryItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginatorLink[];
  };
  rooms: Room[];
  dbCategories: string[]; // Dynamic categories from RoomType model
}

// ─── REVEAL ANIMATION ───────────────────────────────────────────────────────
const Reveal = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
  >
    {children}
  </motion.div>
);

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function Gallery({ items, rooms = [], dbCategories = [] }: GalleryProps) {
  const [tab, setTab] = useState<'all' | 'photos' | 'videos'>('all')
  const [activeCategory, setActiveCategory] = useState('All')
  const [lightbox, setLightbox] = useState<{ item: GalleryItem; index: number } | null>(null)

  // Extract paginated data
  const galleryData = items?.data ?? []
  const currentPage = items?.current_page ?? 1
  const lastPage = items?.last_page ?? 1
  const total = items?.total ?? 0
  const links = items?.links ?? []

  // Combine general category headers with dynamic RoomTypes
  const allCategories = ['All', ...dbCategories];

  // Media Filtering Logic (client-side filtering of current page)
  const photos = galleryData.filter((i) => i.type === 'image')
  const videos = galleryData.filter((i) => i.type === 'video')

  const baseItems = tab === 'photos' ? photos : tab === 'videos' ? videos : galleryData

  const filtered = baseItems.filter((item) =>
    activeCategory === 'All' || item.category === activeCategory
  )

  // Page navigation handler
  const goToPage = (page: number) => {
    if (page < 1 || page > lastPage) return
    router.get(
      window.location.pathname,
      { page },
      { preserveState: true, preserveScroll: true, replace: true }
    )
  }

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
      <SEO
        title="Gallery | Visual Tour of Beach House Botaland"
        description="Explore our stunning seaside suites, coastal grounds, and curated amenities at Beach House Botaland in Limbe, Cameroon."
        canonical={window.location.origin + '/gallery'}
      />

      <main className="min-h-screen bg-[#F5F2E8]">
        {/* ── HERO SECTION ─────────────────────────────────────────────────── */}
        <section className="relative bg-[#2D5016] py-28 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-15"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80')" }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#F5F2E8] to-transparent" />
          <div className="relative mx-auto max-w-4xl px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <span className="text-[#6B9E3F] text-sm font-semibold uppercase tracking-widest block mb-3">
                Visual Tour
              </span>
              <h1 className="text-5xl sm:text-6xl font-bold text-[#F5F2E8] font-serif italic leading-tight">
                Gallery
              </h1>
              <p className="mt-5 text-[#C8DBA8] text-lg max-w-xl mx-auto">
                Explore our stunning seaside suites, coastal grounds, and curated amenities.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24">

          {/* ── TAB SWITCHER (All / Photos / Videos) ───────────────────────── */}
          <Reveal className="pt-10 pb-4">
            <div className="flex flex-wrap items-center gap-2 bg-white/80 backdrop-blur-md rounded-2xl p-1.5 border border-[#2D5016]/10 w-fit shadow-xs">
              {[
                { key: 'all', label: 'All Media', count: total, icon: null },
                { key: 'photos', label: 'Photos', count: photos.length, icon: Images },
                { key: 'videos', label: 'Videos', count: videos.length, icon: Video },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => { setTab(t.key as any); setActiveCategory('All') }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                    tab === t.key ? 'bg-[#2D5016] text-[#F5F2E8] shadow-xs' : 'text-neutral-500 hover:text-[#2D5016]'
                  }`}
                >
                  {t.icon && <t.icon className="h-4 w-4" />}
                  {t.label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1 ${
                    tab === t.key ? 'bg-white/20 text-[#C8DBA8]' : 'bg-[#2D5016]/10 text-[#2D5016]'
                  }`}>
                    {t.count}
                  </span>
                </button>
              ))}
            </div>
          </Reveal>

          {/* ── CATEGORY FILTER ──────────────────────────────────────────── */}
          <Reveal className="py-4">
            <div className="flex flex-wrap gap-2">
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-200 border ${
                    activeCategory === cat
                      ? 'bg-[#2D5016] text-[#F5F2E8] border-[#2D5016] shadow-xs'
                      : 'bg-white border-[#2D5016]/10 text-neutral-600 hover:border-[#2D5016] hover:text-[#2D5016]'
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
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
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
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-28 text-center">
                    <Compass size={48} className="mx-auto text-[#2D5016]/20 mb-4 animate-spin-slow" />
                    <p className="text-neutral-500 font-serif italic text-lg">No media found in this category.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── PAGINATION ─────────────────────────────────────────────────── */}
          {lastPage > 1 && (
            <Reveal className="mt-12">
              <div className="flex items-center justify-center gap-2">
                {/* Previous */}
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="p-2 rounded-lg border border-[#2D5016]/20 text-[#2D5016] hover:bg-[#2D5016]/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={20} />
                </button>

                {/* Page Numbers */}
                {links
                  .filter((link) => !link.label.includes('Previous') && !link.label.includes('Next'))
                  .map((link, i) => {
                    // Parse numeric page from label (handles "1", "2", etc., skips "...")
                    const pageNum = parseInt(link.label, 10)
                    if (isNaN(pageNum)) {
                      return (
                        <span key={`dots-${i}`} className="px-2 text-neutral-400 select-none">
                          …
                        </span>
                      )
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`min-w-[40px] h-10 rounded-lg text-sm font-bold transition-all duration-200 ${
                          link.active
                            ? 'bg-[#2D5016] text-[#F5F2E8] shadow-sm'
                            : 'text-neutral-600 hover:bg-[#2D5016]/10 hover:text-[#2D5016]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}

                {/* Next */}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= lastPage}
                  className="p-2 rounded-lg border border-[#2D5016]/20 text-[#2D5016] hover:bg-[#2D5016]/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Page info */}
              <p className="text-center text-xs text-neutral-400 mt-3 font-medium tracking-wide">
                Page {currentPage} of {lastPage}
                {total > 0 && ` · ${total} total items`}
              </p>
            </Reveal>
          )}
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
      transition={{ delay: (index % 12) * 0.05, duration: 0.4 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="group relative rounded-2xl overflow-hidden cursor-pointer bg-[#EAE6D6]/40 h-72 border border-[#2D5016]/10 shadow-xs hover:shadow-md transition-all duration-300"
    >
      <img
        src={item.url}
        alt={item.title}
        className="w-full h-full object-cover opacity-95 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out bg-[#EAE6D6]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-end">
        <p className="text-white font-bold text-base leading-tight">{item.title}</p>
        <p className="text-[#6B9E3F] text-[10px] font-bold uppercase tracking-widest mt-2">{item.category}</p>
      </div>
    </motion.div>
  )
}

function VideoCard({ item, index, onClick }: { item: GalleryItem; index: number; onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index % 12) * 0.05, duration: 0.4 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="group relative rounded-2xl overflow-hidden cursor-pointer bg-black h-72 border border-[#2D5016]/10 shadow-xs hover:shadow-md transition-all duration-300"
    >
      <img
        src={item.thumbnail || item.url}
        className="w-full h-full object-cover opacity-50 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700 bg-black"
        alt={item.title}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-14 w-14 rounded-full bg-[#2D5016]/90 hover:bg-[#2D5016] flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300 backdrop-blur-xs">
          <Play fill="currentColor" size={24} className="ml-1 text-[#F5F2E8]" />
        </div>
      </div>
      <div className="absolute bottom-6 left-6">
        <p className="text-white font-bold text-base">{item.title}</p>
        <span className="text-[9px] tracking-[0.15em] uppercase font-black text-[#6B9E3F] mt-1.5 block">Video Tour</span>
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full flex flex-col items-center justify-center"
        >
            {item.type === 'video' ? (
              <video src={item.url} controls autoPlay playsInline className="max-h-[70vh] max-w-full rounded-lg shadow-2xl outline-none" />
            ) : (
              <img src={item.url} className="max-h-[70vh] max-w-full rounded-lg shadow-2xl object-contain" alt={item.title} />
            )}

            <div className="mt-8 text-center max-w-2xl px-4">
                <h3 className="text-2xl font-serif text-white tracking-wide">{item.title}</h3>
                {item.description && (
                  <p className="text-white/60 mt-2 text-sm leading-relaxed">{item.description}</p>
                )}
                <div className="mt-6 inline-flex items-center gap-3">
                    <span className="h-px w-6 bg-[#6B9E3F]"></span>
                    <span className="text-[10px] font-black text-[#6B9E3F] uppercase tracking-[0.25em]">
                        {index + 1} / {total}
                    </span>
                    <span className="h-px w-6 bg-[#6B9E3F]"></span>
                </div>
            </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
