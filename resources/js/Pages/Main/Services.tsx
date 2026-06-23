import React from 'react'
import SEO from '../../Components/SEO'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import Layout from '../../Layouts/Layout'

// ─── TYPES ──────────────────────────────────────────────────────────────────
interface ServiceItem {
  id: string | number;
  name: string;
  description: string;
  icon: string | null;
  image: string | null;
  category: string | null;
}

interface ServicesProps {
  services: ServiceItem[];
}

// ─── DYNAMIC LUCIDE ICON ─────────────────────────────────────────────────────
function DynamicLucideIcon({ iconName, className }: { iconName: string | null; className: string }) {
  if (!iconName) return <Sparkles className={className} />;

  const IconComponent = (LucideIcons as Record<string, React.ComponentType<{ className?: string }>>)[iconName];

  if (!IconComponent) return <Sparkles className={className} />;

  return <IconComponent className={className} />;
}

// ─── CATEGORY COLOR MAP ─────────────────────────────────────────────────────
const categoryColors: Record<string, string> = {
  'Dining': 'bg-amber-100 text-amber-800',
  'Wellness': 'bg-emerald-100 text-emerald-800',
  'Transport': 'bg-sky-100 text-sky-800',
  'Recreation': 'bg-indigo-100 text-indigo-800',
  'Guest Services': 'bg-rose-100 text-rose-800',
  'Business': 'bg-slate-100 text-slate-800',
};

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
export default function Services({ services = [] }: ServicesProps) {

  return (
    <Layout>
      <SEO
        title="Our Services | Beach House Botaland"
        description="Discover the full range of premium hotel services at Beach House Botaland — from fine dining and spa treatments to airport shuttles and concierge services in Limbe, Cameroon."
        canonical={window.location.origin + '/services'}
      />

      <main className="min-h-screen bg-[#F5F2E8]">
        {/* ── HERO SECTION ───────────────────────────────────────────── */}
        <section className="relative bg-[#2D5016] py-28 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: "url('/images/team_image.jpeg')" }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#F5F2E8] to-transparent" />
          <div className="relative mx-auto max-w-4xl px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <span className="text-[#6B9E3F] text-sm font-semibold uppercase tracking-widest block mb-3">
                What We Offer
              </span>
              <h1 className="text-5xl sm:text-6xl font-bold text-[#F5F2E8] font-serif italic leading-tight">
                Our Services
              </h1>
              <p className="mt-5 text-[#C8DBA8] text-lg max-w-xl mx-auto">
                Experience the finest amenities and personalized services designed to make your stay exceptional.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── SERVICES GRID AREA ──────────────────────────────────────── */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-28 pt-8">

          <Reveal className="text-center mb-12">
            <h2 className="text-3xl font-serif text-[#2D5016] italic">Everything You Need for a Perfect Stay</h2>
            <p className="text-neutral-500 text-sm mt-2">From dining to wellness, we have you covered</p>
          </Reveal>

          <AnimatePresence mode="popLayout">
            {services.length > 0 ? (
              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {services.map((service, i) => (
                  <motion.div
                    key={service.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: (i % 9) * 0.05, duration: 0.4 }}
                    className="bg-[#EAE6D6]/40 rounded-2xl overflow-hidden border border-[#2D5016]/10 flex flex-col group hover:shadow-lg hover:border-[#2D5016]/30 transition-all duration-300"
                  >
                    {/* Image */}
                    {service.image && (
                      <div className="h-52 overflow-hidden bg-black">
                        <img
                          src={service.image}
                          alt={service.name}
                          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-1">
                      {/* Icon + Category */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-[#2D5016]/10 rounded-xl">
                          <DynamicLucideIcon
                            iconName={service.icon}
                            className="h-5 w-5 text-[#2D5016]"
                          />
                        </div>
                        {service.category && (
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[service.category] || 'bg-gray-100 text-gray-700'}`}>
                            {service.category}
                          </span>
                        )}
                      </div>

                      {/* Name */}
                      <h3 className="font-serif text-xl font-bold text-[#2D5016] mb-2">
                        {service.name}
                      </h3>

                      {/* Description */}
                      <p className="text-neutral-600 text-sm leading-relaxed flex-1">
                        {service.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-32 text-center"
              >
                <Sparkles size={48} className="mx-auto text-[#2D5016]/20 mb-4" />
                <h3 className="text-lg font-bold text-[#2D5016]">Services are being prepared</h3>
                <p className="text-neutral-500 mt-1">Please check back soon to explore our offerings.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </Layout>
  )
}
