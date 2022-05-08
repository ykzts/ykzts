declare module '*.mdx' {
  const MDXComponent: (props: Props) => JSX.Element

  export default MDXComponent
}

declare module '*.svg' {
  const content: import('next/image').StaticImageData

  export default content
}
