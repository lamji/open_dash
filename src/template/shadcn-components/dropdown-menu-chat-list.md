# Shadcn UI: Chat List Dropdown Menu Variant

## 🎯 Purpose
Provides a standardized implementation pattern for a "Chat List" or "Notification" dropdown menu using Shadcn UI's `DropdownMenu`, `Avatar`, and `Badge` components. This variant demonstrates complex item layouts with primary text, subtext, timestamps, and notification count badges.

## 📦 Dependencies
```bash
npx shadcn@latest add avatar badge button dropdown-menu
```

## 🛠️ Implementation Example (`dropdown-menu-03.tsx`)

```tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
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
    src: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png',
    fallback: 'PG',
    name: 'Phillip George',
    message: 'Hii samira, thanks for the...',
    time: '9:00AM',
    newMessages: 1
  },
  {
    src: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-2.png',
    fallback: 'JD',
    name: 'Jaylon Donin',
    message: "I'll send the texts and...",
    time: '10:00PM',
    newMessages: 3
  },
  {
    src: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png',
    fallback: 'TC',
    name: 'Tiana Curtis',
    message: "That's Great!",
    time: '8:30AM',
    newMessages: null
  },
  {
    src: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-4.png',
    fallback: 'ZV',
    name: 'Zaire Vetrovs',
    message: 'https://www.youtub...',
    time: '5:50AM',
    newMessages: 2
  },
  {
    src: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png',
    fallback: 'KP',
    name: 'Kianna Philips',
    message: 'Okay, It was awesome.',
    time: '6.45PM',
    newMessages: null
  }
]

const DropdownMenuItemAvatarDemo = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline'>Menu item with avatar</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-91'>
        <DropdownMenuLabel>Chat List</DropdownMenuLabel>
        <DropdownMenuGroup>
          {listItems.map((item, index) => (
            <DropdownMenuItem key={index} className='justify-between py-3'>
              <div className='flex items-center gap-3'>
                <Avatar>
                  <AvatarImage src={item.src} alt={item.name} />
                  <AvatarFallback className='text-xs'>{item.fallback}</AvatarFallback>
                </Avatar>
                <div className='flex flex-col'>
                  <span className='text-sm font-medium'>{item.name}</span>
                  <span className='text-muted-foreground text-xs line-clamp-1'>{item.message}</span>
                </div>
              </div>
              <div className='flex flex-col items-end gap-1'>
                <span className='text-muted-foreground text-[10px] uppercase font-medium'>{item.time}</span>
                {item.newMessages && (
                  <Badge className='h-5 min-w-5 flex items-center justify-center bg-green-600 px-1 text-[10px] text-white hover:bg-green-700 dark:bg-green-500'>
                    {item.newMessages}
                  </Badge>
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default DropdownMenuItemAvatarDemo
```

## 📋 Rules
1. **Layout Spacing**: Use `justify-between` and `py-3` on components that have high density (like chat items) to maintain readability.
2. **Text Integrity**: Use `line-clamp-1` or truncation for messages to prevent the dropdown width from exploding.
3. **Badge Visibility**: Only render the `Badge` if `newMessages` is truthy.
4. **Color Semantics**: Use a distinct color (e.g., green) for new message badges to highlight urgency, but ensure it meets accessibility standards in both light and dark modes.
5. **Secondary Information**: Style timestamps and meta-info with `text-[10px]` or `text-xs` and `text-muted-foreground` to maintain a clear information hierarchy.
