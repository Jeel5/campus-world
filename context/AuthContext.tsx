"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import {
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  type User as FirebaseUser,
} from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { COLLECTIONS, type User } from "@/lib/firestore"

interface AuthContextType {
  user: User | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  signInAnonymous: () => Promise<void>
  signInEmail: (email: string, password: string) => Promise<void>
  signUpEmail: (email: string, password: string, username: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithGithub: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser)
      
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid))
          
          if (userDoc.exists()) {
            setUser({ id: userDoc.id, ...userDoc.data() } as User)
          } else {
            // Create user document if it doesn't exist
            const newUser: Omit<User, "id"> = {
              username: firebaseUser.isAnonymous ? `Anonymous${firebaseUser.uid.slice(-4)}` : firebaseUser.email?.split("@")[0] || "User",
              email: firebaseUser.email || undefined,
              xp: 0,
              createdAt: serverTimestamp() as any,
            }
            
            await setDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid), newUser)
            setUser({ id: firebaseUser.uid, ...newUser, createdAt: new Date() as any } as User)
          }
        } catch (error: any) {
          // Handle offline errors gracefully
          if (error.code === "unavailable" || error.message?.includes("offline")) {
            console.warn("Firestore offline: Using cached user data or creating temporary user")
            // Create a temporary user object from Firebase Auth data
            setUser({
              id: firebaseUser.uid,
              username: firebaseUser.isAnonymous ? `Anonymous${firebaseUser.uid.slice(-4)}` : firebaseUser.email?.split("@")[0] || "User",
              email: firebaseUser.email || undefined,
              xp: 0,
              createdAt: new Date() as any,
            } as User)
          } else {
            console.error("Error fetching user data:", error)
          }
        }
      } else {
        setUser(null)
      }
      
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signInAnonymous = async () => {
    try {
      await signInAnonymously(auth)
    } catch (error) {
      console.error("Error signing in anonymously:", error)
      throw error
    }
  }

  const signInEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error("Error signing in:", error)
      throw error
    }
  }

  const signUpEmail = async (email: string, password: string, username: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // Create user document
      const newUser: Omit<User, "id"> = {
        username,
        email,
        xp: 0,
        createdAt: serverTimestamp() as any,
      }
      
      try {
        await setDoc(doc(db, COLLECTIONS.USERS, userCredential.user.uid), newUser)
      } catch (firestoreError: any) {
        // If offline, the user is still created in Auth, document will sync when online
        if (firestoreError.code === "unavailable" || firestoreError.message?.includes("offline")) {
          console.warn("Firestore offline: User document will be created when connection is restored")
        } else {
          throw firestoreError
        }
      }
    } catch (error) {
      console.error("Error signing up:", error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error("Error signing in with Google:", error)
      throw error
    }
  }

  const signInWithGithub = async () => {
    try {
      const provider = new GithubAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error("Error signing in with Github:", error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    signInAnonymous,
    signInEmail,
    signUpEmail,
    signInWithGoogle,
    signInWithGithub,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
