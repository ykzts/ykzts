/// <reference types="next" />
/// <reference types="next/types/global" />

declare module '*.mdx' {
  const MDXComponent: (props: Props) => JSX.Element

  export default MDXComponent
}
