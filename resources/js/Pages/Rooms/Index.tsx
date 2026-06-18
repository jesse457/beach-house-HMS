import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { Link, router } from '@inertiajs/react'
import SEO from '../../Components/SEO'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowRight, ShoppingBag, Star, X, Check, Wifi, Tv, Wind,
    SlidersHorizontal, Search, Trash2, MapPin, Coffee, Utensils
} from 'lucide-react'

// Layout & Context
import Layout from '../../Layouts/Layout'
import { useCart } from '../../Context/CartContext'

// ─── TYPES ──────────────────────────────────────────────────────────────────
interface Amenity {
    id: number;
    name: string;
    icon: string;
}

interface RoomType {
    id: number;
    name: string;
    description: string;
}

interface Room {
    id: number;
    slug?: string;
    room_number: string;
    room_type_id: number;
    price_per_night: string;
    is_occupied: boolean;
    pictures: string[] | null;
    room_type: RoomType;
    amenities: Amenity[];
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedRooms {
    data: Room[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface RoomsProps {
    rooms: PaginatedRooms;
    roomTypes: RoomType[];
    amenities: Amenity[];
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
export default function Rooms({
    rooms = { data: [], links: [], current_page: 1, last_page: 1, per_page: 8, total: 0, from: 0, to: 0 },
    roomTypes = [],
    amenities = []
}: RoomsProps) {
    const [activeCategory, setActiveCategory] = useState('All');
    const [maxPrice, setMaxPrice] = useState(500000); // Default 500k XAF
    const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    // Dynamic Category List
    const allCategories = useMemo(() => ['All', ...roomTypes.map(t => t.name)], [roomTypes]);

    // ─── Client-side Filter Logic (runs on the current page's dataset) ─────────
    const filteredRooms = useMemo(() => {
        const roomList = rooms.data || [];
        return roomList.filter(room => {
            const matchesCat = activeCategory === 'All' || room.room_type.name === activeCategory;
            const matchesPrice = parseFloat(room.price_per_night) <= maxPrice;
            const matchesAmenities = selectedAmenities.length === 0 ||
                selectedAmenities.every(id => room.amenities.some(a => a.id === id));
            return matchesCat && matchesPrice && matchesAmenities;
        });
    }, [rooms.data, activeCategory, maxPrice, selectedAmenities]);

    const toggleAmenity = (id: number) => {
        setSelectedAmenities(prev =>
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        );
    };

    const resetFilters = () => {
        setIsResetting(true);
        setActiveCategory('All');
        setMaxPrice(1000000);
        setSelectedAmenities([]);
        // Reload page 1 with no filters to get fresh server data
        router.get('/rooms', {}, {
            preserveState: false,
            onFinish: () => setIsResetting(false),
        });
    };

    const getUrl = (path: string) => {
        if (!path) return 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80';
        return path.startsWith('http') ? path : `/storage/${path}`;
    };

    return (
        <Layout>
            <SEO
                title="Luxury Lodges & Suites | Cameroon"
                description="Browse our curated selection of luxury suites and lodges at Beach House Botaland. Find your perfect stay with ocean views and premium amenities in Limbe, Cameroon."
                canonical={window.location.origin + '/rooms'}
            />

            <main className="min-h-screen bg-[#F5F2E8]">
                {/* ── HERO SECTION ───────────────────────────────────────────── */}
                <section className="relative bg-[#2D5016] py-28 overflow-hidden">
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-15"
                        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80')" }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#F5F2E8] to-transparent" />
                    <div className="relative mx-auto max-w-4xl px-4 text-center">
                        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                            <span className="text-[#6B9E3F] text-sm font-semibold uppercase tracking-widest block mb-3">
                                The Art of Living
                            </span>
                            <h1 className="text-5xl sm:text-6xl font-bold text-[#F5F2E8] leading-tight font-serif italic">
                                Suites & Lodges
                            </h1>
                            <p className="mt-5 text-[#C8DBA8] text-lg max-w-xl mx-auto">
                                Discover curated modern sanctuaries engineered for rest and exquisite style.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* ── MAIN CONTENT AREA ─────────────────────────────────────── */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                    <div className="flex flex-col lg:flex-row gap-12 pt-10">

                        {/* ── SIDEBAR FILTERS (Desktop) ──────────────────────── */}
                        <aside className="hidden lg:block w-80 sticky top-28 h-fit space-y-10">
                            <Reveal>
                                <div>
                                    <h3 className="text-[#2D5016] text-xs font-black uppercase tracking-widest mb-4">
                                        Filter by Category
                                    </h3>
                                    <div className="space-y-1.5 bg-white rounded-2xl p-2 border border-[#2D5016]/10 shadow-sm">
                                        {allCategories.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setActiveCategory(cat)}
                                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-between
                                                    ${activeCategory === cat
                                                        ? 'bg-[#2D5016] text-[#F5F2E8] shadow-md'
                                                        : 'hover:bg-[#FAF9F6] text-neutral-500'}`}
                                            >
                                                {cat}
                                                {activeCategory === cat && <Check size={14} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </Reveal>

                            <Reveal>
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-[#2D5016] text-xs font-black uppercase tracking-widest">
                                            Budget Per Night
                                        </h3>
                                        <span className="text-xs font-bold text-[#6B9E3F]">FCFA</span>
                                    </div>
                                    <div className="bg-white rounded-2xl p-5 border border-[#2D5016]/10 shadow-sm">
                                        <input
                                            type="range" min="25000" max="1000000" step="5000" value={maxPrice}
                                            onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                                            className="w-full accent-[#2D5016] h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <div className="flex justify-between mt-4 items-center">
                                            <span className="text-[10px] font-bold text-neutral-400">25,000</span>
                                            <span className="text-sm font-extrabold text-[#2D5016]">{maxPrice.toLocaleString()} FCFA</span>
                                        </div>
                                    </div>
                                </div>
                            </Reveal>

                            <Reveal>
                                <div>
                                    <h3 className="text-[#2D5016] text-xs font-black uppercase tracking-widest mb-4">
                                        Amenities
                                    </h3>
                                    <div className="grid grid-cols-1 gap-1.5 bg-white rounded-2xl p-3 border border-[#2D5016]/10 shadow-sm">
                                        {amenities.map(a => (
                                            <button
                                                key={a.id}
                                                onClick={() => toggleAmenity(a.id)}
                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all
                                                    ${selectedAmenities.includes(a.id)
                                                        ? 'bg-[#6B9E3F]/10 border-[#6B9E3F] text-[#2D5016]'
                                                        : 'bg-transparent border-transparent text-neutral-500 hover:bg-[#FAF9F6]'}`}
                                            >
                                                <div className={`w-2 h-2 rounded-full ${selectedAmenities.includes(a.id) ? 'bg-[#6B9E3F]' : 'bg-neutral-200'}`} />
                                                {a.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </Reveal>

                            <Reveal>
                                <button
                                    onClick={resetFilters}
                                    className="w-full py-4 rounded-xl border-2 border-dashed border-[#2D5016]/20 text-[#2D5016] hover:bg-[#2D5016]/5 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={14} /> Reset All Filters
                                </button>
                            </Reveal>
                        </aside>

                        {/* ── MOBILE FILTER TOGGLE ───────────────────────────── */}
                        <div className="lg:hidden flex items-center justify-between bg-white p-4 rounded-2xl border border-[#2D5016]/10 shadow-sm">
                            <button
                                onClick={() => setIsMobileFilterOpen(true)}
                                className="flex items-center gap-2 text-sm font-bold text-[#2D5016]"
                            >
                                <SlidersHorizontal size={18} /> Filters
                            </button>
                            <span className="text-xs font-bold text-neutral-400">{filteredRooms.length} Spaces found</span>
                        </div>

                        {/* ── ROOM GRID ──────────────────────────────────────── */}
                        <div className="flex-1 relative">
                            {/* Loading overlay when resetting filters */}
                            {isResetting && (
                                <div className="absolute inset-0 z-20 bg-[#F5F2E8]/70 backdrop-blur-sm flex items-start justify-center pt-40">
                                    <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-lg border border-[#2D5016]/10">
                                        <div className="w-5 h-5 border-2 border-[#2D5016] border-t-transparent rounded-full animate-spin" />
                                        <span className="text-sm font-semibold text-[#2D5016]">Refreshing rooms...</span>
                                    </div>
                                </div>
                            )}
                            <div className="mb-8 hidden lg:flex items-center justify-between border-b border-[#2D5016]/10 pb-4">
                                <h2 className="text-2xl font-serif text-[#2D5016]">
                                    Discovering <span className="italic">{activeCategory}</span>
                                </h2>
                                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                                    Showing {rooms.from || 0} - {rooms.to || 0} of {rooms.total || 0} Spaces
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <AnimatePresence mode='popLayout'>
                                    {filteredRooms.map((room, i) => (
                                        <RoomCard key={room.id} room={room} index={i} getUrl={getUrl} />
                                    ))}
                                </AnimatePresence>
                            </div>

                            {filteredRooms.length === 0 && (
                                <div className="py-40 text-center">
                                    <Search size={48} className="mx-auto text-neutral-300 mb-4" />
                                    <h3 className="text-xl font-bold text-[#2D5016]">No matching sanctuaries</h3>
                                    <p className="text-neutral-500 mt-2">Try adjusting your price range or amenities.</p>
                                    <button onClick={resetFilters} className="mt-6 text-[#6B9E3F] font-bold border-b border-[#6B9E3F]">Clear all filters</button>
                                </div>
                            )}

                            {/* ── PAGINATION SYSTEM ── */}
                            {rooms.links && rooms.links.length > 3 && (
                                <div className="mt-16 flex flex-wrap justify-center items-center gap-2">
                                    {rooms.links.map((link, idx) => {
                                        const isActive = link.active;
                                        return (
                                            <Link
                                                key={idx}
                                                href={link.url || '#'}
                                                onClick={(e) => {
                                                    if (!link.url) e.preventDefault();
                                                }}
                                                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center min-w-[40px]
                                                    ${isActive
                                                        ? 'bg-[#2D5016] text-[#F5F2E8] shadow-md'
                                                        : 'bg-white border border-[#2D5016]/10 text-[#2D5016] hover:bg-[#FAF9F6]'}
                                                    ${!link.url ? 'opacity-40 cursor-not-allowed border-transparent bg-transparent text-neutral-400' : ''}`}
                                            >
                                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* ── MOBILE FILTER DRAWER ─────────────────────────────────────── */}
            {isMobileFilterOpen && (
                <div className="fixed inset-0 z-[100] lg:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)} />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        className="absolute right-0 top-0 bottom-0 w-[85%] bg-[#F5F2E8] p-8 overflow-y-auto shadow-2xl"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-bold text-[#2D5016]">Filters</h3>
                            <button onClick={() => setIsMobileFilterOpen(false)}>
                                <X className="text-[#2D5016]" />
                            </button>
                        </div>
                        <SidebarContent
                            activeCategory={activeCategory} setActiveCategory={setActiveCategory}
                            maxPrice={maxPrice} setMaxPrice={setMaxPrice}
                            amenities={amenities} selectedAmenities={selectedAmenities} toggleAmenity={toggleAmenity}
                            roomTypes={roomTypes} resetFilters={resetFilters}
                        />
                    </motion.div>
                </div>
            )}
        </Layout>
    );
}

// ── ROOM CARD SUB-COMPONENT ──────────────────────────────────────────────────

function RoomCard({ room, index, getUrl }: { room: Room, index: number, getUrl: any }) {
    const { items, addToCart, removeFromCart } = useCart();
    const isInCart = items.some(item => item.id === room.id);
    const isOccupied = room.is_occupied;
    const mainImage = room.pictures && room.pictures.length > 0 ? getUrl(room.pictures[0]) : '';

    const handleCartToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isOccupied) return;

        if (isInCart) {
            removeFromCart(room.id);
        } else {
            addToCart({
                id: room.id,
                name: `${room.room_type.name} - No. ${room.room_number}`,
                price_per_night: room.price_per_night,
                image: mainImage,
                is_occupied: isOccupied
            });
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: (index % 12) * 0.05, duration: 0.4 }}
            className={`group bg-[#EAE6D6] rounded-2xl overflow-hidden border shadow-sm hover:shadow-md transition-all duration-500 flex flex-col justify-between
                ${isOccupied ? 'opacity-70 border-neutral-200' : 'border-[#2D5016]/10 hover:border-[#2D5016]/30'}`}
        >
            <div>
                <div className="relative h-64 overflow-hidden bg-black">
                    <img
                        src={mainImage}
                        className={`w-full h-full object-cover transition-transform duration-1000
                            ${isOccupied ? 'grayscale-[40%] opacity-75' : 'group-hover:scale-105'}`}
                        alt={room.room_type.name}
                    />

                    {/* Occupied Overlay */}
                    {isOccupied && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                            <span className="bg-[#2D5016] text-[#F5F2E8] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                <X size={12} /> Currently Booked
                            </span>
                        </div>
                    )}

                    {/* Price Badge */}
                    <div className="absolute top-4 right-4 bg-[#2D5016] text-[#F5F2E8] px-4 py-1.5 rounded-full shadow-lg flex items-baseline gap-1">
                        <span className="text-base font-black">{parseInt(room.price_per_night).toLocaleString()}</span>
                        <span className="text-[9px] font-bold text-[#C8DBA8] uppercase">FCFA</span>
                    </div>
                </div>

                <div className="p-6">
                    <div className="mb-4">
                        <h3 className={`text-2xl font-serif font-bold mb-1 ${isOccupied ? 'text-neutral-500' : 'text-[#2D5016]'}`}>
                            {room.room_type.name}
                        </h3>
                        <div className="flex items-center gap-2 text-[#2D5016]/60">
                            <MapPin size={13} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">
                                Suite {room.room_number}
                            </span>
                        </div>
                    </div>

                    {/* Amenities List */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                        {room.amenities.slice(0, 3).map(a => (
                            <div key={a.id} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF9F6] text-neutral-600 border border-[#2D5016]/5 text-[10px] font-semibold">
                                <AmenityIcon name={a.name} />
                                {a.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Actions Footer */}
            <div className="p-6 pt-0 mt-auto">
                <div className="flex gap-2.5 h-12">
                    <Link
                        href={isOccupied ? '#' : `/rooms/${room.slug || room.id}`}
                        onClick={(e) => isOccupied && e.preventDefault()}
                        className={`flex-1 rounded-xl flex items-center justify-center text-xs font-bold uppercase tracking-widest transition-all duration-200
                            ${isOccupied
                                ? 'bg-neutral-200/50 text-neutral-400 cursor-not-allowed'
                                : 'bg-[#2D5016] hover:bg-[#3d691e] text-white'}`}
                    >
                        {isOccupied ? 'Unavailable' : 'View Space'}
                    </Link>
                    <button
                        onClick={handleCartToggle}
                        disabled={isOccupied}
                        className={`w-12 flex items-center justify-center rounded-xl border transition-all duration-200
                            ${isOccupied
                                ? 'bg-neutral-100 border-neutral-200 text-neutral-300 cursor-not-allowed'
                                : isInCart
                                    ? 'bg-[#6B9E3F] border-[#6B9E3F] text-white'
                                    : 'border-[#2D5016]/20 text-[#2D5016] bg-white hover:bg-[#FAF9F6]'}`}
                        title={isOccupied ? 'This room is currently booked' : undefined}
                    >
                        {isOccupied ? <X size={18} /> : isInCart ? <Check size={18} /> : <ShoppingBag size={18} />}
                    </button>
                </div>

                {isOccupied && (
                    <p className="text-[9px] text-neutral-400 mt-2 text-center italic">
                        This suite is reserved for another guest. Check back later!
                    </p>
                )}
            </div>
        </motion.div>
    );
}

// ── HELPERS & UTILITIES ──────────────────────────────────────────────────────

function AmenityIcon({ name }: { name: string }) {
    const n = name.toLowerCase();
    if (n.includes('wifi')) return <Wifi size={11} />;
    if (n.includes('tv')) return <Tv size={11} />;
    if (n.includes('air') || n.includes('ac')) return <Wind size={11} />;
    if (n.includes('breakfast')) return <Utensils size={11} />;
    return <Coffee size={11} />;
}

function SidebarContent({ activeCategory, setActiveCategory, maxPrice, setMaxPrice, amenities, selectedAmenities, toggleAmenity, roomTypes, resetFilters }: any) {
    const allCats = ['All', ...roomTypes.map((t: any) => t.name)];

    return (
        <div className="space-y-10">
             <div>
                <h3 className="text-[#2D5016] text-xs font-black uppercase tracking-widest mb-4">Category</h3>
                <div className="grid grid-cols-2 gap-2">
                    {allCats.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all
                                ${activeCategory === cat
                                    ? 'bg-[#2D5016] text-white border-[#2D5016]'
                                    : 'bg-white border-[#2D5016]/10 text-neutral-500'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <h3 className="text-[#2D5016] text-xs font-black uppercase tracking-widest mb-4">Max Budget: {maxPrice.toLocaleString()} FCFA</h3>
                <div className="bg-white rounded-xl p-4 border border-[#2D5016]/10">
                    <input
                        type="range" min="25000" max="1000000" step="5000" value={maxPrice}
                        onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                        className="w-full accent-[#2D5016]"
                    />
                </div>
            </div>
            <div>
                <h3 className="text-[#2D5016] text-xs font-black uppercase tracking-widest mb-4">Amenities</h3>
                <div className="flex flex-wrap gap-1.5">
                    {amenities.map((a: any) => (
                        <button
                            key={a.id}
                            onClick={() => toggleAmenity(a.id)}
                            className={`px-3 py-2 rounded-full border text-[10px] font-semibold transition-all
                                ${selectedAmenities.includes(a.id)
                                    ? 'bg-[#6B9E3F] text-white border-[#6B9E3F]'
                                    : 'bg-white text-neutral-500 border-[#2D5016]/10 hover:border-[#2D5016]/30'}`}
                        >
                            {a.name}
                        </button>
                    ))}
                </div>
            </div>
            <button
                onClick={resetFilters}
                className="w-full py-4 text-xs font-bold text-red-500 border-2 border-dashed border-red-200 hover:bg-red-50/50 rounded-xl transition-all"
            >
                Reset All Filters
            </button>
        </div>
    );
}
