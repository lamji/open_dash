# Shadcn UI: Accordion with Left Icons Variant

## 🎯 Purpose
Provides an implementation pattern for the Shadcn UI `Accordion` where each trigger includes an identifying leading icon and the chevron indicator is moved to the "start" (left) position for a different visual hierarchy.

## 📦 Dependencies
```bash
npm install lucide-react
npx shadcn@latest add accordion
```

## 🛠️ Implementation Example (`accordion-03.tsx`)

```tsx
import { HeadsetIcon, PackageIcon, RefreshCwIcon } from 'lucide-react'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const items = [
  {
    icon: PackageIcon,
    title: 'How do I track my order?',
    content: `You can track your order by logging into your account and visiting the "Orders" section. You'll receive tracking information via email once your order ships. For real-time updates, you can also use the tracking number provided in your shipping confirmation email.`
  },
  {
    icon: RefreshCwIcon,
    title: 'What is your return policy?',
    content:
      'We offer a 30-day return policy for most items. Products must be unused and in their original packaging. To initiate a return, please contact our customer service team or use the return portal in your account dashboard.'
  },
  {
    icon: HeadsetIcon,
    title: 'How can I contact customer support?',
    content:
      'Our customer support team is available 24/7. You can reach us via live chat, email at support@example.com, or by phone at 1-800-123-4567. For faster service, please have your order number ready when contacting us.'
  }
]

const AccordionLeftIconDemo = () => {
  return (
    <Accordion type='single' collapsible className='w-full' defaultValue='item-1'>
      {items.map((item, index) => (
        <AccordionItem key={index} value={`item-${index + 1}`}>
          <AccordionTrigger className='justify-start [&>svg]:order-first'>
            <span className='flex items-center gap-4'>
              <item.icon className='text-muted-foreground size-4 shrink-0' />
              <span>{item.title}</span>
            </span>
          </AccordionTrigger>
          <AccordionContent className='text-muted-foreground'>{item.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export default AccordionLeftIconDemo
```

## 📋 Rules
1. **Chevron Ordering**: Use Tailwind's `[&>svg]:order-first` on the `AccordionTrigger` to move the default chevron to the far left.
2. **Icon Integration**: Wrap the custom icon and title within a `<span>` with `flex` and `gap-4` to handle horizontal spacing correctly.
3. **Visual Hierarchy**: Apply `text-muted-foreground` to the decorative icon to ensure it doesn't distract from the primary content.
4. **Trigger Alignment**: Use `justify-start` on the trigger to ensure content stays pinned to the left when the chevron is ordered first.
