"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, ShieldCheck, Megaphone, MapPin, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/AuthContext"
import { getNotices, voteNotice, subscribeToCollection, type Notice, COLLECTIONS } from "@/lib/firestore"
import { orderBy, limit } from "firebase/firestore"

export default function NoticeBoardPage() {
  const { user, signInAnonymous } = useAuth()
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [votes, setVotes] = useState<Record<string, number>>({})

  useEffect(() => {
    // Subscribe to real-time notices
    const unsubscribe = subscribeToCollection<Notice>(
      COLLECTIONS.NOTICES,
      [orderBy("createdAt", "desc"), limit(50)],
      (noticesData) => {
        setNotices(noticesData)
        const initialVotes = noticesData.reduce((acc, notice) => ({ ...acc, [notice.id]: notice.trustVotes }), {})
        setVotes(initialVotes)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [])

  const handleVote = async (noticeId: string) => {
    if (!user) {
      await signInAnonymous()
      return
    }

    try {
      // Optimistic update
      setVotes((v) => ({ ...v, [noticeId]: v[noticeId] + 1 }))
      await voteNotice(noticeId)
    } catch (error) {
      console.error("Error voting:", error)
      // Revert on error
      setVotes((v) => ({ ...v, [noticeId]: v[noticeId] - 1 }))
    }
  }

  return (
    <div className="relative min-h-screen bg-[#111317] text-[#E6E6E3] overflow-x-hidden">
      {/* Warm Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#15151d] via-[#0f0f14] to-[#121217]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_40%,rgba(99,102,241,0.08),transparent_40%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_60%,rgba(139,92,246,0.06),transparent_35%)]" />
      
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10">
      <header className="mb-10 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/30 border border-indigo-800/30 text-xs font-medium text-indigo-200">
          <Megaphone className="w-4 h-4" /> Official Updates
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-white">
            Notice Board
          </h1>
          <p className="text-white/60 text-sm sm:text-base max-w-3xl">
            Official announcements and campus updates. Trust-verified and always current.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10">
        <div className="space-y-6">
          {loading ? (
            <Card className="bg-[#15181d] border border-white/5 rounded-3xl p-12 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-indigo-700 border-t-transparent rounded-full mx-auto" />
            </Card>
          ) : notices.length === 0 ? (
            <Card className="bg-[#15181d] border border-white/5 rounded-3xl p-12 text-center">
              <p className="text-white/60 text-base">No notices available at this time.</p>
            </Card>
          ) : (
            notices.map((notice, idx) => (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="bg-[#15181d] border border-white/5 hover:bg-[#181b21] transition-all duration-500 rounded-3xl overflow-hidden group">
                  <CardContent className="p-6 lg:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-indigo-900/40 flex items-center justify-center text-indigo-200 border border-indigo-800/30">
                          <Megaphone className="w-5 h-5" />
                        </div>
                        <div>
                          <Badge
                            variant="outline"
                            className="border-indigo-800 bg-indigo-900/40 text-indigo-100 text-xs mb-1"
                          >
                            {notice.category}
                          </Badge>
                          <div className="flex items-center gap-2">
                            {notice.isOfficial && (
                              <span className="text-xs text-emerald-300 flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Verified
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        onClick={() => handleVote(notice.id)}
                        className="h-10 px-5 rounded-xl bg-white/5 hover:bg-indigo-900/30 hover:text-indigo-200 transition-all group/vote"
                      >
                        <ShieldCheck className="w-4 h-4 mr-2 group-hover/vote:scale-110 transition-transform" />
                        <span className="text-sm font-medium">
                          {votes[notice.id] || 0} trust
                        </span>
                      </Button>
                    </div>

                    <h3 className="text-2xl lg:text-3xl font-bold tracking-tight mb-4 leading-tight group-hover:text-indigo-200 transition-colors">
                      {notice.title}
                    </h3>
                    <p className="text-white/70 text-base leading-relaxed mb-6">{notice.content}</p>

                    <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-300" />
                        <span className="text-sm text-white/60">{notice.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-indigo-300" />
                        <span className="text-sm text-white/60">{notice.location}</span>
                      </div>
                      <Button
                        variant="link"
                        className="ml-auto text-indigo-200 font-medium text-sm hover:translate-x-1 transition-transform p-0 h-auto"
                      >
                        Learn More <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        <aside className="space-y-8">
          <Card className="bg-gradient-to-br from-indigo-900/40 via-indigo-950/20 to-transparent border border-indigo-800/30 p-8 rounded-3xl text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/5 blur-[60px] rounded-full group-hover:scale-125 transition-transform duration-1000" />
            <h4 className="text-xs font-medium text-indigo-200/60 mb-4">
              Official Status
            </h4>
            <div className="space-y-6">
              <div>
                <div className="text-4xl font-bold leading-none mb-1 text-indigo-100">100%</div>
                <div className="text-sm text-indigo-200/60">Accuracy Rate</div>
              </div>
              <p className="text-sm leading-relaxed text-indigo-100/80">
                All verified notices come directly from campus administration.
              </p>
              <Button className="w-full h-11 bg-indigo-100 text-indigo-950 hover:bg-indigo-50 rounded-xl font-semibold text-sm shadow-lg">
                Submit for Verification
              </Button>
            </div>
          </Card>
        </aside>
      </div>
      </div>
    </div>
  )
}
