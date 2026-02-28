import Navigation from '@ykzts/layout/components/navigation'

const navItems = [
  { href: '/blog/archive', label: 'Archive' },
  { href: '/blog/search', label: 'Search' }
] as const

export default function BlogNavigation() {
  return <Navigation navItems={navItems} />
}
