import { ImageResponse } from 'next/server'

export const runtime = 'edge'

export const alt = 'ykzts.com'
export const size = {
  width: 1200,
  height: 630
}
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          backgroundColor: '#000',
          color: '#fff',
          display: 'flex',
          height: '100%',
          justifyContent: 'space-between',
          lineHeight: 1.5,
          width: '100%'
        }}
      >
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            flex: 1,
            justifyContent: 'center',
            padding: 32
          }}
        >
          <div style={{ fontSize: 96, fontWeight: 900 }}>ykzts.com</div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end'
          }}
        >
          <div style={{ display: 'flex', padding: 32 }}>
            <div style={{ display: 'flex', paddingRight: 32 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt=""
                height={128}
                src="https://www.gravatar.com/avatar/b9025074d487cd0328f1dc816e5ac50a?s=128"
                style={{ borderRadius: 64 }}
                width={128}
              />
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <div style={{ fontSize: 32, fontWeight: 700 }}>
                Yamagishi Kazutoshi
              </div>
              <div style={{ fontSize: 24 }}>ykzts@desire.sh</div>
            </div>
          </div>
        </div>
      </div>
    )
  )
}
