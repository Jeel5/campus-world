"use client"

import { motion } from "framer-motion"
import { type Department } from "@/lib/library-service"
import { ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"

interface DepartmentCardProps {
  department: Department
  onClick: () => void
  index: number
}

export function DepartmentCard({ department, onClick, index }: DepartmentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -4 }}
    >
      <Card
        onClick={onClick}
        className="group relative overflow-hidden cursor-pointer border-0 bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-sm hover:from-white/[0.12] hover:to-white/[0.06] transition-all duration-300"
        style={{
          boxShadow: `0 0 0 1px ${department.color}15, 0 8px 24px -8px ${department.color}20`,
        }}
      >
        {/* Hover glow effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${department.color}15, transparent 70%)`,
          }}
        />

        <div className="relative p-6 space-y-4">
          {/* Icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
            style={{
              backgroundColor: `${department.color}20`,
              boxShadow: `0 4px 16px ${department.color}30`,
            }}
          >
            {department.icon}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-bold text-white leading-tight group-hover:text-white/90 transition-colors">
                {department.name}
              </h3>
              <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/70 group-hover:translate-x-1 transition-all flex-shrink-0 mt-0.5" />
            </div>
            
            <p className="text-sm text-white/60 leading-relaxed">
              {department.subtitle}
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 pt-2 text-xs text-white/50">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
              {department.code}
            </span>
            {department.semesterCount && (
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                {department.semesterCount} Semesters
              </span>
            )}
          </div>
        </div>

        {/* Bottom accent */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `linear-gradient(90deg, transparent, ${department.color}, transparent)`,
          }}
        />
      </Card>
    </motion.div>
  )
}
