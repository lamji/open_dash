# Shadcn UI: Time Input with Icon Variant

## 🎯 Purpose
Provides a standardized implementation pattern for a native Time Input with a leading icon using Shadcn UI's `Input` styling. This pattern effectively combines a static visual cue (`Clock8Icon`) with the native browser time picker.

## 📦 Dependencies
```bash
npm install lucide-react
npx shadcn@latest add input label
```

## 🛠️ Implementation Example (`date-picker-09.tsx`)

```tsx
import { Clock8Icon } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const TimePickerWithIconDemo = () => {
  return (
    <div className='w-full max-w-xs space-y-2'>
      <Label htmlFor='timepicker'>Time input with start icon</Label>
      <div className='relative'>
        <div className='text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50'>
          <Clock8Icon className='size-4' />
          <span className='sr-only'>User</span>
        </div>
        <Input
          type='time'
          id='time-picker'
          step='1'
          defaultValue='08:30:00'
          className='peer bg-background appearance-none pl-9 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
        />
      </div>
    </div>
  )
}

export default TimePickerWithIconDemo
```

## 📋 Rules
1. **Icon Placement**: Use a `relative` container and an `absolute` positioned icon div.
2. **Padding Adjustment**: Increase the `Input` left padding (`pl-9`) to accommodate the leading icon.
3. **State Sync**: Use the `peer` class on the `Input` and `peer-disabled` on the icon container to ensure visual styles sync during disabled states.
4. **Clean Design**: Hide the default browser calendar/time indicator icon using `[&::-webkit-calendar-picker-indicator]:hidden`.
