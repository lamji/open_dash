# Shadcn UI: Input Component Variants

## 🎯 Purpose
Provides a collection of standardized implementation patterns for the Shadcn UI `Input` component, covering basic usage, labels, required states, disabled states, and size variations.

## 📦 Dependencies
```bash
npx shadcn@latest add input label
```

## 🛠️ Implementation Examples

### 1. Basic Input (`input-01.tsx`)
```tsx
import { Input } from '@/components/ui/input'

const InputDemo = () => {
  return <Input type='email' placeholder='Email address' className='max-w-xs' />
}

export default InputDemo
```

### 2. Input with Label (`input-02.tsx`)
```tsx
import { useId } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const InputLabelDemo = () => {
  const id = useId()
  return (
    <div className='w-full max-w-xs space-y-2'>
      <Label htmlFor={id}>Input with label</Label>
      <Input id={id} type='email' placeholder='Email address' />
    </div>
  )
}

export default InputLabelDemo
```

### 3. Required Input (`input-03.tsx`)
```tsx
import { useId } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const InputRequiredDemo = () => {
  const id = useId()
  return (
    <div className='w-full max-w-xs space-y-2'>
      <Label htmlFor={id} className='gap-1'>
        Required input <span className='text-destructive'>*</span>
      </Label>
      <Input id={id} type='email' placeholder='Email address' required />
    </div>
  )
}

export default InputRequiredDemo
```

### 4. Disabled Input (`input-04.tsx`)
```tsx
import { useId } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const InputDisabledDemo = () => {
  const id = useId()
  return (
    <div className='w-full max-w-xs space-y-2'>
      <Label htmlFor={id}>Disabled input</Label>
      <Input id={id} type='email' placeholder='Email address' disabled />
    </div>
  )
}

export default InputDisabledDemo
```

### 5. Input Sizes (`input-06.tsx`)
```tsx
import { Input } from '@/components/ui/input'

const InputSizesDemo = () => {
  return (
    <div className='w-full max-w-xs space-y-2'>
      <Input type='text' placeholder='Small input' className='h-8' />
      <Input type='text' placeholder='Medium input' />
      <Input type='text' placeholder='Large input' className='h-10' />
    </div>
  )
}

export default InputSizesDemo
```

## 📋 Rules
1. **Accessibility**: Always use `useId` to generate unique IDs for linking `Label` (`htmlFor`) and `Input` (`id`).
2. **Visual Hierarchy**: Use `text-destructive` for the required asterisk (`*`) to provide immediate visual feedback.
3. **Consistency**: Use `max-w-xs` or responsive width classes to prevent inputs from stretching excessively on large screens.
4. **Sizing**: While Shadcn doesn't have native size props for Input, use Tailwind height classes (`h-8`, `h-10`) to create size variations that align with other UI elements.
5. **State Sync**: Rely on the `disabled` prop for both visual and functional disabling of the input field.
