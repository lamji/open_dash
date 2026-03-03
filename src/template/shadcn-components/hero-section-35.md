# Shadcn Block: Hero Section 35 (Ink Theme)

## 🎯 Purpose
Provide a standardized, pre-made implementation pattern for a Hero Section block featuring a subscription input, a trust badge, and an accompanying grid of feature/blog cards. Includes a sticky animated header and dropdown navigation.

## 📦 Dependencies
```bash
npm install lucide-react
npx shadcn@latest add badge button card collapsible dropdown-menu navigation-menu tooltip input utils
```

## 🛠️ Implementation Examples

### 1. Page Component (`app/hero-section-35/page.tsx`)
```tsx
import Header from '@/components/shadcn-studio/blocks/hero-section-35/header'
import HeroSection from '@/components/shadcn-studio/blocks/hero-section-35/hero-section-35'
import type { NavigationSection } from '@/components/shadcn-studio/blocks/menu-navigation'

const navigationData: NavigationSection[] = [
  { title: 'Home', href: '#' },
  { title: 'Categories', href: '#' },
  { title: 'Team', href: '#' },
  { title: 'About Us', href: '#' }
]

const blogdata = [
  {
    img: 'https://cdn.shadcnstudio.com/ss-assets/template/landing-page/ink/image-02.png',
    date: 'January 20, 2026',
    blogTitle: 'Build with Empathy for Better User Outcomes',
    description: 'Understand user needs to create intuitive and lovable experiences.',
    author: 'Allen Reilly',
    badge: 'UI',
    authorLink: '#',
    blogLink: '#',
    categoryLink: '#'
  },
  {
    img: 'https://cdn.shadcnstudio.com/ss-assets/template/landing-page/ink/image-03.png',
    date: 'May 20, 2025',
    blogTitle: 'Write Code That Scales with Your Product',
    description: 'Structure your projects for easier updates, faster growth, and bugs.',
    author: 'Sara Wilkerson',
    badge: 'Coding',
    authorLink: '#',
    blogLink: '#',
    categoryLink: '#'
  }
]

const HeroSectionPage = () => {
  return (
    <div className='overflow-x-hidden'>
      <Header navigationData={navigationData} />
      <main className='flex flex-col pt-17.5'>
        <HeroSection blogdata={blogdata} />
      </main>
    </div>
  )
}

export default HeroSectionPage
```

### 2. Header (`components/shadcn-studio/blocks/hero-section-35/header.tsx`)
```tsx
'use client'

import { useEffect, useState } from 'react'
import { MailIcon, MenuIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import MenuDropdown from '@/components/shadcn-studio/blocks/menu-dropdown'
import MenuNavigation from '@/components/shadcn-studio/blocks/menu-navigation'
import type { NavigationSection } from '@/components/shadcn-studio/blocks/menu-navigation'
import { cn } from '@/lib/utils'
import InkLogo from '@/assets/svg/ink-logo'

type HeaderProps = {
  navigationData: NavigationSection[]
  className?: string
}

const Header = ({ navigationData, className }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0)
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={cn('fixed top-0 z-50 h-17.5 w-full transition-all duration-300', { 'bg-background shadow-md': isScrolled }, className)}>
      <div className='mx-auto flex h-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8'>
        <a href='#' className='flex items-center gap-3'>
          <InkLogo />
          <span className='text-primary text-[20px] font-semibold'>INK</span>
        </a>
        <MenuNavigation navigationData={navigationData} className='max-lg:hidden' />
        <div className='flex gap-4'>
          <Button variant='outline' className='max-sm:hidden' asChild>
            <a href='#'>Get in Touch</a>
          </Button>
          <div className='flex gap-3'>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant='outline' size='icon' className='sm:hidden' asChild>
                  <a href='#'>
                    <MailIcon />
                    <span className='sr-only'>Get in Touch</span>
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Get in Touch</TooltipContent>
            </Tooltip>
            <MenuDropdown
              align='end'
              navigationData={navigationData}
              trigger={
                <Button variant='outline' size='icon' className='lg:hidden'>
                  <MenuIcon />
                  <span className='sr-only'>Menu</span>
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
```

### 3. Hero Section Component (`components/shadcn-studio/blocks/hero-section-35/hero-section-35.tsx`)
```tsx
import { ArrowUpRightIcon, CalendarDaysIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

export type BlogData = {
  img: string; date: string; blogTitle: string; description: string; author: string; badge: string; authorLink: string; blogLink: string; categoryLink: string
}

const HeroSection = ({ blogdata }: { blogdata: BlogData[] }) => {
  return (
    <section className='bg-muted pt-16 pb-12 sm:pb-16 lg:pb-24'>
      <div className='mx-auto flex h-full max-w-7xl flex-col gap-16 px-4 sm:px-6 lg:px-8'>
        <div className='flex max-w-4xl flex-col items-center gap-4 self-center text-center'>
          <Badge variant='outline' className='text-sm font-normal'>Trusted by 1,000,000+ professionals</Badge>
          <h1 className='text-3xl leading-[1.29167] font-semibold text-balance sm:text-4xl lg:text-5xl'>
            Build Better Products with Insights that Drive Real Impact.
          </h1>
          <p className='text-muted-foreground mx-auto max-w-2xl text-xl'>
            Learn how to design, develop, launch, and grow digital products through practical knowledge and proven frameworks.
          </p>
          <div className='z-10 flex items-center gap-3 p-2'>
            <Input type='email' placeholder='Your email' required className='bg-background h-10 sm:w-70' />
            <Button size='lg' className='relative w-fit overflow-hidden rounded-lg px-6 text-base hover:before:bg-[position:-100%_0,0_0]' asChild>
              <a href='#'>Subscribe</a>
            </Button>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          {blogdata.map((item, index) => (
            <Card key={`${item.author}-${index}`} className='group py-0 shadow-none'>
              <CardContent className='grid grid-cols-1 px-0 xl:grid-cols-2'>
                <div className='p-6'>
                  <div className='h-59.5 w-full overflow-hidden rounded-lg'>
                    <img src={item.img} alt={item.author} className='w-full object-cover transition-transform duration-300 group-hover:scale-105' />
                  </div>
                </div>
                <div className='flex flex-col justify-center gap-3 p-6'>
                  <div className='flex items-center gap-1.5 py-1'>
                    <div className='text-muted-foreground flex grow items-center gap-1.5'>
                      <CalendarDaysIcon className='size-6' />
                      <p>{item.date}</p>
                    </div>
                    <a href={item.categoryLink}>
                      <Badge className='bg-primary/10 text-primary border-0 text-sm'>{item.badge}</Badge>
                    </a>
                  </div>
                  <a href={item.blogLink}>
                    <h3 className='text-xl font-medium'>{item.blogTitle}</h3>
                  </a>
                  <p className='text-muted-foreground'>{item.blogTitle}</p>
                  <div className='flex w-full items-center justify-between gap-1 py-1'>
                    <a href={item.authorLink} className='text-sm font-medium'>{item.author}</a>
                    <Button size='icon' variant='outline' className='group-hover:bg-primary! hover:bg-primary! hover:text-primary-foreground group-hover:text-primary-foreground group-hover:border-transparent hover:border-transparent' asChild>
                      <a href={item.blogLink}><ArrowUpRightIcon /></a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HeroSection
```

### 4. Menu Dropdown (`components/shadcn-studio/blocks/menu-dropdown.tsx`)
```tsx
'use client'

import type { ReactNode } from 'react'
import { ChevronRightIcon, CircleSmallIcon } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export type NavigationItem = { title: string; href: string }
export type NavigationSection = { title: string; icon?: ReactNode } & ({ items: NavigationItem[]; href?: never } | { items?: never; href: string })

type Props = { trigger: ReactNode; navigationData: NavigationSection[]; align?: 'center' | 'end' | 'start' }

const MenuDropdown = ({ trigger, navigationData, align = 'start' }: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align={align}>
        {navigationData.map(navItem => {
          if (navItem.href) {
            return (
              <DropdownMenuItem key={navItem.title} asChild>
                <a href={navItem.href}>
                  {navItem.icon}
                  {navItem.title}
                </a>
              </DropdownMenuItem>
            )
          }
          return (
            <Collapsible key={navItem.title} asChild>
              <DropdownMenuGroup>
                <CollapsibleTrigger asChild>
                  <DropdownMenuItem onSelect={event => event.preventDefault()} className='justify-between'>
                    {navItem.icon}
                    <span className='flex-1'>{navItem.title}</span>
                    <ChevronRightIcon className='shrink-0 transition-transform [[data-state=open]>&]:rotate-90' />
                  </DropdownMenuItem>
                </CollapsibleTrigger>
                <CollapsibleContent className='pl-2'>
                  {navItem.items?.map(item => (
                    <DropdownMenuItem key={item.title} asChild>
                      <a href={item.href}>
                        <CircleSmallIcon />
                        <span>{item.title}</span>
                      </a>
                    </DropdownMenuItem>
                  ))}
                </CollapsibleContent>
              </DropdownMenuGroup>
            </Collapsible>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default MenuDropdown
```

### 5. Menu Navigation (`components/shadcn-studio/blocks/menu-navigation.tsx`)
```tsx
import type { ReactNode } from 'react'
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'

export type NavigationItem = { title: string; href: string }
export type NavigationSection = { title: string; icon?: ReactNode } & ({ items: NavigationItem[]; href?: never } | { items?: never; href: string })

type MenuNavigationProps = { navigationData: NavigationSection[]; className?: string }

const MenuNavigation = ({ navigationData, className }: MenuNavigationProps) => {
  return (
    <NavigationMenu viewport={false} className={className}>
      <NavigationMenuList className='flex-wrap justify-start gap-0'>
        {navigationData.map(navItem => {
          if (navItem.href) {
            return (
              <NavigationMenuItem key={navItem.title}>
                <NavigationMenuLink
                  href={navItem.href}
                  className={cn(navigationMenuTriggerStyle(), 'text-muted-foreground hover:text-primary dark:hover:bg-accent/50 bg-transparent px-3 py-1.5 text-base!')}
                >
                  {navItem.title}
                </NavigationMenuLink>
              </NavigationMenuItem>
            )
          }
          return (
            <NavigationMenuItem key={navItem.title}>
              <NavigationMenuTrigger className='dark:data-[state=open]:hover:bg-accent/50 text-muted-foreground hover:text-primary dark:hover:bg-accent/50 bg-transparent px-3 py-1.5 text-base [&>svg]:size-4'>
                {navItem.title}
              </NavigationMenuTrigger>
              <NavigationMenuContent className='data-[motion=from-start]:slide-in-from-left-30! data-[motion=to-start]:slide-out-to-left-30! data-[motion=from-end]:slide-in-from-right-30! data-[motion=to-end]:slide-out-to-right-30! absolute w-auto'>
                <ul className='grid w-38 gap-4'>
                  <li>
                    {navItem.items?.map(item => (
                      <NavigationMenuLink key={item.title} href={item.href}>
                        {item.title}
                      </NavigationMenuLink>
                    ))}
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export default MenuNavigation
```

### 6. Logo (`assets/svg/ink-logo.tsx`)
```tsx
import type { SVGAttributes } from 'react'

const InkLogo = (props: SVGAttributes<SVGElement>) => {
  return (
    <div className='bg-primary text-background relative flex size-8 overflow-hidden rounded-full'>
      <svg className='absolute -top-px right-0' width='20' height='30' viewBox='0 0 20 30' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
        <path d='M1.75195 7.90625L1.75586 7.93457L1.76562 7.96191C2.16851 9.04621 2.54073 9.8622 2.90723 10.4062C3.2654 10.9379 3.67056 11.2863 4.15527 11.2617C4.62298 11.2378 5.03681 10.8682 5.42578 10.3359C5.82582 9.78847 6.25198 8.99494 6.72656 7.98145L6.74316 7.94531L6.74805 7.90625L7.20996 4.20801C7.34724 4.26031 7.44215 4.31167 7.51367 4.37695C7.61221 4.46697 7.69065 4.60448 7.74512 4.88086C7.12392 8.38213 6.90091 10.398 7.7334 13.834C6.66499 15.606 5.55675 18.0723 4.71387 20.0996C4.4074 20.8367 4.13636 21.518 3.91309 22.0889L4.24023 18.4922C4.26261 18.471 4.29041 18.4466 4.32031 18.417C4.4113 18.3269 4.53325 18.1984 4.65918 18.0469C4.90131 17.7555 5.19468 17.3324 5.24805 16.9062C5.30575 16.4447 5.27456 15.8994 5.10059 15.458C4.95136 15.0796 4.6792 14.7454 4.25 14.6514V13.375H3.75V14.6514C3.3208 14.7454 3.04864 15.0796 2.89941 15.458C2.72544 15.8994 2.69425 16.4447 2.75195 16.9062C2.80532 17.3324 3.09869 17.7555 3.34082 18.0469C3.46675 18.1984 3.5887 18.3269 3.67969 18.417C3.70111 18.4382 3.72155 18.4567 3.73926 18.4736L3.37695 22.4619C3.2094 21.8629 2.9907 21.1013 2.72656 20.2549C2.10613 18.2668 1.24305 15.7963 0.267578 13.8516C1.30813 10.4879 1.22519 8.45381 0.750977 4.86621C0.762769 4.53785 0.823132 4.39443 0.904297 4.31445C0.970203 4.24953 1.07961 4.19454 1.2832 4.15625L1.75195 7.90625ZM4 15.125C4.2969 15.125 4.5033 15.3056 4.63574 15.6416C4.77051 15.9835 4.80252 16.4389 4.75195 16.8438C4.71791 17.1161 4.51138 17.4436 4.27539 17.7275C4.17668 17.8463 4.07817 17.9484 4 18.0273C3.92183 17.9484 3.82332 17.8463 3.72461 17.7275C3.48862 17.4436 3.28209 17.1161 3.24805 16.8438C3.19748 16.4389 3.22949 15.9835 3.36426 15.6416C3.4967 15.3056 3.7031 15.125 4 15.125ZM1.56055 0.617188C3.52074 0.127146 4.97926 0.127145 6.93945 0.617188C7.15696 0.671565 7.28845 0.75252 7.36914 0.835938C7.44798 0.917465 7.49362 1.01776 7.51074 1.14258C7.5472 1.40913 7.45239 1.76072 7.29102 2.15234C7.21257 2.34266 7.12286 2.53251 7.03516 2.71484C6.94884 2.89431 6.86243 3.07183 6.7959 3.22656C6.73191 3.37539 6.67264 3.53364 6.65918 3.6709C6.65234 3.74083 6.65433 3.83322 6.69727 3.92188C6.70779 3.94353 6.72061 3.9631 6.73438 3.98145L6.25684 7.80176C5.79149 8.79298 5.38863 9.53989 5.02246 10.041C4.64141 10.5625 4.34958 10.7504 4.12988 10.7617C3.92697 10.772 3.66158 10.6321 3.32129 10.127C2.99199 9.63807 2.64017 8.87636 2.24414 7.81348L1.76855 4.01172C1.77624 4.00404 1.78575 3.99792 1.79297 3.98926C1.86492 3.90274 1.88166 3.80152 1.88184 3.72461C1.88208 3.58118 1.82393 3.41678 1.76367 3.27148C1.69958 3.11695 1.61342 2.93903 1.52539 2.75781C1.43586 2.57351 1.34281 2.38091 1.25977 2.18652C1.08919 1.78721 0.981522 1.42478 1.00977 1.14844C1.02309 1.01886 1.06579 0.916274 1.14062 0.834961C1.21704 0.752065 1.34461 0.671171 1.56055 0.617188Z' stroke='currentColor' strokeWidth='0.5' />
        <path d='M5.22512 25.9048C5.10919 25.9694 4.97409 25.984 4.84811 25.9424C4.72221 25.9009 4.61573 25.8068 4.55354 25.6834C4.49136 25.5601 4.47896 25.4185 4.52051 25.2927C4.56198 25.1666 4.65399 25.0666 4.77488 25.0119C4.77488 25.0119 4.77488 25.0119 4.77488 25.0119C4.97101 24.9224 5.16804 24.8413 5.36576 24.7658C6.88448 24.2029 8.4385 23.8663 10.0288 23.7346C11.101 23.651 12.0315 24.2216 12.7263 24.8648C13.5975 25.4289 14.8446 25.6229 15.9457 25.8996C16.1426 25.9452 16.3436 25.991 16.5388 26.0387C16.3404 26.0074 16.1364 25.978 15.9365 25.9488C14.7898 25.7469 13.6442 25.7264 12.5093 25.12C11.7979 24.5577 10.9219 24.1552 10.0931 24.297C8.59034 24.545 7.09747 25.003 5.73912 25.6393C5.56346 25.7235 5.39118 25.8117 5.22512 25.9048Z' fill='currentColor' />
        <path d='M5.06801 25.8746C4.93754 25.8993 4.80518 25.8702 4.69951 25.7899C4.59387 25.7099 4.52359 25.5853 4.50465 25.4473C4.4857 25.3093 4.5198 25.1704 4.59995 25.0648C4.68008 24.9591 4.79971 24.8954 4.93199 24.8839C4.93199 24.8839 4.93199 24.8839 4.93199 24.8839C5.10982 24.8679 5.28611 24.8577 5.4617 24.8515C7.12088 24.8107 8.73244 25.0135 10.3063 25.4251C11.7416 25.9447 12.9179 26.7593 14.0103 27.7078C14.1303 27.8246 14.2552 27.9492 14.3357 28.0943C14.2413 27.9586 14.1071 27.8488 13.9776 27.7456C12.8302 26.9235 11.5025 26.2167 10.204 25.89C8.66063 25.6442 7.06115 25.6075 5.5402 25.7982C5.38064 25.8198 5.22285 25.845 5.06801 25.8746Z' fill='currentColor' />
        <path d='M5.49739 25.8368C5.38721 25.9108 5.25384 25.9364 5.12489 25.9052C4.99604 25.8741 4.88217 25.7888 4.81006 25.6707C4.73794 25.5526 4.71399 25.4124 4.74518 25.2835C4.77627 25.1546 4.85997 25.0476 4.97612 24.9834C4.97612 24.9834 4.97612 24.9834 4.97612 24.9834C5.15471 24.8841 5.33402 24.7906 5.51426 24.7008C7.16365 23.8967 8.86537 23.2979 10.62 22.8597C11.6966 22.5937 12.8026 22.8065 13.7604 23.2134C14.391 23.4842 15.0842 23.6057 15.7819 23.6371C15.9768 23.6464 16.1716 23.6493 16.3676 23.6475C16.1724 23.6659 15.9778 23.6797 15.7817 23.6871C15.081 23.7153 14.3623 23.6542 13.6803 23.4283C12.7196 23.1125 11.6746 23.0191 10.7564 23.3338C9.0905 23.9033 7.46231 24.6409 5.9726 25.5329C5.81091 25.6315 5.65199 25.7326 5.49739 25.8368Z' fill='currentColor' />
      </svg>
    </div>
  )
}

export default InkLogo
```
