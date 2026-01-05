# 🚀 Campus World - Deployment Checklist

Use this checklist to ensure your enhanced Campus World platform is fully set up and ready for the Google Hackathon!

## ✅ Pre-Deployment Checklist

### 1. Environment Setup

- [ ] **Copy environment template**
  ```bash
  cp .env.local.example .env.local
  ```

- [ ] **Add Firebase Configuration**
  - [ ] Firebase API Key
  - [ ] Auth Domain
  - [ ] Project ID
  - [ ] Storage Bucket
  - [ ] Messaging Sender ID
  - [ ] App ID
  - [ ] Measurement ID

- [ ] **Add Google Gemini API Key**
  - [ ] Get key from https://makersuite.google.com/app/apikey
  - [ ] Paste in `NEXT_PUBLIC_GEMINI_API_KEY`

- [ ] **Add YouTube Data API Key**
  - [ ] Enable YouTube Data API v3 in Google Cloud Console
  - [ ] Get key from https://console.cloud.google.com/apis/credentials
  - [ ] Paste in `NEXT_PUBLIC_YOUTUBE_API_KEY`

### 2. Firebase Configuration

- [ ] **Enable Firestore Database**
  - [ ] Go to Firebase Console > Firestore
  - [ ] Click "Create database"
  - [ ] Choose production mode
  - [ ] Select location

- [ ] **Update Firestore Rules**
  - [ ] Copy rules from `IMPLEMENTATION_GUIDE.md`
  - [ ] Paste in Firestore > Rules tab
  - [ ] Publish rules

- [ ] **Enable Firebase Authentication**
  - [ ] Go to Firebase Console > Authentication
  - [ ] Enable Google Sign-In
  - [ ] Enable Email/Password
  - [ ] Enable Anonymous Auth

- [ ] **Enable Firebase Storage**
  - [ ] Go to Firebase Console > Storage
  - [ ] Get started
  - [ ] Choose production mode
  - [ ] Select location

- [ ] **Update Storage Rules**
  - [ ] Copy rules from `IMPLEMENTATION_GUIDE.md`
  - [ ] Paste in Storage > Rules tab
  - [ ] Publish rules

### 3. Dependencies

- [ ] **Verify installed packages**
  ```bash
  npm list @google/generative-ai react-player react-dropzone axios
  ```

- [ ] **Install if missing**
  ```bash
  npm install @google/generative-ai react-player react-dropzone axios
  ```

- [ ] **Clear node_modules if issues**
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

### 4. Code Deployment

- [ ] **Backup current files** (optional)
  ```bash
  cp app/quad/page.tsx app/quad/page.backup.tsx
  cp app/lab/page.tsx app/lab/page.backup.tsx
  cp app/canteen/page.tsx app/canteen/page.backup.tsx
  ```

- [ ] **Deploy enhanced Quad page**
  ```bash
  cp enhanced-pages/quad-enhanced.tsx app/quad/page.tsx
  ```

- [ ] **Restart development server**
  ```bash
  npm run dev
  ```

## 🧪 Testing Checklist

### Test 1: Firebase Connection

- [ ] Visit http://localhost:3000
- [ ] Check browser console for errors
- [ ] Sign in with Google or email
- [ ] Verify user appears in Firestore

### Test 2: The Quad (Forum)

- [ ] Navigate to /quad
- [ ] Page loads without errors
- [ ] Click "Create Thread" button
- [ ] Toggle "Post Anonymously" switch
- [ ] Select a category
- [ ] Add a content warning
- [ ] Enter title and content
- [ ] Add tags
- [ ] Submit thread
- [ ] Verify thread appears in list
- [ ] Click upvote/downvote buttons
- [ ] Expand thread and add comment
- [ ] Vote on comment
- [ ] Test search functionality
- [ ] Try all sort options (Hot, Best, New, Top)
- [ ] Filter by category

### Test 3: Gemini AI (Lab)

- [ ] Open browser console
- [ ] Run test command:
  ```javascript
  import { generateTopicExplanation } from '@/lib/gemini'
  const explanation = await generateTopicExplanation("Machine Learning", "beginner")
  console.log(explanation)
  ```
- [ ] Verify AI response is received
- [ ] No errors in console

### Test 4: YouTube API

- [ ] Open browser console
- [ ] Run test command:
  ```javascript
  import { searchEducationalVideos } from '@/lib/youtube'
  const videos = await searchEducationalVideos("React Hooks", 5)
  console.log(videos)
  ```
- [ ] Verify array of videos is returned
- [ ] Check video objects have title, thumbnail, etc.

### Test 5: File Upload (Canteen)

- [ ] Navigate to /canteen
- [ ] Try uploading an image (< 10MB)
- [ ] Verify upload succeeds
- [ ] Check Firebase Storage for uploaded file
- [ ] Try uploading a video (< 10MB)
- [ ] Test file validation (upload wrong type)
- [ ] Test file size limit (upload > 10MB)

### Test 6: Real-time Updates

- [ ] Open two browser windows side-by-side
- [ ] Create a thread in window 1
- [ ] Verify it appears in window 2
- [ ] Add a comment in window 2
- [ ] Verify it appears in window 1
- [ ] Test voting synchronization

## 📊 Performance Checklist

- [ ] **Check Firestore reads**
  - [ ] Go to Firebase Console > Firestore > Usage
  - [ ] Verify reads are within limits

- [ ] **Check Storage usage**
  - [ ] Go to Firebase Console > Storage > Usage
  - [ ] Monitor file uploads

- [ ] **Test offline mode**
  - [ ] Disconnect internet
  - [ ] Navigate to /quad
  - [ ] Verify cached data loads
  - [ ] Reconnect internet
  - [ ] Verify sync works

- [ ] **Check page load times**
  - [ ] All pages load < 3 seconds
  - [ ] Images lazy load
  - [ ] No blocking JavaScript

## 🔒 Security Checklist

- [ ] **Firestore Rules**
  - [ ] All reads require authentication
  - [ ] Users can only edit their own content
  - [ ] Proper validation rules in place

- [ ] **Storage Rules**
  - [ ] File size limits enforced
  - [ ] File type validation works
  - [ ] Authentication required for uploads

- [ ] **API Keys**
  - [ ] .env.local not committed to Git
  - [ ] .env.local in .gitignore
  - [ ] Keys not visible in browser console

- [ ] **Authentication**
  - [ ] Anonymous auth works
  - [ ] Google sign-in works
  - [ ] Email/password works
  - [ ] User data stored securely

## 📱 UI/UX Checklist

- [ ] **Responsive Design**
  - [ ] Test on mobile (375px width)
  - [ ] Test on tablet (768px width)
  - [ ] Test on desktop (1440px width)
  - [ ] All buttons clickable
  - [ ] Text readable at all sizes

- [ ] **Accessibility**
  - [ ] All interactive elements keyboard accessible
  - [ ] Proper ARIA labels
  - [ ] Color contrast sufficient
  - [ ] Focus indicators visible

- [ ] **User Feedback**
  - [ ] Loading states show spinners
  - [ ] Success messages on actions
  - [ ] Error messages clear and helpful
  - [ ] Optimistic updates work

## 🎨 Features Verification

### The Quad
- [ ] Thread creation works
- [ ] Anonymous mode works
- [ ] Content warnings display
- [ ] Voting system works
- [ ] Comments nest properly
- [ ] Search finds threads
- [ ] Filters work
- [ ] Sorting works
- [ ] Real-time updates work

### The Lab (Services)
- [ ] AI explanation generator works
- [ ] Learning path generator works
- [ ] Quiz generator works
- [ ] AI chat works
- [ ] Problem solver works
- [ ] YouTube video search works
- [ ] Playlist search works
- [ ] Caching works

### The Canteen
- [ ] Post creation works
- [ ] Image upload works
- [ ] Video upload works
- [ ] Poll creation works
- [ ] Like system works
- [ ] Comment system works
- [ ] Share works
- [ ] Expiration works

## 🚦 Go-Live Checklist

### Before Launch
- [ ] All tests passing
- [ ] No console errors
- [ ] No broken links
- [ ] All images load
- [ ] All buttons work
- [ ] Error handling works

### Documentation
- [ ] README.md updated
- [ ] IMPLEMENTATION_GUIDE.md reviewed
- [ ] QUICK_SUMMARY.md read
- [ ] .env.local.example provided
- [ ] Code comments adequate

### Performance
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s
- [ ] No memory leaks
- [ ] No console warnings

### Production Deployment
- [ ] Environment variables set in hosting platform
- [ ] Firebase quotas checked
- [ ] API quotas checked
- [ ] Domain configured (if applicable)
- [ ] HTTPS enabled
- [ ] Error monitoring setup (optional)

## 🎯 Hackathon Specific

- [ ] **Demo Preparation**
  - [ ] Sample data created
  - [ ] Demo scenarios planned
  - [ ] Screenshots taken
  - [ ] Video demo recorded

- [ ] **Presentation Ready**
  - [ ] Features list prepared
  - [ ] Tech stack highlighted
  - [ ] Google technologies emphasized (Gemini, YouTube, Firebase)
  - [ ] Unique features noted

- [ ] **Code Quality**
  - [ ] TypeScript types complete
  - [ ] No eslint errors
  - [ ] Code formatted consistently
  - [ ] Comments where needed

## 📝 Final Checks

- [ ] **Git Repository**
  - [ ] All files committed
  - [ ] .gitignore configured
  - [ ] README.md complete
  - [ ] No sensitive data committed

- [ ] **Backup**
  - [ ] Firestore data exported
  - [ ] Code backed up
  - [ ] Environment variables documented

- [ ] **Monitoring**
  - [ ] Firebase Console accessible
  - [ ] Google Cloud Console accessible
  - [ ] Error logs reviewed

## 🎉 Launch Checklist

- [ ] All above checklists completed
- [ ] Final test run successful
- [ ] Team members tested
- [ ] Demo video prepared
- [ ] Presentation ready
- [ ] Questions & answers prepared

## 📞 Emergency Contacts

### If Something Goes Wrong

1. **Firebase Issues**
   - Check Firebase Console > Firestore > Usage
   - Review Firestore Rules
   - Check Authentication status
   - Verify Storage rules

2. **API Issues**
   - Check API quotas in Google Cloud Console
   - Verify API keys in .env.local
   - Review browser console for errors
   - Check network tab for failed requests

3. **Deployment Issues**
   - Clear node_modules and reinstall
   - Check Next.js build output
   - Verify all environment variables
   - Review hosting platform logs

4. **Code Issues**
   - Check browser console for errors
   - Review Network tab for failed requests
   - Check Firestore rules
   - Verify authentication status

## 🔗 Quick Links

- Firebase Console: https://console.firebase.google.com/
- Google Cloud Console: https://console.cloud.google.com/
- Gemini API Keys: https://makersuite.google.com/app/apikey
- YouTube API: https://console.cloud.google.com/apis/library/youtube.googleapis.com

## ✅ Sign Off

- [ ] All checks complete
- [ ] Ready for demo
- [ ] Confident in deployment
- [ ] Hackathon ready! 🚀

---

**Remember**: Test thoroughly before the demo! Good luck with the Google Hackathon! 🎉

**Support**: If you encounter issues, check the documentation:
- README.md - Full documentation
- IMPLEMENTATION_GUIDE.md - Deployment steps
- QUICK_SUMMARY.md - Quick reference
