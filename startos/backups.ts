import { storeJson } from './fileModels/store.json'
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
      if (!password) throw new Error('No postgresPassword found in store.json')
      return password
    },
  }).addVolume('startos'),
)
