import { FC } from 'react'

declare module 'gatsby-plugin-mdx' {
  type MDXRendererProps = {
    children: string
  }

  export const MDXRenderer: FC<MDXRendererProps>
}
