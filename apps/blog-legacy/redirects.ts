export type LegacyRedirectTuple = [source: string, destination: string]

export const legacyRedirects: LegacyRedirectTuple[] = [
  ['/([Aa]uthor|about)', '/'],
  ['/(feed/?|index.xml|rss)', '/blog/atom.xml'],
  ['/post/20308520977', '/blog/2012/04/01/custom-http-header-on-nginx'],
  ['/post/25108537330', '/blog/2012/06/14/nodex-xmlhttprequest'],
  ['/post/25378068289', '/blog/2012/06/18/xmlhttprequest-response-type'],
  ['/post/25705564207', '/blog/2012/06/23/register-node-xmlhttprequest-to-npm'],
  ['/post/29666019536', '/blog/2012/08/18/blobbuilder-interface-is-deprecated'],
  [
    '/post/32797731246',
    '/blog/2012/10/03/relationship-between-html5-and-americans'
  ],
  ['/post/33501908970', '/blog/2012/10/13/debug-console-for-ios-safari'],
  ['/post/42110686577', '/blog/2013/02/02/spdy-is-not-silver-bullet'],
  ['/post/57553849556', '/blog/2013/08/06/javascript-is-not-slow'],
  ['/post/58006314813', '/blog/2013/08/11/w3c-xmlhttprequest'],
  ['/post/58263403686', '/blog/2013/08/14/do-not-use-html-js'],
  ['/post/58555491127', '/blog/2013/08/18/css-animation'],
  ['/post/60856466146', '/blog/2013/09/10/thoughts-on-javascript'],
  ['/post/64423815085', '/blog/2013/10/18/get-along-with-oss'],
  ['/post/70207582523', '/blog/2013/12/16/function-of-coffeescript'],
  ['/post/100149511913', '/blog/2014/10/16/goodbye-heartrails'],
  ['/post/118946779168', '/blog/2015/05/14/join-to-pixiv'],
  ['/post/132335401043', '/blog/2015/11/01/join-to-animatelab'],
  ['/post/143689622893', '/blog/2016/05/01/github-account-for-recruitment'],
  ['/post/144696559108', '/blog/2016/05/21/redirect-to-hostname-without-www'],
  ['/post/147704551073', '/blog/2016/07/20/goodbye-fetch-api'],
  ['/:path*', '/blog/:path*']
]

export function createLegacyRedirects(
  baseUrl: string,
  redirects: LegacyRedirectTuple[] = legacyRedirects
) {
  const normalizedBaseUrl = baseUrl.endsWith('/')
    ? baseUrl.slice(0, -1)
    : baseUrl

  return redirects.map(([source, destination]) => ({
    destination: `${normalizedBaseUrl}${destination}`,
    source,
    statusCode: 301 as const
  }))
}
