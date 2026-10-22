import { utils } from '@start9labs/start-sdk'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'
import { getRandomPassword } from '../utils'

export const seedFiles = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') {
    await storeJson.merge(effects, {})
    return
  }

  await storeJson.merge(effects, {
    postgresPassword: getRandomPassword(),
    appSecret: utils.getDefaultString({ charset: 'a-z,A-Z,0-9', len: 64 }),
    twoFactorEncryptionKey: utils.getDefaultString({
      charset: 'a-f,0-9',
      len: 64,
    }),
  })
})
