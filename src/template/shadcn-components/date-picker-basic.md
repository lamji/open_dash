# Shadcn UI: Basic Date Picker Variant

## 🎯 Purpose
Provides a standardized implementation pattern for the Shadcn UI `DatePicker`. It uses a `Popover` to display a `Calendar` component, allowing users to select a single date.

## 📦 Dependencies
```bash
npm install lucide-react
npx shadcn@latest add button calendar label popover
```

## 🛠️ Implementation Example (`date-picker-01.tsx`)

```tsx
'use client'

import { useState } from 'react'
import { ChevronDownIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const DatePickerDemo = () => {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(undefined)

  return (
    <div className='w-full max-w-xs space-y-2'>
      <Label htmlFor='date' className='px-1'>
        Date picker
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant='outline' id='date' className='w-full justify-between font-normal'>
            {date ? date.toLocaleDateString() : 'Pick a date'}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto overflow-hidden p-0' align='start'>
          <Calendar
            mode='single'
            selected={date}
            onSelect={date => {
              setDate(date)
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default DatePickerDemo
```

## 📋 Rules
1. **Accessibility**: Always use the `Label` component associated with the `Button` (trigger) using `htmlFor` and `id`.
2. **State Management**: Use `useState` to handle both the `open` state of the popover and the selected `date`.
3. **UX**: Ensure the popover closes automatically (`setOpen(false)`) after a date is selected.
4. **Layout**: Use `align='start'` on `PopoverContent` for a cleaner alignment with the trigger button.
