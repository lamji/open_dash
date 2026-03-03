# Shadcn UI: Native Time Input Variant

## 🎯 Purpose
Provides a standardized implementation pattern for a native Time Input using Shadcn UI's `Input` styling. This approach leverages the browser's native `type='time'` while ensuring it blends seamlessly with the Shadcn design system.

## 📦 Dependencies
```bash
npx shadcn@latest add input label
```

## 🛠️ Implementation Example (`date-picker-08.tsx`)

```tsx
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const DatePickerDemo = () => {
  return (
    <div className='w-full max-w-xs space-y-2'>
      <Label htmlFor='time-picker' className='px-1'>
        Time input
      </Label>
      <Input
        type='time'
        id='time-picker'
        step='1'
        defaultValue='08:30:00'
        className='bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
      />
    </div>
  )
}

export default DatePickerDemo
```

## 📋 Rules
1. **Native Integration**: Use `type='time'` on the Shadcn `Input` component to leverage browser-native time picking utilities.
2. **Custom Styling**: Use Tailwind's `appearance-none` and specific webkit selectors (`[&::-webkit-calendar-picker-indicator]`) to hide the default browser icon if a purely textual input is desired.
3. **Precision**: Use the `step` attribute (e.g., `step='1'` for seconds) to control the precision of the time input.
4. **Accessibility**: Always include a `Label` correctly linked via `htmlFor` and `id`.
