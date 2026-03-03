# Shadcn UI: Date Picker with Icon Variant

## 🎯 Purpose
Provides a standardized implementation pattern for the Shadcn UI `DatePicker` with an internal leading icon. It uses a `Popover` to display a `Calendar` component, allowing users to select a single date with enhanced visual cues.

## 📦 Dependencies
```bash
npm install lucide-react
npx shadcn@latest add button calendar label popover
```

## 🛠️ Implementation Example (`date-picker-03.tsx`)

```tsx
'use client'

import { useState } from 'react'

import { CalendarIcon, ChevronDownIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const DatePickerWithIconDemo = () => {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(undefined)

  return (
    <div className='w-full max-w-xs space-y-2'>
      <Label htmlFor='date' className='px-1'>
        Date picker with icon
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant='outline' id='date' className='w-full justify-between font-normal'>
            <span className='flex items-center'>
              <CalendarIcon className='mr-2' />
              {date ? date.toLocaleDateString() : 'Pick a date'}
            </span>
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

export default DatePickerWithIconDemo
```

## 📋 Rules
1. **Iconography**: Include a leading `CalendarIcon` within the trigger `Button` to visually identify the input type.
2. **Accessibility**: Maintain the `Label` association using `htmlFor` and `id` on the trigger button.
3. **State Management**: Use `useState` to handle both the `open` state of the popover and the selected `date`.
4. **UX**: Ensure the popover closes automatically (`setOpen(false)`) after a date is selected.
