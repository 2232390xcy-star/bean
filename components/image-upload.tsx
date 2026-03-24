'use client'

import { useCallback, useState } from 'react'
import { CheckCircle2, ImageIcon, Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ImageUploadProps {
  onImageChange: (base64: string | null) => void
  disabled?: boolean
}

export function ImageUpload({ onImageChange, disabled }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        alert('请上传图片文件')
        return
      }

      setFileName(file.name)
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target?.result as string
        setPreview(base64)
        onImageChange(base64)
      }
      reader.readAsDataURL(file)
    },
    [onImageChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (disabled) return

      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [disabled, handleFile]
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!disabled) setIsDragging(true)
    },
    [disabled]
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleRemove = useCallback(() => {
    setPreview(null)
    setFileName(null)
    onImageChange(null)
  }, [onImageChange])

  return (
    <div className="flex flex-col gap-4">
      {preview ? (
        <div className="group relative">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border-2 border-border bg-muted/30 shadow-sm transition-shadow duration-200 hover:shadow-md">
            <img src={preview} alt="预览图片" className="h-full w-full object-contain" />
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            {fileName && (
              <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <p className="truncate text-sm text-white">{fileName}</p>
              </div>
            )}
          </div>
          <div className="absolute -right-2 -top-2 rounded-full bg-success p-1.5 text-success-foreground shadow-lg">
            <CheckCircle2 className="size-4" />
          </div>
          {!disabled && (
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-3 top-3 size-8 bg-background/90 opacity-0 shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-background group-hover:opacity-100"
              onClick={handleRemove}
            >
              <X className="size-4" />
              <span className="sr-only">移除图片</span>
            </Button>
          )}
        </div>
      ) : (
        <label
          className={cn(
            'relative flex aspect-[3/4] w-full cursor-pointer flex-col items-center justify-center gap-5 rounded-2xl border-2 border-dashed bg-gradient-to-b from-muted/30 to-muted/60 transition-all duration-300',
            isDragging
              ? 'scale-[1.02] border-primary bg-primary/5 shadow-lg shadow-primary/10'
              : 'border-border hover:border-primary/50 hover:bg-muted/50 hover:shadow-md',
            disabled && 'cursor-not-allowed opacity-50'
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleInputChange}
            disabled={disabled}
          />
          <div
            className={cn(
              'rounded-2xl p-5 transition-all duration-300',
              isDragging ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            )}
          >
            {isDragging ? (
              <Upload className="size-10" />
            ) : (
              <ImageIcon className="size-10" />
            )}
          </div>
          <div className="text-center">
            <p
              className={cn(
                'text-base font-medium transition-colors duration-200',
                isDragging ? 'text-primary' : 'text-foreground'
              )}
            >
              {isDragging ? '松开鼠标上传图片' : '点击或拖拽上传图片'}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">支持 JPG、PNG、WEBP</p>
          </div>
          <div className="pointer-events-none absolute inset-4">
            <div className="absolute left-0 top-0 h-6 w-6 rounded-tl-lg border-l-2 border-t-2 border-border/50" />
            <div className="absolute right-0 top-0 h-6 w-6 rounded-tr-lg border-r-2 border-t-2 border-border/50" />
            <div className="absolute bottom-0 left-0 h-6 w-6 rounded-bl-lg border-b-2 border-l-2 border-border/50" />
            <div className="absolute bottom-0 right-0 h-6 w-6 rounded-br-lg border-b-2 border-r-2 border-border/50" />
          </div>
        </label>
      )}
    </div>
  )
}
