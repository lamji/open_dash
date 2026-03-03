# Shadcn UI: Basic Dropdown Menu Variant

## 🎯 Purpose
Provides a comprehensive implementation pattern for the Shadcn UI `DropdownMenu` component. This variant demonstrates a standard menu structure with labels, item grouping, separators, and nested submenus.

## 📦 Dependencies
```bash
npx shadcn@latest add button dropdown-menu
```

## 🛠️ Implementation Example (`dropdown-menu-01.tsx`)

```tsx
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

const DropdownMenuDemo = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline'>Basic</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56'>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Email</DropdownMenuItem>
                <DropdownMenuItem>Message</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>More...</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem>GitHub</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuItem disabled>API</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default DropdownMenuDemo
```

## 📋 Rules
1. **Triggering**: Always use `asChild` on `DropdownMenuTrigger` when using a `Button` or other interactive component to avoid nested button issues.
2. **Organization**: Use `DropdownMenuLabel` for section titles and `DropdownMenuSeparator` to visually group related items.
3. **Submenus**: Nest `DropdownMenuSub`, `DropdownMenuSubTrigger`, and `DropdownMenuSubContent` (within a `DropdownMenuPortal`) to create multi-level navigation.
4. **States**: Use the `disabled` prop on `DropdownMenuItem` for actions that are currently unavailable.
5. **Sizing**: Use a fixed width (e.g., `w-56`) on `DropdownMenuContent` to ensure consistent alignment and readability.
