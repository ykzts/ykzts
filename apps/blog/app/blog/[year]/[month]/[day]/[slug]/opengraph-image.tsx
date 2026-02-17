import { ImageResponse } from 'next/og'
import { DEFAULT_POST_TITLE, MAX_EXCERPT_LENGTH } from '@/lib/constants'
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
          background:
            'linear-gradient(135deg, #0f172a 0%, #1e40af 50%, #3b82f6 100%)',
          color: '#fff',
          display: 'flex',
          height: '100%',
          justifyContent: 'center',
          position: 'relative',
          width: '100%'
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '50%',
            display: 'flex',
            height: 400,
            left: -100,
            position: 'absolute',
            top: -100,
            width: 400
          }}
        />
        <div
          style={{
            background: 'rgba(147, 197, 253, 0.1)',
            borderRadius: '50%',
            bottom: -150,
            display: 'flex',
            height: 500,
            position: 'absolute',
            right: -150,
            width: 500
          }}
        />
        <div style={{ fontSize: 96, fontWeight: 900, zIndex: 1 }}>Blog</div>
      </div>,
      {
        ...size
      }
    )
  }

  return new ImageResponse(
    <div
      style={{
        background:
          'linear-gradient(135deg, #0f172a 0%, #1e40af 50%, #3b82f6 100%)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'space-between',
        padding: 64,
        position: 'relative',
        width: '100%'
      }}
    >
      {/* Decorative background elements */}
      <div
        style={{
          background: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '50%',
          display: 'flex',
          height: 600,
          left: -200,
          position: 'absolute',
          top: -200,
          width: 600
        }}
      />
      <div
        style={{
          background: 'rgba(147, 197, 253, 0.1)',
          borderRadius: '50%',
          bottom: -250,
          display: 'flex',
          height: 700,
          position: 'absolute',
          right: -250,
          width: 700
        }}
      />

      {/* Content */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          zIndex: 1
        }}
      >
        {/* Accent bar */}
        <div
          style={{
            background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
            borderRadius: 4,
            display: 'flex',
            height: 8,
            marginBottom: 32,
            width: 120
          }}
        />
        <div
          style={{
            display: 'flex',
            fontSize: 64,
            fontWeight: 900,
            lineHeight: 1.2,
            marginBottom: 24
          }}
        >
          {post.title || DEFAULT_POST_TITLE}
        </div>
        {post.excerpt && (
          <div
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              fontSize: 32,
              fontWeight: 400,
              lineHeight: 1.5
            }}
          >
            {post.excerpt.slice(0, MAX_EXCERPT_LENGTH)}
            {post.excerpt.length > MAX_EXCERPT_LENGTH ? '...' : ''}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          alignItems: 'center',
          borderTop: '2px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          paddingTop: 32,
          zIndex: 1
        }}
      >
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            gap: 16
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
              borderRadius: 8,
              display: 'flex',
              height: 12,
              width: 12
            }}
          />
          <div style={{ fontSize: 40, fontWeight: 700 }}>Blog</div>
        </div>
        <div
          style={{
            color: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            fontSize: 32,
            fontWeight: 500
          }}
        >
          {post.profile?.name || 'Blog'}
        </div>
      </div>
    </div>,
    {
      ...size
    }
  )
}
