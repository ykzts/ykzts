import { themes as prismThemes } from 'prism-react-renderer'
import type * as Preset from '@docusaurus/preset-classic'
import type { Config } from '@docusaurus/types'

const title = 'ykzts.blog'
const description = 'ソフトウェア開発者 山岸和利のブログ'
const copyright = 'Copyright © 2012-2024 Yamagishi Kazutoshi'

const localeConfigs = {
  ja: {
    label: '日本語'
  }
}

const config: Config = {
  baseUrl: '/',
  favicon: 'img/favicon.png',
  future: {
    experimental_faster: true,
    v4: true
  },
  i18n: {
    defaultLocale: 'ja',
    localeConfigs,
    locales: Object.keys(localeConfigs)
  },
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  organizationName: 'ykzts',
  plugins: ['vercel-analytics'],
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        blog: {
          blogDescription: description,
          blogSidebarCount: 0,
          blogSidebarTitle: '最近の投稿',
          editUrl: 'https://github.com/ykzts/ykzts/edit/main/apps/blog-legacy/',
          feedOptions: {
            copyright,
            description,
            title,
            type: 'atom',
            xslt: true
          },
          path: 'blog',
          postsPerPage: 5,
          routeBasePath: '/',
          showLastUpdateTime: true,
          showReadingTime: false
        },
        docs: false,
        gtag: {
          trackingID: 'UA-97395750-2'
        },
        sitemap: {}
      } satisfies Preset.Options
    ]
  ],
  projectName: 'ykzts.blog',
  tagline: description,
  themeConfig: {
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
          label: 'Privacy Policy',
          to: 'privacy'
        },
        {
          href: 'https://github.com/sponsors/ykzts',
          label: 'GitHub Sponsors'
        },
        {
          href: 'https://www.patreon.com/ykzts',
          label: 'Patreon'
        }
      ],
      style: 'dark'
    },
    // image: 'img/main-visual.png',
    metadata: [
      {
        content: 'nocomment',
        name: 'Hatena::Bookmark'
      },
      {
        content: 'ykzts@ykzts.technology',
        name: 'fediverse:creator'
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
      darkTheme: prismThemes.dracula,
      theme: prismThemes.github
    }
  } satisfies Preset.ThemeConfig,
  title,
  url: 'https://ykzts.blog'
}

export default config
