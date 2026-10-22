import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  assetsPath,
  dbMounts,
  pgIsReady,
  pgdataSubpath,
  postgresDb,
  postgresPath,
  postgresUser,
  tolerant,
  trackerPort,
  uiPort,
  umamiEnv,
  writeAdminPassword,
} from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Umami'))

  const store = await storeJson
    .read((s) => ({
      postgresPassword: s.postgresPassword,
      appSecret: s.appSecret,
      twoFactorEncryptionKey: s.twoFactorEncryptionKey,
    }))
    .const(effects)
  if (
    !store?.postgresPassword ||
    !store.appSecret ||
    !store.twoFactorEncryptionKey
  ) {
    throw new Error(i18n('Generated secrets are missing from store.json'))
  }
  const { postgresPassword, appSecret, twoFactorEncryptionKey } = store

  // Read once: Set Admin Password applies a password itself while the database is up.
  const admin = await storeJson
    .read((s) => ({
      password: s.adminPassword,
      pending: s.adminPasswordPending,
    }))
    .once()
  if (!admin?.password) {
    throw new Error(i18n('No admin password has been set'))
  }
  const { password: adminPassword, pending } = admin

  const env = umamiEnv({ postgresPassword, appSecret, twoFactorEncryptionKey })

  const postgresSub = sdk.SubContainer.of(
    effects,
    { imageId: 'postgres' },
    dbMounts,
    'postgres',
  )
  const umamiSub = sdk.SubContainer.of(
    effects,
    { imageId: 'umami' },
    null,
    'umami',
  )
  const nginxSub = sdk.SubContainer.of(
    effects,
    { imageId: 'nginx' },
    sdk.Mounts.of().mountAssets({ subpath: null, mountpoint: assetsPath }),
    'nginx',
  )

  return sdk.Daemons.of(effects)
    .addOneshot('pg-recover', {
      subcontainer: postgresSub,
      exec: {
        // After an unclean stop the PID in postmaster.pid is often alive in the new namespace, and postgres refuses to start.
        command: ['rm', '-f', `${postgresPath}${pgdataSubpath}/postmaster.pid`],
        user: 'root',
      },
      requires: [],
    })
    .addDaemon('postgres', {
      subcontainer: postgresSub,
      exec: {
        command: sdk.useEntrypoint(['--listen_addresses=127.0.0.1']),
        env: {
          POSTGRES_USER: postgresUser,
          POSTGRES_DB: postgresDb,
          POSTGRES_PASSWORD: postgresPassword,
        },
      },
      ready: {
        display: null,
        fn: async () =>
          (await tolerant(() => pgIsReady(postgresSub, 15)))
            ? { result: 'success', message: null }
            : { result: 'starting', message: null },
      },
      requires: ['pg-recover'],
    })
    .addOneshot('migrate', {
      subcontainer: umamiSub,
      exec: {
        command: [
          'sh',
          '-c',
          'PATH="$PWD/node_modules/.bin:$PATH" exec node scripts/check-db.js',
        ],
        cwd: '/app',
        env,
      },
      requires: ['postgres'],
    })
    .addOneshot('admin-password', {
      subcontainer: postgresSub,
      exec: {
        fn: async () => {
          if (!pending) return null
          const username = await writeAdminPassword(
            postgresSub,
            postgresPassword,
            adminPassword,
          )
          // Stays pending rather than failing the start; the action reports it while Umami runs.
          if (!username) {
            console.error(i18n('The Umami admin account no longer exists'))
            return null
          }
          if (
            (await storeJson.read((s) => s.adminPassword).once()) ===
            adminPassword
          ) {
            await storeJson.merge(effects, {
              adminUsername: username,
              adminPasswordPending: false,
            })
          }
          return null
        },
      },
      requires: ['migrate'],
    })
    .addDaemon('umami', {
      subcontainer: umamiSub,
      exec: {
        command: sdk.useEntrypoint(),
        cwd: '/app',
        env: { ...env, SKIP_DB_CHECK: '1' },
      },
      ready: {
        display: i18n('Dashboard'),
        gracePeriod: 60_000,
        fn: async () =>
          (await tolerant(() =>
            fetch(`http://127.0.0.1:${uiPort}/api/heartbeat`, {
              signal: AbortSignal.timeout(10_000),
            }).then(
              (res) => res.ok,
              () => false,
            ),
          ))
            ? {
                result: 'success',
                message: i18n('The dashboard is ready'),
              }
            : {
                result: 'starting',
                message: i18n('The dashboard is not ready'),
              },
      },
      requires: ['admin-password'],
    })
    .addDaemon('tracker', {
      subcontainer: nginxSub,
      exec: {
        command: [
          'nginx',
          '-c',
          `${assetsPath}/nginx.conf`,
          '-g',
          'daemon off;',
        ],
      },
      ready: {
        display: i18n('Tracker'),
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, trackerPort, {
            successMessage: i18n('The tracker is ready'),
            errorMessage: i18n('The tracker is not ready'),
          }),
      },
      requires: ['umami'],
    })
})
