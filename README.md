# 🎓 CampusWorld - Digital Campus Hub

<div align="center">
  
  ![CampusWorld Banner](https://img.shields.io/badge/CampusWorld-Digital_Campus_Hub-10B981?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkw0IDdWMTJDNCAxNi40IDE3IDE5IDE3IDE5TDIwIDdMMTIgMloiIGZpbGw9IiNGRkZGRkYiLz48L3N2Zz4=)
  
  **Your Ultimate Digital Campus Experience**
  
  [![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
  [![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
  [![Gemini AI](https://img.shields.io/badge/Gemini_AI-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  
</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Key Highlights](#-key-highlights)
- [Screenshots](#-screenshots)
- [Future Enhancements](#-future-enhancements)

---

## 🌟 Overview

**CampusWorld** is a comprehensive digital platform designed to revolutionize the campus experience by bringing all essential academic and social features under one unified interface. It serves as a central hub where students can learn, collaborate, socialize, and stay informed - all in one place.

### 🎯 Problem Statement

Traditional campus life is fragmented across multiple platforms - students need separate apps for social interaction, academic resources, announcements, and casual conversations. This creates:
- Information overload and missed updates
- Disconnected learning experiences
- Lack of centralized communication
- Difficulty accessing educational resources

### 💡 Our Solution

CampusWorld consolidates everything into an intuitive, gamified platform with six interconnected zones, each serving a specific purpose while maintaining a cohesive user experience.

---

## ✨ Features

### 🗺️ **Campus Map** - Interactive Navigation Hub
- Visual representation of all campus zones
- Smooth, performance-optimized animations
- One-click navigation to any section
- Mobile-responsive design with top navigation bar

### 👥 **The Quad** - Community Discussion Forum
- Real-time threaded discussions
- Create posts with images (Cloudinary integration)
- Upvote/downvote system with optimistic updates
- Nested comment replies with proper vote tracking
- Prevents duplicate voting with user tracking arrays

### 📚 **The Library** - Knowledge Repository
- Organized educational content by:
  - Departments
  - Semesters
  - Subjects
  - Units
  - Topics
- Comprehensive explanations with examples
- Searchable content structure
- Easy navigation through nested categories

### 🔬 **The Lab** - AI-Powered Learning Platform
- **Learn Mode**: 
  - AI-generated topic explanations (Gemini AI)
  - Structured learning paths with time estimates
  - Difficulty levels (Beginner, Intermediate, Advanced)
- **Quiz Mode**: 
  - Dynamic AI-generated quizzes
  - Instant feedback with explanations
  - XP rewards system (20 XP per correct answer)
- **Chat Mode**: 
  - Conversational AI assistant
  - Context-aware responses
  - Topic-based conversation history
- **Videos Mode**: 
  - YouTube API integration
  - Curated educational videos
  - Watch history tracking
- **History System**: 
  - Persistent learning history
  - Resume incomplete quizzes
  - Access past conversations

### ☕ **The Canteen** - Social Feed
- Campus social media feed
- Create posts with media uploads
- Comments with optimistic updates
- Real-time engagement tracking
- Anonymous posting support

### 📢 **Notice Board** - Official Announcements
- Verified official notices
- Submit notices for admin verification
- Category-based filtering (Academic, Events, Important)
- Mobile-optimized modal positioning
- Real-time updates via Firestore subscriptions

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: Next.js 16.0 with Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom OKLCH color system
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion
- **Icons**: Lucide React

### **Backend & Services**
- **Database**: Firebase Firestore (Real-time NoSQL)
- **Authentication**: Firebase Auth
- **Storage**: Cloudinary (Image/Media hosting)
- **AI**: Google Gemini AI API
- **Video**: YouTube Data API v3

### **Key Libraries**
- `react-hook-form` + `zod` - Form validation
- `date-fns` - Date formatting
- `react-markdown` + `remark-gfm` - Markdown rendering
- `@vercel/analytics` - Performance monitoring

---

## 🚀 Getting Started

### Prerequisites
```bash
node >= 18.0.0
npm or pnpm
```

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd campus-world
```

2. **Install dependencies**
```bash
npm install
# or
pnpm install
```

3. **Environment Setup**

Create a `.env.local` file with the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Gemini AI
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# YouTube API
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

4. **Firebase Setup**
- Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
- Enable Firestore Database
- Enable Authentication (Email/Password)
- Copy the configuration values to `.env.example`
- Deploy security rules from `firestore.rules`

5. **Run Development Server**
```bash
npm run dev
# or
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🎯 Key Highlights

### 🏆 **Innovation**
- **AI-Powered Learning**: Integration with Google Gemini for personalized education
- **Unified Platform**: All campus needs in one place
- **Gamification**: XP system to encourage learning
- **Real-time Collaboration**: Live updates using Firestore subscriptions

### 💪 **Technical Excellence**
- **Scalable Architecture**:
  - Modular component structure
  - Type-safe with TypeScript
  - Reusable utility functions
- **Robust State Management**:
  - React Context for global state
  - Local state with hooks
  - Persistent storage with Firestore

### 🔒 **Security**
- **Firebase Rules**: Granular access control
- **Authentication**: Secure user management
- **Vote Tracking**: Prevents duplicate votes with user arrays
- **Admin Verification**: Notice board moderation system

---