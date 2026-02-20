import Html from './_components/html'

const AVAILABLE_PACKAGES = [
  {
    githubBaseURL: 'https://github.com/ykzts/go-mirakurun',
    path: 'mirakurun'
  }
]

export async function GET(
  _request: Request,
  { params }: RouteContext<'/x/[...paths]'>
) {
  const { paths } = await params
  const path = paths.join('/')
  const pkg = AVAILABLE_PACKAGES.find((pkg) => pkg.path === path)

  if (!pkg) {
    return new Response('Not Found', { status: 404 })
  }

  const { renderToReadableStream } = await import('react-dom/server')
  const stream = await renderToReadableStream(
    <Html
      githubBaseURL={pkg.githubBaseURL}
      packageName={`${process.env.NEXT_PUBLIC_SITE_NAME ?? 'example.com'}/x/${pkg.path}`}
    />
  )

  return new Response(stream, {
    headers: {
      'Cache-Control': 'max-age=3600',
      'Content-Type': 'text/html; charset=utf-8'
    },
    status: 200,
    statusText: 'OK'
  })
}
