import * as React from 'react'
import { ImagePlus, X, Link, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface ImageInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  previewClassName?: string
  disabled?: boolean
  aspectRatio?: 'video' | 'square' | 'portrait'
}

export function ImageInput({
  value,
  onChange,
  placeholder = 'URL รูปภาพ',
  className,
  previewClassName,
  disabled = false,
  aspectRatio = 'video',
}: ImageInputProps) {
  const [urlInput, setUrlInput] = React.useState('')
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)
  const [imageError, setImageError] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const aspectRatioClass = {
    video: 'aspect-video',
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
  }[aspectRatio]

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim())
      setUrlInput('')
      setIsPopoverOpen(false)
      setImageError(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Convert to base64 for preview (or upload to server)
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        onChange(result)
        setImageError(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleClear = () => {
    onChange('')
    setImageError(false)
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const handleImageLoad = () => {
    setImageError(false)
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Preview Area */}
      <div
        className={cn(
          'relative rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 overflow-hidden transition-colors',
          'hover:border-muted-foreground/50',
          aspectRatioClass,
          previewClassName,
          disabled && 'opacity-50 pointer-events-none'
        )}
      >
        {value && !imageError ? (
          <>
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
            {/* Overlay actions */}
            <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button size="sm" variant="secondary">
                    <Link className="h-4 w-4 mr-1" />
                    เปลี่ยน URL
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="center">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">ใส่ URL รูปภาพ</p>
                    <div className="flex gap-2">
                      <Input
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://..."
                        onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                      />
                      <Button size="sm" onClick={handleUrlSubmit}>
                        ตกลง
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <Button size="sm" variant="destructive" onClick={handleClear}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
            {imageError ? (
              <>
                <X className="h-8 w-8 text-destructive" />
                <p className="text-sm text-destructive text-center">ไม่สามารถโหลดรูปได้</p>
                <Button size="sm" variant="outline" onClick={handleClear}>
                  ลองใหม่
                </Button>
              </>
            ) : (
              <>
                <ImagePlus className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground text-center">{placeholder}</p>
                <div className="flex gap-2">
                  <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Link className="h-4 w-4 mr-1" />
                        ใส่ URL
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="center">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">ใส่ URL รูปภาพ</p>
                        <div className="flex gap-2">
                          <Input
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            placeholder="https://..."
                            onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                          />
                          <Button size="sm" onClick={handleUrlSubmit}>
                            ตกลง
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Browse
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* URL Display */}
      {value && !value.startsWith('data:') && (
        <p className="text-xs text-muted-foreground truncate" title={value}>
          {value}
        </p>
      )}
    </div>
  )
}
