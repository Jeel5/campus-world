import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  where,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore"
import { db } from "./firebase"

// Collection paths
export const LIBRARY_COLLECTIONS = {
  DEPARTMENTS: "library_departments",
  SEMESTERS: "library_semesters",
  SUBJECTS: "library_subjects",
} as const

// Types
export interface CuratedLink {
  title: string
  url: string
  type: "video" | "article" | "repo" | "tool" | "documentation"
  source: string
  verified: boolean
  description?: string
  isAvailable?: boolean // For health check
}

export interface SubjectContent {
  materials: {
    title: string
    url: string
    type: "pdf" | "doc"
    uploadDate?: string
  }[]
  books: {
    title: string
    author: string
    url?: string
    isbn?: string
  }[]
  ppts: {
    title: string
    url: string
    slides: number
  }[]
  curatedLinks: CuratedLink[]
  extraResources: {
    title: string
    url: string
    type: string
  }[]
}

export interface Subject {
  id: string
  name: string
  code: string
  description: string
  credits?: number
  contents: SubjectContent
  semesterId: string
  departmentId: string
  createdAt?: Date
  updatedAt?: Date
}

export interface Semester {
  id: string
  number: number
  name: string
  departmentId: string
  subjectCount?: number
  createdAt?: Date
}

export interface Department {
  id: string
  name: string
  code: string
  subtitle: string
  icon: string
  color: string
  semesterCount?: number
  createdAt?: Date
}

// Department functions
export async function getDepartments(): Promise<Department[]> {
  try {
    const q = query(collection(db, LIBRARY_COLLECTIONS.DEPARTMENTS), orderBy("name"))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Department[]
  } catch (error) {
    console.error("Error fetching departments:", error)
    return []
  }
}

export async function getDepartment(departmentId: string): Promise<Department | null> {
  try {
    const docRef = doc(db, LIBRARY_COLLECTIONS.DEPARTMENTS, departmentId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Department
    }
    return null
  } catch (error) {
    console.error("Error fetching department:", error)
    return null
  }
}

export function subscribeToDepartments(
  callback: (departments: Department[]) => void
): Unsubscribe {
  const q = query(collection(db, LIBRARY_COLLECTIONS.DEPARTMENTS), orderBy("name"))
  return onSnapshot(q, (snapshot) => {
    const departments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Department[]
    callback(departments)
  })
}

// Semester functions
export async function getSemesters(departmentId: string): Promise<Semester[]> {
  try {
    const q = query(
      collection(db, LIBRARY_COLLECTIONS.SEMESTERS),
      where("departmentId", "==", departmentId),
      orderBy("number")
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Semester[]
  } catch (error) {
    console.error("Error fetching semesters:", error)
    return []
  }
}

export async function getSemester(semesterId: string): Promise<Semester | null> {
  try {
    const docRef = doc(db, LIBRARY_COLLECTIONS.SEMESTERS, semesterId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Semester
    }
    return null
  } catch (error) {
    console.error("Error fetching semester:", error)
    return null
  }
}

// Subject functions
export async function getSubjects(
  departmentId: string,
  semesterId: string
): Promise<Subject[]> {
  try {
    const q = query(
      collection(db, LIBRARY_COLLECTIONS.SUBJECTS),
      where("departmentId", "==", departmentId),
      where("semesterId", "==", semesterId),
      orderBy("name")
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Subject[]
  } catch (error) {
    console.error("Error fetching subjects:", error)
    return []
  }
}

export async function getSubject(subjectId: string): Promise<Subject | null> {
  try {
    const docRef = doc(db, LIBRARY_COLLECTIONS.SUBJECTS, subjectId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Subject
    }
    return null
  } catch (error) {
    console.error("Error fetching subject:", error)
    return null
  }
}

export function subscribeToSubjects(
  departmentId: string,
  semesterId: string,
  callback: (subjects: Subject[]) => void
): Unsubscribe {
  const q = query(
    collection(db, LIBRARY_COLLECTIONS.SUBJECTS),
    where("departmentId", "==", departmentId),
    where("semesterId", "==", semesterId),
    orderBy("name")
  )
  return onSnapshot(q, (snapshot) => {
    const subjects = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Subject[]
    callback(subjects)
  })
}

// Link validation
export async function validateLink(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD", mode: "no-cors" })
    return response.ok || response.type === "opaque"
  } catch (error) {
    console.error("Link validation failed:", url, error)
    return false
  }
}

export async function validateLinks(links: CuratedLink[]): Promise<CuratedLink[]> {
  return Promise.all(
    links.map(async (link) => ({
      ...link,
      isAvailable: await validateLink(link.url),
    }))
  )
}

// Search functionality
export async function searchSubjects(searchTerm: string): Promise<Subject[]> {
  try {
    const q = query(collection(db, LIBRARY_COLLECTIONS.SUBJECTS))
    const snapshot = await getDocs(q)
    const subjects = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Subject[]

    const term = searchTerm.toLowerCase()
    return subjects.filter(
      (subject) =>
        subject.name.toLowerCase().includes(term) ||
        subject.code.toLowerCase().includes(term) ||
        subject.description?.toLowerCase().includes(term)
    )
  } catch (error) {
    console.error("Error searching subjects:", error)
    return []
  }
}
