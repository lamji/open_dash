# Shadcn UI: Accordion with Expand Icon Variant

## 🎯 Purpose
Provides an implementation pattern for the Shadcn UI `Accordion` where the standard chevron is replaced with a `PlusIcon` that rotates 45 degrees to become a "close" (X) icon when expanded.

## 📦 Dependencies
```bash
npm install radix-ui lucide-react
npx shadcn@latest add accordion
```

## 🛠️ Implementation Example (`accordion-06.tsx`)

```tsx
import { HeadsetIcon, PackageIcon, PlusIcon, RefreshCwIcon } from 'lucide-react'

import { Accordion as AccordionPrimitive } from 'radix-ui'

import { Accordion, AccordionContent, AccordionItem } from '@/components/ui/accordion'

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

const AccordionExpandIconDemo = () => {
  return (
    <Accordion type='single' collapsible className='w-full' defaultValue='item-1'>
      {items.map((item, index) => (
        <AccordionItem key={index} value={`item-${index + 1}`}>
          <AccordionPrimitive.Header className='flex'>
            <AccordionPrimitive.Trigger
              data-slot='accordion-trigger'
              className='focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-45'
            >
              <span className='flex items-center gap-4'>
                <item.icon className='size-4 shrink-0' />
                <span>{item.title}</span>
              </span>
              <PlusIcon className='text-muted-foreground pointer-events-none size-4 shrink-0 transition-transform duration-200' />
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionContent className='text-muted-foreground'>{item.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export default AccordionExpandIconDemo
```

## 📋 Rules
1. **Custom Trigger Structure**: Manually use `AccordionPrimitive.Trigger` from `radix-ui` (renamed from `radix-ui/react-accordion`) to gain full control over the trigger layout and icon rotation logic.
2. **Icon Animation**: Use `[&[data-state=open]>svg]:rotate-45` on the trigger to rotate the `PlusIcon` by 45 degrees, visually transforming it into a "close" icon.
3. **Accessibility**: Ensure `data-slot='accordion-trigger'` is present if needed by the styling system of the project (e.g., Tailwind v4 setup).
4. **Visual Cues**: Include a decorative leading icon within a semantic `<span>` for improved item differentiation.
