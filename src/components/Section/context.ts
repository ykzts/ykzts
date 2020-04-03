import { createContext, useContext } from 'react'

type Props = {
  active: boolean
  intro: boolean
}

const Context = createContext<Props>({
  active: false,
  intro: false
})

export const SectionProvider = Context.Provider

export function useSectionContext(): Props {
  const context = useContext(Context)

  return context
}
