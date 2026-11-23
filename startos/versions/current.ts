import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.5.0:1',
  releaseNotes: {
    en_US:
      'Other services on the same server can now send visits to Umami over an internal port.',
    es_ES:
      'Otros servicios del mismo servidor ahora pueden enviar visitas a Umami a través de un puerto interno.',
    de_DE:
      'Andere Dienste auf demselben Server können Besuche jetzt über einen internen Port an Umami senden.',
    pl_PL:
      'Inne usługi na tym samym serwerze mogą teraz wysyłać wizyty do Umami przez port wewnętrzny.',
    fr_FR:
      'Les autres services du même serveur peuvent désormais envoyer des visites à Umami par un port interne.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
