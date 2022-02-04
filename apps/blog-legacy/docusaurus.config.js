// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const darkCodeTheme = require('prism-react-renderer/themes/dracula')
const lightCodeTheme = require('prism-react-renderer/themes/github')

const title = 'ykzts.blog'
const description = 'ソフトウェア開発者 山岸和利のブログ'
const copyright = 'Copyright © 2012-2021 Yamagishi Kazutoshi'

const localeConfigs = {
  ja: {
    label: '日本語'
  }
}

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  baseUrl: '/',
  favicon: 'img/favicon.png',
  i18n: {
    defaultLocale: 'ja',
    localeConfigs,
    locales: Object.keys(localeConfigs)
  },
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  organizationName: 'ykzts',
  presets: [
    [
      '@docusaurus/preset-classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        blog: {
          blogDescription: description,
          blogSidebarCount: 0,
          blogSidebarTitle: '最近の投稿',
          editUrl: 'https://github.com/ykzts/ykzts.blog/edit/main/',
          feedOptions: {
            copyright,
            description,
            type: 'atom'
          },
          path: 'blog',
          postsPerPage: 5,
          routeBasePath: '/',
          showReadingTime: false
        },
        docs: false,
        gtag: {
          trackingID: 'UA-97395750-2'
        },
        sitemap: {}
      })
    ]
  ],
  projectName: 'ykzts.blog',
  tagline: description,
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      algolia: {
        apiKey: 'ce19efe9049e80eabf802d921a314fc9',
        appId: 'DTXYNURL2W',
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
                label: 'Author'
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
                href: 'https://github.com/sponsors/ykzts',
                label: 'GitHub Sponsors'
              },
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
      image: 'img/main-visual.png',
      metadata: [
        {
          content: 'nocomment',
          name: 'Hatena::Bookmark'
        }
      ],
      navbar: {
        hideOnScroll: true,
        items: [
          {
            label: 'Archive',
            position: 'right',
            to: 'archive'
          }
        ],
        logo: {
          src: 'img/pencil.svg',
          srcDark: 'img/pencil_dark.svg'
        },
        title
      },
      prism: {
        darkTheme: darkCodeTheme,
        theme: lightCodeTheme
      }
    }),
  title,
  url: 'https://ykzts.blog'
}
