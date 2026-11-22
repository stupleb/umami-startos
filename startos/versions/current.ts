import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.5.0:1',
  releaseNotes: {
    en_US:
      'Other services on the same server can now send visits to Umami over an internal port. Updated nginx to 1.30.7 and PostgreSQL to 18.7.',
    es_ES:
      'Otros servicios del mismo servidor ahora pueden enviar visitas a Umami a través de un puerto interno. nginx actualizado a 1.30.7 y PostgreSQL a 18.7.',
    de_DE:
      'Andere Dienste auf demselben Server können Besuche jetzt über einen internen Port an Umami senden. nginx auf 1.30.7 und PostgreSQL auf 18.7 aktualisiert.',
    pl_PL:
      'Inne usługi na tym samym serwerze mogą teraz wysyłać wizyty do Umami przez port wewnętrzny. Zaktualizowano nginx do 1.30.7 i PostgreSQL do 18.7.',
    fr_FR:
      'Les autres services du même serveur peuvent désormais envoyer des visites à Umami par un port interne. nginx mis à jour vers 1.30.7 et PostgreSQL vers 18.7.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
