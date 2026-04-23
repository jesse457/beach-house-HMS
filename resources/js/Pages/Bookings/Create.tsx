import React, { useState, useMemo, useEffect } from 'react'
import { useForm, Head, Link, usePage } from '@inertiajs/react'
import {
  CreditCard,
  Banknote,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ShoppingBag,
  Trash2,
  Loader2,
  Users,
  Calendar as CalendarIcon,
  AlertCircle,
  XCircle,
  Info
} from 'lucide-react'
import Layout from '../../Layouts/Layout'
import { Button } from '../../Components/ui/Button'
import { useCart } from '../../Context/CartContext'

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Pay securely now' },
  { id: 'mobile_money', label: 'Mobile Money', icon: Banknote, desc: 'Orange / MTN Money' },
  { id: 'cash', label: 'Pay at Hotel', icon: Banknote, desc: 'Payment during check-in' },
]

// Updated Input class to handle error states
const getInputCls = (hasError: any) => `
  w-full rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:ring-[#2D5016] bg-white transition-all shadow-sm outline-none placeholder:text-neutral-300
  ${hasError ? 'border-red-500 ring-1 ring-red-500' : 'border-neutral-200'}
`
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
  useEffect(() => {
    if (isHydrated) setData('room_ids', items.map(item => item.id));
  }, [items, isHydrated]);

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

  // Guard: Not Hydrated
  if (!isHydrated) return (
    <Layout><div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#2D5016]" size={32} /></div></Layout>
  );

  // Guard: Empty Cart
  if (items.length === 0) return (
    <Layout>
      <div className="h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-6 text-neutral-400">
            <ShoppingBag size={32} />
        </div>
        <h2 className="text-3xl font-black text-[#2D5016] italic">Your cart is empty</h2>
        <p className="text-neutral-500 mt-2 max-w-sm">You haven't selected any luxury rooms yet. Please browse our collection to begin.</p>
        <Link href="/rooms" className="mt-8 px-8 py-4 bg-[#2D5016] text-white rounded-2xl font-bold transition-transform hover:scale-105">Browse Rooms</Link>
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

        {/* Global Error Banner */}
        {Object.keys(errors).length > 0 && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600">
                <XCircle className="shrink-0 mt-0.5" size={18} />
                <div>
                    <p className="text-sm font-bold uppercase tracking-wider">Please fix the following errors:</p>
                    <ul className="text-xs mt-1 list-disc list-inside opacity-80">
                        {Object.values(errors).map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                </div>
            </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          <div className="lg:col-span-8 space-y-12">

            {/* 1. ROOMS SUMMARY */}
            <section>
              <h2 className={labelCls}><ShoppingBag size={14}/> Selected Rooms</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {items.map((room) => (
                  <div key={room.id} className="flex items-center justify-between p-4 bg-white rounded-3xl border border-neutral-100 shadow-sm">
                    <div className="flex items-center gap-4">
                      <img src={room.image} className="w-16 h-16 rounded-2xl object-cover" alt={room.name} />
                      <div>
                        <p className="text-sm font-bold text-[#2D5016]">{room.name}</p>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase">XAF {room.price_per_night} / night</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeFromCart(room.id)} className="p-2 text-neutral-300 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
              {errors.room_ids && <p className="text-red-500 text-[10px] mt-2 font-bold uppercase">{errors.room_ids}</p>}
            </section>

            {/* 2. GUEST & OCCUPANCY */}
            <section className="bg-white rounded-[2.5rem] p-8 border border-neutral-100 shadow-sm">
              <h2 className={labelCls}><Users size={14}/> Guest Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="md:col-span-2">
                    <input type="text" className={getInputCls(errors.name)} placeholder="Full Name (as per ID)" value={data.name} onChange={e => setData('name', e.target.value)} />
                    {errors.name && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.name}</p>}
                </div>

                <div>
                    <input type="email" className={getInputCls(errors.email)} placeholder="Email Address" value={data.email} onChange={e => setData('email', e.target.value)} />
                    {errors.email && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.email}</p>}
                </div>

                <div>
                    <input type="tel" className={getInputCls(errors.phone)} placeholder="Phone Number" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                    {errors.phone && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.phone}</p>}
                </div>

                <div className="md:col-span-1">
                    <input type="text" className={getInputCls(errors.id_card_number)} placeholder="ID / Passport Number" value={data.id_card_number} onChange={e => setData('id_card_number', e.target.value)} />
                    {errors.id_card_number && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.id_card_number}</p>}
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="text-[9px] font-black text-neutral-400 ml-1 uppercase mb-1 block">Adults</label>
                        <input type="number" min="1" className={getInputCls(errors.adults_count)} value={data.adults_count} onChange={e => setData('adults_count', parseInt(e.target.value))} />
                    </div>
                    <div className="flex-1">
                        <label className="text-[9px] font-black text-neutral-400 ml-1 uppercase mb-1 block">Children</label>
                        <input type="number" min="0" className={getInputCls(errors.children_count)} value={data.children_count} onChange={e => setData('children_count', parseInt(e.target.value))} />
                    </div>
                </div>

                <div className="md:col-span-2">
                    <input type="text" className={getInputCls(errors.address)} placeholder="Residential Address" value={data.address} onChange={e => setData('address', e.target.value)} />
                    {errors.address && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.address}</p>}
                </div>
                <div className="md:col-span-2">
                    <textarea rows={3} className={getInputCls(false)} placeholder="Special requests or notes (Optional)" value={data.notes} onChange={e => setData('notes', e.target.value)} />
                </div>
              </div>
            </section>

            {/* 3. CALENDAR STAY */}
            <section className="bg-white rounded-[2.5rem] p-8 border border-neutral-100 shadow-sm">
                <h2 className={labelCls}><CalendarIcon size={14}/> Select Stay Period</h2>

                {/* Specific Date Errors */}
                {(errors.checked_in_at || errors.checked_out_at) && (
                    <div className="mb-4 text-red-500 text-[10px] font-bold uppercase flex items-center gap-1">
                        <AlertCircle size={12}/> {errors.checked_in_at || errors.checked_out_at}
                    </div>
                )}

                <div className={`border rounded-[2rem] overflow-hidden mt-6 transition-colors ${errors.checked_in_at ? 'border-red-500 shadow-sm shadow-red-100' : 'border-neutral-100'}`}>
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

                    <div className="pt-6 border-t border-white/10 space-y-3">
                        <div className="flex justify-between">
                            <span className="opacity-60">Subtotal</span>
                            <span className="font-bold">XAF {subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="opacity-60">Taxes (10%)</span>
                            <span className="font-bold">XAF {taxes.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-end pt-4">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Grand Total</span>
                            <span className="text-4xl font-black italic">XAF {total.toLocaleString()}</span>
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
                                    ${errors.payment_method && data.payment_method !== m.id ? 'border-red-500/50' : ''}
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
                    {errors.payment_method && <p className="text-red-400 text-center text-[9px] font-black uppercase tracking-widest mt-2">{errors.payment_method}</p>}
                </div>

                <Button
                    type="submit"
                    disabled={processing || nights < 1}
                    className="w-full h-20 bg-[#6B9E3F] hover:bg-[#7db84a] text-white rounded-3xl mt-10 font-black uppercase tracking-[0.2em] text-xs shadow-xl transition-transform hover:scale-[1.02] flex items-center justify-center gap-3"
                >
                    {processing ? (
                        <div className="flex items-center gap-2">
                             <Loader2 className="animate-spin" size={18} />
                             Processing...
                        </div>
                    ) : <>Confirm Stay <ArrowRight size={18}/></>}
                </Button>

                {/* Inline contextual warnings */}
                {nights < 1 && (
                    <div className="flex items-center justify-center gap-2 text-red-300 mt-4">
                        <Info size={12}/>
                        <p className="text-[9px] font-bold uppercase tracking-wider">Please select stay dates</p>
                    </div>
                )}
                {!data.payment_method && nights >= 1 && (
                    <div className="flex items-center justify-center gap-2 text-yellow-300 mt-4">
                        <Info size={12}/>
                        <p className="text-[9px] font-bold uppercase tracking-wider">Select a payment method</p>
                    </div>
                )}
            </div>
          </div>

        </form>
      </div>
    </Layout>
  )
}
