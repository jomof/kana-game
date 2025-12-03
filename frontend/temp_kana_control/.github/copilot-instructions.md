# Project AI Instructions

These instructions orient AI coding agents to this LitElement + TypeScript component and docs site.

## Big Picture
- **Core Component**: Single exported web component `KanaControl` (`src/kana-control.ts`) compiled to root `kana-control.js` + type defs via `tsc`.
- **Helper Modules**: `src/tokenize.ts` (Japanese tokenization wrapper) and `src/augment.ts` (answer variant generation) support the core logic.
- **Build Output**: Mirrors `src/` tree into root: `src/test/kana-control_test.ts` -> `test/kana-control_test.js`.
- **Docs Site**: Static site lives in `docs-src/` (Eleventy templates) and is generated into `docs/`.
- **Bundling**: Rollup bundling/minification is **ONLY** for docs (`rollup.config.js`). Do not introduce app bundling for NPM publish.
- **Manifest**: Custom Elements Manifest produced by `npm run analyze` to `custom-elements.json`.

## Key Workflows
- **Install**: `npm i`
- **Build**: `npm run build` (tsc); watch: `npm run build:watch`.
- **Clean**: `npm run clean` (removes generated artifacts).
- **Dev Preview**: `npm run serve` -> http://localhost:8000/ (component demo in `dev/index.html`).
  - Prod mode: `MODE=prod npm run serve:prod`.
- **Docs Pipeline**: `npm run docs` (cleans, builds component, analyzes, rollup bundle to `docs/kana-control.bundled.js`, copies assets, runs Eleventy).
  - Watch docs content: `npm run docs:gen:watch`.
  - Serve generated site: `npm run docs:serve`.
- **Size Check**: `npm run checksize` (gzip bundle heuristic).
- **Publish**: Push tag `vX.Y.Z` -> `.github/workflows/publish.yml` builds & tests then `npm publish`.
- **Canary**: Every push to `main` runs `.github/workflows/canary.yml` and publishes with dist-tag `canary`.

## Testing
- **Framework**: `@web/test-runner` with `@open-wc/testing` (Mocha/Chai/Sinon).
- **Location**: Test suites authored in TS under `src/test/`; compiled JS lives in `test/`.
- **Pattern**: Matched by `./test/**/*_test.js` in `web-test-runner.config.js`.
- **Execution**:
  - Full matrix (dev + prod): `npm test`.
  - Watch mode (dev): `npm test:watch`.
  - Prod watch: `npm run test:prod:watch`.
- **Browser Limit**: Prepend `BROWSERS=chromium,firefox` to test scripts.
- **Fixtures**: Use `fixture` and `html` from `@open-wc/testing` to instantiate components in tests.

## Conventions & Patterns
- **LitElement**:
  - Use `@customElement('kana-control')` and `@property()`/`@state()` decorators.
  - Styles defined via static `styles = css` tagged template.
  - Avoid side effects in `render()`.
- **Component API**:
  - `Question` interface and `makeQuestion(english, japanese[])` factory are central.
  - `supplyQuestion(question)` method updates component state.
- **Tokenization**:
  - `markTokens` function uses overloads for flat `Token[]` vs nested `Token[][]`.
  - `wanakana` library used for IME (Romaji -> Kana) conversion.
- **Events**: Dispatch custom events (e.g., `count-changed`) without detail payload unless necessary.
- **Strictness**: Strict TypeScript & lit-analyzer rules enforced (`ts-lit-plugin`).
- **Bundling**: Do NOT alter Rollup config for publishing—keep build script as plain `tsc`.

## External Integrations
- **Eleventy**: Config `.eleventy.cjs` drives docs generation.
- **Legacy Support**: Handled via `@web/dev-server-legacy` plugin; polyfills toggled based on environment.

## Safe Editing Guidance
- **API Changes**: When changing properties, events, or slots:
  1. Update source (`src/kana-control.ts`).
  2. Update tests (`src/test/kana-control_test.ts`).
  3. Update docs examples (`docs-src/examples/*.md`).
  4. Regenerate manifest (`npm run analyze`).
- **Path Stability**: Do not change `outDir` or `rootDir` in `tsconfig.json`.
- **New Components**: Replicate pattern: TS in `src/`, tests in `src/test/`, no bundling for publish.

## Quick Checklist (before PR)
- Build succeeds (`npm run build`).
- Tests pass in dev & prod (`npm test`).
- Manifest updated (`npm run analyze`).
- Docs regenerate (`npm run docs`).
