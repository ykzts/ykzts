'use client'

import { Button } from '@ykzts/ui/components/button'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle
} from '@ykzts/ui/components/navigation-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@ykzts/ui/components/sheet'
import { Menu } from 'lucide-react'
import { useState } from 'react'
import ThemeToggle from './theme-toggle'

const allNavItems = [
  { href: '#about', label: 'About' },
  { href: '#works', label: 'Works' },
  { href: '/blog', label: 'Blog' },
  { href: '#contact', label: 'Contact' }
]

type Props = {
  hasAbout?: boolean
  hasWorks?: boolean
}

export default function Navigation({
  hasAbout = true,
  hasWorks = true
}: Props) {
  const [open, setOpen] = useState(false)

  const navItems = allNavItems.filter((item) => {
    if (item.href === '#about') return hasAbout
    if (item.href === '#works') return hasWorks
    return true
  })

  return (
    <div className="flex items-center">
      {/* Desktop Navigation */}
      <NavigationMenu aria-label="Main navigation" className="hidden md:flex">
        <NavigationMenuList aria-orientation={undefined}>
          {navItems.map((item) => (
            <NavigationMenuItem key={item.href}>
              <NavigationMenuLink
                className={navigationMenuTriggerStyle()}
                href={item.href}
              >
                {item.label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>

      <ThemeToggle />

      {/* Mobile Navigation */}
      <Sheet onOpenChange={setOpen} open={open}>
        <SheetTrigger
          render={
            <Button
              aria-label="Open menu"
              className="md:hidden"
              size="icon"
              variant="ghost"
            />
          }
        >
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="mt-6 flex flex-col gap-2">
            {navItems.map((item) => (
              <a
                className="rounded-md px-4 py-3 font-medium text-foreground text-lg transition-colors hover:bg-accent hover:text-accent-foreground"
                href={item.href}
                key={item.href}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}
