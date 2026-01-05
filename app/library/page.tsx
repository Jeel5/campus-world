"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Filter, BookOpen, Clock, Users, ArrowUpRight, Plus } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getSubjects, getUnits, subscribeToCollection, type Subject, type Unit, COLLECTIONS } from "@/lib/firestore"
import { where } from "firebase/firestore"

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [unitsMap, setUnitsMap] = useState<Record<string, Unit[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Subscribe to subjects
    const unsubscribeSubjects = subscribeToCollection<Subject>(COLLECTIONS.SUBJECTS, [], (subjectsData) => {
      setSubjects(subjectsData)
      
      // Load units for each subject
      subjectsData.forEach(async (subject) => {
        const units = await getUnits(subject.id)
        setUnitsMap((prev) => ({ ...prev, [subject.id]: units }))
      })
      
      setLoading(false)
    })

    return () => unsubscribeSubjects()
  }, [])

  return (
    <div className="relative min-h-screen bg-[#111317] text-[#E6E6E3] overflow-x-hidden">
      {/* Warm Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#16181d] via-[#11140f] to-[#13161a]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_25%_25%,rgba(245,158,11,0.08),transparent_40%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_75%_60%,rgba(251,191,36,0.06),transparent_35%)]" />
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10">
      <header className="mb-6 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-xs uppercase tracking-[0.3em] text-amber-200">
          <BookOpen className="w-4 h-4" /> Knowledge sanctuary
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-white">
            The Library — where learning feels warm.
          </h1>
          <p className="text-white/70 text-sm sm:text-base md:text-lg max-w-3xl">
            Curated resources, study materials, and comprehensive notes. Everything organized, nothing overwhelming.
          </p>
        </div>
      </header>
      
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <Input
              className="pl-12 h-12 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-white/40"
              placeholder="Search resources, subjects, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button className="h-12 px-6 rounded-2xl bg-amber-900/60 hover:bg-amber-900/70 text-amber-100 border border-amber-800">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {loading ? (
          <Card className="col-span-full bg-[#15181d] border border-white/5 rounded-3xl p-12 sm:p-16 lg:p-20 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-amber-700 border-t-transparent rounded-full mx-auto" />
          </Card>
        ) : subjects.length === 0 ? (
          <Card className="col-span-full bg-[#15181d] border border-white/5 rounded-3xl p-12 sm:p-16 lg:p-20 text-center">
            <p className="text-white/60 text-base">No subjects available. Check back soon!</p>
          </Card>
        ) : (
          subjects.map((subject, sIdx) => (
            <div key={subject.id} className="space-y-4 sm:space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sIdx * 0.1 }}
                className="flex items-center justify-between px-2 sm:px-4"
              >
                <h2 className="text-lg sm:text-xl font-bold text-white">{subject.name}</h2>
                <Badge className="bg-amber-900/40 text-amber-100 border-amber-800 text-xs whitespace-nowrap">
                  {unitsMap[subject.id]?.length || 0} Units
                </Badge>
              </motion.div>

              <div className="space-y-2 sm:space-y-3">
                {unitsMap[subject.id]?.map((unit, uIdx) => (
                  <Link key={unit.id} href={`/library/${subject.id}/${unit.id}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: sIdx * 0.08 + uIdx * 0.04 }}
                    >
                      <Card className="bg-[#15181d] border border-white/5 hover:bg-[#181b21] transition-all rounded-xl sm:rounded-2xl overflow-hidden group shadow-sm">
                        <CardContent className="p-4 sm:p-5 lg:p-6">
                          <div className="flex items-start justify-between mb-2 sm:mb-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center bg-amber-900/30">
                              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-amber-200" />
                            </div>
                            <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-white/30 group-hover:text-amber-200 transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-white mb-1.5 sm:mb-2 group-hover:text-amber-100 transition-colors line-clamp-2">
                            {unit.name}
                          </h3>
                          <p className="text-white/60 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed line-clamp-2">
                            Lecture notes, curated resources, and peer support.
                          </p>
                          <div className="flex items-center gap-3 sm:gap-4 text-xs text-white/50">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{unit.books} Topics</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              <span>{unit.students} Students</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}

        {/* Library Stats / Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3 sm:space-y-4 md:col-span-2 xl:col-span-1"
        >
          <Card className="bg-gradient-to-br from-amber-900/40 to-amber-950/20 border border-amber-800/50 p-5 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <h4 className="text-xs uppercase tracking-[0.3em] text-amber-200 mb-4 sm:mb-6">Library stats</h4>
            <div className="space-y-4 sm:space-y-6">
              <div>
                <div className="text-3xl sm:text-4xl font-black mb-1">1.2k</div>
                <div className="text-xs text-white/70">Verified Notes</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black mb-1">850</div>
                <div className="text-xs text-white/70">Study Hours Recorded</div>
              </div>
            </div>
          </Card>

          <Button className="w-full h-16 sm:h-20 rounded-xl sm:rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 font-bold uppercase tracking-wider text-xs sm:text-sm group px-4">
            <span className="truncate">Contribute to Library</span>
            <Plus className="w-5 h-5 ml-2 sm:ml-4 group-hover:rotate-180 transition-transform duration-500 flex-shrink-0" />
          </Button>
        </motion.div>
      </div>
      </div>
    </div>
  )
}
