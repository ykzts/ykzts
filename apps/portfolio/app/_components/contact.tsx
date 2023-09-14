import Link from '@/components/link'
import styles from './contact.module.css'
import Section, {
  SectionContent,
  SectionFooter,
  SectionHeader,
  SectionTitle
} from './section'

export default function Contact() {
  return (
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
        <ul className={styles.list}>
          <li className={styles['list__item']}>
            <h3 className={styles['list__title']}>Email</h3>

            <a href="mailto:ykzts@desire.sh">ykzts@desire.sh</a>
          </li>
          <li className={styles.list__item}>
            <h3 className={styles['list__title']}>Blog</h3>

            <Link href="https://ykzts.blog/" rel="me" target="_blank">
              ykzts.blog
            </Link>
          </li>
          <li className={styles['list__item']}>
            <h3 className={styles['list__title']}>Elsewhere</h3>

            <ul className={styles.icons}>
              <li className={styles.icons__item}>
                <Link
                  aria-label="山岸和利のFacebookアカウント"
                  className={styles['icon-link']}
                  href="https://www.facebook.com/ykzts"
                  rel="me"
                  target="_blank"
                >
                  <svg className={styles['icon-logo']}>
                    <use xlinkHref="#facebook-logo" />
                  </svg>
                </Link>
              </li>
              <li className={styles.icons__item}>
                <Link
                  aria-label="山岸和利のGitHubアカウント"
                  className={styles['icon-link']}
                  href="https://github.com/ykzts"
                  rel="me"
                  target="_blank"
                >
                  <svg className={styles['icon-logo']}>
                    <use xlinkHref="#github-logo" />
                  </svg>
                </Link>
              </li>
              <li className={styles.icons__item}>
                <Link
                  aria-label="山岸和利のMastodonアカウント"
                  className={styles['icon-link']}
                  href="https://ykzts.technology/@ykzts"
                  rel="me"
                  target="_blank"
                >
                  <svg className={styles['icon-logo']}>
                    <use xlinkHref="#mastodon-logo" />
                  </svg>
                </Link>
              </li>
              <li className={styles.icons__item}>
                <Link
                  aria-label="山岸和利のThreadsアカウント"
                  className={styles['icon-link']}
                  href="https://www.threads.net/@ykzts"
                  rel="me"
                  target="_blank"
                >
                  <svg className={styles['icon-logo']}>
                    <use xlinkHref="#threads-logo" />
                  </svg>
                </Link>
              </li>
              <li className={styles.icons__item}>
                <Link
                  aria-label="山岸和利のXアカウント"
                  className={styles['icon-link']}
                  href="https://twitter.com/ykzts"
                  rel="me"
                  target="_blank"
                >
                  <svg className={styles['icon-logo']}>
                    <use xlinkHref="#x-logo" />
                  </svg>
                </Link>
              </li>
            </ul>
          </li>
        </ul>
      </SectionFooter>
    </Section>
  )
}
