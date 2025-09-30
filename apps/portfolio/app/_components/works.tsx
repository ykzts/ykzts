import {
  PortableText,
  type PortableTextMarkComponentProps,
  type PortableTextReactComponents
} from '@portabletext/react'
import Link from '@/components/link'
import { getWorks } from '@/lib/sanity'
import Section, {
  SectionContent,
  SectionHeader,
  SectionSkeleton,
  SectionTitle
} from './section'

type LinkValue = {
  _type: string
  href: string
}

const portableTextComponents = {
  marks: {
    link({ children, value }: PortableTextMarkComponentProps<LinkValue>) {
      const { href } = value as LinkValue

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
          // biome-ignore lint/suspicious/noArrayIndexKey: using index as key is acceptable for skeletons
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
        <Section id={work.slug} key={work.slug}>
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
