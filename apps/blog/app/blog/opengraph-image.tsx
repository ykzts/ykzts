import { ImageResponse } from 'next/og'
import { getPublisherProfile } from '@/lib/supabase/profiles'

export const alt = 'Blog'
export const size = {
  height: 630,
  width: 1200
}
export const contentType = 'image/png'

export default async function Image() {
  const profile = await getPublisherProfile()

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
          alignItems: 'center',
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
            marginBottom: 48,
            width: 120
          }}
        />
        <div
          style={{
            display: 'flex',
            fontSize: 96,
            fontWeight: 900,
            letterSpacing: -2
          }}
        >
          Blog
        </div>
        {profile.tagline && (
          <div
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              fontSize: 32,
              fontWeight: 400,
              marginTop: 32,
              textAlign: 'center'
            }}
          >
            {profile.tagline}
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
          {profile.name}
        </div>
      </div>
    </div>,
    {
      ...size
    }
  )
}
