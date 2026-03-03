# Shadcn UI: Accordion with Avatar Variant

## 🎯 Purpose
Provides a standardized implementation pattern for the Shadcn UI `Accordion` where each trigger includes an `Avatar`, user name, and subtext (e.g., email). This is ideal for team directories, user profiles, or contact lists within an expandable interface.

## 📦 Dependencies
```bash
npx shadcn@latest add accordion avatar
```

## 🛠️ Implementation Example (`accordion-07.tsx`)

```tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const items = [
  {
    name: 'Richard Payne',
    email: 'pwright@yahoo.com',
    avatarImage: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png',
    content:
      'Richard Payne is a remarkable individual known for his exceptional skills and expertise in various fields. With a strong background in technology and a passion for innovation, Richard has made significant contributions to the industry.'
  },
  {
    name: 'Jordan Stevenson',
    email: 'wramirez@outlook.com',
    avatarImage: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-2.png',
    content:
      'Jordan Stevenson is a talented individual with a passion for technology and innovation. Jordan has made significant contributions to various projects and has a deep understanding of programming languages and frameworks.'
  },
  {
    name: 'Nicholas Tanner',
    email: 'snguyen@icloud.com',
    avatarImage: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-3.png',
    content:
      'Nicholas Tanner is a highly skilled individual with a strong passion for technology and innovation. Nicholas has made significant contributions to numerous projects and possesses a deep understanding of various programming languages and frameworks.'
  }
]

const AccordionAvatarDemo = () => {
  return (
    <Accordion type='single' collapsible className='w-full' defaultValue='item-1'>
      {items.map((item, index) => (
        <AccordionItem key={index} value={`item-${index + 1}`}>
          <AccordionTrigger className='items-center hover:no-underline'>
            <span className='flex items-center gap-4'>
              <Avatar className='size-10.5 rounded-sm'>
                <AvatarImage src={item.avatarImage} alt={item.name} className='rounded-sm' />
                <AvatarFallback className='rounded-sm text-xs'>
                  {item.name.split(/\s/).reduce((response, word) => (response += word.slice(0, 1)), '')}
                </AvatarFallback>
              </Avatar>
              <span className='flex flex-col space-y-0.5'>
                <span>{item.name}</span>
                <span className='text-muted-foreground font-normal'>{item.email}</span>
              </span>
            </span>
          </AccordionTrigger>
          <AccordionContent className='text-muted-foreground'>{item.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export default AccordionAvatarDemo
```

## 📋 Rules
1. **Avatar Styling**: Use `Avatar` with a specific size (e.g., `size-10.5`) and `rounded-sm` for a modern, distinct look.
2. **Text Hierarchy**: Nest a flex column for the name and subtext (e.g., email) to create a clean vertical label structure next to the avatar.
3. **Initials Logic**: Always provide a `AvatarFallback` using the `split` and `reduce` logic shown in the example to handle initials dynamically.
4. **Trigger Behavior**: Use `hover:no-underline` on the `AccordionTrigger` if the text structure is complex, to maintain clean visual aesthetics during interaction.
