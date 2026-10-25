import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.4.1:0',
  releaseNotes: {
    en_US:
      'Updated Umami to 3.4.1, a security release that includes the October 2026 Node.js fixes. Full release notes: https://github.com/umami-software/umami/releases/tag/v3.4.1',
    es_ES:
      'Umami actualizado a 3.4.1, una versión de seguridad que incluye las correcciones de Node.js de octubre de 2026. Notas de la versión completas: https://github.com/umami-software/umami/releases/tag/v3.4.1',
    de_DE:
      'Umami auf 3.4.1 aktualisiert, eine Sicherheitsversion mit den Node.js-Korrekturen vom Oktober 2026. Vollständige Versionshinweise: https://github.com/umami-software/umami/releases/tag/v3.4.1',
    pl_PL:
      'Zaktualizowano Umami do 3.4.1, wydania bezpieczeństwa zawierającego poprawki Node.js z października 2026. Pełne informacje o wydaniu: https://github.com/umami-software/umami/releases/tag/v3.4.1',
    fr_FR:
      "Umami mis à jour vers 3.4.1, une version de sécurité qui inclut les correctifs Node.js d'octobre 2026. Notes de version complètes : https://github.com/umami-software/umami/releases/tag/v3.4.1",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
