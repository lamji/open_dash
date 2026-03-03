# Shadcn UI: Dropdown Menu with Checkboxes Variant

## 🎯 Purpose
Provide a standardized implementation pattern for the Shadcn UI `DropdownMenu` component that includes checkbox items for toggling settings or appearance options.

## 📦 Dependencies
```bash
npx shadcn@latest add button dropdown-menu
```

## 🛠️ Implementation Example (`dropdown-menu-13.tsx`)

```tsx
'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

const DropdownMenuCheckboxDemo = () => {
  const [showStatusBar, setShowStatusBar] = useState(true)
  const [showActivityBar, setShowActivityBar] = useState(false)
  const [showPanel, setShowPanel] = useState(false)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline'>With checkbox</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56'>
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked={showStatusBar} onCheckedChange={setShowStatusBar}>
          Status Bar
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={showActivityBar} onCheckedChange={showActivityBar} disabled>
          API
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={showPanel} onCheckedChange={setShowPanel}>
          Invite users
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default DropdownMenuCheckboxDemo
```

## 📋 Rules
1. Uses `Button`, `DropdownMenu`, `DropdownMenuCheckboxItem`, `DropdownMenuContent`, `DropdownMenuLabel`, `DropdownMenuSeparator`, and `DropdownMenuTrigger` Shadcn components.
2. Demonstrates using `useState` to track the state of multiple checkbox items within the menu.
3. Shows how to use the `disabled` prop on `DropdownMenuCheckboxItem`.
4. Uses `asChild` on the `DropdownMenuTrigger` to properly wrap the trigger `Button`.
