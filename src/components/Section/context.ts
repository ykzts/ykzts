import { createContext, useContext } from 'react'

type Props = {
  active: boolean
  intro: boolean
  last: boolean
}

const Context = createContext<Props>({
  active: false,
  intro: false,
  last: false
})

export const SectionProvider = Context.Provider

export function useSectionContext(): Props {
  const context = useContext(Context)

  return context
}
