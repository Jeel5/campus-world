import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  Timestamp,
  type DocumentData,
  type QueryConstraint,
} from "firebase/firestore"
import { db } from "./firebase"

// Collection names
export const COLLECTIONS = {
  USERS: "users",
  POSTS: "posts",
  THREADS: "threads",
  COMMENTS: "comments",
  CANTEEN_POSTS: "canteenPosts",
  CANTEEN_COMMENTS: "canteenComments",
  POLLS: "polls",
  NOTICES: "notices",
  SUBJECTS: "subjects",
  UNITS: "units",
  TOPICS: "topics",
  QUESTS: "quests",
  USER_PROGRESS: "userProgress",
  VOTES: "votes",
  BOOKMARKS: "bookmarks",
  AI_CONVERSATIONS: "aiConversations",
  YOUTUBE_CACHE: "youtubeCache",
  USER_PREFERENCES: "userPreferences",
  LEARN_HISTORY: "learnHistory",
  QUIZ_HISTORY: "quizHistory",
  CHAT_HISTORY: "chatHistory",
  VIDEO_HISTORY: "videoHistory",
  MATERIAL_CONTRIBUTIONS: "materialContributions",
} as const

// Types
export interface User {
  id: string
  username: string
  email?: string
  avatar?: string
  xp: number
  createdAt: Timestamp
}

export interface Post {
  id: string
  title: string
  content: string
  author: string
  authorId: string
  category: string
  score: number
  replies: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Thread {
  id: string
  title: string
  content: string
  author: string
  authorId: string
  isAnonymous: boolean
  category: string
  tags: string[]
  contentWarning?: string
  score: number
  upvotes: number
  downvotes: number
  commentCount: number
  viewCount: number
  isPinned: boolean
  isLocked: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Comment {
  id: string
  threadId: string
  parentId?: string
  content: string
  author: string
  authorId: string
  isAnonymous: boolean
  score: number
  depth: number
  isEdited: boolean
  isDeleted: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Poll {
  id: string
  question: string
  options: { id: string; text: string; votes: number }[]
  authorId: string
  isAnonymous: boolean
  allowMultiple: boolean
  expiresAt: Timestamp
  totalVotes: number
  createdAt: Timestamp
}

export interface AIConversation {
  id: string
  userId: string
  type: "learning" | "quiz" | "explanation" | "help"
  topic: string
  messages: { role: "user" | "ai"; content: string; timestamp: number }[]
  relatedVideos?: string[]
  createdAt: Timestamp
}

export interface YouTubeVideo {
  id: string
  videoId: string
  title: string
  channelTitle: string
  thumbnail: string
  duration: string
}

export interface YouTubeCache {
  id: string
  topic: string
  videos: YouTubeVideo[]
  createdAt: Timestamp
  expiresAt: Timestamp
}

export interface Bookmark {
  id: string
  userId: string
  type: "thread" | "subject" | "unit" | "topic" | "video"
  referenceId: string
  createdAt: Timestamp
}

export interface UserPreferences {
  id: string
  userId: string
  theme: "dark" | "light"
  defaultAnonymous: boolean
  notificationsEnabled: boolean
  emailNotifications: boolean
}

export interface CanteenPost {
  id: string
  type: "text" | "confession" | "meme" | "photo" | "video" | "poll" | "story" | "image"
  content: string
  mediaUrl?: string
  mediaType?: "image" | "video"
  authorId: string
  author: string
  isAnonymous: boolean
  likes: number
  likedBy: string[]
  comments: number
  shares: number
  pollData?: {
    question: string
    options: { id: string; text: string; votes: number; votedBy: string[] }[]
  }
  createdAt: Timestamp
}

export interface CanteenComment {
  id: string
  postId: string
  content: string
  authorId: string
  author: string
  createdAt: Timestamp
}

export interface Notice {
  id: string
  title: string
  category: string
  content: string
  date: string
  location: string
  trustVotes: number
  isOfficial: boolean
  createdAt: Timestamp
}

export interface Subject {
  id: string
  name: string
  accent: string
  bg: string
}

export interface Unit {
  id: string
  subjectId: string
  name: string
  books: number
  students: number
}

export interface Quest {
  id: string
  title: string
  subject: string
  difficulty: "Easy" | "Medium" | "Hard"
  points: number
  questions: number
  createdAt: Timestamp
}

export interface UserProgress {
  id: string
  userId: string
  questId: string
  score: number
  completed: boolean
  completedAt?: Timestamp
}

// Generic CRUD operations
export async function createDocument<T extends DocumentData>(
  collectionName: string,
  data: Omit<T, "id" | "createdAt">,
) {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function getDocument<T extends DocumentData>(collectionName: string, docId: string): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, docId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as unknown as T
    }
    return null
  } catch (error: any) {
    if (error.code === "unavailable" || error.message?.includes("offline")) {
      console.warn(`Firestore offline: Cannot fetch document from ${collectionName}/${docId}`)
      return null
    }
    throw error
  }
}

export async function getDocuments<T extends DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
): Promise<T[]> {
  try {
    const q = query(collection(db, collectionName), ...constraints)
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as unknown as T))
  } catch (error: any) {
    if (error.code === "unavailable" || error.message?.includes("offline")) {
      console.warn(`Firestore offline: Cannot fetch documents from ${collectionName}`)
      return []
    }
    throw error
  }
}

export async function updateDocument(collectionName: string, docId: string, data: Partial<DocumentData>) {
  const docRef = doc(db, collectionName, docId)
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteDocument(collectionName: string, docId: string) {
  const docRef = doc(db, collectionName, docId)
  await deleteDoc(docRef)
}

export function subscribeToCollection<T extends DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[],
  callback: (data: T[]) => void,
  onError?: (error: Error) => void,
) {
  const q = query(collection(db, collectionName), ...constraints)
  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as unknown as T))
      callback(data)
    },
    (error) => {
      if (error.code === "unavailable" || error.message?.includes("offline")) {
        console.warn(`Firestore offline: Cannot subscribe to ${collectionName}`)
        if (onError) onError(error)
      } else {
        console.error(`Firestore error in ${collectionName}:`, error)
        if (onError) onError(error)
      }
    },
  )
}

// Specific operations
export async function createPost(postData: Omit<Post, "id" | "createdAt" | "updatedAt">) {
  return createDocument<Post>(COLLECTIONS.POSTS, { ...postData, updatedAt: serverTimestamp() as any })
}

export async function getPosts(categoryFilter?: string) {
  const constraints: QueryConstraint[] = [orderBy("createdAt", "desc"), limit(50)]
  if (categoryFilter) {
    constraints.unshift(where("category", "==", categoryFilter))
  }
  return getDocuments<Post>(COLLECTIONS.POSTS, constraints)
}

export async function votePost(postId: string, delta: number) {
  await updateDocument(COLLECTIONS.POSTS, postId, {
    score: increment(delta),
  })
}

export async function likeCanteenPost(postId: string, userId: string) {
  const postRef = doc(db, COLLECTIONS.CANTEEN_POSTS, postId)
  const postDoc = await getDoc(postRef)
  
  if (!postDoc.exists()) throw new Error("Post not found")
  
  const post = { id: postDoc.id, ...postDoc.data() } as CanteenPost
  const isLiked = post.likedBy.includes(userId)
  
  await updateDoc(postRef, {
    likes: increment(isLiked ? -1 : 1),
    likedBy: isLiked ? arrayRemove(userId) : arrayUnion(userId)
  })
}

export async function createCanteenPost(postData: Omit<CanteenPost, "id" | "createdAt" | "likes" | "likedBy" | "comments" | "shares">) {
  return createDocument<CanteenPost>(COLLECTIONS.CANTEEN_POSTS, {
    ...postData,
    likes: 0,
    likedBy: [],
    comments: 0,
    shares: 0,
  })
}

export async function createCanteenComment(commentData: Omit<CanteenComment, "id" | "createdAt">) {
  return createDocument<CanteenComment>(COLLECTIONS.CANTEEN_COMMENTS, commentData)
}

export async function getCanteenComments(postId: string) {
  return getDocuments<CanteenComment>(COLLECTIONS.CANTEEN_COMMENTS, [
    where("postId", "==", postId),
    orderBy("createdAt", "asc"),
    limit(100)
  ])
}

export async function votePoll(postId: string, optionId: string, userId: string) {
  const postRef = doc(db, COLLECTIONS.CANTEEN_POSTS, postId)
  const postDoc = await getDoc(postRef)
  
  if (!postDoc.exists()) throw new Error("Post not found")
  
  const post = { id: postDoc.id, ...postDoc.data() } as CanteenPost
  
  if (!post.pollData) throw new Error("Not a poll post")
  
  // Check if user already voted
  const alreadyVoted = post.pollData.options.some(opt => opt.votedBy?.includes(userId))
  if (alreadyVoted) throw new Error("Already voted")
  
  // Update the specific option
  const updatedOptions = post.pollData.options.map(opt => {
    if (opt.id === optionId) {
      return {
        ...opt,
        votes: opt.votes + 1,
        votedBy: [...(opt.votedBy || []), userId]
      }
    }
    return opt
  })
  
  await updateDoc(postRef, {
    "pollData.options": updatedOptions
  })
}

export async function createNotice(noticeData: Omit<Notice, "id" | "createdAt">) {
  return createDocument<Notice>(COLLECTIONS.NOTICES, noticeData)
}

export async function getNotices() {
  return getDocuments<Notice>(COLLECTIONS.NOTICES, [orderBy("createdAt", "desc"), limit(50)])
}

export async function voteNotice(noticeId: string) {
  await updateDocument(COLLECTIONS.NOTICES, noticeId, {
    trustVotes: increment(1),
  })
}

export interface NoticeVerificationRequest {
  id: string
  title: string
  description: string
  category: string
  location: string
  dateTime: string
  sourceUrl?: string
  attachmentUrl?: string
  submittedBy: string
  submittedByEmail: string
  status: "pending" | "approved" | "rejected"
  createdAt: Timestamp
}

export async function submitNoticeForVerification(data: Omit<NoticeVerificationRequest, "id" | "createdAt" | "status">) {
  return createDocument<NoticeVerificationRequest>("notice_verification_requests", {
    ...data,
    status: "pending",
  })
}

export async function getSubjects() {
  return getDocuments<Subject>(COLLECTIONS.SUBJECTS, [])
}

export async function getUnits(subjectId: string) {
  return getDocuments<Unit>(COLLECTIONS.UNITS, [where("subjectId", "==", subjectId)])
}

export async function getQuests() {
  return getDocuments<Quest>(COLLECTIONS.QUESTS, [orderBy("createdAt", "desc")])
}

export async function saveUserProgress(progressData: Omit<UserProgress, "id">) {
  return createDocument<UserProgress>(COLLECTIONS.USER_PROGRESS, progressData)
}

export async function getUserProgress(userId: string) {
  return getDocuments<UserProgress>(COLLECTIONS.USER_PROGRESS, [where("userId", "==", userId)])
}

export async function updateUserXP(userId: string, xpToAdd: number) {
  await updateDocument(COLLECTIONS.USERS, userId, {
    xp: increment(xpToAdd),
  })
}

// Thread operations
export async function createThread(threadData: Omit<Thread, "id" | "createdAt" | "updatedAt">) {
  // Remove undefined fields to prevent Firestore errors
  const cleanedData = Object.fromEntries(
    Object.entries({ ...threadData, updatedAt: serverTimestamp() as any })
      .filter(([_, value]) => value !== undefined)
  )
  return createDocument<Thread>(COLLECTIONS.THREADS, cleanedData as any)
}

export async function getThreads(filters?: { category?: string; sortBy?: string }) {
  const constraints: QueryConstraint[] = [orderBy("createdAt", "desc"), limit(50)]
  if (filters?.category) {
    constraints.unshift(where("category", "==", filters.category))
  }
  return getDocuments<Thread>(COLLECTIONS.THREADS, constraints)
}

export async function voteThread(threadId: string, delta: number) {
  await updateDocument(COLLECTIONS.THREADS, threadId, {
    score: increment(delta),
    upvotes: delta > 0 ? increment(1) : increment(0),
    downvotes: delta < 0 ? increment(1) : increment(0),
  })
}

export async function updateThreadViews(threadId: string) {
  await updateDocument(COLLECTIONS.THREADS, threadId, {
    viewCount: increment(1),
  })
}

// Comment operations
export async function createComment(commentData: Omit<Comment, "id" | "createdAt" | "updatedAt">) {
  const commentId = await createDocument<Comment>(COLLECTIONS.COMMENTS, {
    ...commentData,
    updatedAt: serverTimestamp() as any,
  })
  
  // Increment thread comment count
  await updateDocument(COLLECTIONS.THREADS, commentData.threadId, {
    commentCount: increment(1),
  })
  
  return commentId
}

export async function getThreadComments(threadId: string) {
  return getDocuments<Comment>(COLLECTIONS.COMMENTS, [where("threadId", "==", threadId), orderBy("createdAt", "asc")])
}

export async function voteComment(commentId: string, delta: number) {
  await updateDocument(COLLECTIONS.COMMENTS, commentId, {
    score: increment(delta),
  })
}

// Poll operations
export async function createPoll(pollData: Omit<Poll, "id" | "createdAt">) {
  return createDocument<Poll>(COLLECTIONS.POLLS, pollData)
}

export async function votePoll(pollId: string, optionId: string) {
  const pollDoc = await getDocument<Poll>(COLLECTIONS.POLLS, pollId)
  if (!pollDoc) return

  const updatedOptions = pollDoc.options.map((opt) =>
    opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt,
  )

  await updateDocument(COLLECTIONS.POLLS, pollId, {
    options: updatedOptions,
    totalVotes: increment(1),
  })
}

// Bookmark operations
export async function createBookmark(bookmarkData: Omit<Bookmark, "id" | "createdAt">) {
  return createDocument<Bookmark>(COLLECTIONS.BOOKMARKS, bookmarkData)
}

export async function getUserBookmarks(userId: string) {
  return getDocuments<Bookmark>(COLLECTIONS.BOOKMARKS, [where("userId", "==", userId), orderBy("createdAt", "desc")])
}

export async function deleteBookmark(bookmarkId: string) {
  await deleteDocument(COLLECTIONS.BOOKMARKS, bookmarkId)
}

// AI Conversation operations
export async function saveAIConversation(conversationData: Omit<AIConversation, "id" | "createdAt">) {
  return createDocument<AIConversation>(COLLECTIONS.AI_CONVERSATIONS, conversationData)
}

export async function getUserAIConversations(userId: string) {
  return getDocuments<AIConversation>(COLLECTIONS.AI_CONVERSATIONS, [
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(20),
  ])
}

// YouTube Cache operations
export async function cacheYouTubeVideos(topic: string, videos: YouTubeVideo[]) {
  const expiresAt = Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) // 7 days
  return createDocument<YouTubeCache>(COLLECTIONS.YOUTUBE_CACHE, {
    topic,
    videos,
    expiresAt,
  })
}

export async function getCachedYouTubeVideos(topic: string) {
  const now = Timestamp.now()
  const cached = await getDocuments<YouTubeCache>(COLLECTIONS.YOUTUBE_CACHE, [
    where("topic", "==", topic),
    where("expiresAt", ">", now),
    limit(1),
  ])
  return cached[0] || null
}

// Enhanced Canteen Post operations
export async function likeCanteenPostEnhanced(postId: string, userId: string) {
  const post = await getDocument<CanteenPost>(COLLECTIONS.CANTEEN_POSTS, postId)
  if (!post) return

  const likedBy = post.likedBy || []
  const hasLiked = likedBy.includes(userId)

  if (hasLiked) {
    // Unlike
    await updateDocument(COLLECTIONS.CANTEEN_POSTS, postId, {
      likes: increment(-1),
      likedBy: likedBy.filter((id) => id !== userId),
    })
  } else {
    // Like
    await updateDocument(COLLECTIONS.CANTEEN_POSTS, postId, {
      likes: increment(1),
      likedBy: [...likedBy, userId],
    })
  }
}

export async function shareCanteenPost(postId: string) {
  await updateDocument(COLLECTIONS.CANTEEN_POSTS, postId, {
    shares: increment(1),
  })
}

// Lab History Types
export interface LearnHistory {
  id: string
  userId: string
  topic: string
  difficulty: "beginner" | "intermediate" | "advanced"
  explanation: string
  learningPath: {
    topic: string
    steps: {
      title: string
      description: string
      resources: string[]
      estimatedTime: string
    }[]
  }
  createdAt: Timestamp
}

export interface QuizHistory {
  id: string
  userId: string
  topic: string
  questions: {
    question: string
    options: string[]
    correctAnswer: number
    explanation: string
  }[]
  score: number
  totalQuestions: number
  completed: boolean
  currentQuestion: number
  createdAt: Timestamp
}

export interface ChatHistory {
  id: string
  userId: string
  topic: string
  messages: { role: "user" | "ai"; content: string; timestamp: number }[]
  createdAt: Timestamp
}

export interface VideoHistory {
  id: string
  userId: string
  video: {
    id: string
    title: string
    channelTitle: string
    thumbnail: string
    description: string
    url: string
    duration: string
  }
  createdAt: Timestamp
}

export interface MaterialContribution {
  id: string
  userId: string
  username: string
  title: string
  description: string
  url: string
  type: "notes" | "video" | "book" | "article"
  status: "pending" | "approved" | "rejected"
  createdAt: Timestamp
}

// Lab History operations
export async function saveLearnHistory(userId: string, data: Omit<LearnHistory, "id" | "userId" | "createdAt">) {
  return createDocument<LearnHistory>(COLLECTIONS.LEARN_HISTORY, { ...data, userId })
}

export async function getLearnHistory(userId: string, limit_count: number = 50) {
  return getDocuments<LearnHistory>(COLLECTIONS.LEARN_HISTORY, [
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(limit_count),
  ])
}

export async function saveQuizHistory(userId: string, data: Omit<QuizHistory, "id" | "userId" | "createdAt">) {
  return createDocument<QuizHistory>(COLLECTIONS.QUIZ_HISTORY, { ...data, userId })
}

export async function getQuizHistory(userId: string, limit_count: number = 50) {
  return getDocuments<QuizHistory>(COLLECTIONS.QUIZ_HISTORY, [
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(limit_count),
  ])
}

export async function saveChatHistory(userId: string, data: Omit<ChatHistory, "id" | "userId" | "createdAt">) {
  return createDocument<ChatHistory>(COLLECTIONS.CHAT_HISTORY, { ...data, userId })
}

export async function getChatHistory(userId: string, limit_count: number = 50) {
  return getDocuments<ChatHistory>(COLLECTIONS.CHAT_HISTORY, [
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(limit_count),
  ])
}

export async function saveVideoHistory(userId: string, data: Omit<VideoHistory, "id" | "userId" | "createdAt">) {
  return createDocument<VideoHistory>(COLLECTIONS.VIDEO_HISTORY, { ...data, userId })
}

export async function getVideoHistory(userId: string, limit_count: number = 100) {
  return getDocuments<VideoHistory>(COLLECTIONS.VIDEO_HISTORY, [
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(limit_count),
  ])
}

// Material Contributions
export async function submitMaterialContribution(
  userId: string,
  username: string,
  data: { title: string; description: string; url: string; type: "notes" | "video" | "book" | "article" }
) {
  return createDocument<MaterialContribution>(COLLECTIONS.MATERIAL_CONTRIBUTIONS, {
    ...data,
    userId,
    username,
    status: "pending",
  })
}

export async function getMaterialContributions(userId?: string) {
  const constraints = userId
    ? [where("userId", "==", userId), orderBy("createdAt", "desc")]
    : [orderBy("createdAt", "desc"), limit(50)]
  return getDocuments<MaterialContribution>(COLLECTIONS.MATERIAL_CONTRIBUTIONS, constraints)
}
