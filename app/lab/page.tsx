"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Trophy, Zap, Brain, ArrowRight, CheckCircle2, Cpu, Timer, 
  BookOpen, Video, MessageSquare, Sparkles, Search, Play, 
  X, Loader2, Youtube, ChevronRight, Star, Target, Award, History, Clock
} from "lucide-react"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useAuth } from "@/context/AuthContext"
import { 
  updateUserXP, 
  saveAIConversation,
  saveLearnHistory,
  getLearnHistory,
  saveQuizHistory,
  getQuizHistory,
  saveChatHistory,
  getChatHistory,
  saveVideoHistory,
  getVideoHistory,
  type LearnHistory,
  type QuizHistory,
  type ChatHistory,
  type VideoHistory
} from "@/lib/firestore"
import { 
  generateTopicExplanation, 
  generateQuizQuestions, 
  chatWithAI, 
  generateLearningPath,
  type QuizQuestion,
  type AIMessage,
  type LearningPath
} from "@/lib/gemini"
import { searchEducationalVideos, getRecommendedVideos, type YouTubeVideo } from "@/lib/youtube"

type Mode = "explore" | "learn" | "quiz" | "chat" | "videos"

export default function LabPage() {
  const { user, signInAnonymous } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [mode, setMode] = useState<Mode>("explore")
  const [loading, setLoading] = useState(false)
  const [userXP, setUserXP] = useState(0)
  
  // Topic search
  const [searchTopic, setSearchTopic] = useState("")
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  
  // Learn mode
  const [explanation, setExplanation] = useState<string | null>(null)
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null)
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("intermediate")
  
  // Quiz mode
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [quizScore, setQuizScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  
  // Chat mode
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [chatLoading, setChatLoading] = useState(false)
  
  // Videos mode
  const [videos, setVideos] = useState<YouTubeVideo[]>([])
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null)
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)

  // History states
  const [learnHistory, setLearnHistory] = useState<LearnHistory[]>([])
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([])
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const [videoHistory, setVideoHistory] = useState<VideoHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [historySearch, setHistorySearch] = useState("")

  useEffect(() => {
    setMounted(true)
    // Load history from Firebase when user is available
    if (user) {
      loadHistoryFromFirebase()
    }
  }, [user])

  useEffect(() => {
    if (user) {
      setUserXP(user.xp || 0)
    }
  }, [user])

  // History management functions
  const loadHistoryFromFirebase = async () => {
    if (!user) return
    
    try {
      const [learn, quiz, chat, video] = await Promise.all([
        getLearnHistory(user.id),
        getQuizHistory(user.id),
        getChatHistory(user.id),
        getVideoHistory(user.id),
      ])
      
      setLearnHistory(learn)
      setQuizHistory(quiz)
      setChatHistory(chat)
      setVideoHistory(video)
    } catch (e) {
      console.error("Error loading history:", e)
    }
  }

  const saveLearnToFirebase = async (data: Omit<LearnHistory, "id" | "userId" | "createdAt">) => {
    if (!user) return
    
    try {
      await saveLearnHistory(user.id, data)
      await loadHistoryFromFirebase()
    } catch (e) {
      console.error("Error saving learn history:", e)
    }
  }

  const saveQuizToFirebase = async (data: Omit<QuizHistory, "id" | "userId" | "createdAt">) => {
    if (!user) return
    
    try {
      await saveQuizHistory(user.id, data)
      await loadHistoryFromFirebase()
    } catch (e) {
      console.error("Error saving quiz history:", e)
    }
  }

  const saveChatToFirebase = async (data: Omit<ChatHistory, "id" | "userId" | "createdAt">) => {
    if (!user) return
    
    try {
      await saveChatHistory(user.id, data)
      await loadHistoryFromFirebase()
    } catch (e) {
      console.error("Error saving chat history:", e)
    }
  }

  const saveVideoToFirebase = async (video: YouTubeVideo) => {
    if (!user) return
    
    try {
      await saveVideoHistory(user.id, { video })
      await loadHistoryFromFirebase()
    } catch (e) {
      console.error("Error saving video history:", e)
    }
  }

  const loadLearnHistoryItem = (item: LearnHistory) => {
    setSelectedTopic(item.topic)
    setDifficulty(item.difficulty)
    setExplanation(item.explanation)
    setLearningPath(item.learningPath)
    setShowHistory(false)
  }

  const loadQuizHistoryItem = (item: QuizHistory) => {
    setSelectedTopic(item.topic)
    setQuizQuestions(item.questions)
    setCurrentQuestion(item.currentQuestion)
    setQuizScore(item.score)
    setQuizCompleted(item.completed)
    setShowHistory(false)
  }

  const loadChatHistoryItem = (item: ChatHistory) => {
    setSelectedTopic(item.topic)
    setMessages(item.messages)
    setShowHistory(false)
  }

  const handleSearch = async () => {
    if (!searchTopic.trim() || !user) return
    
    setLoading(true)
    setSelectedTopic(searchTopic)
    
    try {
      if (mode === "learn") {
        const [exp, path] = await Promise.all([
          generateTopicExplanation(searchTopic, difficulty),
          generateLearningPath(searchTopic)
        ])
        setExplanation(exp)
        setLearningPath(path)
        
        // Save to Firebase
        await saveLearnToFirebase({
          topic: searchTopic,
          difficulty,
          explanation: exp,
          learningPath: path,
        })
      } else if (mode === "quiz") {
        const questions = await generateQuizQuestions(searchTopic, 5)
        setQuizQuestions(questions)
        setCurrentQuestion(0)
        setQuizScore(0)
        setQuizCompleted(false)
        setShowExplanation(false)
        
        // Save to Firebase
        await saveQuizToFirebase({
          topic: searchTopic,
          questions,
          score: 0,
          totalQuestions: questions.length,
          completed: false,
          currentQuestion: 0,
        })
      } else if (mode === "videos") {
        const vids = await searchEducationalVideos(searchTopic, 10)
        setVideos(vids)
      }
      
      await updateUserXP(user.id, 5)
      setUserXP(prev => prev + 5)
    } catch (error) {
      console.error("Error in search:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuizAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
    setShowExplanation(true)
    
    const question = quizQuestions[currentQuestion]
    if (answerIndex === question.correctAnswer) {
      setQuizScore(prev => prev + 1)
    }
  }

  const handleNextQuestion = async () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
      
      // Update quiz history in Firebase
      if (selectedTopic && user) {
        await saveQuizToFirebase({
          topic: selectedTopic,
          questions: quizQuestions,
          score: quizScore,
          totalQuestions: quizQuestions.length,
          completed: false,
          currentQuestion: currentQuestion + 1,
        })
      }
    } else {
      setQuizCompleted(true)
      
      // Save completed quiz to Firebase
      if (selectedTopic && user) {
        await saveQuizToFirebase({
          topic: selectedTopic,
          questions: quizQuestions,
          score: quizScore,
          totalQuestions: quizQuestions.length,
          completed: true,
          currentQuestion: quizQuestions.length,
        })
      }
      
      if (user) {
        const xpGain = quizScore * 20
        await updateUserXP(user.id, xpGain)
        setUserXP(prev => prev + xpGain)
      }
    }
  }

  const handleSendMessage = async () => {
    if (!chatInput.trim() || chatLoading || !user) return
    
    const userMessage: AIMessage = { role: "user", content: chatInput, timestamp: Date.now() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setChatInput("")
    setChatLoading(true)
    
    try {
      const response = await chatWithAI(newMessages, selectedTopic || undefined)
      const aiMessage: AIMessage = { role: "ai", content: response, timestamp: Date.now() }
      const updatedMessages = [...newMessages, aiMessage]
      setMessages(updatedMessages)
      
      // Save chat history to Firebase
      if (selectedTopic) {
        await saveChatToFirebase({
          topic: selectedTopic,
          messages: updatedMessages,
        })
      }
      
      await saveAIConversation({
        userId: user.id,
        messages: updatedMessages,
        topic: selectedTopic || "General",
        createdAt: new Date() as any
      })
      
      await updateUserXP(user.id, 3)
      setUserXP(prev => prev + 3)
    } catch (error) {
      console.error("Error in chat:", error)
    } finally {
      setChatLoading(false)
    }
  }

  const handleVideoClick = (video: YouTubeVideo) => {
    setSelectedVideo(video)
    setShowVideoPlayer(true)
    saveVideoToFirebase(video)
  }

  return (
    <div className="relative min-h-screen bg-[#111317] text-[#E6E6E3] overflow-x-hidden">
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#14181d] via-[#0f120f] to-[#111417]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_35%_30%,rgba(16,185,129,0.08),transparent_40%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_70%,rgba(5,150,105,0.06),transparent_35%)]" />
      
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10">
        {!mounted ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#d1d1ca]">Loading Lab...</p>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
          {/* Header */}
          <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-px bg-emerald-700/40" />
                <span className="text-emerald-200/60 text-xs font-medium tracking-wide">AI-Powered Learning Lab</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3 leading-tight">
                The Lab
              </h1>
              <p className="text-base text-[#d1d1ca] leading-relaxed">
                Learn anything with AI assistance, interactive quizzes, and curated video playlists
              </p>
            </div>

            <Card className="bg-gradient-to-br from-emerald-600 to-emerald-800 border-emerald-700/30 lg:min-w-[200px]">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-yellow-300" />
                </div>
                <div>
                  <p className="text-sm text-emerald-100/80 mb-1">Total XP</p>
                  <p className="text-2xl font-bold text-white">{userXP.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </header>

          {/* Mode Tabs */}
          <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-[#1a1e24] border border-emerald-700/20">
              <TabsTrigger value="explore" className="data-[state=active]:bg-emerald-600">
                <Target className="w-4 h-4 mr-2" />
                Explore
              </TabsTrigger>
              <TabsTrigger value="learn" className="data-[state=active]:bg-emerald-600">
                <Brain className="w-4 h-4 mr-2" />
                Learn
              </TabsTrigger>
              <TabsTrigger value="quiz" className="data-[state=active]:bg-emerald-600">
                <Award className="w-4 h-4 mr-2" />
                Quiz
              </TabsTrigger>
              <TabsTrigger value="chat" className="data-[state=active]:bg-emerald-600">
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="videos" className="data-[state=active]:bg-emerald-600">
                <Youtube className="w-4 h-4 mr-2" />
                Videos
              </TabsTrigger>
            </TabsList>

            {/* Explore Mode */}
            <TabsContent value="explore" className="space-y-6 mt-6">
              <Card className="bg-gradient-to-br from-[#1a1e24] to-[#14181d] border-emerald-700/20">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-emerald-400" />
                    Start Your Learning Journey
                  </h2>
                  <p className="text-[#d1d1ca] mb-6">Choose a learning mode and search for any topic to get started</p>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Card className="bg-[#0f1318] border-emerald-700/30 hover:border-emerald-500/50 transition-colors cursor-pointer"
                          onClick={() => setMode("learn")}>
                      <CardContent className="p-6">
                        <Brain className="w-10 h-10 text-emerald-400 mb-3" />
                        <h3 className="text-lg font-semibold mb-2">Learn with AI</h3>
                        <p className="text-sm text-[#d1d1ca]">Get detailed explanations and structured learning paths</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-[#0f1318] border-emerald-700/30 hover:border-emerald-500/50 transition-colors cursor-pointer"
                          onClick={() => setMode("quiz")}>
                      <CardContent className="p-6">
                        <Award className="w-10 h-10 text-yellow-400 mb-3" />
                        <h3 className="text-lg font-semibold mb-2">Take Quizzes</h3>
                        <p className="text-sm text-[#d1d1ca]">Test your knowledge and earn XP</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-[#0f1318] border-emerald-700/30 hover:border-emerald-500/50 transition-colors cursor-pointer"
                          onClick={() => setMode("chat")}>
                      <CardContent className="p-6">
                        <MessageSquare className="w-10 h-10 text-blue-400 mb-3" />
                        <h3 className="text-lg font-semibold mb-2">Chat with AI</h3>
                        <p className="text-sm text-[#d1d1ca]">Ask questions and get instant answers</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-[#0f1318] border-emerald-700/30 hover:border-emerald-500/50 transition-colors cursor-pointer"
                          onClick={() => setMode("videos")}>
                      <CardContent className="p-6">
                        <Youtube className="w-10 h-10 text-red-400 mb-3" />
                        <h3 className="text-lg font-semibold mb-2">Watch Videos</h3>
                        <p className="text-sm text-[#d1d1ca]">Curated educational content from YouTube</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Learn Mode */}
            <TabsContent value="learn" className="space-y-6 mt-6">
              <Card className="bg-[#1a1e24] border-emerald-700/20">
                <CardContent className="p-6">
                  <div className="flex gap-3">
                    <Input
                      placeholder="Enter a topic to learn (e.g., Quantum Physics, Machine Learning)..."
                      value={searchTopic}
                      onChange={(e) => setSearchTopic(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      className="flex-1 bg-[#0f1318] border-emerald-700/30"
                    />
                    <Button onClick={() => setShowHistory(true)} variant="outline" className="border-emerald-700/30">
                      <History className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => setDifficulty(d => d === "beginner" ? "intermediate" : d === "intermediate" ? "advanced" : "beginner")}
                            variant="outline" className="border-emerald-700/30">
                      {difficulty}
                    </Button>
                    <Button onClick={handleSearch} disabled={loading || !user}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {loading && (
                <Card className="bg-[#1a1e24] border-emerald-700/20">
                  <CardContent className="p-12 flex flex-col items-center">
                    <Loader2 className="w-12 h-12 animate-spin text-emerald-400 mb-4" />
                    <p className="text-[#d1d1ca]">Generating learning materials...</p>
                  </CardContent>
                </Card>
              )}

              {explanation && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Card className="bg-[#1a1e24] border-emerald-700/20">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-emerald-400" />
                        {selectedTopic} - Explanation
                      </h3>
                      <MarkdownRenderer content={explanation} />
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {learningPath && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Card className="bg-[#1a1e24] border-emerald-700/20">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-emerald-400" />
                        Learning Path
                      </h3>
                      <div className="space-y-3">
                        {learningPath.steps.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-4 bg-[#0f1318] rounded-lg border border-emerald-700/20">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-bold">
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">{step.title}</h4>
                              <p className="text-sm text-[#d1d1ca]">{step.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Timer className="w-4 h-4 text-emerald-400" />
                                <span className="text-sm text-emerald-400">{step.estimatedTime}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </TabsContent>

            {/* Quiz Mode */}
            <TabsContent value="quiz" className="space-y-6 mt-6">
              {!quizQuestions.length ? (
                <Card className="bg-[#1a1e24] border-emerald-700/20">
                  <CardContent className="p-6">
                    <div className="flex gap-3">
                      <Input
                        placeholder="Enter a topic for quiz (e.g., JavaScript Arrays, Photosynthesis)..."
                        value={searchTopic}
                        onChange={(e) => setSearchTopic(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                        className="flex-1 bg-[#0f1318] border-emerald-700/30"
                      />
                      <Button onClick={() => setShowHistory(true)} variant="outline" className="border-emerald-700/30">
                        <History className="w-4 h-4" />
                      </Button>
                      <Button onClick={() => setDifficulty(d => d === "beginner" ? "intermediate" : d === "intermediate" ? "advanced" : "beginner")}
                              variant="outline" className="border-emerald-700/30">
                        {difficulty}
                      </Button>
                      <Button onClick={handleSearch} disabled={loading || !user}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Start Quiz"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : quizCompleted ? (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                  <Card className="bg-gradient-to-br from-emerald-600 to-emerald-800 border-emerald-700/30">
                    <CardContent className="p-12 text-center">
                      <Trophy className="w-20 h-20 text-yellow-300 mx-auto mb-6" />
                      <h2 className="text-3xl font-bold mb-4">Quiz Complete!</h2>
                      <p className="text-2xl mb-6">Score: {quizScore}/{quizQuestions.length}</p>
                      <p className="text-lg mb-8">+{quizScore * 20} XP Earned!</p>
                      <Button onClick={() => {
                        setQuizQuestions([])
                        setQuizCompleted(false)
                        setSearchTopic("")
                      }} variant="secondary">
                        Take Another Quiz
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Card className="bg-[#1a1e24] border-emerald-700/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <Badge variant="outline" className="border-emerald-700/30">
                          Question {currentQuestion + 1}/{quizQuestions.length}
                        </Badge>
                        <Badge variant="outline" className="border-emerald-700/30">
                          Score: {quizScore}/{quizQuestions.length}
                        </Badge>
                      </div>

                      <div className="prose prose-invert max-w-none mb-6">
                        <MarkdownRenderer content={quizQuestions[currentQuestion].question} className="text-xl" />
                      </div>

                      <div className="space-y-3 mb-6">
                        {quizQuestions[currentQuestion].options.map((option, idx) => (
                          <Button
                            key={idx}
                            onClick={() => !showExplanation && handleQuizAnswer(idx)}
                            disabled={showExplanation}
                            variant={showExplanation ? 
                              (idx === quizQuestions[currentQuestion].correctAnswer ? "default" : 
                               idx === selectedAnswer ? "destructive" : "outline") : 
                              "outline"}
                            className={`w-full justify-start text-left h-auto py-4 px-4 ${
                              showExplanation && idx === quizQuestions[currentQuestion].correctAnswer ? "bg-emerald-600" : ""
                            }`}
                          >
                            <span className="font-semibold mr-3 shrink-0">{String.fromCharCode(65 + idx)}.</span>
                            <div className="flex-1 min-w-0">
                              <MarkdownRenderer content={option} className="prose-sm my-0" />
                            </div>
                            {showExplanation && idx === quizQuestions[currentQuestion].correctAnswer && (
                              <CheckCircle2 className="w-5 h-5 ml-2 shrink-0" />
                            )}
                          </Button>
                        ))}
                      </div>

                      {showExplanation && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                          <Card className="bg-[#0f1318] border-emerald-700/30 mb-6">
                            <CardContent className="p-4">
                              <div className="text-sm">
                                <strong className="text-emerald-400 block mb-2">Explanation:</strong>
                                <MarkdownRenderer content={quizQuestions[currentQuestion].explanation} className="prose-sm" />
                              </div>
                            </CardContent>
                          </Card>
                          <Button onClick={handleNextQuestion} className="w-full">
                            {currentQuestion < quizQuestions.length - 1 ? "Next Question" : "Finish Quiz"}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </TabsContent>

            {/* Chat Mode */}
            <TabsContent value="chat" className="space-y-6 mt-6">
              <Card className="bg-[#1a1e24] border-emerald-700/20">
                <CardContent className="p-6">
                  <div className="flex gap-3 mb-4">
                    <Input
                      placeholder="Set a topic for context (optional)..."
                      value={searchTopic}
                      onChange={(e) => setSearchTopic(e.target.value)}
                      className="flex-1 bg-[#0f1318] border-emerald-700/30"
                    />
                    <Button onClick={() => setShowHistory(true)} variant="outline" className="border-emerald-700/30">
                      <History className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => setSelectedTopic(searchTopic)} variant="outline">
                      Set Topic
                    </Button>
                  </div>
                  {selectedTopic && (
                    <Badge className="bg-emerald-600">{selectedTopic}</Badge>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-[#1a1e24] border-emerald-700/20">
                <CardContent className="p-6">
                  <div className="h-[500px] overflow-y-auto space-y-4 mb-4">
                    {messages.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-[#d1d1ca]">
                        <div className="text-center">
                          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-emerald-400" />
                          <p>Start a conversation with AI</p>
                        </div>
                      </div>
                    ) : (
                      messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                          <Card className={`max-w-[80%] ${msg.role === "user" ? "bg-emerald-600" : "bg-[#0f1318]"} border-none`}>
                            <CardContent className="p-4">
                              {msg.role === "user" ? (
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                              ) : (
                                <MarkdownRenderer content={msg.content} className="prose-sm" />
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      ))
                    )}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <Card className="bg-[#0f1318] border-none">
                          <CardContent className="p-4">
                            <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Textarea
                      placeholder="Ask anything..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                      className="flex-1 bg-[#0f1318] border-emerald-700/30 resize-none"
                      rows={2}
                    />
                    <Button onClick={handleSendMessage} disabled={chatLoading || !user || !chatInput.trim()}>
                      {chatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Videos Mode */}
            <TabsContent value="videos" className="space-y-6 mt-6">
              <Card className="bg-[#1a1e24] border-emerald-700/20">
                <CardContent className="p-6">
                  <div className="flex gap-3">
                    <Input
                      placeholder="Search for educational videos..."
                      value={searchTopic}
                      onChange={(e) => setSearchTopic(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      className="flex-1 bg-[#0f1318] border-emerald-700/30"
                    />
                    <Button onClick={() => setShowHistory(true)} variant="outline" className="border-emerald-700/30">
                      <History className="w-4 h-4" />
                    </Button>
                    <Button onClick={handleSearch} disabled={loading || !user}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {videos.length > 0 && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {videos.map((video) => (
                    <Card key={video.id} className="bg-[#1a1e24] border-emerald-700/20 hover:border-emerald-500/50 transition-colors cursor-pointer"
                          onClick={() => handleVideoClick(video)}>
                      <CardContent className="p-4">
                        <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
                          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Play className="w-12 h-12 text-white" />
                          </div>
                        </div>
                        <h4 className="font-semibold text-sm line-clamp-2 mb-2">{video.title}</h4>
                        <p className="text-xs text-[#d1d1ca] line-clamp-2 mb-2">{video.description}</p>
                        <div className="flex items-center justify-between text-xs text-[#d1d1ca]">
                          <span className="flex items-center gap-1">
                            <Youtube className="w-3 h-3" />
                            {video.channelTitle}
                          </span>
                          <span>{video.duration}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
        )}

        {/* Video Player Modal - Rendered via Portal */}
        {mounted && showVideoPlayer && selectedVideo && createPortal(
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ zIndex: 999999, position: 'fixed', inset: 0 }}
            className="bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-8"
            onClick={() => {
              setShowVideoPlayer(false)
              setTimeout(() => setSelectedVideo(null), 300)
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative w-full max-w-5xl lg:max-w-6xl bg-[#1a1e24] rounded-lg lg:rounded-xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1&modestbranding=1&rel=0&enablejsapi=1`}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  style={{ border: 'none' }}
                />
              </div>
              <div className="p-4 md:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{selectedVideo.title}</h3>
                    <p className="text-sm text-[#d1d1ca]">{selectedVideo.channelTitle}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => {
                    setShowVideoPlayer(false)
                    setTimeout(() => setSelectedVideo(null), 300)
                  }}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-sm text-[#d1d1ca]">{selectedVideo.description}</p>
              </div>
            </motion.div>
          </motion.div>,
          document.body
        )}

        {/* History Modal */}
        {mounted && showHistory && createPortal(
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ zIndex: 999999, position: 'fixed', inset: 0 }}
            className="bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-8"
            onClick={() => setShowHistory(false)}
          >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-4xl bg-[#1a1e24] rounded-xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-emerald-700/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <History className="w-6 h-6 text-emerald-400" />
                    <h2 className="text-2xl font-bold">History</h2>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowHistory(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                  <Input
                    placeholder="Search history..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    className="bg-[#0f1318] border-emerald-700/30"
                  />

                  {/* Learn History */}
                  {mode === "learn" && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Brain className="w-5 h-5 text-emerald-400" />
                        Learning History
                      </h3>
                      {learnHistory
                        .filter(h => h.topic.toLowerCase().includes(historySearch.toLowerCase()))
                        .map(item => (
                        <Card key={item.id} className="bg-[#0f1318] border-emerald-700/30 hover:border-emerald-500/50 transition-colors cursor-pointer"
                              onClick={() => loadLearnHistoryItem(item)}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold mb-1">{item.topic}</h4>
                                <Badge variant="outline" className="text-xs">{item.difficulty}</Badge>
                              </div>
                              <div className="text-xs text-[#d1d1ca] flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {item.createdAt?.toDate?.()?.toLocaleDateString() || 'Recent'}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {learnHistory.length === 0 && (
                        <p className="text-sm text-[#d1d1ca] text-center py-8">No learning history yet</p>
                      )}
                    </div>
                  )}

                  {/* Quiz History */}
                  {mode === "quiz" && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Award className="w-5 h-5 text-emerald-400" />
                        Quiz History
                      </h3>
                      {quizHistory
                        .filter(h => h.topic.toLowerCase().includes(historySearch.toLowerCase()))
                        .map(item => (
                        <Card key={item.id} className="bg-[#0f1318] border-emerald-700/30 hover:border-emerald-500/50 transition-colors cursor-pointer"
                              onClick={() => loadQuizHistoryItem(item)}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold mb-1">{item.topic}</h4>
                                <div className="flex items-center gap-2 text-sm">
                                  <Badge variant={item.completed ? "default" : "outline"}>
                                    {item.completed ? "Completed" : `In Progress (${item.currentQuestion}/${item.totalQuestions})`}
                                  </Badge>
                                  <span className="text-emerald-400">{item.score}/{item.totalQuestions}</span>
                                </div>
                              </div>
                              <div className="text-xs text-[#d1d1ca] flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {item.createdAt?.toDate?.()?.toLocaleDateString() || 'Recent'}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {quizHistory.length === 0 && (
                        <p className="text-sm text-[#d1d1ca] text-center py-8">No quiz history yet</p>
                      )}
                    </div>
                  )}

                  {/* Chat History */}
                  {mode === "chat" && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-emerald-400" />
                        Chat History
                      </h3>
                      {chatHistory
                        .filter(h => h.topic.toLowerCase().includes(historySearch.toLowerCase()))
                        .map(item => (
                        <Card key={item.id} className="bg-[#0f1318] border-emerald-700/30 hover:border-emerald-500/50 transition-colors cursor-pointer"
                              onClick={() => loadChatHistoryItem(item)}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold mb-1">{item.topic}</h4>
                                <p className="text-xs text-[#d1d1ca]">{item.messages.length} messages</p>
                              </div>
                              <div className="text-xs text-[#d1d1ca] flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {item.createdAt?.toDate?.()?.toLocaleDateString() || 'Recent'}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {chatHistory.length === 0 && (
                        <p className="text-sm text-[#d1d1ca] text-center py-8">No chat history yet</p>
                      )}
                    </div>
                  )}

                  {/* Video History */}
                  {mode === "videos" && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Youtube className="w-5 h-5 text-emerald-400" />
                        Watch History
                      </h3>
                      {videoHistory
                        .filter(h => h.video.title.toLowerCase().includes(historySearch.toLowerCase()))
                        .map(item => (
                        <Card key={item.id} className="bg-[#0f1318] border-emerald-700/30 hover:border-emerald-500/50 transition-colors cursor-pointer"
                              onClick={() => {
                                handleVideoClick(item.video)
                                setShowHistory(false)
                              }}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <img src={item.video.thumbnail} alt="" className="w-24 h-16 rounded object-cover" />
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm mb-1 line-clamp-2">{item.video.title}</h4>
                                <p className="text-xs text-[#d1d1ca]">{item.video.channelTitle}</p>
                              </div>
                              <div className="text-xs text-[#d1d1ca] flex items-center gap-1 shrink-0">
                                <Clock className="w-3 h-3" />
                                {item.createdAt?.toDate?.()?.toLocaleDateString() || 'Recent'}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {videoHistory.length === 0 && (
                        <p className="text-sm text-[#d1d1ca] text-center py-8">No watch history yet</p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>,
            document.body
          )}
      </div>
    </div>
  )
}
