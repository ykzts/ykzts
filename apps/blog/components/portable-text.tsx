import {
  PortableText,
  type PortableTextMarkComponentProps,
  type PortableTextReactComponents
} from '@portabletext/react'
import Image from 'next/image'
import type { ComponentProps } from 'react'
import Link from '@/components/link'
import type {
  CodeBlock,
  ImageBlock,
  PortableTextValue
} from '@/lib/portable-text'
import { highlightCode } from '@/lib/shiki'

const portableTextComponents = {
  marks: {
    link({
      children,
      value
    }: PortableTextMarkComponentProps<{ _type: string; href: string }>) {
      const href = value?.href

      return <Link href={href}>{children}</Link>
    }
  },
  types: {
    async code({ value }: { value: CodeBlock }) {
      const { code, language } = value
      const html = await highlightCode(code, language)

      return (
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki generates safe HTML for syntax highlighting
        <div dangerouslySetInnerHTML={{ __html: html }} />
      )
    },
    image({ value }: { value: ImageBlock }) {
      const { alt, asset } = value
      const imageUrl = asset?.url

      if (!imageUrl) {
        return null
      }

      return (
        <figure className="my-8">
          <Image
            alt={alt || ''}
            className="rounded-lg"
            height={600}
            src={imageUrl}
            width={800}
          />
          {alt && (
            <figcaption className="mt-2 text-center text-muted-foreground text-sm">
              {alt}
            </figcaption>
          )}
        </figure>
      )
    }
  }
} satisfies Partial<PortableTextReactComponents>

type PortableTextProps = Omit<
  ComponentProps<typeof PortableText>,
  'components'
> & {
  value: PortableTextValue
}

export default function PortableTextBlock({
  value,
  ...props
}: PortableTextProps) {
  return (
    <div className="prose prose-lg max-w-none prose-a:text-primary prose-headings:text-foreground prose-p:text-base prose-p:text-muted-foreground prose-strong:text-foreground prose-p:leading-relaxed prose-a:no-underline prose-a:hover:underline">
      <PortableText
        {...props}
        components={portableTextComponents}
        value={value}
      />
    </div>
  )
}
