import React from 'react'
import SEO from '../../Components/SEO'
import { motion, AnimatePresence } from 'framer-motion'
import { Users } from 'lucide-react'
import Layout from '../../Layouts/Layout'

// ─── TYPES ──────────────────────────────────────────────────────────────────
interface TeamMember {
  id: string | number;
  name: string;
  role: string;
  department: string;
  bio: string;
  image: string; // S3 URL
}

interface TeamProps {
  members: TeamMember[];
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
export default function Team({ members = [] }: TeamProps) {

  return (
    <Layout>
      <SEO
        title="Meet our Dedicated Team | Beach House Botaland"
        description="Meet the passionate hospitality professionals at Beach House Botaland who ensure your stay in Limbe, Cameroon is unforgettable."
        canonical={window.location.origin + '/team'}
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
                Our Family
              </span>
              <h1 className="text-5xl sm:text-6xl font-bold text-[#F5F2E8] font-serif italic leading-tight">
                Meet the Team
              </h1>
              <p className="mt-5 text-[#C8DBA8] text-lg max-w-xl mx-auto">
                The passionate individuals working behind the scenes to make your stay unforgettable.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── TEAM GRID AREA ─────────────────────────────────────────── */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-28 pt-8">

          <Reveal className="text-center mb-12">
            <h2 className="text-3xl font-serif text-[#2D5016] italic">Our Dedicated Staff</h2>
            <p className="text-neutral-500 text-sm mt-2">Delivering genuine hospitality and dynamic service</p>
          </Reveal>

          <AnimatePresence mode="popLayout">
            {members.length > 0 ? (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {members.map((member, i) => (
                  <motion.div
                    key={member.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: (i % 12) * 0.05, duration: 0.4 }}
                    className="bg-[#EAE6D6]/40 rounded-2xl overflow-hidden border border-[#2D5016]/10 flex flex-col justify-between group hover:shadow-lg hover:border-[#2D5016]/30 transition-all duration-300"
                  >
                    <div>
                      {/* Image Frame */}
                      <div className="h-64 overflow-hidden bg-black relative">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover object-top opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                        />
                        
                      </div>

                      {/* Content details */}
                      <div className="p-6">
                        <h3 className="font-serif text-xl font-bold text-[#2D5016]">
                          {member.name}
                        </h3>
                        <p className="text-[#6B9E3F] text-xs font-semibold mt-0.5">
                          {member.role}
                        </p>

                      </div>
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
                <Users size={48} className="mx-auto text-[#2D5016]/20 mb-4" />
                <h3 className="text-lg font-bold text-[#2D5016]">Our team is currently preparing</h3>
                <p className="text-neutral-500 mt-1">Please check back soon to meet our staff.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </Layout>
  )
}
