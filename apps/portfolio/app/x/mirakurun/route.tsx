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

export async function GET() {
  const { renderToStaticMarkup } = await import('react-dom/server')
  const html = renderToStaticMarkup(
    <Html
      githubBaseURL="https://github.com/ykzts/go-mirakurun"
      packageName="ykzts.com/x/mirakurun"
    />
  )

  return new Response(html, {
    headers: {
      'Cache-Control': 'max-age=3600',
      'Content-Type': 'text/html; charset=utf-8'
    },
    status: 200,
    statusText: 'OK'
  })
}
