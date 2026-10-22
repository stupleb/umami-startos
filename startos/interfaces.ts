import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  trackerHostId,
  trackerInterfaceId,
  trackerPort,
  uiHostId,
  uiInterfaceId,
  uiPort,
} from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const uiOrigin = await sdk.MultiHost.of(effects, uiHostId).bindPort(uiPort, {
    protocol: 'http',
    preferredExternalPort: 80,
  })
  const ui = sdk.createInterface(effects, {
    name: i18n('Dashboard'),
    id: uiInterfaceId,
    description: i18n(
      'The Umami dashboard, where you sign in, add websites and read their statistics',
    ),
    type: 'ui',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  const trackerOrigin = await sdk.MultiHost.of(effects, trackerHostId).bindPort(
    trackerPort,
    {
      protocol: 'http',
      preferredExternalPort: trackerPort,
    },
  )
  const tracker = sdk.createInterface(effects, {
    name: i18n('Tracker'),
    id: trackerInterfaceId,
    description: i18n(
      'Serves only the tracking script and the endpoints it reports to. Your websites’ visitors must be able to reach it.',
    ),
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  return [await uiOrigin.export([ui]), await trackerOrigin.export([tracker])]
})
