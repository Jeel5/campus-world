import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { storage } from "./firebase"

export interface UploadResult {
  url: string
  path: string
  type: string
}

/**
 * Upload a file to Firebase Storage
 */
export async function uploadFile(
  file: File,
  folder: "canteen" | "profiles" | "library" | "notices",
  userId: string,
): Promise<UploadResult> {
  try {
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const filePath = `${folder}/${userId}/${timestamp}_${sanitizedFileName}`
    const storageRef = ref(storage, filePath)

    // Upload file
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
    })

    // Get download URL
    const url = await getDownloadURL(snapshot.ref)

    return {
      url,
      path: filePath,
      type: file.type,
    }
  } catch (error) {
    console.error("Error uploading file:", error)
    throw new Error("Failed to upload file")
  }
}

/**
 * Upload multiple files
 */
export async function uploadMultipleFiles(
  files: File[],
  folder: "canteen" | "profiles" | "library" | "notices",
  userId: string,
): Promise<UploadResult[]> {
  try {
    const uploadPromises = files.map((file) => uploadFile(file, folder, userId))
    return await Promise.all(uploadPromises)
  } catch (error) {
    console.error("Error uploading multiple files:", error)
    throw new Error("Failed to upload files")
  }
}

/**
 * Delete a file from Firebase Storage
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    const storageRef = ref(storage, filePath)
    await deleteObject(storageRef)
  } catch (error) {
    console.error("Error deleting file:", error)
    throw new Error("Failed to delete file")
  }
}

/**
 * Validate file type and size
 */
export function validateFile(file: File, maxSizeMB: number = 10): { valid: boolean; error?: string } {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/webm"]

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Only images and videos are allowed.",
    }
  }

  const maxSize = maxSizeMB * 1024 * 1024 // Convert to bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeMB}MB`,
    }
  }

  return { valid: true }
}

/**
 * Validate multiple files
 */
export function validateFiles(files: File[], maxSizeMB: number = 10): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  files.forEach((file, index) => {
    const result = validateFile(file, maxSizeMB)
    if (!result.valid && result.error) {
      errors.push(`File ${index + 1}: ${result.error}`)
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Compress image before upload (client-side)
 */
export async function compressImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement("canvas")
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            } else {
              reject(new Error("Failed to compress image"))
            }
          },
          file.type,
          quality,
        )
      }
      img.onerror = () => reject(new Error("Failed to load image"))
    }
    reader.onerror = () => reject(new Error("Failed to read file"))
  })
}

/**
 * Get file extension from URL
 */
export function getFileExtension(url: string): string {
  const match = url.match(/\.([^.?]+)(\?|$)/)
  return match ? match[1].toLowerCase() : ""
}

/**
 * Check if URL is a video
 */
export function isVideoFile(url: string): boolean {
  const ext = getFileExtension(url)
  return ["mp4", "webm", "mov", "avi"].includes(ext)
}

/**
 * Check if URL is an image
 */
export function isImageFile(url: string): boolean {
  const ext = getFileExtension(url)
  return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)
}
