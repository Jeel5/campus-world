"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, Megaphone, MapPin, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/AuthContext"
import { subscribeToCollection, type Notice, COLLECTIONS } from "@/lib/firestore"
import { orderBy, limit } from "firebase/firestore"
import SubmitNoticeModal from "@/components/SubmitNoticeModal"
import NoticeDetailModal from "@/components/NoticeDetailModal"

export default function NoticeBoardPage() {
  const { user } = useAuth()
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  useEffect(() => {
    // Subscribe to real-time notices
    const unsubscribe = subscribeToCollection<Notice>(
      COLLECTIONS.NOTICES,
      [orderBy("createdAt", "desc"), limit(50)],
      (noticesData) => {
        setNotices(noticesData)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [])

  const handleLearnMore = (notice: Notice) => {
    setSelectedNotice(notice)
    setIsDetailModalOpen(true)
  }

  return (
    <div className="relative min-h-screen bg-[#111317] text-[#E6E6E3] overflow-x-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#15151d] via-[#0f0f14] to-[#121217]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_40%,rgba(99,102,241,0.08),transparent_40%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_60%,rgba(139,92,246,0.06),transparent_35%)]" />
      
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <header className="mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/30 border border-indigo-800/30 text-xs font-medium text-indigo-200">
            <Megaphone className="w-4 h-4" /> Official Updates
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-white">
              Notice Board
            </h1>
            <p className="text-white/60 text-sm sm:text-base max-w-3xl">
              Official announcements and campus updates. Verified by campus administration.
            </p>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* Left: Notice Cards */}
          <div className="space-y-5">
            {loading ? (
              <Card className="bg-[#15181d] border border-white/5 rounded-2xl p-12 text-center">
                <div className="animate-spin w-12 h-12 border-4 border-indigo-700 border-t-transparent rounded-full mx-auto" />
              </Card>
            ) : notices.length === 0 ? (
              <Card className="bg-[#15181d] border border-white/5 rounded-2xl p-12 text-center">
                <p className="text-white/60 text-base">No notices available at this time.</p>
              </Card>
            ) : (
              notices.map((notice, idx) => (
                <motion.div
                  key={notice.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <Card className="bg-[#15181d] border border-white/5 hover:border-indigo-500/30 hover:bg-[#181b21] transition-all duration-300 rounded-2xl overflow-hidden group hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]">
                    <CardContent className="p-6 lg:p-7">
                      {/* Category Badge */}
                      <div className="mb-4">
                        <Badge
                          variant="outline"
                          className="border-indigo-800/50 bg-indigo-900/30 text-indigo-200 text-xs font-medium px-3 py-1"
                        >
                          {notice.category}
                        </Badge>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl lg:text-2xl font-bold tracking-tight mb-3 leading-tight text-white group-hover:text-indigo-100 transition-colors">
                        {notice.title}
                      </h3>

                      {/* Description */}
                      <p className="text-white/70 text-sm lg:text-base leading-relaxed mb-5">
                        {notice.content}
                      </p>

                      {/* Divider */}
                      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-5" />

                      {/* Footer: Date, Location, CTA */}
                      <div className="flex flex-wrap items-center gap-5">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-indigo-400" />
                          <span className="text-xs lg:text-sm text-white/60">{notice.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-indigo-400" />
                          <span className="text-xs lg:text-sm text-white/60">{notice.location}</span>
                        </div>
                        <Button
                          variant="link"
                          onClick={() => handleLearnMore(notice)}
                          className="ml-auto text-indigo-300 hover:text-indigo-200 font-medium text-sm group/btn p-0 h-auto"
                        >
                          Learn More 
                          <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>

          {/* Right: Official Status Card */}
          <aside className="space-y-6 lg:sticky lg:top-6 h-fit">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-indigo-950/60 via-indigo-900/30 to-purple-950/40 border border-indigo-700/40 rounded-2xl overflow-hidden relative group">
                {/* Glow Effect */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/20 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-700" />
                
                <CardContent className="p-7 relative z-10">
                  {/* Label */}
                  <div className="text-xs font-semibold text-indigo-300/70 uppercase tracking-wider mb-6">
                    Official Status
                  </div>

                  {/* Main Metric */}
                  <div className="mb-6">
                    <div className="text-5xl font-bold leading-none mb-2 bg-gradient-to-br from-white to-indigo-200 bg-clip-text text-transparent">
                      100%
                    </div>
                    <div className="text-sm font-medium text-indigo-200/70">
                      Accuracy Rate
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm leading-relaxed text-indigo-100/70 mb-6">
                    All verified notices come directly from campus administration.
                  </p>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent mb-6" />

                  {/* Submit Button */}
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    disabled={!user}
                    className="w-full h-12 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold rounded-xl shadow-lg shadow-indigo-900/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit for Verification
                  </Button>

                  {!user && (
                    <p className="text-xs text-indigo-300/60 text-center mt-3">
                      Sign in to submit a notice
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </aside>
        </div>
      </div>

      {/* Submit Modal */}
      <SubmitNoticeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      {/* Notice Detail Modal */}
      <NoticeDetailModal 
        notice={selectedNotice} 
        isOpen={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)} 
      />
    </div>
  )
}
