'use client'

import { Button } from '@ykzts/ui/components/button'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from '@ykzts/ui/components/navigation-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@ykzts/ui/components/sheet'
import { ChevronDown, Menu } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'

type SubItem = {
  href: string
  label: string
}

type NavItem = {
  children?: readonly SubItem[]
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
          {navItems.map((item) =>
            item.children ? (
              <NavigationMenuItem key={item.href}>
                <NavigationMenuTrigger>{item.label}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="flex w-40 flex-col p-1">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <NavigationMenuLink href={child.href}>
                          {child.label}
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            ) : (
              <NavigationMenuItem key={item.href}>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  href={item.href}
                >
                  {item.label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            )
          )}
        </NavigationMenuList>
      </NavigationMenu>

      {actions}

      {/* Mobile Navigation */}
      <Sheet onOpenChange={setOpen} open={open}>
        <SheetTrigger
          render={
            <Button
              aria-label="メニューを開く"
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
            {navItems.map((item) =>
              item.children ? (
                <details className="group" key={item.href}>
                  <summary className="flex cursor-pointer list-none items-center justify-between rounded-md px-4 py-3 font-medium text-foreground text-lg transition-colors hover:bg-accent hover:text-accent-foreground">
                    {item.label}
                    <ChevronDown
                      aria-hidden="true"
                      className="h-4 w-4 transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <div className="mt-1 ml-4 flex flex-col gap-1">
                    {item.children.map((child) => (
                      <a
                        className="rounded-md px-4 py-2 text-base text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                        href={child.href}
                        key={child.href}
                        onClick={() => setOpen(false)}
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                </details>
              ) : (
                <a
                  className="rounded-md px-4 py-3 font-medium text-foreground text-lg transition-colors hover:bg-accent hover:text-accent-foreground"
                  href={item.href}
                  key={item.href}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              )
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}
