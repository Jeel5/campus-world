# Campus World - Enhanced Platform 🎓

> A comprehensive virtual campus platform built for the Google Hackathon 2026, featuring AI-powered learning, social interactions, and community forums.

## 🚀 What's New

### Major Enhancements

#### 1. The Quad - Reddit-Style Forum
- **Full Thread System**: Create threads with titles, content warnings (CW/), tags, and categories
- **Anonymous Mode**: Post without revealing your identity
- **Nested Comments**: Reddit-style comment threads with unlimited depth
- **Voting System**: Upvote/downvote threads and comments
- **Smart Sorting**: Hot, Best, New, Top algorithms
- **Real-time Updates**: See new threads and comments instantly
- **Advanced Search**: Search by title, content, or tags
- **Content Warnings**: Add CW tags for sensitive topics

#### 2. The Lab - AI-Powered Learning
- **Gemini AI Integration**:
  - Get topic explanations at any level (beginner/intermediate/advanced)
  - Generate complete learning paths
  - Interactive AI-generated quizzes
  - Chat with AI tutor for help
  - Step-by-step problem solving
  - Practice problem generation
  
- **YouTube Auto-Find**:
  - Automatically find educational videos for any topic
  - Search complete playlists
  - Filter by difficulty level
  - Cached results for faster loading

- **Quest System**:
  - Interactive learning quests
  - XP and progression tracking
  - Multiple difficulty levels
  - Real-time progress saving

#### 3. The Canteen - Social Media
- **Multi-Format Posts**:
  - Text posts and confessions
  - Photo and video uploads
  - Interactive polls
  - Ephemeral stories
  
- **Social Features**:
  - Like/unlike with tracking
  - Comment threads
  - Share functionality
  - Anonymous posting option
  - Expiring content (24-hour default)

#### 4. The Library - Resource Hub
- **Organization**: Subjects → Units → Topics
- **Search**: Full-text search across all resources
- **Bookmarking**: Save favorite materials
- **Filters**: By subject, difficulty, format
- **Tracking**: View counts and popular resources

#### 5. Notice Board - Announcements
- **Categorization**: Academic, Events, Administrative, Emergency
- **Trust System**: Community voting on notices
- **Official Badges**: Verified admin posts
- **Pinning**: Important notices stay on top

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm/pnpm
- Firebase project
- Google Gemini API key
- YouTube Data API key

### Step 1: Install Dependencies
```bash
npm install
# or
pnpm install
```

Already installed:
- `@google/generative-ai` - Gemini AI SDK
- `react-player` - Video playback
- `react-dropzone` - File uploads
- `axios` - HTTP client

### Step 2: Environment Variables

Create `.env.local` in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google APIs
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key
```

### Step 3: Firebase Setup

#### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if request.auth != null;
    }
    
    match /threads/{threadId} {
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth.uid == resource.data.authorId;
    }
    
    match /comments/{commentId} {
      allow create: if request.auth != null;
      allow update: if request.auth.uid == resource.data.authorId;
      allow delete: if request.auth.uid == resource.data.authorId;
    }
    
    match /canteenPosts/{postId} {
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }
    
    match /bookmarks/{bookmarkId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
  }
}
```

#### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null 
                   && request.resource.size < 10 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*|video/.*');
    }
  }
}
```

### Step 4: Deploy Enhanced Pages

The enhanced pages are in `enhanced-pages/` directory. To use them:

```bash
# Backup originals
cp app/quad/page.tsx app/quad/page.backup.tsx

# Deploy enhanced version
cp enhanced-pages/quad-enhanced.tsx app/quad/page.tsx
```

Or manually review and integrate the changes.

### Step 5: Run the Application

```bash
npm run dev
# or
pnpm dev
```

Visit `http://localhost:3000`

## 🎯 Features Guide

### The Quad - Creating Threads

1. Click "Create Thread" button
2. Toggle "Post Anonymously" if desired
3. Select a category (Academic, Social, Support, Rant, Question)
4. Add optional Content Warning (e.g., "Mental Health")
5. Enter title and content
6. Add tags for better discovery
7. Click "Create Thread"

**Voting**: Click up/down arrows to vote on threads and comments
**Comments**: Click on a thread to expand and add comments
**Search**: Use the search bar to find threads by keywords or tags

### The Lab - AI Learning

#### Get an Explanation
```typescript
import { generateTopicExplanation } from '@/lib/gemini'

const explanation = await generateTopicExplanation(
  "Machine Learning", 
  "intermediate"
)
```

#### Find YouTube Videos
```typescript
import { searchEducationalVideos } from '@/lib/youtube'

const videos = await searchEducationalVideos("React Hooks", 10)
```

#### Generate a Quiz
```typescript
import { generateQuizQuestions } from '@/lib/gemini'

const quiz = await generateQuizQuestions("Data Structures", 5)
```

#### Chat with AI
```typescript
import { chatWithAI } from '@/lib/gemini'

const response = await chatWithAI(messages, "We're discussing algorithms")
```

### The Canteen - Social Posts

1. Click the post input area
2. Choose post type:
   - Text/Confession
   - Photo (upload or drag & drop)
   - Video (MP4, WebM)
   - Poll (add options)
3. Toggle anonymous mode if desired
4. Click "Post" or "Blast"

**Interactions**:
- ❤️ Like/Unlike posts
- 💬 Add comments
- 🔗 Share content
- ⏱️ Posts expire after 24 hours

### File Uploads

```typescript
import { uploadFile, validateFile } from '@/lib/storage'

// Validate before upload
const validation = validateFile(file, 10) // 10MB max
if (!validation.valid) {
  console.error(validation.error)
  return
}

// Upload
const result = await uploadFile(file, 'canteen', userId)
console.log(result.url) // Download URL
```

## 🏗️ Project Structure

```
campus-world/
├── app/                      # Next.js app directory
│   ├── quad/                 # Forum pages
│   ├── lab/                  # Learning pages
│   ├── canteen/              # Social pages
│   ├── library/              # Resource pages
│   └── notice-board/         # Announcement pages
├── components/               # Reusable UI components
│   ├── ui/                   # Shadcn UI components
│   └── campus-sidebar.tsx    # Navigation
├── context/                  # React contexts
│   └── AuthContext.tsx       # Authentication
├── lib/                      # Core utilities
│   ├── firebase.ts           # Firebase config
│   ├── firestore.ts          # Database operations
│   ├── gemini.ts             # Gemini AI service
│   ├── youtube.ts            # YouTube API service
│   ├── storage.ts            # File uploads
│   └── utils.ts              # Helpers
├── enhanced-pages/           # Enhanced page versions
└── public/                   # Static assets
```

## 🔧 API Services

### Gemini AI (`lib/gemini.ts`)
- `generateTopicExplanation()` - Get AI explanations
- `generateLearningPath()` - Create learning paths
- `generateQuizQuestions()` - Generate quizzes
- `chatWithAI()` - Interactive AI chat
- `solveProblem()` - Step-by-step solutions
- `generatePracticeProblems()` - Create practice problems
- `getStudyTips()` - Get study advice
- `summarizeContent()` - Summarize text

### YouTube (`lib/youtube.ts`)
- `searchEducationalVideos()` - Find videos
- `searchPlaylists()` - Find playlists
- `getPlaylistVideos()` - Get videos from playlist
- `searchChannels()` - Find educational channels
- `getRecommendedVideos()` - Get recommendations by difficulty

### Storage (`lib/storage.ts`)
- `uploadFile()` - Upload single file
- `uploadMultipleFiles()` - Upload multiple files
- `deleteFile()` - Delete file
- `validateFile()` - Validate file type/size
- `compressImage()` - Compress images before upload

### Firestore (`lib/firestore.ts`)

#### Threads
- `createThread()` - Create new thread
- `getThreads()` - Get all threads
- `voteThread()` - Vote on thread
- `updateThreadViews()` - Track views

#### Comments
- `createComment()` - Add comment
- `getThreadComments()` - Get all comments for thread
- `voteComment()` - Vote on comment

#### Canteen
- `createCanteenPost()` - Create post
- `likeCanteenPostEnhanced()` - Like/unlike with tracking
- `shareCanteenPost()` - Track shares

#### Bookmarks
- `createBookmark()` - Save content
- `getUserBookmarks()` - Get user's bookmarks
- `deleteBookmark()` - Remove bookmark

#### AI Conversations
- `saveAIConversation()` - Save chat history
- `getUserAIConversations()` - Get user's conversations

## 🎨 UI Components

### Custom Components
- Thread cards with voting
- Comment trees (nested)
- File upload dropzones
- Poll creator and viewer
- Video player embeds
- Anonymous mode toggle
- Content warning badges
- Category filters
- Search bars

### Shadcn UI Components Used
- Card, Button, Input, Textarea
- Tabs, Badge, Avatar
- Dialog, Sheet, Drawer
- Switch, Label, Select
- And many more...

## 🔐 Security Features

1. **Authentication**: All writes require authentication
2. **File Validation**: Type and size checks on uploads
3. **Content Sanitization**: XSS protection
4. **Rate Limiting**: Prevent API abuse (future)
5. **Privacy**: Anonymous mode hides user identity
6. **Moderation**: Report system (future enhancement)

## 📊 Database Schema

### Collections

#### threads
```typescript
{
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
```

#### comments
```typescript
{
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
```

#### canteenPosts
```typescript
{
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
```

#### polls
```typescript
{
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
```

#### bookmarks
```typescript
{
  id: string
  userId: string
  type: "thread" | "subject" | "unit" | "topic" | "video"
  referenceId: string
  createdAt: Timestamp
}
```

#### aiConversations
```typescript
{
  id: string
  userId: string
  type: "learning" | "quiz" | "explanation" | "help"
  topic: string
  messages: { role: "user" | "ai"; content: string; timestamp: number }[]
  relatedVideos?: string[]
  createdAt: Timestamp
}
```

#### youtubeCache
```typescript
{
  id: string
  topic: string
  videos: YouTubeVideo[]
  createdAt: Timestamp
  expiresAt: Timestamp
}
```

## 🚀 Performance Optimizations

1. **Firestore Caching**: Offline persistence enabled
2. **YouTube Caching**: Results cached for 7 days
3. **Image Compression**: Auto-compress before upload
4. **Lazy Loading**: Components load on demand
5. **Real-time Subscriptions**: Efficient Firestore listeners
6. **Pagination**: Queries limited to 50 items
7. **Debounced Search**: Reduce API calls

## 🧪 Testing

### Manual Testing Checklist

#### Quad
- [ ] Create thread with username
- [ ] Create thread anonymously
- [ ] Add content warning
- [ ] Add multiple tags
- [ ] Upvote/downvote threads
- [ ] Add top-level comment
- [ ] Reply to comment (nested)
- [ ] Vote on comments
- [ ] Search threads
- [ ] Filter by category
- [ ] Test Hot/Best/New/Top sorting

#### Lab
- [ ] Generate topic explanation
- [ ] Create learning path
- [ ] Generate quiz
- [ ] Chat with AI
- [ ] Solve problem with AI
- [ ] Find YouTube videos
- [ ] Find playlists
- [ ] Start and complete quest
- [ ] Track XP progression

#### Canteen
- [ ] Create text post
- [ ] Upload image
- [ ] Upload video
- [ ] Create poll
- [ ] Vote on poll
- [ ] Like/unlike post
- [ ] Add comment
- [ ] Share post
- [ ] Test post expiration

## 🐛 Troubleshooting

### Common Issues

**1. "Firebase unavailable" errors**
- Check internet connection
- Verify Firebase config in `.env.local`
- Ensure Firestore is initialized properly

**2. "AI not responding"**
- Verify Gemini API key
- Check API quota/limits
- Review console for errors

**3. "YouTube videos not loading"**
- Verify YouTube API key
- Check API quota
- Ensure CORS is configured

**4. "File upload fails"**
- Check file size (max 10MB)
- Verify file type (images/videos only)
- Check Firebase Storage rules

**5. "Anonymous mode not working"**
- Clear browser cache
- Check user authentication
- Verify Firestore rules

## 📈 Future Enhancements

- [ ] Push notifications for mentions/replies
- [ ] Extended user profiles
- [ ] Direct messaging
- [ ] Content moderation tools
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Gamification system
- [ ] Study group features
- [ ] Calendar integration
- [ ] Email notifications

## 🤝 Contributing

This project was built for the Google Hackathon 2026. Contributions are welcome!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is built for educational purposes.

## 🙏 Acknowledgments

- **Google Gemini AI** for powering the learning features
- **YouTube Data API** for educational video discovery
- **Firebase** for backend services
- **Next.js** for the amazing framework
- **Shadcn UI** for beautiful components
- **Radix UI** for accessible primitives

## 📞 Support

For issues or questions:
- Check the [Implementation Guide](./IMPLEMENTATION_GUIDE.md)
- Review Firebase Console logs
- Check browser console for errors

---

**Built with ❤️ for Google Hackathon 2026**

**Tech Stack**: Next.js 14, TypeScript, Firebase, Gemini AI, YouTube API, Tailwind CSS
