# Shadcn UI: Dialog Subscribe Variant

## 🎯 Purpose
Provide a standardized, pre-made implementation pattern for the Shadcn UI `Dialog` component that includes a subscription form layout. This demonstrates how to combine Dialog, Input, Label, and Button for a cohesive popup form.

## 🛠️ Implementation Example (`dialog-subscribe.tsx`)

```tsx
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const DialogSubscribeDemo = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline'>Subscribe</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-center'>
          <DialogTitle className='text-xl'>Subscribe blog for latest updates</DialogTitle>
          <DialogDescription className='text-base'>
            Subscribe to our blog to stay updated with the latest posts and news. Simply enter your email address and
            click &apos;Subscribe&apos; to receive notifications.
          </DialogDescription>
        </DialogHeader>
        <form className='flex gap-4'>
          <div className='grid grow-1 gap-3'>
            <Label htmlFor='email'>Email</Label>
            <Input type='email' id='email' name='email' placeholder='example@gmail.com' required />
          </div>
          <Button type='submit' className='self-end'>
            Subscribe
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default DialogSubscribeDemo
```

## 📋 Rules
1. Use `Dialog` (@/components/ui/dialog) for standard popups (vs `AlertDialog` for required confirmations).
2. Incorporate `<Label>` and `<Input>` within the `<form>` element.
3. The `DialogContent` accepts Tailwind classes (e.g., `className='sm:max-w-lg'`) to control the modal's width and layout.
