/// <reference types="mdx" />

declare module '*.svg' {
  const content: import('next/image').StaticImageData

  export default content
}
