import React, { FC } from 'react'
import ExternalLink from '../ExternalLink'
import List, { ListItem, ListTitle } from '../List'
import Section, {
  SectionContent,
  SectionFooter,
  SectionHeader,
  SectionTitle
} from '../Section'
import SocialIcons from '../SocialIcons'

const Contact: FC = () => (
  <>
    <Section>
      <SectionHeader>
        <SectionTitle>Get in touch</SectionTitle>
      </SectionHeader>

      <SectionContent>
        <p>
          山岸和利に対するお問い合わせや依頼はメールからお願いします。スケジュール次第ではありますが有期もしくは案件単位での作業依頼や技術相談でしたら有償で承ります。
        </p>
        <p>
          ただし無償もしくは報酬が不明瞭な依頼に関してはお応えできかねます。また依頼主が不明であるスカウトメールやオファーメールにつきましてはご返答いたしかねますのであらかじめご容赦ください。
        </p>
      </SectionContent>

      <SectionFooter>
        <List>
          <ListItem>
            <ListTitle>Email</ListTitle>

            <a href="mailto:ykzts@desire.sh">ykzts@desire.sh</a>
          </ListItem>
          <ListItem>
            <ListTitle>Blog</ListTitle>

            <ExternalLink href="https://ykzts.blog/">ykzts.blog</ExternalLink>
          </ListItem>
          <ListItem>
            <ListTitle>Elsewhere</ListTitle>

            <SocialIcons />
          </ListItem>
        </List>
      </SectionFooter>
    </Section>
  </>
)

export default Contact
