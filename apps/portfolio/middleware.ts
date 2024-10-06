import { NextResponse } from 'next/server'

function createCSPDirectives(): string[] {
  return [
    "base-uri 'none'",
    "connect-src 'self' https://vitals.vercel-insights.com",
    "default-src 'none'",
    "font-src 'self'",
    "form-action 'none'",
    "frame-ancestors 'none'",
    "img-src 'self' data:",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'"
  ]
}

export function middleware(request: Request) {
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.next()
  }

  const requestHeaders = new Headers(request.headers)
  const cspDirectives = createCSPDirectives()
  const cspHeaderValue = cspDirectives.join('; ')

  requestHeaders.set('Content-Security-Policy', cspHeaderValue)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders
    }
  })

  response.headers.set('Content-Security-Policy', cspHeaderValue)

  return response
}

export const config = {
  matcher: [
    {
      missing: [
        {
          key: 'Next-Router-Prefetch',
          type: 'header'
        },
        {
          key: 'Purpose',
          type: 'header',
          value: 'prefetch'
        }
      ],
      source: '/((?!_next/(?:image|static)|api|favicon.ico).*)'
    }
  ]
}
