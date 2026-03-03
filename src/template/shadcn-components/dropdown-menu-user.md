# Shadcn UI: User Profile Dropdown Menu Variant

## 🎯 Purpose
Provides a standardized implementation pattern for a user profile menu typically found in headers. It features a circular avatar trigger and a list of account-related actions with icons.

## 📦 Dependencies
```bash
npm install lucide-react
npx shadcn@latest add button dropdown-menu
```

## 🛠️ Implementation Example (`dropdown-menu-07.tsx`)

```tsx
import { UserIcon, SettingsIcon, BellIcon, LogOutIcon, CreditCardIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

const listItems = [
  {
    icon: UserIcon,
    property: 'Profile'
  },
  {
    icon: SettingsIcon,
    property: 'Settings'
  },
  {
    icon: CreditCardIcon,
    property: 'Billing'
  },
  {
    icon: BellIcon,
    property: 'Notifications'
  },
  {
    icon: LogOutIcon,
    property: 'Sign Out'
  }
]

const DropdownMenuUserMenuDemo = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='secondary' size='icon' className='overflow-hidden rounded-full'>
          <img src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png' alt='Hallie Richards' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56'>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuGroup>
          {listItems.map((item, index) => (
            <DropdownMenuItem key={index}>
              <item.icon className="size-4" />
              <span className='text-popover-foreground'>{item.property}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default DropdownMenuUserMenuDemo
```

## 📋 Rules
1. **Trigger Styling**: Use a `rounded-full` button with `overflow-hidden` for an avatar-style trigger.
2. **Iconography**: Each menu item should include a descriptive icon for better visual recognition.
3. **Consistency**: Use `DropdownMenuLabel` for the menu title and group items logically using `DropdownMenuGroup`.
4. **Imagery**: When using a raw `img` inside the trigger, ensure the `alt` text is descriptive (e.g., the user's name).
