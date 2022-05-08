import { type FC, type ReactNode } from 'react'
import Section, {
  SectionContent,
  SectionHeader,
  SectionTitle
} from '../Section'

type Props = {
  children: ReactNode
  last?: boolean
  title?: string
}

const Part: FC<Props> = ({ children, title }) => (
  <Section>
    <SectionHeader>
      <SectionTitle>{title}</SectionTitle>
    </SectionHeader>

    <SectionContent>{children}</SectionContent>
  </Section>
)

export default Part
