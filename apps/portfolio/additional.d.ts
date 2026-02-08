/// <reference types="mdx" />

declare module '*.svg' {
  const content: import('next/image').StaticImageData

  export default content
}

declare module '*.jpg' {
  const content: import('next/image').StaticImageData

  export default content
}

declare module '*.jpeg' {
  const content: import('next/image').StaticImageData

  export default content
}

declare module '*.png' {
  const content: import('next/image').StaticImageData

  export default content
}

declare module '*.webp' {
  const content: import('next/image').StaticImageData

  export default content
}
