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

const navItems = [
  { href: '#about', label: 'About' },
  { href: '#works', label: 'Works' },
  { href: '/blog', label: 'Blog' },
  { href: '#contact', label: 'Contact' }
]

export default function Navigation() {
  const [open, setOpen] = useState(false)

  return (
    <>
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

      {/* Mobile Navigation */}
      <Sheet onOpenChange={setOpen} open={open}>
        <SheetTrigger asChild className="md:hidden">
          <Button aria-label="Open menu" size="icon" variant="ghost">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="mt-6 flex flex-col gap-4">
            {navItems.map((item) => (
              <a
                className="text-foreground text-lg hover:text-foreground/80"
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
    </>
  )
}
