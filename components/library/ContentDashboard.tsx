"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { type Subject, type CuratedLink, validateLinks } from "@/lib/library-service"
import {
  FileText,
  BookOpen,
  Presentation,
  Link2,
  ExternalLink,
  Youtube,
  Github,
  FileCode,
  Wrench,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface ContentDashboardProps {
  subject: Subject
  departmentColor: string
  onClose: () => void
}

export function ContentDashboard({ subject, departmentColor, onClose }: ContentDashboardProps) {
  const [mounted, setMounted] = useState(false)
  const [validatedLinks, setValidatedLinks] = useState<CuratedLink[]>([])
  const [validatingLinks, setValidatingLinks] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (subject.contents?.curatedLinks) {
      setValidatingLinks(true)
      validateLinks(subject.contents.curatedLinks).then((links) => {
        setValidatedLinks(links)
        setValidatingLinks(false)
      })
    }
  }, [subject])

  const getSourceIcon = (source: string) => {
    const lower = source.toLowerCase()
    if (lower.includes("youtube")) return <Youtube className="w-4 h-4" />
    if (lower.includes("github")) return <Github className="w-4 h-4" />
    if (lower.includes("mdn") || lower.includes("docs")) return <FileCode className="w-4 h-4" />
    return <Link2 className="w-4 h-4" />
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "video":
        return "#ef4444"
      case "article":
        return "#3b82f6"
      case "repo":
        return "#8b5cf6"
      case "tool":
        return "#f59e0b"
      case "documentation":
        return "#10b981"
      default:
        return departmentColor
    }
  }

  return mounted ? createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ zIndex: 999999, position: 'fixed', inset: 0 }}
      className="bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-5xl max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="border-0 bg-gradient-to-br from-[#1a1d24] to-[#13161a] shadow-2xl overflow-hidden">
          {/* Header */}
          <div
            className="relative p-6 border-b"
            style={{
              borderColor: `${departmentColor}20`,
              background: `linear-gradient(135deg, ${departmentColor}08, transparent)`,
            }}
          >
            <Button
              onClick={onClose}
              size="icon"
              variant="ghost"
              className="absolute top-4 right-4 text-white/60 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>

            <div className="space-y-3 pr-12">
              <Badge
                className="text-xs font-semibold px-3 py-1 border-0"
                style={{
                  backgroundColor: `${departmentColor}30`,
                  color: 'white',
                }}
              >
                {subject.code}
              </Badge>

              <h2 className="text-2xl font-bold text-white leading-tight">
                {subject.name}
              </h2>

              <p className="text-sm text-white/70 leading-relaxed max-w-3xl">
                {subject.description}
              </p>
            </div>
          </div>

          {/* Content Tabs */}
          <div className="overflow-y-auto max-h-[calc(85vh-180px)]">
            <Tabs defaultValue="materials" className="w-full">
              <div className="sticky top-0 z-10 bg-[#1a1d24]/95 backdrop-blur-sm border-b border-white/5">
                <TabsList className="w-full justify-start h-auto p-4 bg-transparent gap-2 rounded-none">
                  <TabsTrigger
                    value="materials"
                    className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 px-4 py-2 rounded-lg"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Materials ({subject.contents?.materials?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger
                    value="books"
                    className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 px-4 py-2 rounded-lg"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Books ({subject.contents?.books?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger
                    value="ppts"
                    className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 px-4 py-2 rounded-lg"
                  >
                    <Presentation className="w-4 h-4 mr-2" />
                    Slides ({subject.contents?.ppts?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger
                    value="links"
                    className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 px-4 py-2 rounded-lg"
                  >
                    <Link2 className="w-4 h-4 mr-2" />
                    Curated Links ({validatedLinks.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="extra"
                    className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 px-4 py-2 rounded-lg"
                  >
                    <Wrench className="w-4 h-4 mr-2" />
                    Extra ({subject.contents?.extraResources?.length || 0})
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                {/* Study Materials */}
                <TabsContent value="materials" className="mt-0 space-y-3">
                  {subject.contents?.materials?.length ? (
                    subject.contents.materials.map((material, idx) => (
                      <motion.a
                        key={idx}
                        href={material.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="block group"
                      >
                        <Card className="p-4 border-0 bg-white/[0.04] hover:bg-white/[0.08] transition-all duration-200">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: `${departmentColor}20` }}
                              >
                                <FileText className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-white group-hover:text-white/90 transition-colors">
                                  {material.title}
                                </h4>
                                <p className="text-xs text-white/50 mt-1">
                                  {material.type.toUpperCase()} • {material.uploadDate ? new Date(material.uploadDate).toLocaleDateString() : 'No date'}
                                </p>
                              </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors flex-shrink-0" />
                          </div>
                        </Card>
                      </motion.a>
                    ))
                  ) : (
                    <EmptyState icon={FileText} message="No study materials available yet" />
                  )}
                </TabsContent>

                {/* Reference Books */}
                <TabsContent value="books" className="mt-0 space-y-3">
                  {subject.contents?.books?.length ? (
                    subject.contents.books.map((book, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Card className="p-4 border-0 bg-white/[0.04] hover:bg-white/[0.08] transition-all duration-200">
                          <div className="flex items-start gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: `${departmentColor}20` }}
                            >
                              <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-white">{book.title}</h4>
                              <p className="text-sm text-white/60 mt-1">by {book.author}</p>
                              {book.isbn && (
                                <p className="text-xs text-white/40 mt-1">ISBN: {book.isbn}</p>
                              )}
                              {book.url && (
                                <a
                                  href={book.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs mt-2 text-blue-400 hover:text-blue-300"
                                >
                                  View Book <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))
                  ) : (
                    <EmptyState icon={BookOpen} message="No reference books available yet" />
                  )}
                </TabsContent>

                {/* PPT / Slides */}
                <TabsContent value="ppts" className="mt-0 space-y-3">
                  {subject.contents?.ppts?.length ? (
                    subject.contents.ppts.map((ppt, idx) => (
                      <motion.a
                        key={idx}
                        href={ppt.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="block group"
                      >
                        <Card className="p-4 border-0 bg-white/[0.04] hover:bg-white/[0.08] transition-all duration-200">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: `${departmentColor}20` }}
                              >
                                <Presentation className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-white group-hover:text-white/90 transition-colors">
                                  {ppt.title}
                                </h4>
                                <p className="text-xs text-white/50 mt-1">{ppt.slides} slides</p>
                              </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors flex-shrink-0" />
                          </div>
                        </Card>
                      </motion.a>
                    ))
                  ) : (
                    <EmptyState icon={Presentation} message="No presentation slides available yet" />
                  )}
                </TabsContent>

                {/* Curated Links */}
                <TabsContent value="links" className="mt-0 space-y-3">
                  {validatingLinks ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-8 h-8 border-4 border-white/20 border-t-white/80 rounded-full mx-auto mb-3" />
                      <p className="text-sm text-white/60">Validating links...</p>
                    </div>
                  ) : validatedLinks.length ? (
                    validatedLinks.map((link, idx) => (
                      <motion.a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="block group"
                      >
                        <Card className="p-4 border-0 bg-white/[0.04] hover:bg-white/[0.08] transition-all duration-200">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: getTypeBadgeColor(link.type) + '30' }}
                              >
                                {getSourceIcon(link.source)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-white group-hover:text-white/90 transition-colors">
                                    {link.title}
                                  </h4>
                                  {link.verified && (
                                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge
                                    className="text-xs px-2 py-0.5 border-0"
                                    style={{
                                      backgroundColor: getTypeBadgeColor(link.type) + '25',
                                      color: 'white',
                                    }}
                                  >
                                    {link.type}
                                  </Badge>
                                  <span className="text-xs text-white/50">{link.source}</span>
                                  {link.isAvailable === false && (
                                    <Badge className="text-xs px-2 py-0.5 bg-red-500/20 text-red-300 border-0">
                                      <AlertCircle className="w-3 h-3 mr-1" />
                                      Unavailable
                                    </Badge>
                                  )}
                                </div>
                                {link.description && (
                                  <p className="text-xs text-white/60 mt-2 leading-relaxed">
                                    {link.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors flex-shrink-0 mt-1" />
                          </div>
                        </Card>
                      </motion.a>
                    ))
                  ) : (
                    <EmptyState icon={Link2} message="No curated links available yet" />
                  )}
                </TabsContent>

                {/* Extra Resources */}
                <TabsContent value="extra" className="mt-0 space-y-3">
                  {subject.contents?.extraResources?.length ? (
                    subject.contents.extraResources.map((resource, idx) => (
                      <motion.a
                        key={idx}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="block group"
                      >
                        <Card className="p-4 border-0 bg-white/[0.04] hover:bg-white/[0.08] transition-all duration-200">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: `${departmentColor}20` }}
                              >
                                <Wrench className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-white group-hover:text-white/90 transition-colors">
                                  {resource.title}
                                </h4>
                                <p className="text-xs text-white/50 mt-1 capitalize">{resource.type}</p>
                              </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors flex-shrink-0" />
                          </div>
                        </Card>
                      </motion.a>
                    ))
                  ) : (
                    <EmptyState icon={Wrench} message="No extra resources available yet" />
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </Card>
      </motion.div>
    </motion.div>,
    document.body
  ) : null
}

function EmptyState({ icon: Icon, message }: { icon: any; message: string }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-white/30" />
      </div>
      <p className="text-sm text-white/50">{message}</p>
    </div>
  )
}
