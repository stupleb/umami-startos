import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { pgdataSubpath, postgresDb, postgresPath, postgresUser } from './utils'

export const { createBackup, restoreInit } = sdk.setupBackups(async () =>
  sdk.Backups.withPgDump({
    imageId: 'postgres',
    dbVolume: 'db',
    mountpoint: postgresPath,
    pgdataPath: pgdataSubpath,
    database: postgresDb,
    user: postgresUser,
    password: async () => {
      const password = await storeJson.read((s) => s.postgresPassword).once()
      if (!password)
        throw new Error(i18n('Generated secrets are missing from store.json'))
      return password
    },
  }).addVolume('startos'),
)
