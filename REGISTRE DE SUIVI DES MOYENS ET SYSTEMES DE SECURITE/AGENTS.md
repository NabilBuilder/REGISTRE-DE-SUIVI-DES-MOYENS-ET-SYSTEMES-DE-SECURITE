# Registre de Sécurité — AGENTS.md

## Project Overview
REGISTRE DE SUIVI DES MOYENS ET SYSTEMES DE SECURITE — Security monitoring register for GARDNET SERVICES.

## Architecture
- React 18 + Vite 5 + Tailwind CSS 3
- Modular: `src/modules/registre-securite/`
- PWA: vite-plugin-pwa + Workbox
- Data: localStorage (auto-save 500ms debounce)

## Key Commands
- `npm run build` → production build
- `npm run dev` → dev server on port 5174
- `npm run preview` → preview server on port 5174

## Verified Workflows
- `npm run build` → clean build, zero errors
- PWA ready: manifest + service worker + install prompt
- Offline: all data in localStorage, works without internet
- Print: @page A4 portrait, flex-locked at 297mm
- Email Import: batch parse multiple emails → preview table → apply absences to registry
- Data Hook: `importEntries(parsedEntries)` adds imported absences with deduplication
- Backup/Restore: Export all data to JSON, import with merge/overwrite modes

## File Structure
- `src/modules/registre-securite/RegistreSecurite.jsx` — Main component
- `src/modules/registre-securite/hooks/useRegistreData.js` — Data hook (CRUD, auto-save, import)
- `src/modules/registre-securite/components/` — All UI components
- `src/utils/` — Config, date utils, export utils
- `src/hooks/` — Custom hooks (useLocalStorage, useInstallPrompt)

## Important Notes
- Language: All user-facing text in French
- Company: GARDNET SERVICES (gardnet.ma)
- Default supervisor: NABIL
- Default site: CSS Casablanca
