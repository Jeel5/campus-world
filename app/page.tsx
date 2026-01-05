"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import { Users, Library, FlaskConical, Coffee, ClipboardList, ChevronRight, Sparkles } from "lucide-react"
import { useRef } from "react"

const zones = [
  {
    id: "quad",
    name: "The Quad",
    icon: Users,
    href: "/quad",
    desc: "The heart of campus where voices converge. Share your thoughts, engage in discussions, and connect with the community in real-time.",
    color: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-400",
    position: "left",
  },
  {
    id: "library",
    name: "The Library",
    icon: Library,
    href: "/library",
    desc: "Your knowledge sanctuary filled with curated resources, study materials, and comprehensive explanations across all subjects.",
    color: "from-amber-500/20 to-yellow-500/20",
    iconColor: "text-amber-400",
    position: "right",
  },
  {
    id: "lab",
    name: "The Lab",
    icon: FlaskConical,
    href: "/lab",
    desc: "Hands-on learning through interactive quests, practical exercises, and skill-building challenges that sharpen your expertise.",
    color: "from-emerald-500/20 to-green-500/20",
    iconColor: "text-emerald-400",
    position: "left",
  },
  {
    id: "canteen",
    name: "The Canteen",
    icon: Coffee,
    href: "/canteen",
    desc: "The social hub for lighthearted moments. Share memes, post confessions, and enjoy casual conversations with peers.",
    color: "from-rose-500/20 to-pink-500/20",
    iconColor: "text-rose-400",
    position: "right",
  },
  {
    id: "notice",
    name: "Notice Board",
    icon: ClipboardList,
    href: "/notice-board",
    desc: "Stay informed with official announcements, important updates, campus events, and time-sensitive information.",
    color: "from-indigo-500/20 to-purple-500/20",
    iconColor: "text-indigo-400",
    position: "left",
  },
]

export default function CampusMapPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  return (
    <div ref={containerRef} className="relative min-h-screen w-full flex flex-col overflow-x-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 md:px-8 lg:px-12 pt-8 md:pt-12 pb-6 md:pb-8 shrink-0">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-4 mb-4">
            <span className="h-px w-12 bg-gradient-to-r from-transparent via-primary to-transparent" />
            <span className="text-primary text-[10px] font-black tracking-[0.5em] uppercase flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              Terminal Interface
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter mb-3 leading-[0.85] text-white italic">
            <span className="inline-block" style={{ textShadow: "0 0 30px rgba(var(--primary), 0.4)" }}>
              CAMPUS
            </span>
            <br />
            <span className="inline-block" style={{ textShadow: "0 0 30px rgba(var(--primary), 0.4)" }}>
              WORLD
            </span>
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm md:text-base lg:text-lg max-w-2xl font-medium leading-relaxed">
            Navigate through interconnected zones. Each destination unlocks unique experiences and opportunities.
          </p>
        </motion.div>
      </header>

      {/* Main Content with Journey Path */}
      <div className="relative flex-1 px-4 md:px-8 lg:px-12 pb-12">
        <div className="relative max-w-5xl mx-auto">
          {/* SVG Connecting Path - Behind everything */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <svg 
              className="absolute left-1/2 top-0" 
              style={{ width: '4px', height: '100%', transform: 'translateX(-50%)' }}
              preserveAspectRatio="none"
              viewBox="0 0 4 1000"
            >
              <defs>
                <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
                  <stop offset="25%" stopColor="rgb(147, 51, 234)" stopOpacity="0.7" />
                  <stop offset="50%" stopColor="rgb(59, 130, 246)" stopOpacity="0.9" />
                  <stop offset="75%" stopColor="rgb(236, 72, 153)" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              
              {/* Vertical path connecting all zones */}
              <path
                d="M 2 0 Q 3 200, 2 250 T 2 500 T 2 750 L 2 1000"
                stroke="url(#pathGradient)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="15 10"
                opacity="0.6"
              />
            </svg>
          </div>

          {/* Zones List - Above the path */}
          <div className="relative space-y-24 md:space-y-32 py-12 z-10">
            {zones.map((zone, idx) => (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.4 }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                className="relative"
              >
                <Link href={zone.href} className="block group">
                  <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 md:gap-12 ${zone.position === 'right' ? 'sm:flex-row-reverse' : 'sm:flex-row'}`}>
                    {/* Zone Node */}
                    <motion.div
                      className="relative flex-shrink-0"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {/* Outer Glow Ring */}
                      <div
                        className={`absolute inset-0 rounded-full bg-gradient-to-br ${zone.color} blur-2xl opacity-40`}
                      />
                      
                      {/* Main Circle */}
                      <div
                        className="relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-xl border-2 border-white/20 flex items-center justify-center group-hover:border-primary group-hover:shadow-[0_0_40px_rgba(var(--primary),0.4)] transition-all duration-500"
                      >
                        <motion.div
                          whileHover={{ rotate: 360, scale: 1.2 }}
                          transition={{ duration: 0.6 }}
                        >
                          <zone.icon className={`w-10 h-10 md:w-14 md:h-14 ${zone.iconColor} group-hover:drop-shadow-[0_0_10px_rgba(var(--primary),0.8)]`} />
                        </motion.div>

                        {/* Pulsing Indicator */}
                        <div
                          className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full opacity-80"
                        />

                        {/* Zone Number */}
                        <div
                          className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-full"
                        >
                          <span className="text-xs font-black text-primary">#{idx + 1}</span>
                        </div>
                      </div>

                      {/* Connection Dots */}
                      {idx < zones.length - 1 && (
                        <div
                          className={`absolute ${zone.position === 'right' ? '-left-8' : '-right-8'} top-1/2 w-6 h-6`}
                        >
                          <div className="w-2 h-2 bg-primary/60 rounded-full" />
                        </div>
                      )}
                    </motion.div>

                    {/* Description Card */}
                    <div
                      className={`flex-1 p-4 sm:p-6 md:p-8 rounded-2xl bg-gradient-to-br from-background/60 to-background/30 backdrop-blur-xl border border-white/10 group-hover:border-primary/50 group-hover:bg-gradient-to-br group-hover:from-primary/5 group-hover:to-accent/5 transition-all duration-500 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] group-hover:-translate-y-1`}
                    >
                      <div
                        className="flex items-center gap-3 mb-3"
                      >
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                          {zone.name}
                        </h2>
                        <div>
                          <ChevronRight className={`w-5 h-5 sm:w-6 sm:h-6 text-primary`} />
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground text-xs sm:text-sm md:text-base leading-relaxed mb-4">
                        {zone.desc}
                      </p>

                      <div
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider group-hover:bg-primary/20 group-hover:border-primary/50 group-hover:scale-105 transition-all`}
                      >
                        <span>Enter Zone</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* End Marker */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false }}
            className="flex justify-center mt-16"
          >
            <div className="px-8 py-4 rounded-full bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 border border-primary/50 backdrop-blur-xl">
              <p className="text-primary text-sm font-black uppercase tracking-widest">
                Journey Initialized
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
