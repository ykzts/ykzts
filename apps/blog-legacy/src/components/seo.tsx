import { graphql, useStaticQuery } from 'gatsby'
import React, { FC, ReactElement } from 'react'
import { Helmet } from 'react-helmet'
import Site from '../types/site'

interface Props {
  description?: string
  image?: string
  path: string
  title: string
  type?: 'article' | 'website'
}

const SEO: FC<Props> = ({
  description,
  image,
  path = '/',
  title,
  type = 'website'
}): ReactElement => {
  const { site } = useStaticQuery<{ site: Site }>(
    graphql`
      query {
        site {
          siteMetadata {
            image
            description
            siteUrl
            title
          }
        }
      }
    `
  )

  const canonicalUrl = `${site.siteMetadata.siteUrl}${path}`
  const metaDescription = description || site.siteMetadata.description
  const imageUrl = `${site.siteMetadata.siteUrl}${image ||
    site.siteMetadata.image}`

  return (
    <Helmet defer={false}>
      <title>{title}</title>

      <meta content={metaDescription} name="description" />
      <link href={canonicalUrl} rel="canonical" />

      <meta content={metaDescription} property="og:description" />
      <meta content={imageUrl} name="og:image" />
      {title && (
        <meta content={site.siteMetadata.title} property="og:site_name" />
      )}
      <meta
        content={title ? title : site.siteMetadata.title}
        property="og:title"
      />
      <meta content={type} property="og:type" />
      <meta content={canonicalUrl} property="og:url" />

      <meta content="summary_large_image" name="twitter:card" />
      <meta content={description} name="twitter:description" />
      <meta content={imageUrl} name="twitter:image" />
      <meta
        content={
          title
            ? `${title} | ${site.siteMetadata.title}`
            : site.siteMetadata.title
        }
        name="twitter:title"
      />
    </Helmet>
  )
}

export default SEO
