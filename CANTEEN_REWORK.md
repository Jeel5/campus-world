# Canteen Page - Complete Rework

## ✨ What Changed

The Canteen page has been **completely rebuilt** from scratch with:

### 🎯 Core Features
- ✅ **Permanent posts** (no more expiring content)
- ✅ **Cloudinary integration** for image/video uploads (no Firebase Storage costs!)
- ✅ **Working like system** with real-time updates
- ✅ **Full comment functionality** (create, view, reply)
- ✅ **Multiple post types**: Text, Image, Video, Poll
- ✅ **Poll voting** with visual percentages
- ✅ **Real-time feed** with auto-updates
- ✅ **Portal-based modal** (renders above sidebar at z-index 999999)

### 🎨 UI Improvements
- Beautiful create post modal with media upload
- Smooth animations with Framer Motion
- Responsive design (mobile, tablet, desktop)
- Dark theme optimized
- Toast notifications for feedback

### 🔧 Technical Stack
- **Frontend**: Next.js 16, React, TypeScript
- **Database**: Firebase Firestore
- **Media Storage**: Cloudinary (free 25GB)
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Icons**: Lucide React

---

## 📁 Files Changed

### 1. `app/canteen/page.tsx` - Complete Rewrite
**What it does:** Main Canteen feed page with all functionality

**Key Features:**
- Real-time post subscription
- Create post modal with 4 types (text, image, video, poll)
- Cloudinary upload widget integration
- Like/unlike posts with optimistic updates
- Comment system (create, view, collapse)
- Poll voting interface

**State Management:**
```typescript
- posts: CanteenPost[]           // All posts
- postComments: Record<string, CanteenComment[]>  // Comments by post ID
- showCreateModal: boolean       // Create post modal visibility
- showCommentsFor: string | null // Which post's comments are shown
```

### 2. `lib/firestore.ts` - Updated Functions & Interfaces

**New Interface: `CanteenComment`**
```typescript
export interface CanteenComment {
  id: string
  postId: string
  content: string
  authorId: string
  author: string
  createdAt: Timestamp
}
```

**Updated Interface: `CanteenPost`**
```typescript
export interface CanteenPost {
  id: string
  type: "text" | "image" | "video" | "poll" | ...
  content: string
  mediaUrl?: string
  mediaType?: "image" | "video"
  authorId: string
  author: string
  isAnonymous: boolean
  likes: number
  likedBy: string[]      // NEW: Track who liked
  comments: number
  shares: number
  pollData?: {
    question: string
    options: {
      id: string
      text: string
      votes: number
      votedBy: string[]  // NEW: Track who voted
    }[]
  }
  createdAt: Timestamp
  // ❌ REMOVED: expiresAt (no more temporary posts!)
}
```

**New Functions:**

1. **`createCanteenPost(postData)`**
   - Creates new post in Firestore
   - Auto-initializes: `likes: 0, likedBy: [], comments: 0, shares: 0`
   - Returns post ID

2. **`likeCanteenPost(postId, userId)`**
   - Toggle like/unlike
   - Updates `likes` counter (+1 or -1)
   - Updates `likedBy` array (add or remove userId)
   - Works with optimistic UI updates

3. **`createCanteenComment(commentData)`**
   - Creates comment linked to post
   - Auto-timestamps with Firestore `serverTimestamp()`

4. **`getCanteenComments(postId)`**
   - Fetches all comments for a post
   - Ordered by createdAt ascending (oldest first)
   - Limited to 100 comments

**New Collection:**
```typescript
COLLECTIONS.CANTEEN_COMMENTS = "canteenComments"
```

### 3. `sync.ts` - Database Setup

**Added:**
```typescript
// 16. Create Canteen Comments Collection
await setDoc(doc(collection(db, 'canteenComments'), 'sample-canteen-comment'), {
  postId: 'sample-post',
  content: 'Great post! 🎉',
  authorId: 'system',
  author: 'Campus World',
  createdAt: serverTimestamp()
});
```

### 4. `.env.example` - Environment Variables

**Added Cloudinary config:**
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset_name
```

### 5. `CLOUDINARY_SETUP.md` - New Guide
Complete setup instructions for Cloudinary integration

---

## 🚀 How to Use

### As a User

#### 1. Create a Post
1. Click **"Create Post"** button
2. Choose post type:
   - **Text**: Just type content
   - **Image**: Upload image via Cloudinary widget
   - **Video**: Upload video via Cloudinary widget
   - **Poll**: Add question + 2-6 options
3. Click **"Post"**

#### 2. Like a Post
- Click the ❤️ heart icon
- Icon fills red when liked
- Counter updates in real-time

#### 3. Comment on a Post
1. Click 💬 comment icon to expand
2. Type your comment
3. Press Enter or click Send ➤
4. Comment appears instantly

#### 4. Vote on Poll
- Click any poll option
- Results show as percentage bars
- "Vote Recorded" toast appears

### As a Developer

#### Setup Cloudinary (Required!)

1. **Sign up:** https://cloudinary.com
2. **Get Cloud Name:** From dashboard
3. **Create Upload Preset:**
   - Settings → Upload → Add preset
   - Set to **Unsigned**
   - Copy preset name
4. **Add to `.env.local`:**
   ```env
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset
   ```
5. **Restart dev server**

See [CLOUDINARY_SETUP.md](CLOUDINARY_SETUP.md) for detailed steps.

#### Run Database Sync

```bash
pnpm tsx sync.ts
```

This creates the `canteenComments` collection.

#### Firebase Security Rules

Update Firestore rules:

```javascript
// Canteen Posts
match /canteenPosts/{postId} {
  allow read: if true;
  allow create: if request.auth != null;
  allow update, delete: if request.auth != null && 
    request.auth.uid == resource.data.authorId;
}

// Canteen Comments
match /canteenComments/{commentId} {
  allow read: if true;
  allow create: if request.auth != null;
  allow update, delete: if request.auth != null && 
    request.auth.uid == resource.data.authorId;
}
```

---

## 🔍 Code Flow

### Creating a Post

```
User clicks "Create Post"
  ↓
Modal opens (createPortal to document.body)
  ↓
User selects type (text/image/video/poll)
  ↓
[IF image/video] → openCloudinaryWidget()
  ↓
Cloudinary widget opens
  ↓
User uploads file
  ↓
Cloudinary returns secure_url
  ↓
URL stored in mediaUrl state
  ↓
User clicks "Post"
  ↓
handleCreatePost() → createCanteenPost()
  ↓
Firestore saves post with mediaUrl
  ↓
Real-time subscription updates feed
  ↓
Toast notification "Post Created!"
```

### Liking a Post

```
User clicks heart icon
  ↓
handleLike(postId, isLiked)
  ↓
Optimistic update (setPosts immediately)
  ↓
likeCanteenPost(postId, userId) → Firestore
  ↓
Firestore updates: likes ±1, likedBy add/remove
  ↓
[ON ERROR] → Revert optimistic update
```

### Commenting

```
User clicks comment icon
  ↓
loadComments(postId)
  ↓
getCanteenComments(postId)
  ↓
Comments fetched from Firestore
  ↓
setPostComments({ [postId]: comments })
  ↓
Comment section expands
  ↓
User types + sends
  ↓
handleComment(postId)
  ↓
createCanteenComment() → Firestore
  ↓
Reload comments (getCanteenComments)
  ↓
Update post.comments counter
  ↓
Clear input field
```

---

## 📦 Dependencies

**New:**
- `date-fns` - For relative timestamps ("2 hours ago")
- Cloudinary Upload Widget (CDN script)

**Existing:**
- `framer-motion` - Animations
- `lucide-react` - Icons
- `@/hooks/use-toast` - Toast notifications
- `@/components/ui/*` - shadcn/ui components

---

## 🎯 Key Improvements Over Old Version

| Feature | Old | New |
|---------|-----|-----|
| Post Expiration | ✅ Temporary (expires) | ❌ Permanent |
| Media Upload | ❌ None | ✅ Cloudinary |
| Likes | ⚠️ Optimistic only | ✅ Full backend sync |
| Comments | ❌ Just counter | ✅ Full CRUD |
| Polls | ⚠️ Basic structure | ✅ Voting + percentages |
| Create Post | ❌ No UI | ✅ Full modal |
| Query Filter | `where("expiresAt", ">", now)` | `orderBy("createdAt", "desc")` |
| Post Types | Limited | Text, Image, Video, Poll |
| Real-time Updates | ✅ Yes | ✅ Yes |
| Portal Modal | ❌ No | ✅ Yes (z-index 999999) |

---

## 🐛 Known Issues / TODO

### Current Limitations:
1. **Poll voting not persisted** - UI only, needs Firestore update
2. **Share button** - Not functional (placeholder)
3. **Comment likes** - Not implemented
4. **Comment replies** - Single level only
5. **Post editing** - Not implemented
6. **Media preview in create modal** - Could be better

### Future Enhancements:
- [ ] Edit/delete posts
- [ ] Edit/delete comments
- [ ] Nested comment threads
- [ ] Like comments
- [ ] Share functionality
- [ ] Poll voting persistence
- [ ] User mentions (@username)
- [ ] Hashtags (#trending)
- [ ] Image gallery view
- [ ] Video player controls
- [ ] Search/filter posts
- [ ] Report/flag content
- [ ] Anonymous posting toggle

---

## 🔐 Security Considerations

### Current Setup:
- Posts require authentication (`if request.auth != null`)
- Only author can edit/delete
- Read access is public

### Recommendations:
1. Add content moderation system
2. Implement rate limiting
3. Add profanity filter
4. Report/flag mechanism
5. Admin moderation panel

---

## 📊 Firestore Structure

### Collection: `canteenPosts`
```
canteenPosts/
  ├─ post-id-1/
  │    ├─ type: "image"
  │    ├─ content: "Check out this view!"
  │    ├─ mediaUrl: "https://res.cloudinary.com/..."
  │    ├─ mediaType: "image"
  │    ├─ authorId: "user123"
  │    ├─ author: "John Doe"
  │    ├─ likes: 42
  │    ├─ likedBy: ["user1", "user2", ...]
  │    ├─ comments: 5
  │    └─ createdAt: Timestamp
  └─ post-id-2/
       ├─ type: "poll"
       ├─ content: "What's your favorite food?"
       ├─ pollData: { question: "...", options: [...] }
       └─ ...
```

### Collection: `canteenComments`
```
canteenComments/
  ├─ comment-id-1/
  │    ├─ postId: "post-id-1"
  │    ├─ content: "Amazing!"
  │    ├─ authorId: "user456"
  │    ├─ author: "Jane Smith"
  │    └─ createdAt: Timestamp
  └─ comment-id-2/
       └─ ...
```

---

## 🎨 Styling Details

### Theme Colors
- Primary: Rose/Pink gradient (`from-rose-600 to-pink-600`)
- Background: Dark (`#111317`)
- Cards: `bg-[#15181d]` with `border-white/5`
- Text: `text-white` with opacity variants

### Responsive Breakpoints
- Mobile: Default
- Tablet: `sm:` (640px+)
- Desktop: `md:` (768px+)

### Animations
- **Posts**: Fade in + slide up (staggered)
- **Modal**: Scale + fade
- **Comments**: Smooth expand/collapse

---

## 💡 Tips & Tricks

### Debugging

**Check Cloudinary widget loaded:**
```javascript
console.log('Cloudinary:', window.cloudinary)
```

**Check posts subscription:**
```javascript
useEffect(() => {
  console.log('Posts updated:', posts)
}, [posts])
```

**Check Firestore in console:**
```
Firebase Console → Firestore → canteenPosts
```

### Performance

- Posts limited to 50 (`limit(50)`)
- Comments limited to 100 per post (`limit(100)`)
- Optimistic UI updates (instant feedback)
- Real-time subscription (no polling)

### Customization

**Change post limit:**
```typescript
[orderBy("createdAt", "desc"), limit(100)] // Change 50 → 100
```

**Change theme colors:**
```typescript
// In create modal:
className="bg-gradient-to-r from-blue-600 to-cyan-600"
```

**Add new post type:**
```typescript
type: "meme" | "gif" | "announcement" | ...
```

---

## 📞 Support

If something's not working:

1. **Check environment variables** (`.env.local`)
2. **Restart dev server** (`pnpm dev`)
3. **Check browser console** for errors
4. **Check Firebase rules** (console.firebase.google.com)
5. **Verify Cloudinary setup** (cloudinary.com/console)

---

**Built with ❤️ for Campus World** 🎓
