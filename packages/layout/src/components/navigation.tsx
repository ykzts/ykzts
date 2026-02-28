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
import Link from 'next/link'
import type { ReactNode } from 'react'
import { useState } from 'react'

type NavItem = {
  href: string
  label: string
}

type Props = {
  actions?: ReactNode
  navItems: readonly NavItem[]
}

export default function Navigation({ actions, navItems }: Props) {
  const [open, setOpen] = useState(false)

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
                render={<Link href={item.href} />}
              >
                {item.label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>

      {actions}

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
              <Link
                className="rounded-md px-4 py-3 font-medium text-foreground text-lg transition-colors hover:bg-accent hover:text-accent-foreground"
                href={item.href}
                key={item.href}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}
