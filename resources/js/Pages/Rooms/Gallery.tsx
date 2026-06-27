import React, { useState, useEffect, useCallback, useRef } from 'react'
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
  totalPhotos: number;
  totalVideos: number;
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
export default function Gallery({ items, rooms = [], dbCategories = [], totalPhotos = 0, totalVideos = 0 }: GalleryProps) {
  // Derive current tab from URL query params so state survives page reloads
  const urlParams = new URLSearchParams(window.location.search)
  const urlType = urlParams.get('type')
  const urlCategory = urlParams.get('category')

  const [tab, setTab] = useState<'all' | 'photos' | 'videos'>(
    urlType === 'video' ? 'videos' : urlType === 'image' ? 'photos' : 'all'
  )
  const [activeCategory, setActiveCategory] = useState(urlCategory || 'All')
  const [lightbox, setLightbox] = useState<{ item: GalleryItem; index: number } | null>(null)

  // Data is already filtered server-side — use it directly
  const galleryData = items?.data ?? []
  const currentPage = items?.current_page ?? 1
  const lastPage = items?.last_page ?? 1
  const total = items?.total ?? 0
  const links = items?.links ?? []

  // Combine general category headers with dynamic RoomTypes
  const allCategories = ['All', ...dbCategories];

  // Build query params for the current filter state
  const buildParams = (overrides: Record<string, any> = {}) => {
    const params: Record<string, any> = {}
    const effectiveType = overrides.type ?? (tab === 'photos' ? 'image' : tab === 'videos' ? 'video' : undefined)
    const effectiveCategory = overrides.category ?? activeCategory
    if (effectiveType) params.type = effectiveType
    if (effectiveCategory && effectiveCategory !== 'All') params.category = effectiveCategory
    return { ...params, ...overrides }
  }

  // Navigate to a specific page, preserving active filters
  const goToPage = (page: number) => {
    if (page < 1 || page > lastPage) return
    router.get(
      window.location.pathname,
      buildParams({ page }),
      { preserveState: true, preserveScroll: true, replace: true }
    )
  }

  // Switch media type tab — reload from server with new filter
  const switchTab = (newTab: 'all' | 'photos' | 'videos') => {
    const newType = newTab === 'photos' ? 'image' : newTab === 'videos' ? 'video' : undefined
    setTab(newTab)
    setActiveCategory('All')
    const params: Record<string, any> = { page: 1 }
    if (newType) params.type = newType
    router.get(
      window.location.pathname,
      params,
      { preserveState: true, preserveScroll: true, replace: true }
    )
  }

  // Switch category — reload from server with new filter
  const switchCategory = (cat: string) => {
    setActiveCategory(cat)
    const params = buildParams({ page: 1, category: cat })
    if (cat === 'All') delete params.category
    router.get(
      window.location.pathname,
      params,
      { preserveState: true, preserveScroll: true, replace: true }
    )
  }

  // Lightbox Navigation
  const goNext = useCallback(() => {
    if (!lightbox) return
    const nextIdx = (lightbox.index + 1) % galleryData.length
    setLightbox({ item: galleryData[nextIdx], index: nextIdx })
  }, [lightbox, galleryData])

  const goPrev = useCallback(() => {
    if (!lightbox) return
    const prevIdx = (lightbox.index - 1 + galleryData.length) % galleryData.length
    setLightbox({ item: galleryData[prevIdx], index: prevIdx })
  }, [lightbox, galleryData])

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
        <section className="relative bg-[#2D5016] py-20 sm:py-28 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-15"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80')" }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#F5F2E8] to-transparent" />
          <div className="relative mx-auto max-w-4xl px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <span className="text-[#6B9E3F] text-xs sm:text-sm font-semibold uppercase tracking-widest block mb-2 sm:mb-3">
                Visual Tour
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#F5F2E8] font-serif italic leading-tight">
                Gallery
              </h1>
              <p className="mt-3 sm:mt-5 text-[#C8DBA8] text-base sm:text-lg max-w-xl mx-auto px-4">
                Explore our stunning seaside suites, coastal grounds, and curated amenities.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">

          {/* ── TAB SWITCHER (All / Photos / Videos) ───────────────────────── */}
          <Reveal className="pt-8 sm:pt-10 pb-3 sm:pb-4">
            {/* Mobile: full-width equal buttons | Desktop: fit-content pills */}
            <div className="flex sm:inline-flex gap-1.5 bg-white/80 backdrop-blur-md rounded-2xl p-1.5 border border-[#2D5016]/10 shadow-xs w-full sm:w-fit">
              {[
                { key: 'all', label: 'All', count: totalPhotos + totalVideos, icon: null },
                { key: 'photos', label: 'Photos', count: totalPhotos, icon: Images },
                { key: 'videos', label: 'Videos', count: totalVideos, icon: Video },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => switchTab(t.key as 'all' | 'photos' | 'videos')}
                  className={`flex flex-1 sm:flex-initial items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                    tab === t.key ? 'bg-[#2D5016] text-[#F5F2E8] shadow-xs' : 'text-neutral-500 hover:text-[#2D5016]'
                  }`}
                >
                  {t.icon && <t.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                  <span className="hidden sm:inline">{t.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    tab === t.key ? 'bg-white/20 text-[#C8DBA8]' : 'bg-[#2D5016]/10 text-[#2D5016]'
                  }`}>
                    {t.count}
                  </span>
                </button>
              ))}
            </div>
          </Reveal>

          {/* ── CATEGORY FILTER ──────────────────────────────────────────── */}
          <Reveal className="py-3 sm:py-4">
            {/* Mobile: horizontally scrollable | Desktop: wrapped rows */}
            <div className="flex overflow-x-auto sm:flex-wrap gap-2 pb-1 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => switchCategory(cat)}
                  className={`shrink-0 px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-200 border ${
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
          <div className="mt-6 sm:mt-8">
            <AnimatePresence mode="wait">
              {galleryData.length > 0 ? (
                <motion.div
                    key={`${tab}-${activeCategory}-${currentPage}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                >
                    {galleryData.map((item, i) => (
                    item.type === 'video' ? (
                        <VideoCard key={item.id} item={item} index={i} onClick={() => setLightbox({ item, index: i })} />
                    ) : (
                        <GalleryCard key={item.id} item={item} index={i} onClick={() => setLightbox({ item, index: i })} />
                    )
                    ))}
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 sm:py-28 text-center">
                    <Compass size={48} className="mx-auto text-[#2D5016]/20 mb-4 animate-spin-slow" />
                    <p className="text-neutral-500 font-serif italic text-base sm:text-lg">No media found in this category.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── PAGINATION ─────────────────────────────────────────────────── */}
          {lastPage > 1 && (
            <Reveal className="mt-10 sm:mt-12">
              <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                {/* Previous */}
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="p-2.5 sm:p-2 rounded-lg border border-[#2D5016]/20 text-[#2D5016] hover:bg-[#2D5016]/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
                </button>

                {/* Page Numbers — hide ellipsis dots on very small screens */}
                {links
                  .filter((link) => !link.label.includes('Previous') && !link.label.includes('Next'))
                  .map((link, i) => {
                    const pageNum = parseInt(link.label, 10)
                    if (isNaN(pageNum)) {
                      return (
                        <span key={`dots-${i}`} className="px-1 sm:px-2 text-neutral-400 select-none hidden sm:inline">
                          …
                        </span>
                      )
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`min-w-[36px] sm:min-w-[40px] h-9 sm:h-10 rounded-lg text-sm font-bold transition-all duration-200 ${
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
                  className="p-2.5 sm:p-2 rounded-lg border border-[#2D5016]/20 text-[#2D5016] hover:bg-[#2D5016]/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight size={18} className="sm:w-5 sm:h-5" />
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
              total={galleryData.length}
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
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative rounded-2xl overflow-hidden cursor-pointer bg-[#EAE6D6]/40 h-56 sm:h-64 lg:h-72 border border-[#2D5016]/10 shadow-xs hover:shadow-md active:shadow-sm transition-all duration-300"
    >
      <img
        src={item.url}
        alt={item.title}
        className="w-full h-full object-cover opacity-95 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out bg-[#EAE6D6]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 sm:p-6 flex flex-col justify-end">
        <p className="text-white font-bold text-sm sm:text-base leading-tight">{item.title}</p>
        <p className="text-[#6B9E3F] text-[10px] font-bold uppercase tracking-widest mt-1.5 sm:mt-2">{item.category}</p>
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
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative rounded-2xl overflow-hidden cursor-pointer bg-black h-56 sm:h-64 lg:h-72 border border-[#2D5016]/10 shadow-xs hover:shadow-md active:shadow-sm transition-all duration-300"
    >
      <img
        src={item.thumbnail || item.url}
        className="w-full h-full object-cover opacity-50 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700 bg-black"
        alt={item.title}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-[#2D5016]/90 hover:bg-[#2D5016] flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300 backdrop-blur-xs">
          <Play fill="currentColor" size={20} className="sm:w-6 sm:h-6 ml-0.5 sm:ml-1 text-[#F5F2E8]" />
        </div>
      </div>
      <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6">
        <p className="text-white font-bold text-sm sm:text-base leading-tight">{item.title}</p>
        <span className="text-[9px] tracking-[0.15em] uppercase font-black text-[#6B9E3F] mt-1.5 block">Video Tour</span>
      </div>
    </motion.div>
  )
}

function Lightbox({ item, index, total, onClose, onNext, onPrev }: {
  item: GalleryItem;
  index: number;
  total: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return

    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)

    // Only trigger swipe if horizontal movement dominates and exceeds threshold
    if (absDx > absDy && absDx > 50) {
      if (dx > 0) onPrev()
      else onNext()
    }

    // Swipe down to close
    if (absDy > absDx && dy > 80) {
      onClose()
    }

    touchStartX.current = null
    touchStartY.current = null
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/98 flex items-center justify-center p-3 sm:p-4 md:p-10 backdrop-blur-md"
      onClick={onClose}
    >
      {/* Close Button — larger touch target on mobile */}
      <button
        className="absolute top-3 right-3 sm:top-6 sm:right-6 text-white/50 hover:text-white transition-colors z-[110] p-2 sm:p-0"
        onClick={onClose}
        aria-label="Close"
      >
        <X size={28} className="sm:w-10 sm:h-10" strokeWidth={1.5} />
      </button>

      {/* Navigation — Previous */}
      <div className="absolute left-2 sm:left-4 md:left-10 top-1/2 -translate-y-1/2 z-[110]">
        <button
          onClick={(e) => { e.stopPropagation(); onPrev() }}
          className="p-3 sm:p-4 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all border border-white/10 active:scale-95"
          aria-label="Previous"
        >
          <ChevronLeft size={24} className="sm:w-8 sm:h-8" />
        </button>
      </div>

      {/* Navigation — Next */}
      <div className="absolute right-2 sm:right-4 md:right-10 top-1/2 -translate-y-1/2 z-[110]">
        <button
          onClick={(e) => { e.stopPropagation(); onNext() }}
          className="p-3 sm:p-4 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all border border-white/10 active:scale-95"
          aria-label="Next"
        >
          <ChevronRight size={24} className="sm:w-8 sm:h-8" />
        </button>
      </div>

      {/* Content */}
      <div
        className="relative max-w-6xl w-full h-full flex flex-col items-center justify-center"
        onClick={e => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full flex flex-col items-center justify-center"
        >
            {item.type === 'video' ? (
              <video
                src={item.url}
                controls
                autoPlay
                playsInline
                className="max-h-[60vh] sm:max-h-[70vh] max-w-full rounded-lg shadow-2xl outline-none"
              />
            ) : (
              <img
                src={item.url}
                className="max-h-[60vh] sm:max-h-[70vh] max-w-full rounded-lg shadow-2xl object-contain"
                alt={item.title}
              />
            )}

            <div className="mt-4 sm:mt-8 text-center max-w-2xl px-4">
                <h3 className="text-lg sm:text-2xl font-serif text-white tracking-wide">{item.title}</h3>
                {item.description && (
                  <p className="text-white/60 mt-1.5 sm:mt-2 text-xs sm:text-sm leading-relaxed">{item.description}</p>
                )}
                <div className="mt-4 sm:mt-6 inline-flex items-center gap-3">
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
