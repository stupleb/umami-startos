export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting Umami': 0,
  'Generated secrets are missing from store.json': 1,
  'No admin password has been set': 2,
  'The Umami admin account no longer exists': 3,
  Dashboard: 4,
  'The dashboard is ready': 5,
  'The dashboard is not ready': 6,
  Tracker: 7,
  'The tracker is ready': 8,
  'The tracker is not ready': 9,

  // interfaces.ts
  'The Umami dashboard, where you sign in, add websites and read their statistics': 10,
  'Serves only the tracking script and the endpoints it reports to. Your websites’ visitors must be able to reach it.': 11,

  // init/watchAdminPassword.ts
  'Set the admin password before starting Umami': 12,

  // actions/setAdminPassword.ts
  'Set Admin Password': 13,
  'Generate a new random password for the Umami admin account and show it. Replaces any existing password.': 14,
  'Replaces the current admin password.': 15,
  'The package has not finished installing': 16,
  'Admin Login': 17,
  'The new password is active. Sign in to Umami with it.': 18,
  'Umami applies this password when it next starts. Sign in with it once it is running.': 19,
  Username: 20,
  Password: 21,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
