export interface BlogContent {
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
