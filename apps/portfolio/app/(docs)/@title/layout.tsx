import type { ReactNode } from 'react'

export default function Title({ children }: { children: ReactNode }) {
  return <h1 className="text-[2rem] leading-none">{children}</h1>
}
