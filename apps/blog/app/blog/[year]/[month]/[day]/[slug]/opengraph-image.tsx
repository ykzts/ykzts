import { ImageResponse } from 'next/og'
import { getPostBySlug } from '@/lib/supabase/posts'

export const alt = 'ykzts.com/blog'
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
          backgroundColor: '#000',
          color: '#fff',
          display: 'flex',
          height: '100%',
          justifyContent: 'center',
          width: '100%'
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 900 }}>ykzts.com/blog</div>
      </div>,
      {
        ...size
      }
    )
  }

  return new ImageResponse(
    <div
      style={{
        backgroundColor: '#000',
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
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'center'
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            lineHeight: 1.3,
            marginBottom: 24
          }}
        >
          {post.title}
        </div>
        {post.excerpt && (
          <div
            style={{
              color: '#999',
              fontSize: 32,
              lineHeight: 1.5
            }}
          >
            {post.excerpt.slice(0, 150)}
            {post.excerpt.length > 150 ? '...' : ''}
          </div>
        )}
      </div>
      <div
        style={{
          alignItems: 'center',
          borderTop: '4px solid #333',
          display: 'flex',
          justifyContent: 'space-between',
          paddingTop: 32
        }}
      >
        <div style={{ fontSize: 40, fontWeight: 700 }}>ykzts.com/blog</div>
        <div style={{ color: '#999', fontSize: 32 }}>Yamagishi Kazutoshi</div>
      </div>
    </div>,
    {
      ...size
    }
  )
}
