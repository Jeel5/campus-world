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
  type: "confession" | "meme" | "photo" | "video" | "poll" | "story"
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
    options: { id: string; text: string; votes: number }[]
  }
  expiresAt: Timestamp
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

export async function createCanteenPost(postData: Omit<CanteenPost, "id" | "createdAt">) {
  return createDocument<CanteenPost>(COLLECTIONS.CANTEEN_POSTS, postData)
}

export async function getCanteenPosts() {
  const now = Timestamp.now()
  return getDocuments<CanteenPost>(COLLECTIONS.CANTEEN_POSTS, [
    where("expiresAt", ">", now),
    orderBy("expiresAt", "desc"),
    orderBy("createdAt", "desc"),
    limit(50),
  ])
}

export async function likeCanteenPost(postId: string) {
  await updateDocument(COLLECTIONS.CANTEEN_POSTS, postId, {
    likes: increment(1),
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
