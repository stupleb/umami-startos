import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.5.0:0',
  releaseNotes: {
    en_US:
      'Updated Umami to 3.5.0, which adds browser error tracking. Session replays and heatmaps work through the Tracker. Requires StartOS 0.4.2 or later. Full release notes: https://github.com/umami-software/umami/releases/tag/v3.5.0',
    es_ES:
      'Umami actualizado a 3.5.0, que añade el seguimiento de errores del navegador. Las grabaciones de sesión y los mapas de calor funcionan a través del Rastreador. Requiere StartOS 0.4.2 o posterior. Notas de la versión completas: https://github.com/umami-software/umami/releases/tag/v3.5.0',
    de_DE:
      'Umami auf 3.5.0 aktualisiert, mit Erfassung von Browserfehlern. Sitzungsaufzeichnungen und Heatmaps funktionieren über den Tracker. Erfordert StartOS 0.4.2 oder neuer. Vollständige Versionshinweise: https://github.com/umami-software/umami/releases/tag/v3.5.0',
    pl_PL:
      'Zaktualizowano Umami do 3.5.0, które dodaje śledzenie błędów przeglądarki. Nagrania sesji i mapy cieplne działają przez Tracker. Wymaga StartOS 0.4.2 lub nowszego. Pełne informacje o wydaniu: https://github.com/umami-software/umami/releases/tag/v3.5.0',
    fr_FR:
      'Umami mis à jour vers 3.5.0, qui ajoute le suivi des erreurs du navigateur. Les enregistrements de session et les cartes de chaleur fonctionnent via le Traceur. Nécessite StartOS 0.4.2 ou une version ultérieure. Notes de version complètes : https://github.com/umami-software/umami/releases/tag/v3.5.0',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
