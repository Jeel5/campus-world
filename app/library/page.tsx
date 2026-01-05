"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  BookOpen,
  Home,
  ChevronRight,
  ArrowLeft,
  Grid3x3,
  List,
  SortAsc,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  getDepartments,
  getSemesters,
  getSubjects,
  searchSubjects,
  type Department,
  type Semester,
  type Subject,
} from "@/lib/library-service"
import { DepartmentCard } from "@/components/library/DepartmentCard"
import { SemesterSection } from "@/components/library/SemesterSection"
import { SubjectCard } from "@/components/library/SubjectCard"
import { ContentDashboard } from "@/components/library/ContentDashboard"

type ViewState = "departments" | "semesters" | "subjects" | "content"

interface BreadcrumbItem {
  label: string
  onClick: () => void
}

export default function LibraryPage() {
  // State management
  const [viewState, setViewState] = useState<ViewState>("departments")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<"name" | "code">("name")

  // Data state
  const [departments, setDepartments] = useState<Department[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [subjectCounts, setSubjectCounts] = useState<Record<string, number>>({})

  // Selection state
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [expandedSemester, setExpandedSemester] = useState<string | null>(null)

  // Load departments on mount
  useEffect(() => {
    loadDepartments()
  }, [])

  // Search functionality
  useEffect(() => {
    if (searchQuery && viewState === "subjects") {
      const delayDebounce = setTimeout(() => {
        searchSubjects(searchQuery).then((results) => {
          setSubjects(results)
        })
      }, 300)
      return () => clearTimeout(delayDebounce)
    }
  }, [searchQuery, viewState])

  async function loadDepartments() {
    setLoading(true)
    const depts = await getDepartments()
    setDepartments(depts)
    setLoading(false)
  }

  async function handleDepartmentClick(department: Department) {
    setSelectedDepartment(department)
    setViewState("semesters")
    setLoading(true)

    const sems = await getSemesters(department.id)
    
    // Load subject counts for each semester
    const counts: Record<string, number> = {}
    await Promise.all(
      sems.map(async (sem) => {
        const subjects = await getSubjects(department.id, sem.id)
        counts[sem.id] = subjects.length
      })
    )

    setSemesters(sems)
    setSubjectCounts(counts)
    setLoading(false)
  }

  async function handleSemesterClick(semester: Semester) {
    if (!selectedDepartment) return

    setSelectedSemester(semester)
    setViewState("subjects")
    setLoading(true)

    const subs = await getSubjects(selectedDepartment.id, semester.id)
    setSubjects(subs)
    setLoading(false)
  }

  function handleSubjectClick(subject: Subject) {
    setSelectedSubject(subject)
    setViewState("content")
  }

  function handleBackToDepartments() {
    setViewState("departments")
    setSelectedDepartment(null)
    setSemesters([])
  }

  function handleBackToSemesters() {
    setViewState("semesters")
    setSelectedSemester(null)
    setSubjects([])
  }

  function handleCloseContent() {
    setSelectedSubject(null)
    setViewState("subjects")
  }

  // Breadcrumb navigation
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Library", onClick: handleBackToDepartments },
  ]
  if (selectedDepartment) {
    breadcrumbs.push({
      label: selectedDepartment.name,
      onClick: handleBackToSemesters,
    })
  }
  if (selectedSemester) {
    breadcrumbs.push({
      label: selectedSemester.name,
      onClick: () => setViewState("subjects"),
    })
  }

  // Sort subjects
  const sortedSubjects = [...subjects].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name)
    }
    return a.code.localeCompare(b.code)
  })

  return (
    <div className="relative min-h-screen bg-[#111317] text-[#E6E6E3] overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#16181d] via-[#11140f] to-[#13161a]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_25%_25%,rgba(245,158,11,0.08),transparent_40%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_75%_60%,rgba(251,191,36,0.06),transparent_35%)]" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <header className="mb-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-xs uppercase tracking-[0.3em] text-amber-200">
            <BookOpen className="w-4 h-4" /> Knowledge Sanctuary
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-white">
              The Library
            </h1>
            <p className="text-white/70 text-sm sm:text-base md:text-lg max-w-3xl">
              Comprehensive resources organized by department, semester, and subject. Everything you need to excel in your studies.
            </p>
          </div>
        </header>

        {/* Breadcrumb Navigation */}
        {viewState !== "departments" && viewState !== "content" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <nav className="flex items-center gap-2 text-sm">
              {breadcrumbs.map((crumb, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {idx > 0 && <ChevronRight className="w-4 h-4 text-white/30" />}
                  <button
                    onClick={crumb.onClick}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    {crumb.label}
                  </button>
                </div>
              ))}
            </nav>
          </motion.div>
        )}

        {/* Search & Controls */}
        {(viewState === "subjects" || viewState === "departments") && (
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                <Input
                  className="pl-12 h-12 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-white/40 focus:border-white/20"
                  placeholder={
                    viewState === "subjects"
                      ? "Search subjects..."
                      : "Search departments..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {viewState === "subjects" && (
                <Button
                  onClick={() => setSortBy(sortBy === "name" ? "code" : "name")}
                  className="h-12 px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10"
                >
                  <SortAsc className="w-4 h-4 mr-2" />
                  Sort by {sortBy === "name" ? "Code" : "Name"}
                </Button>
              )}
            </motion.div>
          </div>
        )}

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-20"
            >
              <div className="space-y-4 text-center">
                <div className="animate-spin w-12 h-12 border-4 border-amber-700 border-t-transparent rounded-full mx-auto" />
                <p className="text-white/60 text-sm">Loading...</p>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Departments View */}
              {viewState === "departments" && (
                <motion.div
                  key="departments"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {departments.map((dept, idx) => (
                      <DepartmentCard
                        key={dept.id}
                        department={dept}
                        onClick={() => handleDepartmentClick(dept)}
                        index={idx}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Semesters View */}
              {viewState === "semesters" && selectedDepartment && (
                <motion.div
                  key="semesters"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <Button
                      onClick={handleBackToDepartments}
                      variant="ghost"
                      className="text-white/60 hover:text-white hover:bg-white/5"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Departments
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {semesters.map((sem) => (
                      <SemesterSection
                        key={sem.id}
                        semester={sem}
                        departmentColor={selectedDepartment.color}
                        isExpanded={expandedSemester === sem.id}
                        onToggle={() =>
                          setExpandedSemester(
                            expandedSemester === sem.id ? null : sem.id
                          )
                        }
                        onSelect={() => handleSemesterClick(sem)}
                        subjectCount={subjectCounts[sem.id] || 0}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Subjects View */}
              {viewState === "subjects" && selectedDepartment && selectedSemester && (
                <motion.div
                  key="subjects"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <Button
                      onClick={handleBackToSemesters}
                      variant="ghost"
                      className="text-white/60 hover:text-white hover:bg-white/5"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Semesters
                    </Button>
                  </div>

                  {sortedSubjects.length === 0 ? (
                    <Card className="bg-white/[0.03] border-0 p-12 text-center">
                      <BookOpen className="w-12 h-12 text-white/30 mx-auto mb-4" />
                      <p className="text-white/60">
                        {searchQuery
                          ? "No subjects match your search"
                          : "No subjects available yet"}
                      </p>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {sortedSubjects.map((subject, idx) => (
                        <SubjectCard
                          key={subject.id}
                          subject={subject}
                          departmentColor={selectedDepartment.color}
                          onClick={() => handleSubjectClick(subject)}
                          index={idx}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>

        {/* Content Dashboard Modal */}
        <AnimatePresence>
          {viewState === "content" && selectedSubject && selectedDepartment && (
            <ContentDashboard
              key="content"
              subject={selectedSubject}
              departmentColor={selectedDepartment.color}
              onClose={handleCloseContent}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
