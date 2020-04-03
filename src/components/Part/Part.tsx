import React, { FC } from 'react'
import Section, {
  SectionContent,
  SectionHeader,
  SectionTitle
} from '../Section'

type Props = {
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
