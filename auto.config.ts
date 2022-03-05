import { AutoRc } from 'auto'

import { INpmConfig } from '@auto-it/npm'

const npmOptions: INpmConfig = {
  publishFolder: 'dist',
}

export default function rc(): AutoRc {
  return {
    shipit: {
      noChangelog: true,
    },
    plugins: [['npm', npmOptions], 'released', 'first-time-contributor', 'all-contributors'],
    author: 'Valentin Hervieu <valentin@hervi.eu>',
  }
}
