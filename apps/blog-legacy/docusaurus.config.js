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
    disableDarkMode: true,
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
