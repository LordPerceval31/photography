import posthog from "posthog-js";

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
  api_host: "/ingest",
  ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  // Inclure defaults comme requis par PostHog
  defaults: "2026-01-30",
  // Aucun cookie ni localStorage : tout reste en mémoire RAM
  persistence: "memory",
  // Active la capture automatique des exceptions non gérées
  capture_exceptions: true,
  // Désactive le chargement de surveys.js (fonctionnalité non utilisée)
  disable_surveys: true,
  // Mode debug en développement
  debug: process.env.NODE_ENV === "development",
});

// IMPORTANT: Ne jamais combiner cette approche avec un PostHogProvider.
// instrumentation-client.ts est la solution correcte pour Next.js 15.3+.
