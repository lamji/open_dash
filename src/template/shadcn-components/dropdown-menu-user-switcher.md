# Shadcn UI: User Switcher Dropdown Menu Variant

## 🎯 Purpose
Provides a standardized implementation pattern for a User Switcher or Account Switcher using Shadcn UI's `DropdownMenu` and `Avatar` components. This variant demonstrates stateful selection, truncated text for long names/emails, and checkmark indicators for the active selection.

## 📦 Dependencies
```bash
npm install lucide-react
npx shadcn@latest add avatar button dropdown-menu
```

## 🛠️ Implementation Example (`dropdown-menu-02.tsx`)

```tsx
'use client'

import { useState } from 'react'

import { CheckIcon } from 'lucide-react'

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

const users = [
  {
    id: 1,
    src: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png',
    fallback: 'PG',
    name: 'Phillip George',
    mail: 'phillip12@gmail.com'
  },
  {
    id: 2,
    src: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-2.png',
    fallback: 'JD',
    name: 'Jaylon Donin',
    mail: 'jaylo-don@yahoo.com'
  },
  {
    id: 3,
    src: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png',
    fallback: 'TC',
    name: 'Tiana Curtis',
    mail: 'Tiana_curtis@gmail.com'
  }
]

const DropdownMenuUserSwitcherDemo = () => {
  const [selectUser, setSelectUser] = useState(users[0])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className='bg-secondary flex items-center gap-2 rounded-lg px-3 py-2.5 outline-none'>
        <Avatar>
          <AvatarImage src={selectUser.src} alt={selectUser.name} />
          <AvatarFallback className='text-xs'>{selectUser.fallback}</AvatarFallback>
        </Avatar>
        <div className='flex flex-col gap-1 text-start leading-none'>
          <span className='max-w-[17ch] truncate text-sm leading-none font-semibold'>{selectUser.name}</span>
          <span className='text-muted-foreground max-w-[20ch] truncate text-xs'>{selectUser.mail}</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-66'>
        <DropdownMenuLabel>Task Assignment</DropdownMenuLabel>
        {users.map(user => (
          <DropdownMenuItem key={user.id} onClick={() => setSelectUser(user)}>
            <div className='flex items-center gap-2'>
              <Avatar>
                <AvatarImage src={user.src} alt={user.name} />
                <AvatarFallback className='text-xs'>{user.fallback}</AvatarFallback>
              </Avatar>
              <div className='flex flex-col gap-1 text-start leading-none'>
                <span className='max-w-[17ch] truncate text-sm leading-none font-semibold'>{user.name}</span>
                <span className='text-muted-foreground max-w-[20ch] truncate text-xs'>{user.mail}</span>
              </div>
            </div>
            {selectUser.id === user.id && <CheckIcon className='ml-auto size-4' />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default DropdownMenuUserSwitcherDemo
```

## 📋 Rules
1. **Visual Consistency**: Use the same `Avatar` and typography structure in both the `DropdownMenuTrigger` and the `DropdownMenuItem` for a seamless transition.
2. **Text Overflow**: Apply `truncate` and `max-w-[Xch]` to text containers to prevent long names or emails from breaking the layout.
3. **Active State**: Use a `CheckIcon` with `ml-auto` to clearly indicate the currently selected item.
4. **Interactive Styles**: Ensure the trigger has proper `bg-secondary` and `rounded-lg` styling to look like an interactive selector rather than a standard button.
5. **State Management**: Use `useState` to track the active selection and update it via `onClick` on each `DropdownMenuItem`.
