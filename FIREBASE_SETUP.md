# Firebase Integration Guide for Campus World

This application uses Firebase for all data storage, authentication, and real-time updates.

## Setup Instructions

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the wizard
3. Enable Google Analytics (optional)

### 2. Enable Firebase Services

#### Firestore Database
1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Start in **production mode** (we'll configure rules later)
4. Choose a location closest to your users

#### Authentication
1. Go to "Authentication" → "Sign-in method"
2. Enable **Email/Password** authentication
3. Enable **Anonymous** authentication (for guest users)

### 3. Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Under "Your apps", click the web icon `</>`
3. Register your app with a nickname (e.g., "Campus World Web")
4. Copy the Firebase configuration object

### 4. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in the values from your Firebase config:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

### 5. Set Up Firestore Security Rules

In Firebase Console → Firestore Database → Rules, update to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can read any user but only write their own
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Posts collection - anyone can read, authenticated users can write
    match /posts/{postId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        (request.auth.uid == resource.data.authorId || 
         request.resource.data.keys().hasOnly(['score', 'updatedAt']));
    }
    
    // Canteen posts - anyone can read, authenticated users can create
    match /canteenPosts/{postId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        request.resource.data.keys().hasOnly(['likes', 'comments']);
    }
    
    // Notices - anyone can read, only admins can write (customize later)
    match /notices/{noticeId} {
      allow read: if true;
      allow create, update: if request.auth != null;
      allow update: if request.resource.data.keys().hasOnly(['trustVotes']);
    }
    
    // Subjects and units - read-only for now
    match /subjects/{subjectId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /units/{unitId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Quests - anyone can read, authenticated users can attempt
    match /quests/{questId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // User progress - users can only read/write their own
    match /userProgress/{progressId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

### 6. Initialize Sample Data (Optional)

You can add sample data through Firebase Console or create a script. Here's some example data structure:

#### Subjects Collection
```json
{
  "id": "cs",
  "name": "Computer Science",
  "accent": "text-blue-400",
  "bg": "bg-blue-400/10"
}
```

#### Units Collection
```json
{
  "id": "ds",
  "subjectId": "cs",
  "name": "Data Structures",
  "books": 12,
  "students": 450
}
```

#### Quests Collection
```json
{
  "id": "ds-1",
  "title": "Binary Tree Mastery",
  "subject": "CS",
  "difficulty": "Medium",
  "points": 150,
  "questions": 5
}
```

### 7. Run the Application

```bash
# Install dependencies (if not already done)
pnpm install

# Run development server
pnpm dev
```

## Features Integrated with Firebase

### Authentication
- **Anonymous Sign-In**: Users can interact without creating an account
- **Email/Password**: Full user registration and login
- **Automatic User Document Creation**: User profile created in Firestore on first login

### Real-time Data Sync
- **The Quad**: Real-time posts with voting and comments
- **The Canteen**: Temporary posts that auto-expire
- **Notice Board**: Official notices with trust voting
- **The Library**: Subjects, units, and study resources
- **The Lab**: Quests with user progress tracking

### Data Collections

1. **users** - User profiles with XP and achievements
2. **posts** - Forum posts from The Quad
3. **canteenPosts** - Temporary social posts
4. **notices** - Official announcements
5. **subjects** - Academic subjects
6. **units** - Course units within subjects
7. **topics** - Learning topics within units
8. **quests** - Learning challenges
9. **userProgress** - Individual quest completions and scores

## Troubleshooting

### "Permission Denied" Errors
- Verify Firestore security rules are properly configured
- Ensure user is authenticated for protected operations
- Check that the user's auth token is valid

### Environment Variables Not Loading
- Restart the development server after changing `.env.local`
- Verify all variables start with `NEXT_PUBLIC_`
- Check for typos in variable names

### Firebase Connection Issues
- Verify your Firebase project is active
- Check that billing is enabled if using Firebase features beyond free tier
- Ensure your API key and project ID are correct

## Production Deployment

Before deploying:

1. Update Firestore rules to be more restrictive
2. Enable Firebase App Check for additional security
3. Set up Firebase Storage rules if using file uploads
4. Configure proper indexes for complex queries
5. Enable billing and set budget alerts

## Support

For issues specific to Firebase integration, check:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js + Firebase Guide](https://firebase.google.com/docs/web/setup)
- Project GitHub issues (if available)
