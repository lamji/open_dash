# Shadcn UI: Split Accordion Variant

## 🎯 Purpose
Provides a "Split" or "Card" style implementation of the Shadcn UI `Accordion`. Unlike the standard variant, each item behaves like an individual elevated card with custom icon rotation logic.

## 📦 Dependencies
```bash
npx shadcn@latest add accordion
```

## 🛠️ Implementation Example (`accordion-02.tsx`)

```tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const items = [
  {
    title: 'How do I track my order?',
    content: `You can track your order by logging into your account and visiting the "Orders" section. You'll receive tracking information via email once your order ships. For real-time updates, you can also use the tracking number provided in your shipping confirmation email.`
  },
  {
    title: 'What is your return policy?',
    content:
      'We offer a 30-day return policy for most items. Products must be unused and in their original packaging. To initiate a return, please contact our customer service team or use the return portal in your account dashboard.'
  },
  {
    title: 'How can I contact customer support?',
    content:
      'Our customer support team is available 24/7. You can reach us via live chat, email at support@example.com, or by phone at 1-800-123-4567. For faster service, please have your order number ready when contacting us.'
  }
]

const AccordionSplitDemo = () => {
  return (
    <Accordion type='single' collapsible className='w-full space-y-2' defaultValue='item-1'>
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          value={`item-${index + 1}`}
          className='bg-card rounded-md border-b-0 shadow-md data-[state=open]:shadow-lg'
        >
          <AccordionTrigger className='px-5 [&>svg]:rotate-[270deg] [&[data-state=open]>svg]:rotate-0'>
            {item.title}
          </AccordionTrigger>
          <AccordionContent className='text-muted-foreground px-5'>{item.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export default AccordionSplitDemo
```

## 📋 Rules
1. **Card Styling**: Apply `bg-card`, `rounded-md`, and `border-b-0` to the `AccordionItem` to create the split card look.
2. **Elevated State**: Use Tailwind's `data-[state=open]` selector (e.g., `data-[state=open]:shadow-lg`) to increase elevation when an item is active.
3. **Custom Animation**: Target the internal SVG icon with `[&>svg]` to customize its starting rotation (e.g., starting at 270 degrees) and animate it to 0 when open.
4. **Spacing**: Use `space-y-2` on the main `Accordion` container to separate the cards.
