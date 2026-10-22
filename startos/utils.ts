import { SubContainer, utils } from '@start9labs/start-sdk'
import { hashSync } from 'bcryptjs'
import { manifest } from './manifest'
import { sdk } from './sdk'

export const uiPort = 3000
export const trackerPort = 3001

export const uiHostId = 'main'
export const uiInterfaceId = 'ui'
export const trackerHostId = 'tracker'
export const trackerInterfaceId = 'tracker'

export const postgresPath = '/var/lib/postgresql'
// The postgres 18 image's default PGDATA, relative to postgresPath.
export const pgdataSubpath = '/18/docker'
export const postgresUser = 'umami'
export const postgresDb = 'umami'

export const assetsPath = '/etc/startos'

// Umami's first migration seeds the admin account under this id.
export const adminUserId = '41e2b680-648e-4b09-bcd7-3e2b10c06264'

export const getRandomPassword = () =>
  utils.getDefaultString({ charset: 'a-z,A-Z,0-9', len: 32 })

export const dbMounts = sdk.Mounts.of().mountVolume({
  volumeId: 'db',
  subpath: null,
  mountpoint: postgresPath,
  readonly: false,
})

export const umamiEnv = (secrets: {
  postgresPassword: string
  appSecret: string
  twoFactorEncryptionKey: string
}) => ({
  DATABASE_URL: `postgresql://${postgresUser}:${secrets.postgresPassword}@127.0.0.1:5432/${postgresDb}`,
  APP_SECRET: secrets.appSecret,
  TWO_FACTOR_ENCRYPTION_KEY: secrets.twoFactorEncryptionKey,
  HOSTNAME: '0.0.0.0',
  PORT: String(uiPort),
  // StartOS replaces any client-sent X-Forwarded-For; the other headers Umami reads are spoofable.
  CLIENT_IP_HEADER: 'x-forwarded-for',
  DISABLE_TELEMETRY: '1',
  DISABLE_UPDATES: '1',
  PRIVATE_MODE: '1',
})

type PostgresSub = SubContainer<typeof manifest>

const psql = (sql: string) => [
  'psql',
  '-h',
  '127.0.0.1',
  '-U',
  postgresUser,
  '-d',
  postgresDb,
  '-v',
  'ON_ERROR_STOP=1',
  '-qtA',
  '-c',
  sql,
]

// One failed check stops every dependent (start-technologies#3803), so fail only after three misses in a row.
export const tolerant = async (probe: () => Promise<boolean>) => {
  for (let attempt = 0; attempt < 3; attempt++) {
    if (await probe()) return true
    await new Promise((resolve) => setTimeout(resolve, 2_000))
  }
  return false
}

export const pgIsReady = async (sub: PostgresSub, timeoutSeconds: number) =>
  (
    await sub.exec(
      [
        'pg_isready',
        '-q',
        '-h',
        '127.0.0.1',
        '-U',
        postgresUser,
        '-t',
        String(timeoutSeconds),
      ],
      { timeout: (timeoutSeconds + 5) * 1000 },
    )
  ).exitCode === 0

// Returns the admin's username, or null when that account no longer exists.
export async function writeAdminPassword(
  sub: PostgresSub,
  postgresPassword: string,
  password: string,
): Promise<string | null> {
  const hash = hashSync(password, 10)
  const res = await sub.execFail(
    psql(
      `UPDATE "user" SET password = '${hash}', updated_at = now() WHERE user_id = '${adminUserId}' AND deleted_at IS NULL RETURNING username`,
    ),
    { env: { PGPASSWORD: postgresPassword }, timeout: 30_000 },
  )
  return res.stdout.toString().trim() || null
}
