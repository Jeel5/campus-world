// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file FIRST before any Firebase imports
config({ path: resolve(process.cwd(), '.env') });

// Now import Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

// Initialize Firebase directly (without auth to avoid API key issues in Node.js)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function syncFirebaseDatabase() {
  console.log('🚀 Starting Firebase Database Sync...\n');
  console.log('⚠️  IMPORTANT: Before running this script, update Firestore Rules:\n');
  console.log('Go to Firebase Console → Firestore → Rules');
  console.log('Temporarily set to (for testing only):');
  console.log('rules_version = \'2\';');
  console.log('service cloud.firestore {');
  console.log('  match /databases/{database}/documents {');
  console.log('    match /{document=**} {');
  console.log('      allow read, write: if true;');
  console.log('    }');
  console.log('  }');
  console.log('}\n');
  console.log('Press Ctrl+C to cancel, or any key to continue if rules are updated...\n');

  try {
    // 1. Create Threads Collection
    console.log('📝 Creating threads collection...');
    await setDoc(doc(collection(db, 'threads'), 'sample-thread'), {
      title: 'Welcome to The Quad!',
      content: 'This is the first thread on Campus World. Feel free to discuss anything campus-related here!',
      userId: 'system',
      username: 'Campus World',
      category: 'general',
      tags: ['welcome', 'announcement'],
      upvotes: 5,
      downvotes: 0,
      upvotedBy: [],
      downvotedBy: [],
      commentCount: 0,
      viewCount: 10,
      isAnonymous: false,
      isPinned: true,
      contentWarning: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('✅ Threads collection created\n');

    // 2. Create Comments Collection
    console.log('📝 Creating comments collection...');
    await setDoc(doc(collection(db, 'comments'), 'sample-comment'), {
      threadId: 'sample-thread',
      content: 'Welcome everyone! Excited to be part of this community.',
      userId: 'system',
      username: 'Campus World',
      isAnonymous: false,
      parentId: null,
      depth: 0,
      upvotes: 2,
      downvotes: 0,
      upvotedBy: [],
      downvotedBy: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('✅ Comments collection created\n');

    // 3. Create Canteen Posts Collection
    console.log('📝 Creating canteenPosts collection...');
    await setDoc(doc(collection(db, 'canteenPosts'), 'sample-post'), {
      userId: 'system',
      username: 'Campus World',
      content: 'Welcome to The Canteen! Share your campus moments here.',
      type: 'text',
      mediaUrls: [],
      isAnonymous: false,
      likes: 3,
      likedBy: [],
      commentCount: 0,
      category: 'general',
      expiresAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('✅ Canteen posts collection created\n');

    // 4. Create Polls Collection
    console.log('📝 Creating polls collection...');
    await setDoc(doc(collection(db, 'polls'), 'sample-poll'), {
      postId: 'sample-post',
      question: 'What\'s your favorite campus spot?',
      options: [
        { id: '1', text: 'Library', votes: 5, votedBy: [] },
        { id: '2', text: 'Canteen', votes: 8, votedBy: [] },
        { id: '3', text: 'Sports Ground', votes: 3, votedBy: [] },
        { id: '4', text: 'Auditorium', votes: 2, votedBy: [] }
      ],
      createdBy: 'system',
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
      createdAt: serverTimestamp()
    });
    console.log('✅ Polls collection created\n');

    // 5. Create AI Conversations Collection
    console.log('📝 Creating aiConversations collection...');
    await setDoc(doc(collection(db, 'aiConversations'), 'sample-conversation'), {
      userId: 'system',
      messages: [
        {
          role: 'user',
          content: 'Hello! Can you help me understand quantum physics?',
          timestamp: serverTimestamp()
        },
        {
          role: 'assistant',
          content: 'Of course! Quantum physics is the study of matter and energy at the smallest scales...',
          timestamp: serverTimestamp()
        }
      ],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('✅ AI conversations collection created\n');

    // 6. Create YouTube Cache Collection
    console.log('📝 Creating youtubeCache collection...');
    await setDoc(doc(collection(db, 'youtubeCache'), 'sample-cache'), {
      topic: 'machine learning basics',
      videos: [
        {
          id: 'sample-video-1',
          title: 'Introduction to Machine Learning',
          description: 'Learn the basics of ML',
          thumbnailUrl: 'https://via.placeholder.com/480x360',
          channelTitle: 'Education Channel',
          publishedAt: new Date().toISOString(),
          viewCount: '1000000',
          duration: 'PT10M30S'
        }
      ],
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
      createdAt: serverTimestamp()
    });
    console.log('✅ YouTube cache collection created\n');

    // 7. Create Bookmarks Collection
    console.log('📝 Creating bookmarks collection...');
    await setDoc(doc(collection(db, 'bookmarks'), 'sample-bookmark'), {
      userId: 'system',
      itemId: 'sample-thread',
      itemType: 'thread',
      createdAt: serverTimestamp()
    });
    console.log('✅ Bookmarks collection created\n');

    // 8. Create User Preferences Collection
    console.log('📝 Creating userPreferences collection...');
    await setDoc(doc(collection(db, 'userPreferences'), 'system'), {
      theme: 'dark',
      notifications: {
        threads: true,
        comments: true,
        likes: true,
        mentions: true
      },
      privacy: {
        showProfile: true,
        allowMessages: true
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('✅ User preferences collection created\n');

    // 9. Create Study Materials Collection (if not exists)
    console.log('📝 Creating studyMaterials collection...');
    await setDoc(doc(collection(db, 'studyMaterials'), 'sample-material'), {
      title: 'Introduction to Data Structures',
      subject: 'Computer Science',
      unit: 'Unit 1',
      topic: 'Arrays and Linked Lists',
      fileUrl: 'https://example.com/sample.pdf',
      uploadedBy: 'system',
      uploaderName: 'Campus World',
      views: 15,
      downloads: 5,
      rating: 4.5,
      ratingCount: 10,
      createdAt: serverTimestamp()
    });
    console.log('✅ Study materials collection created\n');

    // 10. Create Notices Collection (if not exists)
    console.log('📝 Creating notices collection...');
    await setDoc(doc(collection(db, 'notices'), 'sample-notice'), {
      title: 'Welcome to Campus World',
      content: 'Campus World is now live! Explore all features and connect with your peers.',
      category: 'general',
      postedBy: 'system',
      posterName: 'Administration',
      isPinned: true,
      isOfficial: true,
      trustVotes: 10,
      createdAt: serverTimestamp(),
      expiresAt: null
    });
    console.log('✅ Notices collection created\n');

    // 11. Create Learn History Collection
    console.log('📝 Creating learnHistory collection...');
    await setDoc(doc(collection(db, 'learnHistory'), 'sample-learn-history'), {
      userId: 'system',
      topic: 'Introduction to Machine Learning',
      subject: 'Computer Science',
      unit: 'Unit 5',
      explanation: '# Machine Learning\n\nMachine learning is a subset of artificial intelligence...',
      completed: true,
      createdAt: serverTimestamp()
    });
    console.log('✅ Learn history collection created\n');

    // 12. Create Quiz History Collection
    console.log('📝 Creating quizHistory collection...');
    await setDoc(doc(collection(db, 'quizHistory'), 'sample-quiz-history'), {
      userId: 'system',
      topic: 'Data Structures Quiz',
      questions: [
        {
          question: 'What is a linked list?',
          options: ['A. Array', 'B. Dynamic data structure', 'C. Static structure', 'D. None'],
          correctAnswer: 1,
          explanation: 'A linked list is a dynamic data structure...'
        }
      ],
      score: 8,
      totalQuestions: 10,
      completed: true,
      currentQuestion: 10,
      createdAt: serverTimestamp()
    });
    console.log('✅ Quiz history collection created\n');

    // 13. Create Chat History Collection
    console.log('📝 Creating chatHistory collection...');
    await setDoc(doc(collection(db, 'chatHistory'), 'sample-chat-history'), {
      userId: 'system',
      topic: 'Help with Algorithms',
      messages: [
        {
          role: 'user',
          content: 'Can you explain quicksort?'
        },
        {
          role: 'assistant',
          content: 'Quicksort is a divide-and-conquer sorting algorithm...'
        }
      ],
      createdAt: serverTimestamp()
    });
    console.log('✅ Chat history collection created\n');

    // 14. Create Video History Collection
    console.log('📝 Creating videoHistory collection...');
    await setDoc(doc(collection(db, 'videoHistory'), 'sample-video-history'), {
      userId: 'system',
      video: {
        id: 'dQw4w9WgXcQ',
        title: 'Learn Programming in 10 Minutes',
        description: 'A comprehensive guide to programming',
        thumbnail: 'https://via.placeholder.com/480x360',
        channelTitle: 'Education Channel',
        publishedAt: new Date().toISOString(),
        viewCount: '5000000',
        duration: 'PT10M'
      },
      createdAt: serverTimestamp()
    });
    console.log('✅ Video history collection created\n');

    // 15. Create Material Contributions Collection
    console.log('📝 Creating materialContributions collection...');
    await setDoc(doc(collection(db, 'materialContributions'), 'sample-contribution'), {
      userId: 'system',
      username: 'Campus World',
      title: 'Complete Data Structures Notes',
      description: 'Comprehensive notes covering all DS topics',
      url: 'https://example.com/ds-notes.pdf',
      type: 'notes',
      status: 'pending',
      createdAt: serverTimestamp()
    });
    console.log('✅ Material contributions collection created\n');

    console.log('🎉 DATABASE SYNC COMPLETED SUCCESSFULLY!\n');
    console.log('📋 Collections Created:');
    console.log('   1. ✅ threads');
    console.log('   2. ✅ comments');
    console.log('   3. ✅ canteenPosts');
    console.log('   4. ✅ polls');
    console.log('   5. ✅ aiConversations');
    console.log('   6. ✅ youtubeCache');
    console.log('   7. ✅ bookmarks');
    console.log('   8. ✅ userPreferences');
    console.log('   9. ✅ studyMaterials');
    console.log('   10. ✅ notices');
    console.log('   11. ✅ learnHistory');
    console.log('   12. ✅ quizHistory');
    console.log('   13. ✅ chatHistory');
    console.log('   14. ✅ videoHistory\n');
    console.log('   15. ✅ materialContributions\n');
    console.log('📋 Next Steps:');
    console.log('1. Go to Firebase Console → Firestore → Indexes');
    console.log('2. Click on any error links to create composite indexes');
    console.log('3. Wait 5-10 minutes for indexes to build');
    console.log('4. Refresh your app and test all features\n');

  } catch (error) {
    console.error('❌ Error syncing database:', error);
    throw error;
  }
}

// Run the sync
syncFirebaseDatabase()
  .then(() => {
    console.log('✅ Sync completed! You can now close this process.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  });