"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { type Semester } from "@/lib/library-service"
import { ChevronDown, Calendar, BookOpen } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface SemesterSectionProps {
  semester: Semester
  departmentColor: string
  isExpanded: boolean
  onToggle: () => void
  onSelect: () => void
  subjectCount: number
}

export function SemesterSection({
  semester,
  departmentColor,
  isExpanded,
  onToggle,
  onSelect,
  subjectCount,
}: SemesterSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className="border-0 bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-sm overflow-hidden"
        style={{
          boxShadow: `0 0 0 1px ${departmentColor}10, 0 4px 12px -4px ${departmentColor}15`,
        }}
      >
        <div
          className="p-4 cursor-pointer hover:bg-white/[0.03] transition-colors"
          onClick={onToggle}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              {/* Semester number badge */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-lg flex-shrink-0"
                style={{
                  backgroundColor: `${departmentColor}30`,
                  boxShadow: `0 2px 8px ${departmentColor}20`,
                }}
              >
                {semester.number}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold text-white mb-1">
                  {semester.name}
                </h4>
                <div className="flex items-center gap-3 text-xs text-white/50">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    {subjectCount} {subjectCount === 1 ? 'Subject' : 'Subjects'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect()
                }}
                size="sm"
                className="h-8 px-3 text-xs rounded-lg"
                style={{
                  backgroundColor: `${departmentColor}25`,
                  color: 'white',
                  border: `1px solid ${departmentColor}40`,
                }}
              >
                View Subjects
              </Button>

              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-white/40" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Expandable preview */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div
                className="px-4 pb-4 pt-2 border-t"
                style={{ borderColor: `${departmentColor}15` }}
              >
                <p className="text-xs text-white/60 leading-relaxed">
                  This semester contains {subjectCount} {subjectCount === 1 ? 'subject' : 'subjects'} with comprehensive study materials, reference books, presentations, and curated learning resources.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}
