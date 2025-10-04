# Phase 11 – Internationalization & Photo Reliability

Summary of changes delivered in this phase:

- Implemented app-wide i18n with i18next/react-i18next and a Language Selector that persists and applies the language, also updating the document lang attribute for SEO.
- Fixed wardrobe item photos showing as a small icon by hardening Supabase Storage URL resolution and signing logic for both absolute and relative storage paths.
- Minimal, non-breaking changes focused only on requested scope.

What was updated:
- src/i18n.ts (new): Initializes i18n with starter resources for 10 languages.
- src/main.tsx: Loads i18n globally.
- src/components/LanguageSelector.tsx: Now actually changes app language, persists it, and sets <html lang>.
- src/utils/photoHelpers.ts: Improved resolvePublicUrl to handle relative /storage paths, storage:// scheme, and encoded paths, returning absolute public URLs via Supabase API.
- src/components/WardrobeItemCard.tsx: More robust storage path parsing for signed URLs.

Next phase proposal:
- Expand translations incrementally (common UI strings) and wire t() into top-level nav/pages.
- Add user setting to auto-detect language from browser on first visit.
- Optional: lazy-load namespaces per route for performance.
