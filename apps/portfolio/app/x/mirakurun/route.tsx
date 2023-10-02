import { type NextRequest } from 'next/server'

export const runtime = 'edge'

function Html({
  githubBaseURL,
  packageName,
  repositoryURL = `${githubBaseURL}.git`
}: {
  githubBaseURL: string
  packageName: string
  repositoryURL?: string
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta
          content={`${packageName} git ${repositoryURL}`}
          name="go-import"
        />
        <meta
          content={[
            packageName,
            githubBaseURL,
            `${githubBaseURL}/tree/main{/dir}`,
            `${githubBaseURL}/blob/main{/dir}/{file}#L{line}`
          ].join(' ')}
          name="go-source"
        />
        <meta
          content={`0; url=https://pkg.go.dev/${packageName}`}
          httpEquiv="refresh"
        />
        <title>{packageName}</title>
      </head>
      <body>
        <p>
          Redirect to{' '}
          <a href={`https://pkg.go.dev/${packageName}`}>pkg.go.dev</a>.
        </p>
      </body>
    </html>
  )
}

export async function GET(req: NextRequest) {
  const { renderToReadableStream } = await import('react-dom/server')
  const stream = await renderToReadableStream(
    <Html
      githubBaseURL="https://github.com/ykzts/go-mirakurun"
      packageName="ykzts.com/x/mirakurun"
    />,
    {
      signal: req.signal
    }
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
