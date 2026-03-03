# Shadcn UI: Advanced Input Component Variants

## 🎯 Purpose
Provides a collection of advanced implementation patterns for the Shadcn UI `Input` component, including validation states, icon integration, text add-ons, and interactive features like clear buttons.

## 📦 Dependencies
```bash
npm install lucide-react
npx shadcn@latest add button input label
```

## 🛠️ Implementation Examples

### 1. Input with Error (`input-12.tsx`)
```tsx
import { useId } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const InputErrorDemo = () => {
  const id = useId()
  return (
    <div className='w-full max-w-xs space-y-2'>
      <Label htmlFor={id}>Input with error</Label>
      <Input
        id={id}
        type='email'
        placeholder='Email address'
        className='peer'
        defaultValue='invalid@email.com'
        aria-invalid
      />
      <p className='text-muted-foreground peer-aria-invalid:text-destructive text-xs'>This email is invalid.</p>
    </div>
  )
}

export default InputErrorDemo
```

### 2. Input with Start Icon (`input-14.tsx`)
```tsx
import { useId } from 'react'
import { UserIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const InputStartIconDemo = () => {
  const id = useId()
  return (
    <div className='w-full max-w-xs space-y-2'>
      <Label htmlFor={id}>Input with start icon</Label>
      <div className='relative'>
        <div className='text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50'>
          <UserIcon className='size-4' />
          <span className='sr-only'>User</span>
        </div>
        <Input id={id} type='text' placeholder='Username' className='peer pl-9' />
      </div>
    </div>
  )
}

export default InputStartIconDemo
```

### 3. Input with End Icon (`input-15.tsx`)
```tsx
import { useId } from 'react'
import { MailIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const InputEndIconDemo = () => {
  const id = useId()
  return (
    <div className='w-full max-w-xs space-y-2'>
      <Label htmlFor={id}>Input with end icon</Label>
      <div className='relative'>
        <Input id={id} type='email' placeholder='Email address' className='peer pr-9' />
        <div className='text-muted-foreground pointer-events-none absolute inset-y-0 right-0 flex items-center justify-center pr-3 peer-disabled:opacity-50'>
          <MailIcon className='size-4' />
          <span className='sr-only'>Email</span>
        </div>
      </div>
    </div>
  )
}

export default InputEndIconDemo
```

### 4. Input with Start Text Add-On (`input-16.tsx`)
```tsx
import { useId } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const InputStartTextAddOnDemo = () => {
  const id = useId()
  return (
    <div className='w-full max-w-xs space-y-2'>
      <Label htmlFor={id}>Input with start text add-on</Label>
      <div className='relative'>
        <Input id={id} type='text' placeholder='shadcnstudio.com' className='peer pl-17' />
        <span className='pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 text-sm peer-disabled:opacity-50 text-muted-foreground'>
          https://
        </span>
      </div>
    </div>
  )
}

export default InputStartTextAddOnDemo
```

### 5. Input with Clear Button (`input-36.tsx`)
```tsx
'use client'

import { useId, useRef, useState } from 'react'
import { CircleXIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const InputClearDemo = () => {
  const [value, setValue] = useState('Click to clear')
  const inputRef = useRef<HTMLInputElement>(null)
  const id = useId()

  const handleClearInput = () => {
    setValue('')
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <div className='w-full max-w-xs space-y-2'>
      <Label htmlFor={id}>Input with clear button</Label>
      <div className='relative'>
        <Input
          ref={inputRef}
          id={id}
          type='text'
          placeholder='Type something...'
          value={value}
          onChange={e => setValue(e.target.value)}
          className='pr-9'
        />
        {value && (
          <Button
            variant='ghost'
            size='icon'
            onClick={handleClearInput}
            className='text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent'
          >
            <CircleXIcon className="size-4" />
            <span className='sr-only'>Clear input</span>
          </Button>
        )}
      </div>
    </div>
  )
}

export default InputClearDemo
```

## 📋 Rules
1. **Validation States**: Use the `aria-invalid` attribute and the Tailwind `peer` selector (`peer-aria-invalid:text-destructive`) to style error messages dynamically without additional JS logic for styling.
2. **Relative Sizing**: When adding icons or text add-ons, use a `relative` wrapper and adjust the `Input`'s horizontal padding (`pl-9`, `pr-9`, `pl-17`, etc.) to prevent text overlap.
3. **Internal Icons**: Add-ons should use `pointer-events-none` and `absolute` positioning to ensure they don't interfere with clinical input focus/clicks.
4. **Interactive Overlays**: For actionable overlays like clear buttons, use a `Button` with `variant='ghost'` and ensure it handles focus management (e.g., using `useRef` to re-focus the input after clearing).
5. **Accessibility**: Always include a descriptive `Label` and use hidden `sr-only` spans for icon-only buttons to maintain high accessibility standards.
