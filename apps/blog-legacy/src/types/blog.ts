export interface BlogContent {
  body: string
  excerpt: string
  fields: {
    slug: string
  }
  frontmatter: {
    date: string
    title: string
  }
  html: string
}
