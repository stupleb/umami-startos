import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'umami',
  title: 'Umami',
  license: 'MIT',
  packageRepo: 'https://github.com/stupleb/umami-startos',
  upstreamRepo: 'https://github.com/umami-software/umami',
  marketingUrl: 'https://umami.is',
  donationUrl: null,
  description: { short, long },
  volumes: ['startos', 'db'],
  images: {
    umami: {
      source: { dockerTag: 'ghcr.io/umami-software/umami:3.4.1' },
      arch: ['x86_64', 'aarch64'],
    },
    postgres: {
      source: { dockerTag: 'postgres:18.6-alpine' },
      arch: ['x86_64', 'aarch64'],
    },
    nginx: {
      source: { dockerTag: 'nginx:1.30.6-alpine' },
      arch: ['x86_64', 'aarch64'],
    },
  },
})
