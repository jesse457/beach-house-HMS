import React from 'react'
import { Link } from '@inertiajs/react'
import SEO from '../../Components/SEO'
import { motion } from 'framer-motion'
import {
  MapPin, Phone, Mail, Clock, Car, Plane, ArrowRight, Navigation, Compass
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
  name: 'Bota Guest House',
  address: 'Bota Guest House Real Location, 255G+R9H, Limbe, Cameroon', // Real Location Address
  phone: '+237 675 11 32 44',
  secondaryPhone: '+237 679 44 74 30',
  email: 'hello@beachhousebotaland.com',
  // Verified iframe pb parameter mapped strictly to the unique Place ID: 0x1066b500732725b1:0xe1ada0f6afd9d3bb
  embedSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3980.5927515091703!2d9.173916525141974!3d4.00955809596443!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1066b500732725b1%3A0xe1ada0f6afd9d3bb!2sBota%20Guest%20House%20Real%20Location!5e0!3m2!1sen!2scm!4v1776137218671',
  viewUrl: 'https://www.google.com/maps/place/Bota+Guest+House+Real+Location/@4.0095581,9.1761052,17z/data=!3m1!4b1!4m6!3m5!1s0x1066b500732725b1:0xe1ada0f6afd9d3bb!8m2!3d4.0095581!4d9.1761052!16s%2Fg%2F11z03rp_3t',
  directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Bota+Guest+House+Real+Location,+Limbe,+Cameroon',
}

const hours = [
  { day: 'Check-in Time', time: '2:00 PM – 11:00 PM' },
  { day: 'Check-out Time', time: 'Until 12:00 PM' },
  { day: 'Front Desk Concierge', time: '24 Hours / 7 Days' },
  { day: 'Oceanfront Restaurant', time: '6:30 AM – 10:30 PM' },
];

export default function Location() {
  return (
    <Layout>
      <SEO
        title="Location & Directions | Beach House Botaland"
        description="Find Beach House Botaland in Limbe, Cameroon. Get directions to our beachfront resort on the coast of Botaland with spectacular ocean views."
        canonical={window.location.origin + '/location'}
        jsonLd={[{
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: 'Beach House Botaland',
          description: 'Mediterranean-style beach resort in Limbe, Cameroon.',
          url: window.location.origin + '/location',
          telephone: '+237 679447430',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Bota Guest House Real Location, 255G+R9H',
            addressLocality: 'Limbe',
            addressCountry: 'CM',
          },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: 4.0095581,
            longitude: 9.1761052,
          },
          openingHoursSpecification: [
            { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Monday', opens: '00:00', closes: '23:59' },
            { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Tuesday', opens: '00:00', closes: '23:59' },
            { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Wednesday', opens: '00:00', closes: '23:59' },
            { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Thursday', opens: '00:00', closes: '23:59' },
            { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Friday', opens: '00:00', closes: '23:59' },
            { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '00:00', closes: '23:59' },
            { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Sunday', opens: '00:00', closes: '23:59' },
          ],
        }]}
      />

      <main className="min-h-screen bg-[#F5F2E8]">
        {/* ── HERO SECTION ── */}
        <section className="relative bg-[#2D5016] py-28 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-15"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80')" }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#F5F2E8] to-transparent" />
          <div className="relative mx-auto max-w-4xl px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <span className="text-[#6B9E3F] text-sm font-semibold uppercase tracking-widest block mb-3">
                Our Sanctuary
              </span>
              <h1 className="text-5xl sm:text-6xl font-bold text-[#F5F2E8] font-serif italic leading-tight">
                Our Location
              </h1>
              <p className="mt-5 text-[#C8DBA8] text-lg max-w-xl mx-auto">
                Nestled beautifully along the volcanic black sand coastline of Botaland, Limbe, Cameroon.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── MAP & DETAILS SECTION ── */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Embedded Iframe Map (Dynamic Real Coordinates) */}
            <Reveal className="lg:col-span-2 h-[350px] sm:h-[450px] md:h-[520px]">
              <div className="w-full h-full rounded-2xl md:rounded-3xl overflow-hidden border border-[#2D5016]/10 shadow-lg relative bg-[#EAE6D6]">
                <iframe
                  src={LOCATION.embedSrc}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Bota Guest House Real Location Map"
                  className="absolute inset-0"
                />
              </div>
            </Reveal>

            {/* Side Information Cards */}
            <div className="space-y-6">
              <Reveal delay={0.15}>
                <div className="bg-[#2D5016] rounded-2xl p-8 text-[#F5F2E8] shadow-lg border border-[#2D5016]/5 relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
                    <Compass size={180} />
                  </div>
                  <h3 className="font-serif italic text-2xl mb-6">Contact & Location</h3>
                  <div className="space-y-5 text-sm text-[#C8DBA8]">
                    <div className="flex items-start gap-3.5">
                      <MapPin size={18} className="shrink-0 mt-0.5 text-[#6B9E3F]" />
                      <p className="leading-relaxed font-semibold">{LOCATION.address}</p>
                    </div>
                    <div className="flex items-start gap-3.5">
                      <Phone size={18} className="shrink-0 mt-0.5 text-[#6B9E3F]" />
                      <div>
                        <p>{LOCATION.phone}</p>
                        <p className="opacity-75">{LOCATION.secondaryPhone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3.5">
                      <Mail size={18} className="shrink-0 text-[#6B9E3F]" />
                      <p>{LOCATION.email}</p>
                    </div>
                  </div>
                  <a
                    href={LOCATION.directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-8 block text-center bg-[#F5F2E8] text-[#2D5016] py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all hover:bg-white shadow-md"
                  >
                    Get Directions
                  </a>
                </div>
              </Reveal>

        
            </div>

          </div>
        </section>

        {/* ── LUXURY TRAVEL GUIDE SECTION ── */}
        <section className="bg-[#EAE6D6]/40 border-t border-[#2D5016]/10 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="text-center mb-12">
              <h2 className="text-3xl font-serif italic text-[#2D5016]">Getting Here</h2>
              <p className="text-neutral-500 text-sm mt-2">Smooth routes to your quiet oceanfront stay</p>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Reveal delay={0.1}>
                <div className="bg-white p-6 rounded-2xl border border-[#2D5016]/5 shadow-xs flex gap-5">
                  <div className="p-3 bg-[#F5F2E8] rounded-xl text-[#6B9E3F] shrink-0 h-12 w-12 flex items-center justify-center">
                    <Plane size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#2D5016] text-lg mb-2">By Air</h3>
                    <p className="text-neutral-600 text-sm leading-relaxed">
                      Fly into <strong>Douala International Airport (DLA)</strong>, located approximately 85 km (around 2 hours drive) from Limbe. Private airport transfers can be organized directly to the property upon request.
                    </p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.2}>
                <div className="bg-white p-6 rounded-2xl border border-[#2D5016]/5 shadow-xs flex gap-5">
                  <div className="p-3 bg-[#F5F2E8] rounded-xl text-[#6B9E3F] shrink-0 h-12 w-12 flex items-center justify-center">
                    <Car size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#2D5016] text-lg mb-2">By Road</h3>
                    <p className="text-neutral-600 text-sm leading-relaxed">
                      From Douala or Buea, follow the national highway directly to Limbe. Proceed to the Bota area along the coastal road towards Botaland. The Guest House is easily accessible at Plus Code 255G+R9H.
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  )
}
