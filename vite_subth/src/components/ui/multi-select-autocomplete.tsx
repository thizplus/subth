import * as React from 'react'
import { X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export interface SelectOption {
  id: string
  name: string
}

interface MultiSelectAutocompleteProps {
  selected: SelectOption[]
  onChange: (selected: SelectOption[]) => void
  options?: SelectOption[]
  onSearch: (query: string) => void
  placeholder?: string
  allowCreate?: boolean
  createLabel?: string
  isLoading?: boolean
  disabled?: boolean
  className?: string
  minSearchLength?: number
}

export function MultiSelectAutocomplete({
  selected,
  onChange,
  options = [],
  onSearch,
  placeholder = 'ค้นหา...',
  allowCreate = false,
  createLabel = 'เพิ่ม',
  isLoading = false,
  disabled = false,
  className,
  minSearchLength = 2,
}: MultiSelectAutocompleteProps) {
  const [inputValue, setInputValue] = React.useState('')
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const hasMinLength = inputValue.trim().length >= minSearchLength

  // Filter out already selected items
  const filteredOptions = options.filter(
    (opt) => !selected.some((s) => s.id === opt.id || s.name.toLowerCase() === opt.name.toLowerCase())
  )

  // Can create new item?
  const canCreate =
    allowCreate &&
    hasMinLength &&
    inputValue.trim() &&
    !options.some((o) => o.name.toLowerCase() === inputValue.trim().toLowerCase()) &&
    !selected.some((s) => s.name.toLowerCase() === inputValue.trim().toLowerCase())

  const handleSelect = (option: SelectOption) => {
    onChange([...selected, option])
    setInputValue('')
    onSearch('')
  }

  const handleCreate = () => {
    if (!inputValue.trim()) return
    const newItem: SelectOption = {
      id: `new-${Date.now()}`,
      name: inputValue.trim(),
    }
    onChange([...selected, newItem])
    setInputValue('')
    onSearch('')
  }

  const handleRemove = (id: string) => {
    onChange(selected.filter((s) => s.id !== id))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !inputValue && selected.length > 0) {
      onChange(selected.slice(0, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredOptions.length > 0) {
        handleSelect(filteredOptions[0])
      } else if (canCreate) {
        handleCreate()
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  // Close on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const showDropdown = isOpen && inputValue.length > 0

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Input Container */}
      <div
        className={cn(
          'flex flex-wrap items-center gap-1.5 p-2 min-h-10 rounded-md border border-input bg-background',
          'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          disabled && 'opacity-50 pointer-events-none'
        )}
      >
        {/* Selected badges */}
        {selected.map((item) => (
          <Badge key={item.id} variant="secondary" className="gap-1 pr-1">
            {item.name}
            <button
              type="button"
              onClick={() => handleRemove(item.id)}
              className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        {/* Text Input */}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            const val = e.target.value
            setInputValue(val)
            onSearch(val)
            if (!isOpen) setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selected.length === 0 ? placeholder : ''}
          disabled={disabled}
          className="flex-1 min-w-[100px] bg-transparent outline-none text-sm placeholder:text-muted-foreground"
        />
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-48 overflow-y-auto">
          {!hasMinLength ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              พิมพ์อีก {minSearchLength - inputValue.trim().length} ตัวอักษร...
            </div>
          ) : isLoading ? (
            <div className="px-3 py-2 text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              กำลังค้นหา...
            </div>
          ) : (
            <>
              {filteredOptions.slice(0, 10).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                >
                  {option.name}
                </button>
              ))}

              {canCreate && (
                <button
                  type="button"
                  onClick={handleCreate}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors text-primary font-medium"
                >
                  {createLabel} "{inputValue.trim()}"
                </button>
              )}

              {filteredOptions.length === 0 && !canCreate && (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  ไม่พบข้อมูล
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
