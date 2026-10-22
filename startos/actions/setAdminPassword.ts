import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { getRandomPassword, pgIsReady, writeAdminPassword } from '../utils'

export const setAdminPassword = sdk.Action.withoutInput(
  'set-admin-password',

  async ({ effects }) => ({
    name: i18n('Set Admin Password'),
    description: i18n(
      'Generate a new random password for the Umami admin account and show it. Replaces any existing password.',
    ),
    warning: (await storeJson.read((s) => s.adminPassword).const(effects))
      ? i18n('Replaces the current admin password.')
      : null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  async ({ effects }) => {
    const store = await storeJson.read().once()
    const postgresPassword = store?.postgresPassword
    if (!store || !postgresPassword) {
      throw new Error(i18n('The package has not finished installing'))
    }
    const password = getRandomPassword()
    let username = store.adminUsername ?? 'admin'
    let applied = false

    if (store.adminPassword) {
      await sdk.SubContainer.withTemp(
        effects,
        { imageId: 'postgres' },
        sdk.Mounts.of(),
        'set-admin-password',
        async (sub) => {
          if (!(await pgIsReady(sub, 3))) return
          const live = await writeAdminPassword(sub, postgresPassword, password)
          if (!live) {
            throw new Error(i18n('The Umami admin account no longer exists'))
          }
          username = live
          applied = true
        },
      )
    }

    await storeJson.merge(effects, {
      adminUsername: username,
      adminPassword: password,
      adminPasswordPending: !applied,
    })

    return {
      version: '1',
      title: i18n('Admin Login'),
      message: applied
        ? i18n('The new password is active. Sign in to Umami with it.')
        : i18n(
            'Umami applies this password when it next starts. Sign in with it once it is running.',
          ),
      result: {
        type: 'group',
        value: [
          {
            type: 'single',
            name: i18n('Username'),
            description: null,
            value: username,
            masked: false,
            copyable: true,
            qr: false,
            launchable: false,
          },
          {
            type: 'single',
            name: i18n('Password'),
            description: null,
            value: password,
            masked: true,
            copyable: true,
            qr: false,
            launchable: false,
          },
        ],
      },
    }
  },
)
