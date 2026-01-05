"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Calendar, MapPin, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Notice } from "@/lib/firestore"

interface NoticeDetailModalProps {
  notice: Notice | null
  isOpen: boolean
  onClose: () => void
}

export default function NoticeDetailModal({ notice, isOpen, onClose }: NoticeDetailModalProps) {
  if (!notice) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-[#15181d] border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden">
              {/* Header */}
              <div className="sticky top-0 bg-[#15181d]/95 backdrop-blur-sm border-b border-white/10 px-6 py-4 flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="border-indigo-800/50 bg-indigo-900/30 text-indigo-200 text-xs font-medium"
                >
                  {notice.category}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white/60 hover:text-white hover:bg-white/10 rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
                {/* Title */}
                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-6 leading-tight">
                  {notice.title}
                </h2>

                {/* Meta Information */}
                <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm text-white/70">{notice.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm text-white/70">{notice.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm text-white/70">
                      {notice.isOfficial ? "Official Notice" : "Community Notice"}
                    </span>
                  </div>
                </div>

                {/* Full Content */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white/90">Details</h3>
                  <p className="text-white/70 text-base leading-relaxed whitespace-pre-line">
                    {notice.content}
                  </p>
                </div>

                {/* Additional Info */}
                {notice.isOfficial && (
                  <div className="mt-6 bg-indigo-900/20 border border-indigo-800/30 rounded-lg p-4">
                    <p className="text-xs text-indigo-200/80 leading-relaxed">
                      ℹ️ This is an official notice verified by campus administration. 
                      For any queries, please contact the relevant department.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-[#15181d]/95 backdrop-blur-sm border-t border-white/10 px-6 py-4">
                <Button
                  onClick={onClose}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
