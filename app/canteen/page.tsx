"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Heart, Plus, Send, X, Image as ImageIcon, Video as VideoIcon, 
  BarChart3, Smile, MessageSquare, Loader2
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/hooks/use-toast"
import {
  subscribeToCollection,
  createCanteenPost,
  likeCanteenPost,
  createCanteenComment,
  getCanteenComments,
  type CanteenPost,
  type CanteenComment,
  COLLECTIONS,
} from "@/lib/firestore"
import { orderBy, limit } from "firebase/firestore"
import { formatDistanceToNow } from "date-fns"

export default function CanteenPage() {
  const { user, signInAnonymous } = useAuth()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [posts, setPosts] = useState<CanteenPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  // Create post form
  const [postType, setPostType] = useState<"text" | "image" | "video" | "poll">("text")
  const [postContent, setPostContent] = useState("")
  const [mediaUrl, setMediaUrl] = useState("")
  const [pollQuestion, setPollQuestion] = useState("")
  const [pollOptions, setPollOptions] = useState(["", ""])
  
  // Comments
  const [postComments, setPostComments] = useState<Record<string, CanteenComment[]>>({})
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})
  const [showCommentsFor, setShowCommentsFor] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const unsubscribe = subscribeToCollection<CanteenPost>(
      COLLECTIONS.CANTEEN_POSTS,
      [orderBy("createdAt", "desc"), limit(50)],
      (fetchedPosts) => {
        setPosts(fetchedPosts)
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size
    const maxSize = type === "image" ? 10 * 1024 * 1024 : 50 * 1024 * 1024 // 10MB for images, 50MB for videos
    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: `${type === "image" ? "Images" : "Videos"} must be under ${type === "image" ? "10MB" : "50MB"}`,
      })
      event.target.value = ""
      return
    }

    // Validate file type
    const validTypes = type === "image" 
      ? ["image/jpeg", "image/png", "image/gif", "image/webp"]
      : ["video/mp4", "video/quicktime", "video/x-msvideo"]
    
    if (!validTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: `Please select a valid ${type} file`,
      })
      event.target.value = ""
      return
    }

    try {
      setUploading(true)
      
      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "")
      
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`,
        {
          method: "POST",
          body: formData,
        }
      )

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()
      setMediaUrl(data.secure_url)
      setPostType(type)
      
      toast({
        title: "✅ Upload Successful",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully!`,
      })
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Failed to upload media. Please try again.",
      })
      event.target.value = ""
    } finally {
      setUploading(false)
    }
  }

  const handleCreatePost = async () => {
    if (!user) {
      await signInAnonymous()
      return
    }

    if (!postContent.trim() && !mediaUrl && postType !== "poll") {
      toast({
        variant: "destructive",
        title: "Content Required",
        description: "Please add some content to your post",
      })
      return
    }

    if (postType === "poll" && (!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2)) {
      toast({
        variant: "destructive",
        title: "Invalid Poll",
        description: "Please add a question and at least 2 options",
      })
      return
    }

    try {
      setUploading(true)

      const postData: any = {
        content: postContent,
        type: postType,
        authorId: user.id,
        author: user.username || "Anonymous",
        isAnonymous: false,
      }

      // Only add mediaUrl if it exists
      if (mediaUrl) {
        postData.mediaUrl = mediaUrl
      }

      // Only add mediaType if it's image or video
      if (postType === "image" || postType === "video") {
        postData.mediaType = postType
      }

      if (postType === "poll") {
        postData.pollData = {
          question: pollQuestion,
          options: pollOptions
            .filter(o => o.trim())
            .map((text, idx) => ({
              id: `opt-${idx}`,
              text: text.trim(),
              votes: 0,
              votedBy: []
            }))
        }
      }

      await createCanteenPost(postData)

      toast({
        title: "✅ Post Created!",
        description: "Your post has been shared with everyone",
        className: "bg-gradient-to-r from-rose-900/90 to-pink-800/90 border-rose-700 text-white",
      })

      setShowCreateModal(false)
      setPostContent("")
      setMediaUrl("")
      setPollQuestion("")
      setPollOptions(["", ""])
      setPostType("text")
    } catch (error) {
      console.error("Error creating post:", error)
      toast({
        variant: "destructive",
        title: "Post Failed",
        description: "Failed to create post. Please try again.",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleLike = async (postId: string, isLiked: boolean) => {
    if (!user) {
      await signInAnonymous()
      return
    }

    try {
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likes: isLiked ? post.likes - 1 : post.likes + 1,
            likedBy: isLiked 
              ? post.likedBy.filter(id => id !== user.id)
              : [...post.likedBy, user.id]
          }
        }
        return post
      }))

      await likeCanteenPost(postId, user.id)
    } catch (error) {
      console.error("Error liking post:", error)
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likes: isLiked ? post.likes + 1 : post.likes - 1,
            likedBy: isLiked
              ? [...post.likedBy, user.id]
              : post.likedBy.filter(id => id !== user.id)
          }
        }
        return post
      }))
    }
  }

  const loadComments = async (postId: string) => {
    if (showCommentsFor === postId) {
      setShowCommentsFor(null)
      return
    }

    try {
      const comments = await getCanteenComments(postId)
      setPostComments(prev => ({ ...prev, [postId]: comments }))
      setShowCommentsFor(postId)
    } catch (error) {
      console.error("Error loading comments:", error)
    }
  }

  const handleComment = async (postId: string) => {
    if (!user) {
      await signInAnonymous()
      return
    }

    const content = commentInputs[postId]?.trim()
    if (!content) return

    try {
      // Optimistic update - increment comment count immediately
      setPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, comments: post.comments + 1 } : post
      ))

      await createCanteenComment({
        postId,
        content,
        authorId: user.id,
        author: user.username || "Anonymous",
      })

      // Reload comments to show new comment
      const comments = await getCanteenComments(postId)
      setPostComments(prev => ({ ...prev, [postId]: comments }))
      
      setCommentInputs(prev => ({ ...prev, [postId]: "" }))
      
      toast({
        title: "Comment Posted",
        description: "Your comment has been added!",
      })
    } catch (error) {
      console.error("Error posting comment:", error)
      // Revert optimistic update on error
      setPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, comments: Math.max(0, post.comments - 1) } : post
      ))
      toast({
        variant: "destructive",
        title: "Comment Failed",
        description: "Failed to post comment. Please try again.",
      })
    }
  }

  const handleVotePoll = async (postId: string, optionId: string) => {
    if (!user) {
      await signInAnonymous()
      return
    }

    // Find the post and check if already voted for this option
    const post = posts.find(p => p.id === postId)
    if (post?.pollData) {
      const votedOption = post.pollData.options.find(opt => opt.votedBy?.includes(user.id))
      const alreadyVotedForThis = votedOption?.id === optionId
      
      if (alreadyVotedForThis) {
        return // Silently ignore clicking same option
      }
    }

    try {
      // Optimistic update
      setPosts(prev => prev.map(post => {
        if (post.id === postId && post.pollData) {
          const votedOption = post.pollData.options.find(opt => opt.votedBy?.includes(user.id))

          return {
            ...post,
            pollData: {
              ...post.pollData,
              options: post.pollData.options.map(opt => {
                if (opt.id === optionId) {
                  // Add vote to this option
                  return { ...opt, votes: opt.votes + 1, votedBy: [...(opt.votedBy || []), user.id] }
                } else if (votedOption && opt.id === votedOption.id) {
                  // Remove vote from previous option
                  return { ...opt, votes: opt.votes - 1, votedBy: (opt.votedBy || []).filter(id => id !== user.id) }
                }
                return opt
              })
            }
          }
        }
        return post
      }))

      // Update in Firestore
      const { voteCanteenPoll } = await import("@/lib/firestore")
      await voteCanteenPoll(postId, optionId, user.id)

      toast({
        title: "Vote Recorded",
        description: "Thanks for voting!",
      })
    } catch (error: any) {
      console.error("Error voting:", error)
      
      toast({
        variant: "destructive",
        title: "Vote Failed",
        description: "Failed to record your vote. Please try again.",
      })
    }
  }

  return (
    <>
      <div className="relative min-h-screen bg-[#111317] text-[#E6E6E3] overflow-x-hidden">
        <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#17141d] via-[#100f12] to-[#131116]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_40%_20%,rgba(244,63,94,0.08),transparent_40%)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_65%_65%,rgba(236,72,153,0.06),transparent_35%)]" />
        
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-10">
          <header className="mb-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-xs uppercase tracking-[0.3em] text-rose-200">
              <Smile className="w-4 h-4" /> Social Space
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-white">
                The Canteen
              </h1>
              <p className="text-white/70 text-sm sm:text-base md:text-lg max-w-3xl">
                Share moments, memes, and memories with your campus community.
              </p>
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="h-12 px-6 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
          </header>

          <div className="space-y-6">
            {loading ? (
              <Card className="bg-[#15181d] border-white/5 p-20 text-center">
                <Loader2 className="w-12 h-12 animate-spin mx-auto text-rose-500" />
              </Card>
            ) : posts.length === 0 ? (
              <Card className="bg-[#15181d] border-white/5 p-20 text-center">
                <p className="text-white/60 text-lg">No posts yet. Be the first to share!</p>
              </Card>
            ) : (
              posts.map((post, idx) => {
                const isLiked = user ? (post.likedBy || []).includes(user.id) : false
                const comments = postComments[post.id] || []

                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="bg-[#15181d] border-white/5 overflow-hidden">
                      <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 border border-white/10">
                              <AvatarFallback className="bg-gradient-to-br from-rose-600 to-pink-600 text-white font-bold">
                                {(post.author || "Anonymous").charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-white">{post.author || "Anonymous"}</p>
                              <p className="text-xs text-white/50">
                                {post.createdAt?.seconds ? formatDistanceToNow(new Date(post.createdAt.seconds * 1000), { addSuffix: true }) : "just now"}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {post.type}
                          </Badge>
                        </div>

                        {post.content && (
                          <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
                            {post.content}
                          </p>
                        )}

                        {post.mediaUrl && post.mediaType === "image" && (
                          <div className="rounded-xl overflow-hidden bg-black/20">
                            <img 
                              src={post.mediaUrl} 
                              alt="Post content" 
                              className="w-full h-auto"
                            />
                          </div>
                        )}

                        {post.mediaUrl && post.mediaType === "video" && (
                          <div className="rounded-xl overflow-hidden bg-black/20">
                            <video 
                              src={post.mediaUrl} 
                              controls 
                              className="w-full h-auto"
                            />
                          </div>
                        )}

                        {post.type === "poll" && post.pollData && (
                          <div className="space-y-3">
                            <p className="font-semibold text-white">{post.pollData.question}</p>
                            <div className="space-y-2">
                              {post.pollData.options.map(option => {
                                const totalVotes = post.pollData!.options.reduce((sum, opt) => sum + opt.votes, 0)
                                const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0

                                return (
                                  <button
                                    key={option.id}
                                    onClick={() => handleVotePoll(post.id, option.id)}
                                    className="w-full p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/10 text-left relative overflow-hidden"
                                  >
                                    <div 
                                      className="absolute inset-0 bg-rose-600/20"
                                      style={{ width: `${percentage}%` }}
                                    />
                                    <div className="relative flex items-center justify-between">
                                      <span className="text-white">{option.text}</span>
                                      <span className="text-white/60 text-sm">{percentage}%</span>
                                    </div>
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        <div className="pt-4 border-t border-white/5 flex items-center gap-6">
                          <button
                            onClick={() => handleLike(post.id, isLiked)}
                            className={`flex items-center gap-2 transition-colors ${
                              isLiked ? "text-rose-500" : "text-white/60 hover:text-rose-400"
                            }`}
                          >
                            <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                            <span className="font-medium">{post.likes}</span>
                          </button>
                          <button
                            onClick={() => loadComments(post.id)}
                            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                          >
                            <MessageSquare className="w-5 h-5" />
                            <span className="font-medium">{post.comments}</span>
                          </button>
                        </div>

                        {showCommentsFor === post.id && (
                          <div className="pt-4 space-y-4 border-t border-white/5">
                            <div className="flex gap-2">
                              <Input
                                placeholder="Write a comment..."
                                value={commentInputs[post.id] || ""}
                                onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                onKeyDown={(e) => e.key === "Enter" && handleComment(post.id)}
                                className="bg-white/5 border-white/10 text-white"
                              />
                              <Button
                                size="icon"
                                onClick={() => handleComment(post.id)}
                                className="bg-rose-600 hover:bg-rose-700"
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                            </div>

                            {comments.length > 0 && (
                              <div className="space-y-3">
                                {comments.map(comment => (
                                  <div key={comment.id} className="flex gap-3">
                                    <Avatar className="w-8 h-8 border border-white/10">
                                      <AvatarFallback className="bg-gradient-to-br from-rose-600 to-pink-600 text-white text-xs">
                                        {(comment.author || "Anonymous").charAt(0).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 bg-white/5 rounded-lg p-3">
                                      <p className="font-semibold text-white text-sm">{comment.author || "Anonymous"}</p>
                                      <p className="text-white/80 text-sm mt-1">{comment.content}</p>
                                      <p className="text-xs text-white/40 mt-1">
                                        {comment.createdAt?.seconds ? formatDistanceToNow(new Date(comment.createdAt.seconds * 1000), { addSuffix: true }) : "just now"}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {mounted && showCreateModal && createPortal(
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ zIndex: 999999, position: 'fixed', inset: 0 }}
          className="bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => !uploading && setShowCreateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-2xl bg-gradient-to-br from-[#1a1d24] to-[#13161a] rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-rose-700/20 bg-gradient-to-r from-rose-900/20 to-transparent flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Create Post</h2>
                <Button
                  onClick={() => !uploading && setShowCreateModal(false)}
                  size="icon"
                  variant="ghost"
                  disabled={uploading}
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-4 gap-2">
                {[
                  { type: "text", icon: MessageSquare, label: "Text" },
                  { type: "image", icon: ImageIcon, label: "Image" },
                  { type: "video", icon: VideoIcon, label: "Video" },
                  { type: "poll", icon: BarChart3, label: "Poll" },
                ].map((item) => (
                  <Button
                    key={item.type}
                    onClick={() => setPostType(item.type as any)}
                    variant={postType === item.type ? "default" : "outline"}
                    className={postType === item.type 
                      ? "bg-rose-600 hover:bg-rose-700 text-white" 
                      : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                    }
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                ))}
              </div>

              <Textarea
                placeholder="What's on your mind?"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[120px]"
              />

              {(postType === "image" || postType === "video") && (
                <div className="space-y-2">
                  <label className="block">
                    <input
                      type="file"
                      accept={postType === "image" ? "image/jpeg,image/png,image/gif,image/webp" : "video/mp4,video/quicktime,video/x-msvideo"}
                      onChange={(e) => handleFileUpload(e, postType)}
                      className="hidden"
                      disabled={uploading}
                    />
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement
                        input?.click()
                      }}
                      variant="outline"
                      className="w-full border-white/10 text-white/70 hover:bg-white/10"
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          {postType === "image" ? <ImageIcon className="w-4 h-4 mr-2" /> : <VideoIcon className="w-4 h-4 mr-2" />}
                          {mediaUrl ? "Change" : "Upload"} {postType}
                        </>
                      )}
                    </Button>
                  </label>
                  {mediaUrl && (
                    <div className="relative rounded-lg overflow-hidden bg-black/20">
                      {postType === "image" ? (
                        <img src={mediaUrl} alt="Preview" className="w-full h-auto" />
                      ) : (
                        <video src={mediaUrl} controls className="w-full h-auto" />
                      )}
                      <button
                        onClick={() => {
                          setMediaUrl("")
                          const input = document.querySelector('input[type="file"]') as HTMLInputElement
                          if (input) input.value = ""
                        }}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {postType === "poll" && (
                <div className="space-y-3">
                  <Input
                    placeholder="Poll question"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                  {pollOptions.map((option, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        placeholder={`Option ${idx + 1}`}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...pollOptions]
                          newOptions[idx] = e.target.value
                          setPollOptions(newOptions)
                        }}
                        className="bg-white/5 border-white/10 text-white"
                      />
                      {pollOptions.length > 2 && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                          className="text-white/60 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {pollOptions.length < 6 && (
                    <Button
                      onClick={() => setPollOptions([...pollOptions, ""])}
                      variant="outline"
                      className="w-full border-white/10 text-white/70 hover:bg-white/10"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Option
                    </Button>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleCreatePost}
                  disabled={uploading}
                  className="flex-1 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Post
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowCreateModal(false)}
                  variant="outline"
                  disabled={uploading}
                  className="border-white/10 text-white/70 hover:bg-white/5"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>,
        document.body
      )}

      {mounted && (
        <script
          src="https://widget.cloudinary.com/v2.0/global/all.js"
          type="text/javascript"
          async
        />
      )}
    </>
  )
}

