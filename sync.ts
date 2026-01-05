import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';

async function syncFirebaseDatabase() {
  console.log('🚀 Starting Firebase Database Sync...\n');

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

    console.log('🎉 DATABASE SYNC COMPLETED SUCCESSFULLY!\n');
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