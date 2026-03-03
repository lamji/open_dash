# Shadcn Block: Hero Section 41 (Bistro Theme)

## 🎯 Purpose
A premium, full-featured Hero Section block designed for restaurant or culinary websites. It features a sticky header with responsive navigation, an auto-playing carousel with synchronized thumbnails, and a testimonials slider.

## 📦 Dependencies
```bash
npm install lucide-react embla-carousel-autoplay
npx shadcn@latest add button card carousel collapsible dropdown-menu navigation-menu separator tooltip utils
```

## 🛠️ Implementation

### File: `app/hero-section-41/page.tsx`
```tsx
import Header from '@/components/shadcn-studio/blocks/hero-section-41/header'
import HeroSection from '@/components/shadcn-studio/blocks/hero-section-41/hero-section-41'
import type { NavigationSection } from '@/components/shadcn-studio/blocks/menu-navigation'

const navigationData: NavigationSection[] = [
  { title: 'About Us', href: '#' },
  { title: 'Testimonials', href: '#' },
  { title: 'Contact us', href: '#' },
  { title: 'Offers', href: '#' }
]

const menudata = [
  {
    id: 1,
    img: 'https://cdn.shadcnstudio.com/ss-assets/template/landing-page/bistro/image-18.png',
    imgAlt: 'plate-1',
    userComment: 'The ambiance is perfect and the food is absolutely delicious. Highly recommended!',
    userAvatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-56.png'
  },
  {
    id: 2,
    img: 'https://cdn.shadcnstudio.com/ss-assets/template/landing-page/bistro/image-19.png',
    imgAlt: 'plate-2',
    userComment: 'Best dining experience in town. The staff is friendly and the menu is exceptional.',
    userAvatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-46.png'
  },
  {
    id: 3,
    img: 'https://cdn.shadcnstudio.com/ss-assets/template/landing-page/bistro/image-20.png',
    imgAlt: 'plate-3',
    userComment: 'Every dish is crafted with care. This place never disappoints!',
    userAvatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-57.png'
  },
  {
    id: 4,
    img: 'https://cdn.shadcnstudio.com/ss-assets/template/landing-page/bistro/image-05.png',
    imgAlt: 'plate-4',
    userComment: 'Great atmosphere and incredible flavors. A must-visit restaurant!',
    userAvatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-58.png'
  }
]

export default function HeroSectionPage() {
  return (
    <div className='overflow-x-hidden'>
      <Header navigationData={navigationData} />
      <main className='flex flex-col pt-17.5'>
        <HeroSection menudata={menudata} />
      </main>
    </div>
  )
}
```

### File: `components/shadcn-studio/blocks/hero-section-41/header.tsx`
```tsx
'use client'

import { useEffect, useState } from 'react'
import { CalendarClockIcon, MenuIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import MenuDropdown from '@/components/shadcn-studio/blocks/menu-dropdown'
import MenuNavigation from '@/components/shadcn-studio/blocks/menu-navigation'
import type { NavigationSection } from '@/components/shadcn-studio/blocks/menu-navigation'
import { cn } from '@/lib/utils'
import BistroLogo from '@/assets/svg/bistro-logo'

export default function Header({ navigationData, className }: { navigationData: NavigationSection[], className?: string }) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={cn('fixed top-0 z-50 h-17.5 w-full border-b transition-all duration-300', isScrolled && 'bg-background shadow-md', className)}>
      <div className='mx-auto flex h-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8'>
        <a href='#' className='flex items-center gap-3'>
          <BistroLogo />
          <span className='text-primary text-[20px] font-semibold'>Bistro</span>
        </a>
        <MenuNavigation navigationData={navigationData} className='max-lg:hidden' />
        <div className='flex gap-4'>
          <Button className='rounded-full max-sm:hidden'>Book table</Button>
          <MenuDropdown navigationData={navigationData} trigger={<Button variant='outline' size='icon' className='rounded-full lg:hidden'><MenuIcon /></Button>} />
        </div>
      </div>
    </header>
  )
}
```

### File: `components/shadcn-studio/blocks/hero-section-41/hero-section-41.tsx`
```tsx
'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { ArrowRightIcon } from 'lucide-react'
import Autoplay from 'embla-carousel-autoplay'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { type CarouselApi, Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { cn } from '@/lib/utils'

export type MenuData = { id: number; img: string; imgAlt: string; userAvatar: string; userComment: string }

export default function HeroSection({ menudata }: { menudata: MenuData[] }) {
  const [mainApi, setMainApi] = useState<CarouselApi>()
  const [thumbApi, setThumbApi] = useState<CarouselApi>()
  const [commentsApi, setCommentsApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!mainApi) return
    mainApi.on('select', () => {
      const selectedIndex = mainApi.selectedScrollSnap()
      setCurrent(selectedIndex)
      thumbApi?.scrollTo(selectedIndex)
      commentsApi?.scrollTo(selectedIndex)
    })
  }, [mainApi, thumbApi, commentsApi])

  const plugin = useRef(Autoplay({ delay: 3000, stopOnInteraction: false }))

  return (
    <section className='flex-1 py-12 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 gap-12 lg:grid-cols-5'>
          <div className='lg:col-span-3'>
            <h1 className='text-3xl font-semibold sm:text-4xl lg:text-5xl'>Savor the taste of perfection</h1>
            <p className='mt-5 text-xl text-muted-foreground'>Welcome to Restaurant where passion meets the plate.</p>
            <div className='mt-8 flex gap-4'>
              <Button size='lg' className='rounded-full'>Order now <ArrowRightIcon className='ml-2' /></Button>
              <Button size='lg' variant='outline' className='rounded-full'>Book table</Button>
            </div>
          </div>
          <div className='lg:col-span-2'>
            <Carousel setApi={setMainApi} plugins={[plugin.current]} opts={{ loop: true }}>
              <CarouselContent>
                {menudata.map(item => (
                  <CarouselItem key={item.id} className='flex justify-center'>
                    <img src={item.img} alt={item.imgAlt} className='size-95 object-contain' />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  )
}
```

## 📋 Rules
1. **Carousel Synchronization**: Always use `useEffect` and `setApi` to sync main, thumbnail, and testimonial carousels.
2. **Global Components**: Use the generic `MenuNavigation` and `MenuDropdown` components for header navigation to ensure consistency.
3. **Theming**: Use `var(--primary)` and `var(--primary-foreground)` for branding elements (like SVG logos) to follow project theme tokens.
