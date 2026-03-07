import type { PortableTextBlock } from '@portabletext/types'

export type Profile = {
  about: PortableTextBlock[] | null
  avatar_url: string | null
  email: string | null
  fediverse_creator: string | null
  id: string
  key_visual: {
    alt_text: string | null
    artist_name: string | null
    artist_url: string | null
    attribution: string | null
    height: number | null
    id: string
    url: string
    width: number | null
  } | null
  name: string
  occupation: string | null
  profile_technologies: readonly {
    sort_order: number
    technology: {
      name: string
    } | null
  }[]
  social_links: readonly {
    service: string | null
    url: string
  }[]
  tagline: string | null
}

export type Work = {
  content: PortableTextBlock[] | null
  slug: string
  starts_at: string
  title: string
  work_technologies: readonly {
    technology: {
      name: string
    } | null
    technology_id: string
  }[]
  work_urls: readonly {
    id: string
    label: string
    sort_order: number
    url: string
  }[]
}

export type PostAuthor = {
  fediverse_creator: string | null
  id: string
  name: string
}

export type Post = {
  content: PortableTextBlock[] | null
  excerpt: string | null
  id: string
  profile: PostAuthor | null
  published_at: string | null
  slug: string
  status: string
  tags: string[] | null
  title: string
  version_date: string | null
}

export type PostSummary = {
  excerpt: string | null
  published_at: string
  slug: string
  title: string
}
