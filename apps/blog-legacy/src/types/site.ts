export interface SiteMetadata {
  description: string
  image: string
  siteUrl: string
  title: string
}

export default interface Site {
  siteMetadata: SiteMetadata
}
