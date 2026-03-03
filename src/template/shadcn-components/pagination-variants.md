# Shadcn UI: Pagination Component Variants

## 🎯 Purpose
Provides a collection of standardized implementation patterns for the Shadcn UI `Pagination` component, covering basic usage, icon-only navigation, primary-styled active items, and bordered/split layouts.

## 📦 Dependencies
```bash
npm install lucide-react
npx shadcn@latest add button pagination
```

## 🛠️ Implementation Examples

### 1. Basic Pagination (`pagination-01.tsx`)
```tsx
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'

const PaginationDemo = () => {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href='#' />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href='#'>1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href='#' isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href='#'>3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href='#' />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export default PaginationDemo
```

### 2. Pagination with Icon Only (`pagination-02.tsx`)
```tsx
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination'

const PaginationWithIconDemo = () => {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationLink href='#' aria-label='Go to previous page' size='icon'>
            <ChevronLeftIcon className='size-4' />
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href='#'>1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href='#' isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href='#'>3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href='#' aria-label='Go to next page' size='icon'>
            <ChevronRightIcon className='size-4' />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export default PaginationWithIconDemo
```

### 3. Pagination with Primary Active Button (`pagination-03.tsx`)
```tsx
import { buttonVariants } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import { cn } from '@/lib/utils'

const PaginationWithPrimaryButtonDemo = () => {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href='#' />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href='#'>1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink
            href='#'
            isActive
            className={cn(
              buttonVariants({
                variant: 'default',
                size: 'icon'
              }),
              'hover:!text-primary-foreground dark:bg-primary dark:text-primary-foreground dark:hover:text-primary-foreground dark:hover:bg-primary/90 !shadow-none dark:border-transparent'
            )}
          >
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href='#'>3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href='#' />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export default PaginationWithPrimaryButtonDemo
```

### 4. Bordered/Split Pagination (`pagination-05.tsx`)
```tsx
import { buttonVariants } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import { cn } from '@/lib/utils'

const pages = [1, 2, 3]

const BorderedPaginationDemo = () => {
  return (
    <Pagination>
      <PaginationContent className='gap-0 divide-x overflow-hidden rounded-lg border'>
        <PaginationItem>
          <PaginationPrevious href='#' className='rounded-none' />
        </PaginationItem>
        {pages.map(page => {
          const isActive = page === 2
          return (
            <PaginationItem key={page}>
              <PaginationLink
                href={`#${page}`}
                className={cn(
                  {
                    [buttonVariants({
                      variant: 'default',
                      className:
                        'hover:!text-primary-foreground dark:bg-primary dark:text-primary-foreground dark:hover:text-primary-foreground dark:hover:bg-primary/90 dark:border-transparent'
                    })]: isActive
                  },
                  'rounded-none border-none'
                )}
                isActive={isActive}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        })}
        <PaginationItem>
          <PaginationNext href='#' className='rounded-none' />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export default BorderedPaginationDemo
```

## 📋 Rules
1. **Accessibility**: All icon-only pagination links must include an `aria-label` to specify their purpose (e.g., "Go to next page").
2. **Active State Styling**: For the primary button variant, use `buttonVariants({ variant: 'default' })` and carefully manage dark mode utility classes to maintain contrast.
3. **Layout Customization**: When using the bordered/split variant, apply `gap-0` and `divide-x` to the `PaginationContent` to create a unified block appearance. Ensure child items have `rounded-none`.
4. **Consistency**: Use the standard `@/components/ui/pagination` and `@/components/ui/button` imports to remain compatible with the project's Shadcn installation.
