"use client"

import { motion } from "framer-motion"
import { type Subject } from "@/lib/library-service"
import { BookOpen, FileText, Presentation, Link2, Sparkles } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface SubjectCardProps {
  subject: Subject
  departmentColor: string
  onClick: () => void
  index: number
}

export function SubjectCard({ subject, departmentColor, onClick, index }: SubjectCardProps) {
  const contentCounts = {
    materials: subject.contents?.materials?.length || 0,
    books: subject.contents?.books?.length || 0,
    ppts: subject.contents?.ppts?.length || 0,
    links: subject.contents?.curatedLinks?.length || 0,
  }

  const totalContent = Object.values(contentCounts).reduce((a, b) => a + b, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      whileHover={{ y: -3 }}
    >
      <Card
        onClick={onClick}
        className="group relative overflow-hidden cursor-pointer border-0 bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-sm hover:from-white/[0.10] hover:to-white/[0.05] transition-all duration-300 h-full"
        style={{
          boxShadow: `0 0 0 1px ${departmentColor}12, 0 6px 20px -6px ${departmentColor}18`,
        }}
      >
        {/* Hover gradient */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at 80% 20%, ${departmentColor}12, transparent 60%)`,
          }}
        />

        <div className="relative p-5 space-y-4">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <Badge
                className="text-xs font-semibold px-2.5 py-0.5 border-0"
                style={{
                  backgroundColor: `${departmentColor}25`,
                  color: 'white',
                }}
              >
                {subject.code}
              </Badge>
              {subject.credits && (
                <span className="text-xs text-white/50 font-medium">
                  {subject.credits} credits
                </span>
              )}
            </div>

            <h4 className="text-base font-bold text-white leading-tight group-hover:text-white/95 transition-colors line-clamp-2">
              {subject.name}
            </h4>

            <p className="text-sm text-white/60 leading-relaxed line-clamp-2">
              {subject.description || 'No description available'}
            </p>
          </div>

          {/* Content badges */}
          <div className="flex flex-wrap gap-2">
            {contentCounts.materials > 0 && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                style={{
                  backgroundColor: `${departmentColor}15`,
                  color: 'white',
                }}
              >
                <FileText className="w-3.5 h-3.5" />
                {contentCounts.materials} PDF
              </div>
            )}
            {contentCounts.ppts > 0 && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                style={{
                  backgroundColor: `${departmentColor}15`,
                  color: 'white',
                }}
              >
                <Presentation className="w-3.5 h-3.5" />
                {contentCounts.ppts} PPT
              </div>
            )}
            {contentCounts.links > 0 && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                style={{
                  backgroundColor: `${departmentColor}15`,
                  color: 'white',
                }}
              >
                <Link2 className="w-3.5 h-3.5" />
                {contentCounts.links} Links
              </div>
            )}
            {contentCounts.books > 0 && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                style={{
                  backgroundColor: `${departmentColor}15`,
                  color: 'white',
                }}
              >
                <BookOpen className="w-3.5 h-3.5" />
                {contentCounts.books} Books
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <span className="text-xs text-white/50 font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {totalContent} Resources
            </span>
            <span className="text-xs text-white/40 group-hover:text-white/70 transition-colors">
              View →
            </span>
          </div>
        </div>

        {/* Bottom accent */}
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `linear-gradient(90deg, transparent, ${departmentColor}, transparent)`,
          }}
        />
      </Card>
    </motion.div>
  )
}
