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
        <motion.div 
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-cyan-600/20 blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
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
            <motion.span 
              className="h-px w-12 bg-gradient-to-r from-transparent via-primary to-transparent"
              animate={{ width: ["48px", "64px", "48px"] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <span className="text-primary text-[10px] font-black tracking-[0.5em] uppercase flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              Terminal Interface
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter mb-3 leading-[0.85] text-white italic">
            <motion.span
              className="inline-block"
              animate={{ 
                textShadow: [
                  "0 0 20px rgba(var(--primary), 0.3)",
                  "0 0 40px rgba(var(--primary), 0.5)",
                  "0 0 20px rgba(var(--primary), 0.3)",
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              CAMPUS
            </motion.span>
            <br />
            <motion.span
              className="inline-block"
              animate={{ 
                textShadow: [
                  "0 0 20px rgba(var(--primary), 0.5)",
                  "0 0 40px rgba(var(--primary), 0.7)",
                  "0 0 20px rgba(var(--primary), 0.5)",
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
            >
              WORLD
            </motion.span>
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm md:text-base lg:text-lg max-w-2xl font-medium leading-relaxed">
            Navigate through interconnected zones. Each destination unlocks unique experiences and opportunities.
          </p>
        </motion.div>
      </header>

      {/* Main Content with Journey Path */}
      <div className="relative flex-1 px-4 md:px-8 lg:px-12 pb-12">
        <div className="relative max-w-5xl mx-auto">
          {/* SVG Connecting Path */}
          <svg 
            className="absolute left-1/2 top-0 pointer-events-none" 
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
              
              <filter id="glow" x="-200%" y="-50%" width="500%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Vertical flowing path connecting all zones */}
            <motion.path
              d="M 2 0 Q 3 200, 2 250 T 2 500 T 2 750 L 2 1000"
              stroke="url(#pathGradient)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              filter="url(#glow)"
              strokeDasharray="15 10"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 3, ease: "easeInOut" }}
            />
            
            {/* Animated flowing dots */}
            <motion.circle
              cx="2"
              cy="0"
              r="2"
              fill="rgb(59, 130, 246)"
              filter="url(#glow)"
              animate={{ cy: [0, 1000] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
          </svg>

          {/* Zones List */}
          <div className="relative space-y-24 md:space-y-32 py-12">
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
                      <motion.div
                        className={`absolute inset-0 rounded-full bg-gradient-to-br ${zone.color} blur-2xl`}
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      
                      {/* Main Circle */}
                      <motion.div
                        className="relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-xl border-2 border-white/20 flex items-center justify-center group-hover:border-primary group-hover:shadow-[0_0_50px_rgba(var(--primary),0.5)] transition-all duration-500"
                        whileHover={{
                          boxShadow: [
                            "0 0 30px rgba(var(--primary), 0.3)",
                            "0 0 60px rgba(var(--primary), 0.6)",
                            "0 0 30px rgba(var(--primary), 0.3)",
                          ]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <motion.div
                          whileHover={{ rotate: 360, scale: 1.2 }}
                          transition={{ duration: 0.6 }}
                        >
                          <zone.icon className={`w-10 h-10 md:w-14 md:h-14 ${zone.iconColor} group-hover:drop-shadow-[0_0_10px_rgba(var(--primary),0.8)]`} />
                        </motion.div>

                        {/* Pulsing Indicator */}
                        <motion.div
                          className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full"
                          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />

                        {/* Zone Number */}
                        <motion.div
                          className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-full"
                          whileHover={{ scale: 1.1 }}
                        >
                          <span className="text-xs font-black text-primary">#{idx + 1}</span>
                        </motion.div>
                      </motion.div>

                      {/* Connection Dots */}
                      {idx < zones.length - 1 && (
                        <motion.div
                          className={`absolute ${zone.position === 'right' ? '-left-8' : '-right-8'} top-1/2 w-6 h-6`}
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          transition={{ delay: 0.5 + idx * 0.1 }}
                        >
                          <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse" />
                        </motion.div>
                      )}
                    </motion.div>

                    {/* Description Card */}
                    <motion.div
                      className={`flex-1 p-4 sm:p-6 md:p-8 rounded-2xl bg-gradient-to-br from-background/60 to-background/30 backdrop-blur-xl border border-white/10 group-hover:border-primary/50 group-hover:bg-gradient-to-br group-hover:from-primary/5 group-hover:to-accent/5 transition-all duration-500`}
                      whileHover={{ 
                        y: -5,
                        boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
                      }}
                    >
                      <motion.div
                        className="flex items-center gap-3 mb-3"
                      >
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                          {zone.name}
                        </h2>
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ChevronRight className={`w-5 h-5 sm:w-6 sm:h-6 text-primary`} />
                        </motion.div>
                      </motion.div>
                      
                      <p className="text-muted-foreground text-xs sm:text-sm md:text-base leading-relaxed mb-4">
                        {zone.desc}
                      </p>

                      <motion.div
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider group-hover:bg-primary/20 group-hover:border-primary/50 transition-all`}
                        whileHover={{ scale: 1.05 }}
                      >
                        <span>Enter Zone</span>
                        <ChevronRight className="w-4 h-4" />
                      </motion.div>
                    </motion.div>
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
