import React, { useState } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserCheck, UserPlus, Mail, Users } from 'lucide-react'
import Layout from '../../Layouts/Layout'

// ─── TYPES ──────────────────────────────────────────────────────────────────
interface TeamMember {
  id: string | number;
  name: string;
  role: string;
  department: string;
  bio: string;
  image: string;
}

interface TeamProps {
  members: TeamMember[]; // These come from DB
  followedIds?: (string | number)[];
}

const DEPARTMENTS = ['All', 'Management', 'Operations', 'Hospitality', 'Support']

// ─── STATIC OWNER DATA ──────────────────────────────────────────────────────
const STATIC_OWNER: TeamMember = {
  id: 'owner-static',
  name: 'His Majesty/Senator Ekoko Mukete',
  role: 'Founder & Owner',
  department: 'Leadership',
  bio: 'Senator Ekoko Mukete founded Beach House in the year ... with a vision to create a sanctuary where luxury meets nature. With over 20 years in the hospitality industry across Cameroon, Turkey, and Dubai, he personally oversees every detail to ensure guests receive nothing short of excellence.',
  image: 'https://tse4.mm.bing.net/th/id/OIP.uy10XXpA_6DneEyzdn0l7QHaJ4?rs=1&pid=ImgDetMain&o=7&rm=3',
};

export default function Team({ members = [], followedIds = [] }: TeamProps) {
  const { auth } = usePage<any>().props;
  const isLoggedIn = !!auth?.user;

  const [dept, setDept] = useState('All');
  const [localFollows, setLocalFollows] = useState<Set<string | number>>(new Set(followedIds));
  const [processingId, setProcessingId] = useState<string | number | null>(null);

  // Filter ONLY the DB members. The static owner is always visible.
  const filteredDBMembers = members.filter((m) => dept === 'All' || m.department === dept);

  function handleToggleFollow(member: TeamMember) {
    if (!isLoggedIn) {
        router.visit('/login');
        return;
    }
    // If you don't want people following the static owner in the DB,
    // you can return early here or handle it via a specific route.
    if (member.id === 'owner-static') return;

    setProcessingId(member.id);
    router.post(`/team/${member.id}/follow`, {}, {
      preserveScroll: true,
      onSuccess: () => {
        setLocalFollows((prev) => {
          const next = new Set(prev);
          next.has(member.id) ? next.delete(member.id) : next.add(member.id);
          return next;
        });
      },
      onFinish: () => setProcessingId(null)
    });
  }

  return (
    <Layout>
      <Head title="Meet the Team | Beach House Botaland" />

      <main className="min-h-screen bg-[#F5F2E8]">
        {/* Hero Section */}
        <section className="relative bg-[#2D5016] py-28 overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1600&q=80')" }} />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#F5F2E8] to-transparent" />
          <div className="relative mx-auto max-w-4xl px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
              <span className="text-[#6B9E3F] text-sm font-semibold uppercase tracking-widest">Our People</span>
              <h1 className="mt-3 text-5xl font-bold text-[#F5F2E8]">Meet the Team</h1>
            </motion.div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-28">

          {/* STATIC OWNER CARD (Never Changes) */}
          <div className="mt-[-2rem] mb-16 bg-[#2D5016] rounded-3xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative h-72 md:h-auto min-h-[320px]">
                <img src={STATIC_OWNER.image} alt={STATIC_OWNER.name} className="w-full h-full object-cover object-top" />
              </div>
              <div className="p-10 flex flex-col justify-center">
                <span className="inline-flex bg-[#F5F2E8]/15 text-[#C8DBA8] text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full w-fit mb-4">
                  {STATIC_OWNER.department}
                </span>
                <h2 className="text-3xl font-bold text-[#F5F2E8]">{STATIC_OWNER.name}</h2>
                <p className="text-[#C8DBA8] font-medium mt-1 text-lg">{STATIC_OWNER.role}</p>
                <p className="mt-5 text-[#C8DBA8]/80 leading-relaxed text-sm">{STATIC_OWNER.bio}</p>
                <div className="mt-7 flex gap-3">
                  <a href="mailto:management@beachhouse.com" className="flex items-center gap-2 border border-[#F5F2E8]/20 text-[#F5F2E8] px-6 py-2.5 rounded-xl font-bold text-sm">
                    <Mail size={16}/> Contact Owner
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* DEPARTMENT FILTER */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {DEPARTMENTS.map((d) => (
              <button
                key={d}
                onClick={() => setDept(d)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  dept === d ? 'bg-[#2D5016] text-[#F5F2E8]' : 'bg-white border border-[#2D5016]/15 text-neutral-600'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* DYNAMIC TEAM GRID (From Database) */}
          <AnimatePresence mode="popLayout">
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredDBMembers.map((member, i) => (
                <motion.div
                  key={member.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-2xl overflow-hidden border border-[#2D5016]/10 flex flex-col"
                >
                  <div className="h-56 overflow-hidden bg-[#EAE6D6]">
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover object-top" />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <span className="text-[10px] font-bold uppercase text-[#6B9E3F] mb-1">{member.department}</span>
                    <h3 className="font-bold text-[#2D5016] text-base">{member.name}</h3>
                    <p className="text-gray-500 text-xs mt-0.5">{member.role}</p>
                    <p className="text-neutral-500 text-xs mt-3 line-clamp-3 flex-1">{member.bio}</p>

                    <button
                        onClick={() => handleToggleFollow(member)}
                        disabled={processingId === member.id}
                        className={`mt-5 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                            localFollows.has(member.id)
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-[#2D5016] text-white hover:bg-[#3D6B1F]'
                        }`}
                    >
                        {processingId === member.id ? '...' : (
                            localFollows.has(member.id) ? <><UserCheck size={14}/> Following</> : <><UserPlus size={14}/> Follow</>
                        )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredDBMembers.length === 0 && (
            <div className="text-center py-24 text-neutral-400">
                <Users size={48} className="mx-auto opacity-20 mb-4" />
                <p>No team members found in the {dept} category.</p>
            </div>
          )}
        </div>
      </main>
    </Layout>
  )
}
