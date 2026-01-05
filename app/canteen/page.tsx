"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Timer, MessageSquare, Heart, Plus, Camera, Send } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/context/AuthContext"
import {
  getCanteenPosts,
  likeCanteenPost,
  subscribeToCollection,
  type CanteenPost,
  COLLECTIONS,
} from "@/lib/firestore"
import { where, orderBy, Timestamp } from "firebase/firestore"
import { formatDistanceToNow } from "date-fns"

export default function CanteenPage() {
  const { user, signInAnonymous } = useAuth()
  const [canteenPosts, setCanteenPosts] = useState<CanteenPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Subscribe to real-time canteen posts that haven't expired
    const now = Timestamp.now()
    const unsubscribe = subscribeToCollection<CanteenPost>(
      COLLECTIONS.CANTEEN_POSTS,
      [where("expiresAt", ">", now), orderBy("expiresAt", "desc"), orderBy("createdAt", "desc")],
      (posts) => {
        setCanteenPosts(posts)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [])

  const handleLike = async (postId: string) => {
    if (!user) {
      await signInAnonymous()
      return
    }

    try {
      // Optimistic update
      setCanteenPosts((prev) => prev.map((post) => (post.id === postId ? { ...post, likes: post.likes + 1 } : post)))
      await likeCanteenPost(postId)
    } catch (error) {
      console.error("Error liking post:", error)
      // Revert on error
      setCanteenPosts((prev) => prev.map((post) => (post.id === postId ? { ...post, likes: post.likes - 1 } : post)))
    }
  }

  return (
    <div className="relative min-h-screen bg-[#111317] text-[#E6E6E3] overflow-x-hidden">
      {/* Warm Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#17141d] via-[#100f12] to-[#131116]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_40%_20%,rgba(244,63,94,0.08),transparent_40%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_65%_65%,rgba(236,72,153,0.06),transparent_35%)]" />
      
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-10">
      <header className="mb-10 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-xs uppercase tracking-[0.3em] text-rose-200">
          <Timer className="w-4 h-4" /> Social lounge
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-white">
            The Canteen — where vibes are temporary.
          </h1>
          <p className="text-white/70 text-sm sm:text-base md:text-lg max-w-3xl">
            Memes, confessions, and lighthearted moments. Everything expires — no permanent record, just vibes.
          </p>
        </div>
        <Button className="h-12 px-6 rounded-2xl bg-rose-900/60 hover:bg-rose-900/70 text-rose-100 border border-rose-800">
          <Plus className="w-4 h-4 mr-2" />
          Post something
        </Button>
      </header>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        <Card className="bg-[#15181d] border border-white/5 rounded-3xl p-6 space-y-4 break-inside-avoid">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border border-white/10">
              <AvatarFallback className="bg-rose-900/40 text-rose-100 font-bold text-sm">
                {user?.username.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <Input
              placeholder="Share something temporary..."
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-white/5 hover:bg-white/10">
              <Camera className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-white/5 hover:bg-white/10">
              <Timer className="w-5 h-5" />
            </Button>
            <Button className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/80">
              <Send className="w-4 h-4 mr-2" />
              <span className="text-[10px] font-black uppercase tracking-widest">Blast</span>
            </Button>
          </div>
        </Card>

        {loading ? (
          <Card className="bg-white/[0.02] border-white/5 rounded-[2.5rem] p-20 text-center break-inside-avoid">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          </Card>
        ) : canteenPosts.length === 0 ? (
          <Card className="bg-white/[0.02] border-white/5 rounded-[2.5rem] p-20 text-center break-inside-avoid">
            <p className="text-muted-foreground text-lg">No active posts. Start the conversation!</p>
          </Card>
        ) : (
          canteenPosts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="break-inside-avoid"
            >
              <Card className="bg-[#15181d] border border-white/5 hover:bg-[#181b21] transition-all rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        post.type === "confession" ? "bg-rose-900/40 text-rose-100 border-rose-800" : "bg-amber-900/40 text-amber-100 border-amber-800"
                      }`}
                    >
                      {post.type}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-rose-200">
                      <Timer className="w-3.5 h-3.5" />
                      {post.expiresAt?.seconds
                        ? formatDistanceToNow(new Date(post.expiresAt.seconds * 1000), { addSuffix: false }) + " left"
                        : "expiring soon"}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {post.imageUrl && (
                      <div className="rounded-2xl overflow-hidden bg-white/5\">
                        <img src={post.imageUrl || "/placeholder.svg"} alt="Content" className="w-full h-auto" />
                      </div>
                    )}
                    <p className="text-white/80 leading-relaxed text-base\">
                      {post.type === "confession" && '"'}
                      {post.content}
                      {post.type === "confession" && '"'}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-4\">
                    <button
                      onClick={() => handleLike(post.id)}
                      className="flex items-center gap-2 text-white/60 hover:text-rose-200 transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm">{post.comments}</span>
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
      </div>
    </div>
  )
}

