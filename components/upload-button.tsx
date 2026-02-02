"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Loader2, CheckCircle } from "lucide-react"
import { Input } from "@/components/ui/input"

interface UploadButtonProps {
  onUploadComplete?: (url: string, key: string, publicUrl: string) => void
  label?: string
}

export function UploadButton({ onUploadComplete, label = "Subir Archivo" }: UploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setIsSuccess(false)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload-file", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error("Upload failed")

      const { key, publicUrl } = await res.json()

      setIsSuccess(true)
      if (onUploadComplete) {
        onUploadComplete("", key, publicUrl)
      }

    } catch (error) {
      console.error("Upload error:", error)
      alert("Error al subir archivo")
    } finally {
      setIsUploading(false)
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <Button
        onClick={handleButtonClick}
        disabled={isUploading}
        variant={isSuccess ? "outline" : "default"}
        size="sm"
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : isSuccess ? (
          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
        ) : (
          <Upload className="h-4 w-4 mr-2" />
        )}
        {isUploading ? "Subiendo..." : isSuccess ? "Agregar" : label}
      </Button>
    </div>
  )
}
