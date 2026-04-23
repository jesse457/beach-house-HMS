import React from 'react'
import { Head, Link } from '@inertiajs/react'
import { motion } from 'framer-motion'
import {
  MapPin, Phone, Mail, Clock, Car, Train, Plane, ArrowRight, Navigation,
} from 'lucide-react'
import Layout from '../../Layouts/Layout'

// ─── REVEAL COMPONENT ───────────────────────────────────────────────────────
const Reveal = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
  >
    {children}
  </motion.div>
);

const LOCATION = {
  name: 'Beach House Botaland',
  address: 'Beach House, Botaland, Limbe, Cameroon',
  phone: '+237 679447430',
  email: 'hello@Beach-house.com',
  embedSrc: 'https://www.google.com/maps/embed?pb=!1m15!1m10!1m3!1d3!2d9.1744533!3d4.0125958!2m1!1f0!3m2!1i1024!2i768!4f82.9130430216073!3m3!1m2!1s0x1066b55b02cdc2b9%3A0xd12df0a4d290021f!2sBeach%20house%20botaland!4v1776137218671',
  directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Beach+house+botaland,+Limbe,+Cameroon',
  viewUrl: 'https://www.google.com/maps/place/Beach+house+botaland/@4.0125958,9.1744533,17z',
}

const hours = [
  { day: 'Check-in', time: '2:00 PM – 11:00 PM' },
  { day: 'Check-out', time: 'Until 12:00 PM' },
  { day: 'Front Desk', time: '24 hours / 7 days' },
  { day: 'Restaurant', time: '6:30 AM – 10:30 PM' },
];

export default function Location() {
  return (
    <Layout>
      <Head title="Location & Directions | Beach House Botaland" />

      <main className="min-h-screen bg-[#F5F2E8]">
        {/* HERO */}
        <section className="relative bg-[#2D5016] py-28 overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1600&q=80')" }} />
          <div className="relative mx-auto max-w-4xl px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <span className="text-[#6B9E3F] text-sm font-semibold uppercase tracking-widest">Find Us</span>
              <h1 className="mt-3 text-5xl sm:text-6xl font-bold text-[#F5F2E8]">Our Location</h1>
              <p className="mt-5 text-[#C8DBA8] text-lg max-w-xl mx-auto">Nestled in the heart of Limbe, Beach House is your sanctuary by the coast.</p>
            </motion.div>
          </div>
        </section>

        {/* MAP & INFO */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Reveal className="lg:col-span-2 h-[500px]">
              <iframe
                src={LOCATION.embedSrc}
                width="100%" height="100%" style={{ border: 0 }}
                allowFullScreen loading="lazy" className="rounded-3xl shadow-xl"
              />
            </Reveal>

            <Reveal delay={0.2} className="space-y-6">
              <div className="bg-[#2D5016] rounded-2xl p-6 text-[#F5F2E8]">
                <h3 className="font-bold text-xl mb-4">Contact Info</h3>
                <div className="space-y-4 text-sm text-[#C8DBA8]">
                  <p className="flex items-center gap-3"><MapPin size={18}/> {LOCATION.address}</p>
                  <p className="flex items-center gap-3"><Phone size={18}/> {LOCATION.phone}</p>
                  <p className="flex items-center gap-3"><Mail size={18}/> {LOCATION.email}</p>
                </div>
                <a href={LOCATION.directionsUrl} target="_blank" className="mt-6 block text-center bg-[#F5F2E8] text-[#2D5016] py-3 rounded-xl font-bold">Get Directions</a>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-[#2D5016]/10">
                <h3 className="font-bold text-[#2D5016] mb-4">Operating Hours</h3>
                {hours.map(h => (
                  <div key={h.day} className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                    <span className="text-gray-500">{h.day}</span>
                    <span className="font-medium text-[#2D5016]">{h.time}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      </main>
    </Layout>
  )
}
