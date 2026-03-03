# Shadcn UI: Date Range Picker Variant

## 🎯 Purpose
Provides a standardized implementation pattern for a Date Range Picker using Shadcn UI. It allows users to select a start and end date within a single `Calendar` component displayed inside a `Popover`.

## 📦 Dependencies
```bash
npm install lucide-react
npx shadcn@latest add button calendar label popover
```

## 🛠️ Implementation Example (`date-picker-02.tsx`)

```tsx
'use client'

import { useState } from 'react'

import { ChevronDownIcon } from 'lucide-react'
import { type DateRange } from 'react-day-picker'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const DatePickerRangeDemo = () => {
  const [range, setRange] = useState<DateRange | undefined>(undefined)

  return (
    <div className='w-full max-w-xs space-y-2'>
      <Label htmlFor='dates' className='px-1'>
        Range date picker
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant='outline' id='dates' className='w-full justify-between font-normal'>
            {range?.from && range?.to
              ? `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`
              : 'Pick a date'}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto overflow-hidden p-0' align='start'>
          <Calendar
            mode='range'
            selected={range}
            onSelect={range => {
              setRange(range)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default DatePickerRangeDemo
```

## 📋 Rules
1. **Selection Mode**: Always set `mode='range'` on the `Calendar` component.
2. **Type Safety**: Import `DateRange` from `react-day-picker` to type the state correctly.
3. **Display Logic**: Format the button text to show both the start and end dates when a full range is selected.
4. **Accessibility**: Maintain the `Label` association using `htmlFor` and `id` on the trigger button.
