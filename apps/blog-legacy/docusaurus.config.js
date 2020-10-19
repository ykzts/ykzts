const title = 'ykzts.blog'
const description = 'ソフトウェア開発者 山岸和利のブログ'
const copyright = 'Copyright © 2012-2020 Yamagishi Kazutoshi'

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
          blogDescription: description,
          editUrl: 'https://github.com/ykzts/ykzts.blog/edit/main/',
          showReadingTime: false,
          path: 'blog',
          feedOptions: {
            copyright,
            description,
            type: 'atom'
          },
          postsPerPage: 5,
          routeBasePath: '/'
        },
        docs: {},
        sitemap: {}
      }
    ]
  ],
  tagline: description,
  themeConfig: {
    algolia: {
      appId: 'DTXYNURL2W',
      apiKey: 'ce19efe9049e80eabf802d921a314fc9',
      indexName: 'posts'
    },
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true
    },
    footer: {
      copyright,
      links: [
        {
          items: [
            {
              href: 'https://ykzts.com/',
              label: 'Yamagishi Kazutoshi'
            },
            {
              label: 'Privacy Policy',
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
    metadatas: [
      {
        content: 'nocomment',
        name: 'Hatena::Bookmark'
      }
    ],
    navbar: {
      hideOnScroll: true,
      logo: {
        src: 'img/pencil.svg',
        srcDark: 'img/pencil_dark.svg'
      },
      title
    },
    prism: {
      darkTheme: require('prism-react-renderer/themes/dracula'),
      theme: require('prism-react-renderer/themes/github')
    }
  },
  title,
  url: 'https://ykzts.blog',
  favicon: 'img/favicon.png'
}
