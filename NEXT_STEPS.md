# 🚀 Next Steps - Canteen Page Setup

Your canteen page has been completely reworked! Here's what you need to do to get it working:

## ✅ What's Been Done

1. ✅ Complete page rewrite with permanent posts
2. ✅ Cloudinary integration for media uploads
3. ✅ Working like system with backend
4. ✅ Full comment functionality
5. ✅ Poll support with voting UI
6. ✅ Portal-based modal (renders above sidebar)
7. ✅ Updated Firestore interfaces and functions
8. ✅ Added `canteenComments` collection to sync
9. ✅ Created setup documentation

## 🔧 What You Need To Do

### 1. Set Up Cloudinary (Required!)

**Time: ~5 minutes**

1. Go to https://cloudinary.com and sign up (free!)
2. Copy your **Cloud Name** from the dashboard
3. Go to **Settings → Upload → Add upload preset**
4. Create an **unsigned** preset (name it `campus-world-uploads`)
5. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=campus-world-uploads
   ```

📖 **Detailed guide:** [CLOUDINARY_SETUP.md](CLOUDINARY_SETUP.md)

### 2. Run Database Sync

**Time: ~1 minute**

This creates the new `canteenComments` collection:

```bash
pnpm tsx sync.ts
```

### 3. Update Firebase Security Rules

**Time: ~2 minutes**

Go to Firebase Console → Firestore → Rules and add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ... your existing rules ...
    
    // Canteen Posts - UPDATED (removed expiresAt requirement)
    match /canteenPosts/{postId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        request.auth.uid == resource.data.authorId;
      allow delete: if request.auth != null && 
        request.auth.uid == resource.data.authorId;
    }
    
    // Canteen Comments - NEW
    match /canteenComments/{commentId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        request.auth.uid == resource.data.authorId;
      allow delete: if request.auth != null && 
        request.auth.uid == resource.data.authorId;
    }
  }
}
```

### 4. Restart Development Server

```bash
# Stop current server (Ctrl+C)
pnpm dev
```

### 5. Test Everything!

Go to `/canteen` and test:

- ✅ Create text post
- ✅ Upload image post (via Cloudinary)
- ✅ Upload video post (via Cloudinary)
- ✅ Create poll
- ✅ Like a post
- ✅ Comment on a post
- ✅ Vote on a poll

---

## 📚 Documentation Created

1. **[CANTEEN_REWORK.md](CANTEEN_REWORK.md)** - Complete technical documentation
   - All features explained
   - Code flow diagrams
   - Firestore structure
   - Troubleshooting guide

2. **[CLOUDINARY_SETUP.md](CLOUDINARY_SETUP.md)** - Step-by-step Cloudinary setup
   - Account creation
   - Upload preset configuration
   - Environment variables
   - Troubleshooting

3. **[.env.example](.env.example)** - Updated with Cloudinary variables

---

## 🎯 Key Features Now Available

### For Users:
- 📝 Create text posts
- 🖼️ Upload images (via Cloudinary)
- 🎥 Upload videos (via Cloudinary)
- 📊 Create polls with up to 6 options
- ❤️ Like posts (with visual feedback)
- 💬 Comment on posts (full CRUD)
- 🗳️ Vote on polls (with percentage bars)
- ⏱️ Real-time feed updates

### For Developers:
- Permanent posts (no expiration)
- Cloudinary CDN (free 25GB storage)
- Optimistic UI updates
- Portal-based modals (z-index 999999)
- Toast notifications
- Type-safe Firestore functions
- Real-time subscriptions

---

## 🐛 Known Limitations

1. **Poll voting** - UI works but doesn't persist to Firestore yet
2. **Share button** - Placeholder (not functional)
3. **Comment likes** - Not implemented
4. **Nested replies** - Single level only

These can be added later if needed!

---

## ❓ Troubleshooting

### Cloudinary widget not loading
```
Error: "Cloudinary widget not loaded"
```
**Fix:** Check script is in page and restart dev server

### Upload fails
```
Error: "Upload Failed"
```
**Fix:** 
1. Verify upload preset is **unsigned**
2. Check environment variables in `.env.local`
3. Restart dev server

### Posts not appearing
```
Empty feed or loading forever
```
**Fix:**
1. Check Firebase rules allow read access
2. Run `pnpm tsx sync.ts` to create collection
3. Check browser console for errors

### Comments not working
```
Can't create or view comments
```
**Fix:**
1. Run `pnpm tsx sync.ts` to create `canteenComments` collection
2. Update Firebase rules (see step 3 above)
3. Refresh page

---

## 📞 Need Help?

1. Check [CANTEEN_REWORK.md](CANTEEN_REWORK.md) - Full technical docs
2. Check [CLOUDINARY_SETUP.md](CLOUDINARY_SETUP.md) - Cloudinary guide
3. Check browser console for errors
4. Check Firebase Console → Firestore for data

---

## 🎉 Summary

**Changed Files:**
- ✅ `app/canteen/page.tsx` - Complete rewrite
- ✅ `app/canteen/loading.tsx` - Updated loading UI
- ✅ `lib/firestore.ts` - New functions + updated interfaces
- ✅ `sync.ts` - Added canteenComments collection
- ✅ `.env.example` - Added Cloudinary variables

**New Files:**
- ✨ `CANTEEN_REWORK.md` - Technical documentation
- ✨ `CLOUDINARY_SETUP.md` - Setup guide
- ✨ `NEXT_STEPS.md` - This file!

**What You Need:**
1. 🔑 Cloudinary account (free)
2. ⚙️ Update `.env.local`
3. 🔒 Update Firebase rules
4. 🚀 Restart server

**Time to completion:** ~10 minutes

---

**Ready to go! 🚀**
