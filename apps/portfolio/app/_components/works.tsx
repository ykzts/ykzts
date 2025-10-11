import {
  PortableText,
  type PortableTextMarkComponentProps,
  type PortableTextReactComponents
} from '@portabletext/react'
import { Suspense } from 'react'
import Link from '@/components/link'
import Section, {
  SectionContent,
  SectionHeader,
  SectionSkeleton,
  SectionTitle
} from '@/components/section'
import range from '@/lib/range'
import { getWorks } from '@/lib/sanity'

const portableTextComponents = {
  marks: {
    link({
      children,
      value
    }: PortableTextMarkComponentProps<{ _type: string; href: string }>) {
      const href = value?.href

      return <Link href={href}>{children}</Link>
    }
  }
} satisfies Partial<PortableTextReactComponents>

function WorksSkeleton() {
  return (
    <div id="works">
      {Array.from(range(0, 3), (i) => (
        <SectionSkeleton key={`skeleton-section-${i}`} />
      ))}
    </div>
  )
}

async function WorksImpl() {
  const works = await getWorks()

  return (
    <div id="works">
      {works.map((work) => (
        <Section id={work.slug} key={work.slug}>
          <SectionHeader>
            <SectionTitle>{work.title}</SectionTitle>
          </SectionHeader>

          <SectionContent className="prose prose-slate max-w-none">
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

export default function Works() {
  return (
    <Suspense fallback={<WorksSkeleton />}>
      <WorksImpl />
    </Suspense>
  )
}
