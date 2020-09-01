/// <reference types="next" />
/// <reference types="next/types/global" />

declare module '*.jpg' {
  export const palette: string[]
  export const preSrc: string
  export const src: string
}

declare module '*.svg' {
  const url: string

  export default url
}

declare module '*.mdx' {
  const MDXComponent: (props: Props) => JSX.Element

  export default MDXComponent
}
