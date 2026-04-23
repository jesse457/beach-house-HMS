import React, { useState, useMemo, useEffect } from 'react'
import { useForm, Head, Link } from '@inertiajs/react'
import {
  CreditCard,
  Banknote,
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
  ArrowRight,
  ShoppingBag,
  Trash2,
  Loader2,
  Users,
  Calendar as CalendarIcon,
  MapPin
} from 'lucide-react'
import Layout from '../../Layouts/Layout'
import { Button } from '../../Components/ui/Button'
import { useCart } from '../../Context/CartContext'

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Pay securely now' },
  { id: 'mobile_money', label: 'Mobile Money', icon: Banknote, desc: 'Orange / MTN Money' },
  { id: 'cash', label: 'Pay at Hotel', icon: Banknote, desc: 'Payment during check-in' },
]

const inputCls = 'w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#2D5016] bg-white transition-all shadow-sm outline-none placeholder:text-neutral-300'
const labelCls = 'flex items-center gap-2 text-[11px] font-bold text-[#2D5016] mb-2 uppercase tracking-widest'

const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
const toISO = (d: Date) => d.toISOString().split('T')[0];

export default function BookingPage() {
  const cart = useCart();
  const { items, totalPrice: cartBasePrice, removeFromCart, clearCart, isHydrated } = cart;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewDate, setViewDate] = useState(new Date())
  const [rangeStart, setRangeStart] = useState<Date | null>(null)
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null)
  const [hovered, setHovered] = useState<Date | null>(null)

  const { data, setData, post, processing, errors } = useForm({
    room_ids: [] as number[],
    checked_in_at: '',
    checked_out_at: '',
    payment_method: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    id_card_number: '',
    adults_count: 1,
    children_count: 0,
    notes: '',
  });

  // Sync rooms from cart
  const itemIdsString = useMemo(() => items.map(i => i.id).join(','), [items]);
  useEffect(() => {
    if (isHydrated) setData('room_ids', items.map(item => item.id));
  }, [itemIdsString, isHydrated]);

  // Pricing Logic
  const nights = useMemo(() => {
    if (!rangeStart || !rangeEnd) return 0;
    const diff = Math.round((rangeEnd.getTime() - rangeStart.getTime()) / 86400000);
    return diff <= 0 ? 1 : diff;
  }, [rangeStart, rangeEnd]);

  const subtotal = nights * cartBasePrice;
  const taxes = subtotal * 0.1;
  const total = subtotal + taxes;

  const handleDayClick = (day: Date) => {
    if (day < today) return
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(day); setRangeEnd(null)
      setData(prev => ({ ...prev, checked_in_at: toISO(day), checked_out_at: '' }))
    } else if (day <= rangeStart) {
      setRangeStart(day); setRangeEnd(null)
      setData(prev => ({ ...prev, checked_in_at: toISO(day), checked_out_at: '' }))
    } else {
      setRangeEnd(day)
      setData('checked_out_at', toISO(day))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/bookings', {
      onSuccess: () => clearCart(),
      onError: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
    });
  };

  if (!isHydrated) return (
    <Layout>
        <div className="h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-[#2D5016]" size={32} />
        </div>
    </Layout>
  );

  return (
    <Layout>
      <Head title="Checkout | Finalize Luxury Booking" />
      <div className="max-w-7xl mx-auto py-16 px-4">

        <header className="mb-12">
            <h1 className="text-5xl font-black text-[#2D5016] tracking-tighter italic">Checkout.</h1>
            <p className="text-neutral-500 mt-2 font-medium">Complete your reservation for a world-class experience.</p>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          <div className="lg:col-span-8 space-y-12">

            {/* 1. ROOMS SUMMARY */}
            <section>
              <h2 className={labelCls}><ShoppingBag size={14}/> Selected Rooms</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {items.map((room) => (
                  <div key={room.id} className="flex items-center justify-between p-4 bg-white rounded-3xl border border-neutral-100 shadow-sm group">
                    <div className="flex items-center gap-4">
                      <img src={room.image} className="w-16 h-16 rounded-2xl object-cover" alt={room.name} />
                      <div>
                        <p className="text-sm font-bold text-[#2D5016]">{room.name}</p>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase">${room.price_per_night} / night</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeFromCart(room.id)} className="p-2 text-neutral-300 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. GUEST & OCCUPANCY */}
            <section className="bg-white rounded-[2.5rem] p-8 border border-neutral-100 shadow-sm">
              <h2 className={labelCls}><Users size={14}/> Guest Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="md:col-span-2">
                    <input type="text" required className={inputCls} placeholder="Full Name (as per ID)" value={data.name} onChange={e => setData('name', e.target.value)} />
                    {errors.name && <p className="text-red-500 text-[10px] mt-1">{errors.name}</p>}
                </div>
                <input type="email" required className={inputCls} placeholder="Email Address" value={data.email} onChange={e => setData('email', e.target.value)} />
                <input type="tel" required className={inputCls} placeholder="Phone Number" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                <input type="text" required className={inputCls} placeholder="ID / Passport Number" value={data.id_card_number} onChange={e => setData('id_card_number', e.target.value)} />

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="text-[9px] font-black text-neutral-400 ml-1 uppercase mb-1 block">Adults</label>
                        <input type="number" min="1" className={inputCls} value={data.adults_count} onChange={e => setData('adults_count', parseInt(e.target.value))} />
                    </div>
                    <div className="flex-1">
                        <label className="text-[9px] font-black text-neutral-400 ml-1 uppercase mb-1 block">Children</label>
                        <input type="number" min="0" className={inputCls} value={data.children_count} onChange={e => setData('children_count', parseInt(e.target.value))} />
                    </div>
                </div>

                <div className="md:col-span-2">
                    <input type="text" className={inputCls} placeholder="Residential Address" value={data.address} onChange={e => setData('address', e.target.value)} />
                </div>
                <div className="md:col-span-2">
                    <textarea rows={3} className={inputCls} placeholder="Special requests or notes (Optional)" value={data.notes} onChange={e => setData('notes', e.target.value)} />
                </div>
              </div>
            </section>

            {/* 3. CALENDAR STAY */}
            <section className="bg-white rounded-[2.5rem] p-8 border border-neutral-100 shadow-sm">
                <h2 className={labelCls}><CalendarIcon size={14}/> Select Stay Period</h2>
                <div className="border border-neutral-100 rounded-[2rem] overflow-hidden mt-6">
                    <div className="flex items-center justify-between px-8 py-5 bg-[#2D5016] text-white">
                        <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}><ChevronLeft /></button>
                        <span className="text-sm font-black uppercase tracking-widest">{viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                        <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}><ChevronRight /></button>
                    </div>
                    <div className="grid grid-cols-7 p-6 gap-1">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <span key={d} className="text-center text-[10px] font-bold text-neutral-300 mb-4">{d}</span>)}
                        {Array.from({ length: new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay() }).map((_, i) => <div key={i} />)}
                        {Array.from({ length: new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate() }, (_, i) => {
                            const day = new Date(viewDate.getFullYear(), viewDate.getMonth(), i + 1);
                            const isPast = day < today;
                            const isStart = rangeStart && isSameDay(day, rangeStart);
                            const isEnd = rangeEnd && isSameDay(day, rangeEnd);
                            const inRange = rangeStart && rangeEnd && day > rangeStart && day < rangeEnd;

                            return (
                                <button
                                    key={i} type="button" disabled={isPast}
                                    onClick={() => handleDayClick(day)}
                                    className={`h-12 rounded-xl text-sm transition-all
                                        ${isPast ? 'text-neutral-200 cursor-not-allowed' : 'text-neutral-700 hover:bg-neutral-50'}
                                        ${isStart || isEnd ? 'bg-[#2D5016] text-white font-bold shadow-lg scale-110 z-10' : ''}
                                        ${inRange ? 'bg-[#2D5016]/10 text-[#2D5016] rounded-none' : ''}
                                    `}
                                >
                                    {i + 1}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </section>
          </div>

          {/* 4. SIDEBAR SUMMARY */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-[#2D5016] text-white rounded-[3rem] p-10 shadow-2xl sticky top-24">
                <h3 className="text-xl font-bold mb-8 flex items-center gap-2">Reservation Summary</h3>

                <div className="space-y-6 text-sm">
                    <div className="flex justify-between items-center opacity-70">
                        <span>Accommodations</span>
                        <span className="font-bold">{items.length} Rooms</span>
                    </div>
                    <div className="flex justify-between items-center opacity-70">
                        <span>Length of Stay</span>
                        <span className="font-bold">{nights} Nights</span>
                    </div>
                    <div className="flex justify-between items-center opacity-70">
                        <span>Occupancy</span>
                        <span className="font-bold">{data.adults_count + data.children_count} Guests</span>
                    </div>

                    <div className="pt-6 border-t border-white/10 space-y-3">
                        <div className="flex justify-between">
                            <span className="opacity-60">Subtotal</span>
                            <span className="font-bold">${subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="opacity-60">Taxes (10%)</span>
                            <span className="font-bold">${taxes.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-end pt-4">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Grand Total</span>
                            <span className="text-4xl font-black italic">${total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-12 space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-4 block text-center">Select Payment Method</label>
                    <div className="grid grid-cols-1 gap-3">
                        {PAYMENT_METHODS.map(m => (
                            <button
                                key={m.id} type="button"
                                onClick={() => setData('payment_method', m.id)}
                                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left
                                    ${data.payment_method === m.id ? 'bg-white text-[#2D5016] border-white' : 'border-white/10 hover:border-white/30'}
                                `}
                            >
                                <m.icon size={20} />
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest">{m.label}</p>
                                    <p className="text-[9px] opacity-60">{m.desc}</p>
                                </div>
                                {data.payment_method === m.id && <Check size={16} className="ml-auto" />}
                            </button>
                        ))}
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={processing || nights < 1 || !data.payment_method}
                    className="w-full h-20 bg-[#6B9E3F] hover:bg-[#7db84a] text-white rounded-3xl mt-10 font-black uppercase tracking-[0.2em] text-xs shadow-xl transition-transform hover:scale-[1.02] flex items-center justify-center gap-3"
                >
                    {processing ? <Loader2 className="animate-spin" /> : <>Confirm Stay <ArrowRight size={18}/></>}
                </Button>

                {nights < 1 && <p className="text-center text-[9px] font-bold text-red-300 mt-4 uppercase">Select your stay dates to continue</p>}
            </div>
          </div>

        </form>
      </div>
    </Layout>
  )
}
