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
import { useState } from 'react'

const navItems = [
  { href: '/works' as const, label: 'Works' },
  { href: '/posts' as const, label: 'Posts' }
]

export default function Navigation() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop Navigation */}
      <NavigationMenu aria-label="Main navigation" className="hidden sm:flex">
        <NavigationMenuList aria-orientation={undefined}>
          {navItems.map((item) => (
            <NavigationMenuItem key={item.href}>
              <NavigationMenuLink
                className={navigationMenuTriggerStyle()}
                render={<Link href={item.href} />}
              >
                {item.label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>

      {/* Mobile Navigation */}
      <Sheet onOpenChange={setOpen} open={open}>
        <SheetTrigger
          render={
            <Button
              aria-label={open ? 'メニューを閉じる' : 'メニューを開く'}
              className="sm:hidden"
              size="icon-sm"
              variant="ghost"
            />
          }
        >
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>管理画面</SheetTitle>
          </SheetHeader>
          <nav
            aria-label="モバイルナビゲーション"
            className="mt-6 flex flex-col gap-2"
          >
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
    </>
  )
}
