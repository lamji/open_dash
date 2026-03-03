# Shadcn UI: Alert Dialog Pattern

## 🎯 Purpose
Provide a standardized, pre-made implementation pattern for the Shadcn UI `AlertDialog` component. This should be referenced whenever an alert dialog or confirmation modal is needed.

## 🛠️ Implementation Example

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

const AlertDialogDemo = () => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant='outline'>Alert Dialog</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your account and remove your data from our
            servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default AlertDialogDemo
```

## 📋 Rules
1. Always import from `@/components/ui/alert-dialog`.
2. Ensure you use the `asChild` prop on `AlertDialogTrigger` when passing a component like `<Button>` as its child.
3. Keep the content structure exactly as shown using Header, Title, Description, and Footer for correct Shadcn layout.
