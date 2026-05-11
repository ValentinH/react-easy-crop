import type { SidebarsConfig } from '@docusaurus/plugin-content-docs'

const sidebars: SidebarsConfig = {
  docs: [
    'getting-started',
    'styling',
    'props',
    'callbacks',
    'advanced',
    'known-issues',
    {
      type: 'category',
      label: 'Examples',
      items: [
        'examples/basic',
        'examples/output',
        'examples/upload',
        'examples/round',
        'examples/video',
        'examples/restore',
      ],
    },
  ],
}

export default sidebars
