import React, { useState, useMemo, useEffect } from 'react'
import { useForm, Link, router, PageProps } from '@inertiajs/react'
import SEO from '../Components/SEO'
import {
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
  Info,
  Check,
  CreditCard,
  MapPin,
  FileText
} from 'lucide-react'
import {
    motion
} from "framer-motion";
import Layout from '../../Layouts/Layout'
import { Button } from '../../Components/ui/Button'
import { useCart } from '../../Context/CartContext'

// Types for Inertia page props
interface BookingPageProps extends PageProps {
  errors: {
    room_ids?: string;
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    id_card_number?: string;
    adults_count?: string;
    children_count?: string;
    checked_in_at?: string;
    checked_out_at?: string;
    system_error?: string;
    [key: string]: string | undefined;
  };
}

const getInputCls = (hasError: any) => `
  w-full rounded-xl border px-4 py-3 text-sm focus:ring-1 focus:ring-[#2D5016] focus:border-[#2D5016] bg-white transition-all shadow-xs outline-none placeholder:text-neutral-300
  ${hasError ? 'border-red-500 ring-1 ring-red-500 bg-red-50/10' : 'border-[#2D5016]/15 hover:border-[#2D5016]/30'}
`
const labelCls = 'flex items-center gap-2.5 text-xs font-black text-[#2D5016] mb-4 uppercase tracking-widest'

const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

const toLocalDate = (d: Date): string => {
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().split('T')[0];
};

const parseLocalDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// ─── REVEAL ANIMATION ───
const Reveal = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
  >
    {children}
  </motion.div>
);

export default function BookingPage({ errors: inertiaErrors }: BookingPageProps) {
  const cart = useCart();
  const { items, totalPrice: cartBasePrice, removeFromCart, clearCart, isHydrated } = cart;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewDate, setViewDate] = useState(new Date())
  const [rangeStart, setRangeStart] = useState<Date | null>(null)
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null)
  const [isSuccess, setIsSuccess] = useState(false);

  const { data, setData, post, processing, errors } = useForm({
    room_ids: [] as number[],
    checked_in_at: '',
    checked_out_at: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    id_card_number: '',
    adults_count: 1,
    children_count: 0,
    notes: '',
  });

  useEffect(() => {
    if (isHydrated) setData('room_ids', items.map(item => item.id));
  }, [items, isHydrated]);

  useEffect(() => {
    if (data.checked_in_at) setRangeStart(parseLocalDate(data.checked_in_at));
    if (data.checked_out_at) setRangeEnd(parseLocalDate(data.checked_out_at));
  }, [data.checked_in_at, data.checked_out_at]);

  const nights = useMemo(() => {
    if (!rangeStart || !rangeEnd) return 0;
    const diff = Math.round((rangeEnd.getTime() - rangeStart.getTime()) / 86400000);
    return diff <= 0 ? 1 : diff;
  }, [rangeStart, rangeEnd]);

  const subtotal = nights * cartBasePrice;
  const total = subtotal;

  const handleDayClick = (day: Date) => {
    if (day < today) return
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(day); setRangeEnd(null)
      setData(prev => ({ ...prev, checked_in_at: toLocalDate(day), checked_out_at: '' }))
    } else {
      setRangeEnd(day)
      setData('checked_out_at', toLocalDate(day))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/bookings', {
      preserveScroll: true,
      onSuccess: (page) => {
        const pageErrors = page.props.errors as BookingPageProps['errors'] | undefined;
        if (pageErrors && Object.keys(pageErrors).length > 0) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
        setIsSuccess(true);

        setTimeout(() => {
          clearCart();
          router.visit('/');
        }, 4000);
      },
      onError: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    });
  };

  if (!isHydrated) return (
    <Layout>
      <div className="h-screen bg-[#F5F2E8] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#2D5016]" size={32} />
      </div>
    </Layout>
  );

  if (isSuccess) return (
    <Layout>
      <SEO
        title="Booking Confirmed | Beach House Botaland"
        description="Your reservation at Beach House Botaland has been submitted successfully."
        noIndex
      />
      <div className="min-h-[85vh] bg-[#F5F2E8] flex flex-col items-center justify-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-10 rounded-[2rem] border border-[#2D5016]/10 shadow-xl max-w-lg w-full"
        >
          <div className="w-20 h-20 bg-[#2D5016]/10 rounded-full flex items-center justify-center mb-6 text-[#2D5016] mx-auto">
            <Check size={36} strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-serif text-[#2D5016] italic mb-4">Stay Reserved!</h2>
          <p className="text-neutral-500 text-sm md:text-base leading-relaxed">
            Thank you for choosing Beach House Botaland. Your reservation request was submitted successfully.
          </p>
          <p className="text-neutral-400 text-xs mt-3">
            Preparing your travel voucher details... Redirecting shortly.
          </p>
          <div className="mt-8 flex justify-center">
            <Loader2 className="animate-spin text-[#2D5016]/40" size={24} />
          </div>
        </motion.div>
      </div>
    </Layout>
  );

  if (items.length === 0) return (
    <Layout>
      <div className="min-h-[80vh] bg-[#F5F2E8] flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-[#EAE6D6] rounded-full flex items-center justify-center mb-6 text-[#2D5016]/40">
          <ShoppingBag size={28} />
        </div>
        <h2 className="text-3xl font-serif text-[#2D5016] italic">Your cart is empty</h2>
        <p className="text-neutral-500 mt-2 max-w-sm text-sm">You haven't selected any luxury suites or rooms yet. Browse our inventory to begin your reservation.</p>
        <Link
          href="/rooms"
          className="mt-8 px-8 py-3.5 bg-[#2D5016] text-[#F5F2E8] rounded-xl font-bold transition-all hover:bg-[#3d691e] shadow-md text-xs uppercase tracking-wider"
        >
          Browse Accommodations
        </Link>
      </div>
    </Layout>
  );

  const allErrors = { ...errors, ...inertiaErrors };

  return (
    <Layout>
      <SEO
        title="Checkout | Secure Luxury Reservation"
        description="Complete your reservation at Beach House Botaland. Secure checkout for your luxury stay in Limbe, Cameroon."
        noIndex
      />
      <div className="bg-[#F5F2E8] min-h-screen pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* PAGE HEADER */}
          <header className="mb-12 border-b border-[#2D5016]/10 pb-6">
            <h1 className="text-4xl sm:text-5xl font-serif text-[#2D5016] italic leading-none">
              Checkout
            </h1>
            <p className="text-neutral-500 mt-2.5 text-sm">
              Finalize details to request and secure your custom stays with our team.
            </p>
          </header>

          {/* GLOBAL SYSTEM ERRORS */}
          {allErrors.system_error && (
            <div className="mb-8 p-5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3.5 text-red-700 shadow-xs">
              <AlertCircle className="shrink-0 mt-0.5 text-red-500" size={20} />
              <div>
                <p className="text-sm font-bold uppercase tracking-wider">Service Temporarily Unavailable</p>
                <p className="text-xs mt-1 opacity-90">{allErrors.system_error}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-3 text-xs font-bold text-[#2D5016] hover:underline"
                >
                  Retry Secure Checkout
                </button>
              </div>
            </div>
          )}

          {/* INPUT FORM ERRORS BOX */}
          {Object.keys(allErrors).filter(k => k !== 'system_error').length > 0 && (
            <div className="mb-8 p-5 bg-red-50 border border-red-150 rounded-2xl flex items-start gap-3.5 text-red-600 shadow-xs">
              <XCircle className="shrink-0 mt-0.5 text-red-500" size={20} />
              <div>
                <p className="text-sm font-bold uppercase tracking-wider">Validation Errors Identified</p>
                <ul className="text-xs mt-2 list-disc list-inside space-y-1 opacity-90">
                  {Object.entries(allErrors)
                    .filter(([key]) => key !== 'system_error')
                    .map(([_, err], i) => <li key={i}>{err as string}</li>)}
                </ul>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">

            {/* LEFT COLUMN FORM PARTS */}
            <div className="lg:col-span-8 space-y-8">

              {/* 1. ROOMS SUMMARY */}
              <section className="bg-white rounded-[1.5rem] p-6 sm:p-8 border border-[#2D5016]/10 shadow-xs">
                <h2 className={labelCls}><ShoppingBag size={15}/> Selected Accommodations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((room) => (
                    <div
                      key={room.id}
                      className="flex items-center justify-between p-3.5 bg-[#EAE6D6]/30 rounded-xl border border-[#2D5016]/5 transition-shadow hover:shadow-xs"
                    >
                      <div className="flex items-center gap-4">
                        <img src={room.image} className="w-14 h-14 rounded-xl object-cover border border-[#2D5016]/5 bg-black" alt={room.name} />
                        <div>
                          <p className="text-sm font-bold text-[#2D5016]">{room.name}</p>
                          <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mt-0.5">
                            FCFA {parseFloat(room.price_per_night.toString()).toLocaleString()} / night
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(room.id)}
                        className="p-2 text-neutral-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                        title="Remove Suite"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                {allErrors.room_ids && (
                  <p className="text-red-500 text-[10px] mt-3 font-bold uppercase tracking-wider">
                    {allErrors.room_ids}
                  </p>
                )}
              </section>

              {/* 2. GUEST INFORMATION */}
              <section className="bg-white rounded-[1.5rem] p-6 sm:p-8 border border-[#2D5016]/10 shadow-xs">
                <h2 className={labelCls}><Users size={15}/> Guest Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <input type="text" className={getInputCls(allErrors.name)} placeholder="Full Name (As shown on ID)" value={data.name} onChange={e => setData('name', e.target.value)} />
                    {allErrors.name && <p className="text-red-500 text-[10px] mt-1.5 font-medium">{allErrors.name}</p>}
                  </div>
                  <div>
                    <input type="email" className={getInputCls(allErrors.email)} placeholder="Email Address" value={data.email} onChange={e => setData('email', e.target.value)} />
                    {allErrors.email && <p className="text-red-500 text-[10px] mt-1.5 font-medium">{allErrors.email}</p>}
                  </div>
                  <div>
                    <input type="tel" className={getInputCls(allErrors.phone)} placeholder="Contact Phone Number" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                    {allErrors.phone && <p className="text-red-500 text-[10px] mt-1.5 font-medium">{allErrors.phone}</p>}
                  </div>
                  <div className="md:col-span-1">
                    <input type="text" className={getInputCls(allErrors.id_card_number)} placeholder="ID Card / Passport Number" value={data.id_card_number} onChange={e => setData('id_card_number', e.target.value)} />
                    {allErrors.id_card_number && <p className="text-red-500 text-[10px] mt-1.5 font-medium">{allErrors.id_card_number}</p>}
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-[10px] font-black text-neutral-400 ml-1 uppercase mb-1.5 block">Adults</label>
                      <input type="number" min="1" className={getInputCls(allErrors.adults_count)} value={data.adults_count} onChange={e => setData('adults_count', parseInt(e.target.value))} />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-black text-neutral-400 ml-1 uppercase mb-1.5 block">Children</label>
                      <input type="number" min="0" className={getInputCls(allErrors.children_count)} value={data.children_count} onChange={e => setData('children_count', parseInt(e.target.value))} />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <input type="text" className={getInputCls(allErrors.address)} placeholder="Residential Home Address" value={data.address} onChange={e => setData('address', e.target.value)} />
                    {allErrors.address && <p className="text-red-500 text-[10px] mt-1.5 font-medium">{allErrors.address}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <textarea rows={3} className={getInputCls(false)} placeholder="Add any custom requests or general stay remarks... (Optional)" value={data.notes} onChange={e => setData('notes', e.target.value)} />
                  </div>
                </div>
              </section>

              {/* 3. CALENDAR STAY */}
              <section className="bg-white rounded-[1.5rem] p-6 sm:p-8 border border-[#2D5016]/10 shadow-xs">
                <h2 className={labelCls}><CalendarIcon size={15}/> Define Stay Period</h2>

                {(allErrors.checked_in_at || allErrors.checked_out_at) && (
                  <div className="mb-4 text-red-500 text-[10px] font-bold uppercase flex items-center gap-1">
                    <AlertCircle size={12}/> {allErrors.checked_in_at || allErrors.checked_out_at}
                  </div>
                )}

                <div className={`border rounded-2xl overflow-hidden mt-6 transition-colors ${
                  (allErrors.checked_in_at || allErrors.checked_out_at)
                    ? 'border-red-500 shadow-sm shadow-red-100'
                    : 'border-[#2D5016]/10'
                }`}>
                  {/* Calendar Top Controls */}
                  <div className="flex items-center justify-between px-6 py-4.5 bg-[#2D5016] text-[#F5F2E8]">
                    <button
                      type="button"
                      onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                      className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span className="text-xs font-black uppercase tracking-widest">
                      {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                      type="button"
                      onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                      className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>

                  {/* Calendar Grid Frame */}
                  <div className="grid grid-cols-7 p-5 gap-1.5 bg-white">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                      <span key={d} className="text-center text-[10px] font-bold text-neutral-300 mb-3 uppercase">
                        {d}
                      </span>
                    ))}
                    {Array.from({ length: new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay() }).map((_, i) => (
                      <div key={i} />
                    ))}
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
                          className={`h-11 rounded-xl text-xs transition-all relative flex items-center justify-center
                            ${isPast
                              ? 'text-neutral-200 cursor-not-allowed bg-neutral-50/20'
                              : 'text-neutral-700 hover:bg-[#2D5016]/5 font-semibold'}
                            ${isStart || isEnd
                              ? 'bg-[#2D5016] text-[#F5F2E8] font-bold shadow-md scale-105 z-10'
                              : ''}
                            ${inRange
                              ? 'bg-[#2D5016]/10 text-[#2D5016] rounded-none'
                              : ''}
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

            {/* RIGHT COLUMN SIDEBAR DETAILS */}
            <div className="lg:col-span-4">
              <div className="bg-[#2D5016] text-[#F5F2E8] rounded-[2rem] p-8 shadow-lg border border-[#2D5016]/5 sticky top-28">
                <h3 className="text-xl font-serif italic mb-6 border-b border-white/10 pb-4">
                  Reservation Summary
                </h3>

                <div className="space-y-4.5 text-xs">
                  <div className="flex justify-between items-center opacity-80">
                    <span className="font-medium">Accommodations</span>
                    <span className="font-bold">{items.length} Suite(s)</span>
                  </div>
                  <div className="flex justify-between items-center opacity-80">
                    <span className="font-medium">Stay Duration</span>
                    <span className="font-bold">{nights} Nights</span>
                  </div>

                  <div className="pt-5 border-t border-white/10 space-y-3.5">
                    <div className="flex justify-between items-center opacity-70">
                      <span>Rate Subtotal</span>
                      <span className="font-semibold">FCFA {subtotal.toLocaleString()}</span>
                    </div>
                <div className="flex justify-between items-start pt-2">
  <span className="text-[10px] font-black uppercase tracking-wider opacity-60 mt-1">
    Estimated Total
  </span>
  <div className="text-right">
    <span className="text-xl font-serif italic font-bold block">
      FCFA {total.toLocaleString()}
    </span>
    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#C8DBA8] block mt-1">
      (Negotiable)
    </span>
  </div>
</div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#6B9E3F]"></span>
                      <p className="text-[10px] font-black uppercase tracking-wider text-[#C8DBA8]">
                        Booking Method: Pay at Hotel
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={processing || nights < 1}
                  className="w-full h-12 bg-[#6B9E3F] hover:bg-[#7db84a] text-white rounded-xl mt-8 font-black uppercase tracking-widest text-xs shadow-md transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={16} />
                      Processing Request
                    </div>
                  ) : <>Submit Request <ArrowRight size={14}/></>}
                </Button>

                {nights < 1 && (
                  <div className="flex items-center justify-center gap-2 text-[#C8DBA8] mt-4">
                    <Info size={12} className="shrink-0" />
                    <p className="text-[9px] font-black uppercase tracking-wider">Please select stay dates above</p>
                  </div>
                )}
              </div>
            </div>

          </form>
        </div>
      </div>
    </Layout>
  )
}
