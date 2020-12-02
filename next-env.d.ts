/// <reference types="next" />
/// <reference types="next/types/global" />

type ResponsiveLoaderImage = {
  height: number
  path: string
  width: number
}

type ResponsiveLoaderOutput = {
  height: number
  images: ResponsiveLoaderImage[]
  placeholder: string
  src: string
  srcSet: string
  toString: () => string
  width: number
}

declare module '*.jpg' {
  const content: ResponsiveLoaderOutput

  export default content
}

declare module '*.jpeg' {
  const content: ResponsiveLoaderOutput

  export default content
}

declare module '*.svg' {
  const url: string

  export default url
}

declare module '*.mdx' {
  const MDXComponent: (props: Props) => JSX.Element

  export default MDXComponent
}
