import {
  PortableText,
  type PortableTextReactComponents
} from '@portabletext/react'
import Link from '@/components/link'
import { getWorks } from '@/lib/sanity'
import Section, {
  SectionContent,
  SectionHeader,
  SectionTitle,
  SectionSkeleton
} from './section'

const portableTextComponents = {
  marks: {
    link({ children, value }) {
      const { href } = value as {
        href: string
      }

      return <Link href={href}>{children}</Link>
    }
  }
} satisfies Partial<PortableTextReactComponents>

export function WorksSkeleton() {
  return (
    <div id="works">
      {Array(3)
        .fill(undefined)
        .map((_, i) => (
          <SectionSkeleton key={`skeleton-section-${i}`} />
        ))}
    </div>
  )
}

export default async function Works() {
  const works = await getWorks()

  return (
    <div id="works">
      {works.map((work) => (
        <Section key={work.slug}>
          <SectionHeader>
            <SectionTitle>{work.title}</SectionTitle>
          </SectionHeader>

          <SectionContent>
            <PortableText
              components={portableTextComponents}
              value={work.content}
            />
          </SectionContent>
        </Section>
      ))}
    </div>
  )
}
