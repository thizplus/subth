import * as React from 'react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { CalendarIcon, ChevronDownIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface DatePickerProps {
  /** Selected date value */
  value?: Date
  /** Callback when date changes */
  onChange?: (date: Date | undefined) => void
  /** Placeholder text */
  placeholder?: string
  /** Date format string (date-fns format) */
  dateFormat?: string
  /** Disable the picker */
  disabled?: boolean
  /** Additional class name */
  className?: string
  /** Use Thai locale */
  thaiLocale?: boolean
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'เลือกวันที่',
  dateFormat = 'dd MMM yyyy',
  disabled = false,
  className,
  thaiLocale = true,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (date: Date | undefined) => {
    onChange?.(date)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-between text-left font-normal',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <span className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            {value ? (
              format(value, dateFormat, { locale: thaiLocale ? th : undefined })
            ) : (
              placeholder
            )}
          </span>
          <ChevronDownIcon className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleSelect}
          defaultMonth={value}
          locale={thaiLocale ? th : undefined}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

/** Controlled version with string value (YYYY-MM-DD format) */
interface DatePickerStringProps extends Omit<DatePickerProps, 'value' | 'onChange'> {
  value?: string
  onChange?: (value: string) => void
}

export function DatePickerString({
  value,
  onChange,
  ...props
}: DatePickerStringProps) {
  const dateValue = value ? new Date(value) : undefined

  const handleChange = (date: Date | undefined) => {
    if (date) {
      // Format as YYYY-MM-DD for API
      const formatted = format(date, 'yyyy-MM-dd')
      onChange?.(formatted)
    } else {
      onChange?.('')
    }
  }

  return (
    <DatePicker
      value={dateValue}
      onChange={handleChange}
      {...props}
    />
  )
}
