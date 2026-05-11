import type { Config } from '@docusaurus/types'
import type * as Preset from '@docusaurus/preset-classic'
import { themes as prismThemes } from 'prism-react-renderer'

const config: Config = {
  title: 'react-easy-crop',
  tagline: 'A React component to crop images and videos with easy interactions',
  url: 'https://ValentinH.github.io',
  baseUrl: '/react-easy-crop/',
  organizationName: 'ValentinH',
  projectName: 'react-easy-crop',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: 'docs',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/ValentinH/react-easy-crop/tree/main/docs/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'react-easy-crop',
      items: [
        { to: '/docs/getting-started', label: 'Docs', position: 'left' },
        { to: '/docs/examples/basic', label: 'Examples', position: 'left' },
        {
          href: 'https://github.com/ValentinH/react-easy-crop',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Getting started', to: '/docs/getting-started' },
            { label: 'Props', to: '/docs/props' },
            { label: 'Examples', to: '/docs/examples/basic' },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/ValentinH/react-easy-crop',
            },
            {
              label: 'Issues',
              href: 'https://github.com/ValentinH/react-easy-crop/issues',
            },
          ],
        },
      ],
      copyright: `Copyright ${new Date().getFullYear()} Valentin Hervieu.`,
    },
    colorMode: {
      respectPrefersColorScheme: true,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['typescript', 'tsx'],
    },
  } satisfies Preset.ThemeConfig,
}

export default config
