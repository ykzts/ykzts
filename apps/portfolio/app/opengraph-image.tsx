import { ImageResponse } from 'next/og'
import { getProfile } from '@/lib/supabase'

export const alt = process.env.NEXT_PUBLIC_SITE_NAME ?? 'example.com'
export const size = {
  height: 630,
  width: 1200
}
export const contentType = 'image/png'

export default async function Image() {
  const profile = await getProfile()

  return new ImageResponse(
    <div
      style={{
        background:
          'linear-gradient(135deg, #0f172a 0%, #1e40af 50%, #3b82f6 100%)',
        color: '#fff',
        display: 'flex',
        height: '100%',
        justifyContent: 'space-between',
        lineHeight: 1.5,
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
          left: -150,
          position: 'absolute',
          top: -150,
          width: 600
        }}
      />
      <div
        style={{
          background: 'rgba(147, 197, 253, 0.1)',
          borderRadius: '50%',
          bottom: -200,
          display: 'flex',
          height: 800,
          position: 'absolute',
          right: -200,
          width: 800
        }}
      />

      {/* Left side - Logo */}
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 64,
          zIndex: 1
        }}
      >
        {/* Accent decoration */}
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
          {process.env.NEXT_PUBLIC_SITE_NAME ?? 'example.com'}
        </div>
        {profile.tagline && (
          <div
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              fontSize: 28,
              fontWeight: 400,
              marginTop: 24,
              textAlign: 'center'
            }}
          >
            {profile.tagline}
          </div>
        )}
      </div>

      {/* Right side - Profile card */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          zIndex: 1
        }}
      >
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 24,
            display: 'flex',
            margin: 64,
            padding: 48
          }}
        >
          <div style={{ display: 'flex', paddingRight: 32 }}>
            {profile.avatar_url && (
              <>
                {/* biome-ignore lint/performance/noImgElement: `<Image />` is unsupported. Uses @vercel/og to convert restricted JSX to SVG. */}
                <img
                  alt=""
                  height={128}
                  src={profile.avatar_url}
                  style={{
                    border: '4px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 64
                  }}
                  width={128}
                />
              </>
            )}
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <div style={{ fontSize: 36, fontWeight: 700, marginBottom: 8 }}>
              {profile.name}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
