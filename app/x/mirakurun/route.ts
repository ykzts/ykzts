import { NextResponse } from 'next/server'

export const runtime = 'edge'

export function GET() {
  const body = `<!doctype html>
<meta charset="UTF-8">
<meta content="ykzts.com/x/mirakurun git https://github.com/ykzts/go-mirakurun.git" name="go-import">
<meta content="ykzts.com/x/mirakurun https://github.com/ykzts/go-mirakurun https://github.com/ykzts/go-mirakurun/tree/main{/dir} https://github.com/ykzts/go-mirakurun/blob/main{/dir}/{file}#L{line}" name="go-source">
<meta content="0; url=https://pkg.go.dev/ykzts.com/x/mirakurun" http-equiv="refresh">
<title>ykzts.com/x/mirakurun</title>
<p>Redirect to <a href="https://pkg.go.dev/ykzts.com/x/mirakurun">pkg.go.dev</a>.</p>
`

  return new NextResponse(body, {
    headers: {
      'Cache-Control': 'max-age=3600',
      'Content-Type': 'text/html; charset=utf-8'
    },
    status: 200,
    statusText: 'OK'
  })
}
