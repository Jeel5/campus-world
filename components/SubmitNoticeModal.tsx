"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Upload, Calendar as CalendarIcon, Link2, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/context/AuthContext"
import { submitNoticeForVerification } from "@/lib/firestore"
import { useToast } from "@/hooks/use-toast"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "@/lib/firebase"

interface SubmitNoticeModalProps {
  isOpen: boolean
  onClose: () => void
}

const CATEGORIES = ["Library", "Exam", "Event", "Admin", "Other"]

export default function SubmitNoticeModal({ isOpen, onClose }: SubmitNoticeModalProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    dateTime: "",
    sourceUrl: "",
  })
  
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = "Title is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.category) newErrors.category = "Category is required"
    if (!formData.location.trim()) newErrors.location = "Location is required"
    if (!formData.dateTime) newErrors.dateTime = "Date and time are required"
    
    if (formData.title.length > 150) newErrors.title = "Title must be less than 150 characters"
    if (formData.description.length < 20) newErrors.description = "Description must be at least 20 characters"
    if (formData.description.length > 1000) newErrors.description = "Description must be less than 1000 characters"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit a notice",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      let attachmentUrl = ""
      
      // Upload file if provided
      if (file) {
        const fileRef = ref(storage, `notice-attachments/${Date.now()}_${file.name}`)
        await uploadBytes(fileRef, file)
        attachmentUrl = await getDownloadURL(fileRef)
      }

      await submitNoticeForVerification({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        dateTime: formData.dateTime,
        sourceUrl: formData.sourceUrl,
        attachmentUrl,
        submittedBy: user.id,
        submittedByEmail: user.email || "anonymous",
      })

      toast({
        title: "✅ Success!",
        description: "Notice submitted for verification successfully",
      })

      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        location: "",
        dateTime: "",
        sourceUrl: "",
      })
      setFile(null)
      setErrors({})
      onClose()
    } catch (error) {
      console.error("Error submitting notice:", error)
      toast({
        title: "Submission Failed",
        description: "An error occurred while submitting your notice. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive",
        })
        return
      }
      
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF or image (JPG, PNG)",
          variant: "destructive",
        })
        return
      }
      
      setFile(selectedFile)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-[#15181d] border border-white/10 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-[#15181d] border-b border-white/10 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Submit for Verification</h2>
                  <p className="text-sm text-white/60 mt-1">All submissions are reviewed by campus administration</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white/60 hover:text-white hover:bg-white/10 rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white font-medium">
                    Notice Title <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Mid-term Examination Schedule Released"
                    className="bg-[#1a1d24] border-white/10 text-white placeholder:text-white/40 focus:border-indigo-500"
                    maxLength={150}
                  />
                  <div className="flex justify-between items-center">
                    {errors.title && (
                      <p className="text-red-400 text-sm flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.title}
                      </p>
                    )}
                    <p className="text-white/40 text-xs ml-auto">
                      {formData.title.length}/150
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white font-medium">
                    Description <span className="text-red-400">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide detailed information about this notice..."
                    className="bg-[#1a1d24] border-white/10 text-white placeholder:text-white/40 focus:border-indigo-500 min-h-[120px] resize-none"
                    maxLength={1000}
                  />
                  <div className="flex justify-between items-center">
                    {errors.description && (
                      <p className="text-red-400 text-sm flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.description}
                      </p>
                    )}
                    <p className="text-white/40 text-xs ml-auto">
                      {formData.description.length}/1000
                    </p>
                  </div>
                </div>

                {/* Category & Location Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-white font-medium">
                      Category <span className="text-red-400">*</span>
                    </Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger className="bg-[#1a1d24] border-white/10 text-white focus:border-indigo-500">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1d24] border-white/10">
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat} className="text-white focus:bg-indigo-900/30">
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-red-400 text-sm flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.category}
                      </p>
                    )}
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-white font-medium">
                      Location <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Main Campus, Library"
                      className="bg-[#1a1d24] border-white/10 text-white placeholder:text-white/40 focus:border-indigo-500"
                    />
                    {errors.location && (
                      <p className="text-red-400 text-sm flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.location}
                      </p>
                    )}
                  </div>
                </div>

                {/* Date & Time */}
                <div className="space-y-2">
                  <Label htmlFor="dateTime" className="text-white font-medium">
                    Date & Time <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      id="dateTime"
                      type="datetime-local"
                      value={formData.dateTime}
                      onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                      className="bg-[#1a1d24] border-white/10 text-white focus:border-indigo-500 pl-10"
                    />
                  </div>
                  {errors.dateTime && (
                    <p className="text-red-400 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.dateTime}
                    </p>
                  )}
                </div>

                {/* Source URL (Optional) */}
                <div className="space-y-2">
                  <Label htmlFor="sourceUrl" className="text-white font-medium">
                    Source URL <span className="text-white/40 text-xs">(Optional)</span>
                  </Label>
                  <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      id="sourceUrl"
                      type="url"
                      value={formData.sourceUrl}
                      onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                      placeholder="https://example.com/notice"
                      className="bg-[#1a1d24] border-white/10 text-white placeholder:text-white/40 focus:border-indigo-500 pl-10"
                    />
                  </div>
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <Label htmlFor="file" className="text-white font-medium">
                    Attachment <span className="text-white/40 text-xs">(Optional - PDF or Image, max 10MB)</span>
                  </Label>
                  <div className="relative">
                    <input
                      id="file"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="file"
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1a1d24] border border-white/10 rounded-lg cursor-pointer hover:bg-[#1f242c] transition-colors"
                    >
                      <Upload className="w-4 h-4 text-indigo-400" />
                      <span className="text-white/70 text-sm">
                        {file ? file.name : "Choose file to upload"}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Contribution Guidelines */}
                <div className="bg-indigo-900/20 border border-indigo-800/30 rounded-lg p-4">
                  <p className="text-xs text-indigo-200/80 leading-relaxed">
                    ℹ️ By submitting this notice, you confirm that the information is accurate and from an official source. 
                    False or misleading submissions may result in account restrictions.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="flex-1 bg-transparent border-white/10 text-white hover:bg-white/5"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit for Review"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
