import Navigation from '@ykzts/layout/components/navigation'
import ThemeToggle from './theme-toggle'

const allNavItems = [
  { href: '/#about', label: 'About' },
  { href: '/#works', label: 'Works' },
  { href: '/blog', label: 'Blog' },
  { href: '/#contact', label: 'Contact' }
]

type Props = {
  hasAbout?: boolean
  hasWorks?: boolean
}

export default function PortfolioNavigation({
  hasAbout = true,
  hasWorks = true
}: Props) {
  const navItems = allNavItems.filter((item) => {
    if (item.href === '/#about') return hasAbout
    if (item.href === '/#works') return hasWorks
    return true
  })

  return <Navigation actions={<ThemeToggle />} navItems={navItems} />
}
