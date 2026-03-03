# Shadcn UI: Sonner (Toast) Component Variants

## 🎯 Purpose
Provides a collection of standardized implementation patterns for the `sonner` toast library, covering positioning, actions, custom icon integration, and themed visual styles.

## 📦 Dependencies
```bash
npm install sonner lucide-react
npx shadcn@latest add button
```

## 🛠️ Implementation Examples

### 1. Positioning Demo (`sonner-08.tsx`)
```tsx
'use client'

import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

const SonnerPositionDemo = () => {
  return (
    <div className='grid grid-cols-2 gap-2'>
      <Button variant='outline' onClick={() => toast('Top Left', { position: 'top-left' })}>Top Left</Button>
      <Button variant='outline' onClick={() => toast('Top Center', { position: 'top-center' })}>Top Center</Button>
      <Button variant='outline' onClick={() => toast('Top Right', { position: 'top-right' })}>Top Right</Button>
      <Button variant='outline' onClick={() => toast('Bottom Left', { position: 'bottom-left' })}>Bottom Left</Button>
      <Button variant='outline' onClick={() => toast('Bottom Center', { position: 'bottom-center' })}>Bottom Center</Button>
      <Button variant='outline' onClick={() => toast('Bottom Right', { position: 'bottom-right' })}>Bottom Right</Button>
    </div>
  )
}

export default SonnerPositionDemo
```

### 2. Toast with Action (`sonner-06.tsx`)
```tsx
'use client'

import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

const SonnerWithActionDemo = () => {
  return (
    <Button
      variant='outline'
      onClick={() =>
        toast('Action completed successfully!', {
          action: {
            label: 'Undo',
            onClick: () => console.log('Undo')
          }
        })
      }
    >
      Toast with action
    </Button>
  )
}

export default SonnerWithActionDemo
```

### 3. Toast with Custom Icon (`sonner-03.tsx`)
```tsx
'use client'

import { TruckIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

const SonnerWithIconDemo = () => {
  return (
    <Button
      variant='outline'
      onClick={() =>
        toast(
          <div className='flex items-center gap-2'>
            <TruckIcon className='size-5.5 shrink-0' />
            Your order has been successfully placed, and your parcel is on its way.
          </div>
        )
      }
    >
      Toast with icon
    </Button>
  )
}

export default SonnerWithIconDemo
```

### 4. Soft Destructive Toast (`sonner-12.tsx`)
```tsx
'use client'

import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

const SoftDestructiveSonnerDemo = () => {
  return (
    <Button
      variant='outline'
      onClick={() =>
        toast.error('Oops, there was an error processing your request.', {
          style: {
            '--normal-bg': 'color-mix(in oklab, var(--destructive) 10%, var(--background))',
            '--normal-text': 'var(--destructive)',
            '--normal-border': 'var(--destructive)'
          } as React.CSSProperties
        })
      }
    >
      Soft Destructive Toast
    </Button>
  )
}

export default SoftDestructiveSonnerDemo
```

## 📋 Rules
1. **State Independence**: Since `sonner` is a singleton-based library, ensure `Toaster` is mounted at the root of the application (e.g., `layout.tsx`).
2. **Layout Consistency**: For custom layouts with icons, use `flex` and `gap-2` to align the icon and text correctly.
3. **Accessibility**: Always include a `label` for actions and ensure contrast meets standards, especially when using custom `style` overrides.
4. **Theming**: When creating "Soft" variants, use `color-mix` with CSS variables to ensure the toast adapts correctly to light/dark modes while maintaining brand colors.
5. **UX**: Use specific positions only if the layout requires it (e.g., avoiding overlapping persistent UI elements). By default, bottom-right is often preferred for desktop.
