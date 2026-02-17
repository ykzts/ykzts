import { ImageResponse } from 'next/og'
import {
  AUTHOR_NAME,
  DEFAULT_POST_TITLE,
  MAX_EXCERPT_LENGTH
} from '@/lib/constants'
import { getPostBySlug } from '@/lib/supabase/posts'

export const alt = 'Blog'
export const size = {
  height: 630,
  width: 1200
}
export const contentType = 'image/png'

type Props = {
  params: Promise<{
    year: string
    month: string
    day: string
    slug: string
  }>
}

export default async function Image({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return new ImageResponse(
      <div
        style={{
          alignItems: 'center',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #2563eb 100%)',
          color: '#fff',
          display: 'flex',
          height: '100%',
          justifyContent: 'center',
          width: '100%'
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 900 }}>Blog</div>
      </div>,
      {
        ...size
      }
    )
  }

  return new ImageResponse(
    <div
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #2563eb 100%)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'space-between',
        padding: 64,
        width: '100%'
      }}
    >
      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 64,
            fontWeight: 900,
            lineHeight: 1.3,
            marginBottom: 24
          }}
        >
          {post.title || DEFAULT_POST_TITLE}
        </div>
        {post.excerpt && (
          <div
            style={{
              color: 'rgba(255, 255, 255, 0.7)',
              display: 'flex',
              fontSize: 32,
              lineHeight: 1.5
            }}
          >
            {post.excerpt.slice(0, MAX_EXCERPT_LENGTH)}
            {post.excerpt.length > MAX_EXCERPT_LENGTH ? '...' : ''}
          </div>
        )}
      </div>
      <div
        style={{
          alignItems: 'center',
          borderTop: '4px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          paddingTop: 32
        }}
      >
        <div style={{ fontSize: 40, fontWeight: 700 }}>Blog</div>
        <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 32 }}>
          {AUTHOR_NAME}
        </div>
      </div>
    </div>,
    {
      ...size
    }
  )
}
