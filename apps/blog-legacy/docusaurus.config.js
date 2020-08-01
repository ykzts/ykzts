const title = 'ykzts.blog'
const description = 'ソフトウェア開発者 山岸和利のブログ'

/**
 * @type {import('@docusaurus/types').DocusaurusConfig}
 */
module.exports = {
  baseUrl: '/',
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        blog: {
          path: 'blog',
          feedOptions: {
            description,
            type: 'atom'
          },
          postsPerPage: 5,
          routeBasePath: '/'
        },
        sitemap: {}
      }
    ]
  ],
  tagline: description,
  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      disableSwitch: true,
      respectPrefersColorScheme: false
    },
    footer: {
      copyright: 'Copyright © 2012-2020 Yamagishi Kazutoshi',
      links: [
        {
          items: [
            {
              href: 'https://ykzts.com/',
              label: '運営者情報'
            },
            {
              label: 'プライバシーポリシー',
              to: 'privacy'
            }
          ],
          title: 'Information'
        },
        {
          items: [
            {
              href: 'https://github.com/ykzts',
              label: 'GitHub'
            },
            {
              href: 'https://ykzts.technology/@ykzts',
              label: 'Mastodon'
            },
            {
              href: 'https://twitter.com/ykzts',
              label: 'Twitter'
            },
            {
              href: 'https://www.facebook.com/ykzts',
              label: 'Facebook'
            }
          ],
          title: 'Social'
        },
        {
          items: [
            {
              href: 'https://www.patreon.com/ykzts',
              label: 'Patreon'
            }
          ],
          title: 'Donation'
        }
      ],
      style: 'dark'
    },
    gtag: {
      trackingID: 'UA-97395750-2'
    },
    image: 'img/main-visual.png',
    navbar: {
      hideOnScroll: true,
      title
    },
    prism: {
      theme: require('prism-react-renderer/themes/github')
    }
  },
  title,
  url: 'https://ykzts.blog',
  favicon: 'img/favicon.png'
}
