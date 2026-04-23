import React, { useState, useMemo, useEffect } from 'react'
import { Link, Head } from '@inertiajs/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowRight, ShoppingBag, Star, X, Check, Wifi, Tv, Wind,
    SlidersHorizontal, Search, Trash2, MapPin, Coffee, Utensils
} from 'lucide-react'
import Layout from '../../Layouts/Layout'
import { useCart } from '../../Context/CartContext'

// --- Types ---
interface Amenity { id: number; name: string; icon: string; }
interface RoomType { id: number; name: string; description: string; }
interface Room {
    id: number;
    room_number: string;
    room_type_id: number;
    price_per_night: string;
    pictures: string[] | null;
    room_type: RoomType;
    amenities: Amenity[];
}

interface RoomsProps {
    rooms: Room[];
    roomTypes: RoomType[];
    amenities: Amenity[];
}

export default function Rooms({ rooms = [], roomTypes = [], amenities = [] }: RoomsProps) {
    const [activeCategory, setActiveCategory] = useState('All');
    const [maxPrice, setMaxPrice] = useState(500000); // 500k XAF Default
    const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // --- Filter Logic ---
    const filteredRooms = useMemo(() => {
        return rooms.filter(room => {
            const matchesCat = activeCategory === 'All' || room.room_type.name === activeCategory;
            const matchesPrice = parseFloat(room.price_per_night) <= maxPrice;
            const matchesAmenities = selectedAmenities.length === 0 ||
                selectedAmenities.every(id => room.amenities.some(a => a.id === id));
            return matchesCat && matchesPrice && matchesAmenities;
        });
    }, [rooms, activeCategory, maxPrice, selectedAmenities]);

    const toggleAmenity = (id: number) => {
        setSelectedAmenities(prev =>
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        );
    };

    const resetFilters = () => {
        setActiveCategory('All');
        setMaxPrice(1000000);
        setSelectedAmenities([]);
    };

    const getUrl = (path: string) => {
        if (!path) return 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80';
        return path.startsWith('http') ? path : `/storage/${path}`;
    };

    return (
        <Layout>
            <Head title="Luxury Rooms & Suites | Cameroon" />

            <div className="min-h-screen bg-[#FAF9F6]">
                {/* --- ELEGANT HERO --- */}
                <div className="bg-[#2D5016] pt-40 pb-24 text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
                    <div className="relative z-10 px-4">
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[#6B9E3F] text-xs font-black uppercase tracking-[0.5em] block mb-4"
                        >
                            The Art of Living
                        </motion.span>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-serif italic text-[#F5F2E8] tracking-tight"
                        >
                            Suites & Sanctuaries
                        </motion.h1>
                    </div>
                </div>

                {/* --- MAIN CONTENT AREA --- */}
                <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12">
                    <div className="flex flex-col lg:flex-row gap-12">

                        {/* --- SIDEBAR FILTERS (Desktop) --- */}
                        <aside className="hidden lg:block w-80 sticky top-28 h-fit space-y-10">
                            <div>
                                <h3 className="text-[#2D5016] text-xs font-black uppercase tracking-widest mb-6">Filter by Category</h3>
                                <div className="space-y-2">
                                    {['All', ...roomTypes.map(t => t.name)].map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setActiveCategory(cat)}
                                            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-between
                                                ${activeCategory === cat ? 'bg-[#2D5016] text-white shadow-lg' : 'hover:bg-white text-neutral-500'}`}
                                        >
                                            {cat}
                                            {activeCategory === cat && <Check size={14} />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-[#2D5016] text-xs font-black uppercase tracking-widest">Budget Per Night</h3>
                                    <span className="text-[10px] font-bold text-[#6B9E3F]">XAF</span>
                                </div>
                                <input
                                    type="range" min="25000" max="1000000" step="5000" value={maxPrice}
                                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                                    className="w-full accent-[#2D5016] h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between mt-4">
                                    <span className="text-[10px] font-bold text-neutral-400">25,000</span>
                                    <span className="text-sm font-black text-[#2D5016]">{maxPrice.toLocaleString()} XAF</span>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-[#2D5016] text-xs font-black uppercase tracking-widest mb-6">Amenities</h3>
                                <div className="grid grid-cols-1 gap-2">
                                    {amenities.map(a => (
                                        <button
                                            key={a.id}
                                            onClick={() => toggleAmenity(a.id)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-xs font-bold transition-all
                                                ${selectedAmenities.includes(a.id)
                                                    ? 'bg-[#6B9E3F]/10 border-[#6B9E3F] text-[#2D5016]'
                                                    : 'bg-white border-neutral-100 text-neutral-500 hover:border-neutral-300'}`}
                                        >
                                            <div className={`w-2 h-2 rounded-full ${selectedAmenities.includes(a.id) ? 'bg-[#6B9E3F]' : 'bg-neutral-200'}`} />
                                            {a.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={resetFilters}
                                className="w-full py-4 rounded-xl border-2 border-dashed border-neutral-200 text-neutral-400 text-[10px] font-black uppercase tracking-widest hover:border-red-200 hover:text-red-500 transition-all flex items-center justify-center gap-2"
                            >
                                <Trash2 size={14} /> Reset All Filters
                            </button>
                        </aside>

                        {/* --- MOBILE FILTER TOGGLE --- */}
                        <div className="lg:hidden flex items-center justify-between bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm">
                            <button
                                onClick={() => setIsMobileFilterOpen(true)}
                                className="flex items-center gap-2 text-sm font-bold text-[#2D5016]"
                            >
                                <SlidersHorizontal size={18} /> Filters
                            </button>
                            <span className="text-xs font-bold text-neutral-400">{filteredRooms.length} Spaces found</span>
                        </div>

                        {/* --- ROOM GRID --- */}
                        <div className="flex-1">
                            <div className="mb-10 hidden lg:flex items-center justify-between">
                                <h2 className="text-2xl font-serif text-[#2D5016]">
                                    Discovering <span className="italic">{activeCategory}</span>
                                </h2>
                                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                                    {filteredRooms.length} Results Found
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
                                <AnimatePresence mode='popLayout'>
                                    {filteredRooms.map((room, i) => (
                                        <RoomCard key={room.id} room={room} index={i} getUrl={getUrl} />
                                    ))}
                                </AnimatePresence>
                            </div>

                            {filteredRooms.length === 0 && (
                                <div className="py-40 text-center">
                                    <Search size={48} className="mx-auto text-neutral-200 mb-4" />
                                    <h3 className="text-xl font-bold text-[#2D5016]">No matching sanctuaries</h3>
                                    <p className="text-neutral-500 mt-2">Try adjusting your price range or amenities.</p>
                                    <button onClick={resetFilters} className="mt-6 text-[#6B9E3F] font-bold border-b border-[#6B9E3F]">Clear all filters</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MOBILE FILTER DRAWER --- */}
            {isMobileFilterOpen && (
                <div className="fixed inset-0 z-[100] lg:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)} />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        className="absolute right-0 top-0 bottom-0 w-[85%] bg-[#FAF9F6] p-8 overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-bold text-[#2D5016]">Filters</h3>
                            <button onClick={() => setIsMobileFilterOpen(false)}><X /></button>
                        </div>
                        {/* Mobile content mirrors desktop sidebar */}
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

function RoomCard({ room, index, getUrl }: { room: Room, index: number, getUrl: any }) {
    const { items, addToCart, removeFromCart } = useCart();
    const isInCart = items.some(item => item.id === room.id);
    const mainImage = room.pictures && room.pictures.length > 0 ? getUrl(room.pictures[0]) : '';

    const handleCartToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isInCart) {
            removeFromCart(room.id);
        } else {
            addToCart({
                id: room.id,
                name: `${room.room_type.name} - No. ${room.room_number}`,
                price_per_night: room.price_per_night,
                image: mainImage
            });
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className="group bg-white rounded-[2rem] overflow-hidden border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-500"
        >
            <div className="relative h-80 overflow-hidden">
                <img
                    src={mainImage}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    alt={room.room_type.name}
                />
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-2">
                    <Star size={12} className="text-[#6B9E3F]" fill="currentColor" />
                    <span className="text-[10px] font-black text-[#2D5016]">4.9</span>
                </div>
                <div className="absolute top-6 right-6 bg-[#2D5016] text-white px-5 py-2 rounded-2xl">
                    <span className="text-lg font-black">{parseInt(room.price_per_night).toLocaleString()}</span>
                    <span className="text-[10px] font-bold text-[#6B9E3F] ml-1">XAF</span>
                </div>
            </div>

            <div className="p-8">
                <div className="mb-4">
                    <h3 className="text-2xl font-serif text-[#2D5016] mb-1">{room.room_type.name}</h3>
                    <div className="flex items-center gap-2 text-neutral-400">
                        <MapPin size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Main Wing, Suite {room.room_number}</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                    {room.amenities.slice(0, 3).map(a => (
                        <div key={a.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-50 text-neutral-500 border border-neutral-100 text-[10px] font-bold">
                            <AmenityIcon name={a.name} />
                            {a.name}
                        </div>
                    ))}
                </div>

                <div className="flex gap-3 h-14">
                    <Link
                        href={`/rooms/${room.id}`}
                        className="flex-1 bg-[#2D5016] hover:bg-[#3d691e] text-white rounded-2xl flex items-center justify-center text-xs font-black uppercase tracking-widest transition-all"
                    >
                        View Space
                    </Link>
                    <button
                        onClick={handleCartToggle}
                        className={`w-14 flex items-center justify-center rounded-2xl border-2 transition-all
                            ${isInCart ? 'bg-[#6B9E3F] border-[#6B9E3F] text-white' : 'border-neutral-100 text-[#2D5016] hover:bg-neutral-50'}`}
                    >
                        {isInCart ? <Check /> : <ShoppingBag size={20} />}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

// Helper for Icons
function AmenityIcon({ name }: { name: string }) {
    const n = name.toLowerCase();
    if (n.includes('wifi')) return <Wifi size={12} />;
    if (n.includes('tv')) return <Tv size={12} />;
    if (n.includes('air') || n.includes('ac')) return <Wind size={12} />;
    if (n.includes('breakfast')) return <Utensils size={12} />;
    return <Coffee size={12} />;
}

// Reusable Filter Content Component
function SidebarContent({ activeCategory, setActiveCategory, maxPrice, setMaxPrice, amenities, selectedAmenities, toggleAmenity, roomTypes, resetFilters }: any) {
    return (
        <div className="space-y-10">
             <div>
                <h3 className="text-[#2D5016] text-xs font-black uppercase tracking-widest mb-6">Category</h3>
                <div className="grid grid-cols-2 gap-2">
                    {['All', ...roomTypes.map((t:any) => t.name)].map(cat => (
                        <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${activeCategory === cat ? 'bg-[#2D5016] text-white border-[#2D5016]' : 'bg-white border-neutral-200 text-neutral-400'}`}>{cat}</button>
                    ))}
                </div>
            </div>
            <div>
                <h3 className="text-[#2D5016] text-xs font-black uppercase tracking-widest mb-6">Max Budget: {maxPrice.toLocaleString()} XAF</h3>
                <input type="range" min="25000" max="1000000" step="5000" value={maxPrice} onChange={(e) => setMaxPrice(parseInt(e.target.value))} className="w-full accent-[#2D5016]" />
            </div>
            <div>
                <h3 className="text-[#2D5016] text-xs font-black uppercase tracking-widest mb-6">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                    {amenities.map((a:any) => (
                        <button key={a.id} onClick={() => toggleAmenity(a.id)} className={`px-4 py-2 rounded-xl border text-[10px] font-bold transition-all ${selectedAmenities.includes(a.id) ? 'bg-[#6B9E3F] text-white border-[#6B9E3F]' : 'bg-white text-neutral-500 border-neutral-200'}`}>{a.name}</button>
                    ))}
                </div>
            </div>
            <button onClick={resetFilters} className="w-full py-4 text-xs font-bold text-red-500 border-2 border-dashed border-red-100 rounded-2xl">Reset All</button>
        </div>
    );
}
