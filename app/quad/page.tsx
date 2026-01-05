"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import {
  MessageSquare,
  Flame,
  Clock,
  Plus,
  ArrowBigUp,
  ArrowBigDown,
  TrendingUp,
  Search,
  Hash,
  Sparkles,
  Reply,
  Heart,
  Smile,
  Loader2,
  X,
  Eye,
  Send,
  Pin,
  Filter,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"
import {
  createThread,
  voteThread,
  subscribeToCollection,
  createComment,
  getThreadComments,
  voteComment,
  updateThreadViews,
  type Thread,
  type Comment,
  COLLECTIONS,
} from "@/lib/firestore"
import { orderBy, limit, where } from "firebase/firestore"
import { formatDistanceToNow } from "date-fns"

const categories = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "academic", label: "Academic", icon: Hash },
  { id: "social", label: "Social", icon: Smile },
  { id: "support", label: "Support", icon: Heart },
  { id: "rant", label: "Rant", icon: Flame },
  { id: "question", label: "Question", icon: MessageSquare },
]

export default function EnhancedQuadPage() {
  const { user, signInAnonymous } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("hot")
  const [activeCategory, setActiveCategory] = useState("all")
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [userVotes, setUserVotes] = useState<Record<string, number>>({})
  const [threadComments, setThreadComments] = useState<Record<string, Comment[]>>({})
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({})
  const [replyingTo, setReplyingTo] = useState<Record<string, boolean>>({})
  const [collapsedComments, setCollapsedComments] = useState<Set<string>>(new Set())
  const [showComposer, setShowComposer] = useState(false)
  const [composerTitle, setComposerTitle] = useState("")
  const [composerContent, setComposerContent] = useState("")
  const [composerCategory, setComposerCategory] = useState("academic")
  const [composerTags, setComposerTags] = useState<string[]>([])
  const [anonymous, setAnonymous] = useState(true)
  const [tagInput, setTagInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [submittingComment, setSubmittingComment] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const constraints =
      activeCategory !== "all"
        ? [where("category", "==", activeCategory), orderBy("createdAt", "desc"), limit(50)]
        : [orderBy("createdAt", "desc"), limit(50)]

    const unsubscribe = subscribeToCollection<Thread>(COLLECTIONS.THREADS, constraints, (threadsData) => {
      setThreads(threadsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [activeCategory])

  const loadComments = async (threadId: string) => {
    if (threadComments[threadId]) return

    try {
      const comments = await getThreadComments(threadId)
      setThreadComments((prev) => ({ ...prev, [threadId]: comments }))
      await updateThreadViews(threadId)
    } catch (err) {
      console.error("Error loading comments:", err)
    }
  }

  const toggleThread = (threadId: string) => {
    setExpandedThreads((prev) => {
      const next = new Set(prev)
      if (next.has(threadId)) {
        next.delete(threadId)
      } else {
        next.add(threadId)
        loadComments(threadId)
      }
      return next
    })
  }

  const handleVote = async (threadId: string, delta: number) => {
    if (!user) {
      await signInAnonymous()
      return
    }

    const currentVote = userVotes[threadId] || 0
    const newVote = currentVote === delta ? 0 : delta
    const scoreChange = newVote - currentVote

    setUserVotes((prev) => ({ ...prev, [threadId]: newVote }))
    setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, score: t.score + scoreChange } : t)))

    try {
      await voteThread(threadId, scoreChange)
    } catch (err) {
      setUserVotes((prev) => ({ ...prev, [threadId]: currentVote }))
      setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, score: t.score - scoreChange } : t)))
      console.error(err)
    }
  }

  const handleCommentVote = async (commentId: string, threadId: string, delta: number) => {
    if (!user) {
      await signInAnonymous()
      return
    }

    try {
      setThreadComments((prev) => ({
        ...prev,
        [threadId]: prev[threadId].map((c) => (c.id === commentId ? { ...c, score: c.score + delta } : c)),
      }))

      await voteComment(commentId, delta)
    } catch (err) {
      console.error(err)
    }
  }

  const heatScore = (thread: Thread) => {
    const commentsWeight = (thread.commentCount || 0) * 2
    const ageHours = thread.createdAt?.seconds ? (Date.now() - thread.createdAt.seconds * 1000) / 3600000 : 0
    const recency = Math.max(0, 48 - ageHours)
    return commentsWeight + recency + thread.score + thread.viewCount * 0.1
  }

  const sortedThreads = useMemo(() => {
    let filtered = threads

    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    return filtered.sort((a, b) => {
      if (activeTab === "best") return b.score - a.score
      if (activeTab === "new") return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      if (activeTab === "top") return b.score + b.commentCount * 2 - (a.score + a.commentCount * 2)
      return heatScore(b) - heatScore(a)
    })
  }, [threads, activeTab, searchQuery])

  const handleCreateThread = async () => {
    if (!composerTitle.trim() || !composerContent.trim()) {
      setError("Title and content are required")
      return
    }

    if (!user) {
      await signInAnonymous()
    }

    const threadData = {
      title: composerTitle.trim(),
      content: composerContent.trim(),
      author: anonymous ? `Anonymous ${user?.id.slice(-4)}` : user?.username || "User",
      authorId: user?.id || "anon",
      isAnonymous: anonymous,
      category: composerCategory,
      tags: composerTags,
      score: 0,
      upvotes: 0,
      downvotes: 0,
      commentCount: 0,
      viewCount: 0,
      isPinned: false,
      isLocked: false,
    }

    try {
      await createThread(threadData as any)
      setComposerTitle("")
      setComposerContent("")
      setComposerCategory("academic")
      setComposerTags([])
      setShowComposer(false)
      setError(null)
    } catch (err) {
      setError("Failed to create thread. Please try again.")
      console.error(err)
    }
  }

  const handleAddComment = async (threadId: string, parentId: string | null = null) => {
    const draftKey = parentId || threadId
    const content = commentDrafts[draftKey]
    if (!content?.trim()) return

    if (!user) {
      await signInAnonymous()
      return
    }

    const depth = parentId ? (threadComments[threadId]?.find((c) => c.id === parentId)?.depth || 0) + 1 : 0

    const commentData = {
      threadId,
      parentId,
      content: content.trim(),
      author: anonymous ? `Anonymous ${user?.id.slice(-4)}` : user?.username || "User",
      authorId: user?.id || "anon",
      isAnonymous: anonymous,
      score: 0,
      depth,
      isEdited: false,
      isDeleted: false,
    }

    try {
      setSubmittingComment(draftKey)
      
      // Clear draft immediately for better UX
      setCommentDrafts((prev) => {
        const next = { ...prev }
        delete next[draftKey]
        return next
      })

      await createComment(commentData as any)

      // Reload comments to get the new one
      const comments = await getThreadComments(threadId)
      setThreadComments((prev) => ({ ...prev, [threadId]: comments }))
      
      // Clear reply state
      if (parentId) {
        setReplyingTo((prev) => {
          const next = { ...prev }
          delete next[parentId]
          return next
        })
      }
    } catch (err) {
      console.error("Error adding comment:", err)
      // Restore draft on error
      setCommentDrafts((prev) => ({ ...prev, [draftKey]: content }))
    } finally {
      setSubmittingComment(null)
    }
  }

  const toggleCommentCollapse = (commentId: string) => {
    setCollapsedComments((prev) => {
      const next = new Set(prev)
      if (next.has(commentId)) {
        next.delete(commentId)
      } else {
        next.add(commentId)
      }
      return next
    })
  }

  const addTag = () => {
    if (tagInput.trim() && !composerTags.includes(tagInput.trim())) {
      setComposerTags([...composerTags, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setComposerTags(composerTags.filter((t) => t !== tag))
  }

  const renderComments = (comments: Comment[], threadId: string, depth: number = 0) => {
    const topLevel = comments.filter((c) => (depth === 0 ? !c.parentId : c.depth === depth))
    
    return topLevel.map((comment) => {
      const replies = comments.filter((c) => c.parentId === comment.id)
      const isCollapsed = collapsedComments.has(comment.id)
      const isReplying = replyingTo[comment.id]
      const draftKey = comment.id

      return (
        <motion.div
          key={comment.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("mt-3", depth > 0 && "ml-6 border-l-2 border-white/5 pl-4")}
        >
          <div className="flex gap-3">
            <Avatar className="w-8 h-8 border border-white/10 flex-shrink-0">
              <AvatarFallback className="bg-indigo-900/40 text-indigo-100 text-xs">
                {comment.isAnonymous ? "?" : comment.author.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-sm font-medium text-white/80">
                  {comment.isAnonymous ? "Anonymous" : comment.author}
                </span>
                <span className="text-xs text-white/40">
                  {comment.createdAt?.seconds
                    ? formatDistanceToNow(new Date(comment.createdAt.seconds * 1000), { addSuffix: true })
                    : "just now"}
                </span>
                {replies.length > 0 && (
                  <button
                    onClick={() => toggleCommentCollapse(comment.id)}
                    className="text-xs text-white/50 hover:text-white/80 flex items-center gap-1"
                  >
                    {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {isCollapsed ? `Show ${replies.length} ${replies.length === 1 ? "reply" : "replies"}` : "Collapse"}
                  </button>
                )}
              </div>
              
              <p className="text-sm text-white/70 leading-relaxed mb-2 break-words">{comment.content}</p>
              
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-white/5 text-white/60 hover:text-orange-400"
                    onClick={() => handleCommentVote(comment.id, threadId, 1)}
                  >
                    <ArrowBigUp className="w-4 h-4" />
                  </Button>
                  <span className="text-xs text-white/60 min-w-[24px] text-center font-medium">{comment.score}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-white/5 text-white/60 hover:text-blue-400"
                    onClick={() => handleCommentVote(comment.id, threadId, -1)}
                  >
                    <ArrowBigDown className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs hover:bg-white/5 text-white/60 hover:text-white"
                  onClick={() => setReplyingTo((prev) => ({ ...prev, [comment.id]: !prev[comment.id] }))}
                >
                  <Reply className="w-3 h-3 mr-1" />
                  Reply
                </Button>
              </div>

              {/* Reply Input */}
              {isReplying && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3"
                >
                  <Textarea
                    placeholder="Write a reply..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 text-sm min-h-[60px] resize-none"
                    value={commentDrafts[draftKey] || ""}
                    onChange={(e) => {
                      const textarea = e.target
                      textarea.style.height = 'auto'
                      textarea.style.height = textarea.scrollHeight + 'px'
                      setCommentDrafts((prev) => ({ ...prev, [draftKey]: e.target.value }))
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleAddComment(threadId, comment.id)
                      }
                    }}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button
                      onClick={() => handleAddComment(threadId, comment.id)}
                      disabled={!commentDrafts[draftKey]?.trim() || submittingComment === draftKey}
                      className="h-7 px-3 text-xs rounded-lg bg-indigo-800 hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {submittingComment === draftKey ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3 mr-1" />
                          Reply
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => {
                        setReplyingTo((prev) => {
                          const next = { ...prev }
                          delete next[comment.id]
                          return next
                        })
                        setCommentDrafts((prev) => {
                          const next = { ...prev }
                          delete next[draftKey]
                          return next
                        })
                      }}
                      variant="ghost"
                      className="h-7 px-3 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Nested Replies */}
              {!isCollapsed && replies.length > 0 && (
                <div className="mt-3">
                  {replies.map((reply) => renderComments([reply, ...comments], threadId, depth + 1))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )
    })
  }

  return (
    <div className="relative min-h-screen bg-[#111317] text-[#E6E6E3] overflow-x-hidden">
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#14181d] via-[#0f120f] to-[#111417]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_35%_30%,rgba(99,102,241,0.08),transparent_40%)]" />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10">
        <header className="mb-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-xs uppercase tracking-[0.3em] text-indigo-200">
            <MessageSquare className="w-4 h-4" /> Community Forum
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-white">
              The Quad — Your Voice, Your Space
            </h1>
            <p className="text-white/70 text-sm sm:text-base max-w-3xl">
              A safe space for students to connect, discuss, and support each other. Anonymous mode enabled.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              <Input
                className="pl-12 h-12 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-white/40"
                placeholder="Search threads, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="h-12 px-6 rounded-2xl border-white/10 hover:bg-white/5"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button
              onClick={() => setShowComposer(true)}
              className="h-12 px-6 rounded-2xl bg-indigo-900/60 hover:bg-indigo-900/70 text-indigo-100 border border-indigo-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Thread
            </Button>
          </div>

          {showFilters && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => {
                const Icon = cat.icon
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                      activeCategory === cat.id
                        ? "bg-indigo-900/60 text-indigo-100 border border-indigo-800"
                        : "bg-white/5 text-white/60 hover:bg-white/10",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {cat.label}
                  </button>
                )
              })}
            </motion.div>
          )}

          {mounted && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-white/5 border border-white/10">
                <TabsTrigger value="hot" className="gap-2">
                  <Flame className="w-4 h-4" />
                  Hot
                </TabsTrigger>
                <TabsTrigger value="best" className="gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Best
                </TabsTrigger>
                <TabsTrigger value="new" className="gap-2">
                  <Clock className="w-4 h-4" />
                  New
                </TabsTrigger>
                <TabsTrigger value="top" className="gap-2">
                  <ArrowBigUp className="w-4 h-4" />
                  Top
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </header>

        <div className="space-y-4">
          {loading ? (
            <Card className="bg-[#15181d] border border-white/5 rounded-3xl p-12 text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-indigo-500" />
            </Card>
          ) : sortedThreads.length === 0 ? (
            <Card className="bg-[#15181d] border border-white/5 rounded-3xl p-12 text-center">
              <p className="text-white/60 text-base">
                {searchQuery ? "No threads found" : "No threads yet. Be the first to post!"}
              </p>
            </Card>
          ) : (
            sortedThreads.map((thread, idx) => (
              <motion.div key={thread.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <Card className="bg-[#15181d] border border-white/5 hover:bg-[#181b21] transition-all rounded-3xl overflow-hidden">
                  <div className="p-6">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn("h-8 w-8 hover:bg-white/10", userVotes[thread.id] === 1 && "text-orange-400")}
                          onClick={() => handleVote(thread.id, 1)}
                        >
                          <ArrowBigUp className="w-5 h-5" />
                        </Button>
                        <span className="text-lg font-bold text-white">{thread.score}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn("h-8 w-8 hover:bg-white/10", userVotes[thread.id] === -1 && "text-blue-400")}
                          onClick={() => handleVote(thread.id, -1)}
                        >
                          <ArrowBigDown className="w-5 h-5" />
                        </Button>
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-white/50">
                          {thread.isPinned && (
                            <Badge variant="outline" className="border-green-800 text-green-400">
                              <Pin className="w-3 h-3 mr-1" />
                              Pinned
                            </Badge>
                          )}
                          <Badge variant="outline" className="border-white/10">
                            {thread.category}
                          </Badge>
                          <span>by {thread.isAnonymous ? "Anonymous" : thread.author}</span>
                          <span>•</span>
                          <span>
                            {thread.createdAt?.seconds
                              ? formatDistanceToNow(new Date(thread.createdAt.seconds * 1000), { addSuffix: true })
                              : "just now"}
                          </span>
                        </div>

                        <div>
                          <h3
                            className="text-xl font-bold text-white mb-2 cursor-pointer hover:text-indigo-200 transition-colors"
                            onClick={() => toggleThread(thread.id)}
                          >
                            {thread.title}
                          </h3>
                          <p className="text-white/70 text-sm line-clamp-3 leading-relaxed">{thread.content}</p>
                        </div>

                        {thread.tags && thread.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {thread.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="border-indigo-800/30 bg-indigo-900/20 text-indigo-200 text-xs"
                              >
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-6 text-white/60 text-sm">
                          <button
                            onClick={() => toggleThread(thread.id)}
                            className="flex items-center gap-2 hover:text-white transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>{thread.commentCount || 0} comments</span>
                          </button>
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            <span>{thread.viewCount || 0} views</span>
                          </div>
                        </div>

                        {expandedThreads.has(thread.id) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-6 pt-6 border-t border-white/10 space-y-4"
                          >
                            <div className="flex gap-3">
                              <Avatar className="w-8 h-8 border border-white/10 flex-shrink-0">
                                <AvatarFallback className="bg-indigo-900/40 text-indigo-100 text-xs">
                                  {anonymous ? "?" : user?.username?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <Textarea
                                  placeholder="Add a comment... (Press Enter to submit, Shift+Enter for new line)"
                                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 text-sm min-h-[80px] resize-none"
                                  value={commentDrafts[thread.id] || ""}
                                  onChange={(e) => {
                                    const textarea = e.target
                                    textarea.style.height = 'auto'
                                    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
                                    setCommentDrafts((prev) => ({ ...prev, [thread.id]: e.target.value }))
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault()
                                      handleAddComment(thread.id)
                                    }
                                  }}
                                />
                                <Button
                                  onClick={() => handleAddComment(thread.id)}
                                  disabled={!commentDrafts[thread.id]?.trim() || submittingComment === thread.id}
                                  className="mt-2 h-9 px-4 rounded-xl bg-indigo-800 hover:bg-indigo-700 disabled:opacity-50"
                                >
                                  {submittingComment === thread.id ? (
                                    <>
                                      <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                      Posting...
                                    </>
                                  ) : (
                                    <>
                                      <Send className="w-3 h-3 mr-2" />
                                      Comment
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>

                            {threadComments[thread.id] && threadComments[thread.id].length > 0 ? (
                              <div className="space-y-1">{renderComments(threadComments[thread.id], thread.id)}</div>
                            ) : (
                              <p className="text-center text-white/40 text-sm py-6">No comments yet. Be the first to share your thoughts!</p>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {mounted && showComposer && createPortal(
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ zIndex: 999999, position: 'fixed', inset: 0 }}
          className="flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowComposer(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-[#15181d] border border-white/10 rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Create Thread</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowComposer(false)} className="hover:bg-white/10">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-900/20 border border-red-800/30 text-red-200 text-sm">{error}</div>
              )}

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div>
                  <Label className="text-white font-medium">Post Anonymously</Label>
                  <p className="text-xs text-white/50">Your username won't be shown</p>
                </div>
                <Switch checked={anonymous} onCheckedChange={setAnonymous} />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Category</Label>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(1).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setComposerCategory(cat.id)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                        composerCategory === cat.id
                          ? "bg-indigo-900/60 text-indigo-100 border border-indigo-800"
                          : "bg-white/5 text-white/60 hover:bg-white/10",
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Title *</Label>
                <Input
                  placeholder="What's your thread about?"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                  value={composerTitle}
                  onChange={(e) => setComposerTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Content *</Label>
                <Textarea
                  placeholder="Share your thoughts..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[150px] resize-none"
                  value={composerContent}
                  onChange={(e) => setComposerContent(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tags..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                  />
                  <Button onClick={addTag} variant="outline" className="border-white/10">
                    Add
                  </Button>
                </div>
                {composerTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {composerTags.map((tag) => (
                      <Badge key={tag} variant="outline" className="border-indigo-800/30 bg-indigo-900/20 text-indigo-200">
                        #{tag}
                        <button onClick={() => removeTag(tag)} className="ml-2">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setShowComposer(false)}
                  variant="outline"
                  className="flex-1 border-white/10 hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateThread} className="flex-1 bg-indigo-800 hover:bg-indigo-700">
                  Create Thread
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>,
        document.body
      )}
    </div>
  )
}
