import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const shape = z.looseObject({
  postgresPassword: z.string().optional().catch(undefined),
  appSecret: z.string().optional().catch(undefined),
  twoFactorEncryptionKey: z.string().optional().catch(undefined),
  // The admin's username as of the last password the package applied.
  adminUsername: z.string().optional().catch(undefined),
  adminPassword: z.string().optional().catch(undefined),
  // Set when the password could not reach the database; the next start applies it.
  adminPasswordPending: z.boolean().catch(false),
})

export const storeJson = FileHelper.json(
  { base: sdk.volumes.startos, subpath: './store.json' },
  shape,
)
