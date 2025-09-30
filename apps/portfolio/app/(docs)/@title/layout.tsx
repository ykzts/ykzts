import type { ReactNode } from 'react'

export default function Title({ children }: { children: ReactNode }) {
  return <h1 className="text-3xl leading-tight">{children}</h1>
}
