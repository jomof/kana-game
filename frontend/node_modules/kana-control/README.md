# kana-control

A LitElement web component for Japanese kana input with support for question display and progress tracking.

## Features

- **Romaji → Kana Conversion**: Type romaji (e.g., `konnnichiha`) and get automatic conversion to kana (こんにちは) using WanaKana
- **Question Support**: Display English prompts with furigana annotations
- **Interactive Furigana**: Click English words to toggle Japanese pronunciation hints (furigana)
- **Progress Tracking**: Visual skeleton shows answering progress with marked/unmarked tokens
- **Flexible Answers**: Accepts multiple Japanese variants (e.g., polite/casual, pronoun changes) and tracks progress across all
- **Incremental Validation**: Press Enter to validate typed kana; matched tokens reveal themselves, unmatched input remains for correction
- **Completion Indicator**: A checkmark (✓) appears when all non-punctuation tokens are correctly answered

## Installation

```bash
npm install kana-control
```

## Usage

### Basic Kana Input

```html
<kana-control></kana-control>
```

### With Question Display

```html
<script type="module">
  import {makeQuestion} from 'kana-control';

  const control = document.querySelector('kana-control');
  
  // Create a question with furigana annotations: word[ふりがな]
  const question = await makeQuestion('I live[すむ] in Seattle[シアトル].', [
    '私 は シアトル に 住んでいます。',
    '私 は シアトル に 住んでる。',
  ]);
  
  // Supply the question to the control
  await control.supplyQuestion(question);
</script>

<kana-control></kana-control>
```

### Answering Questions

Type kana (or romaji which auto-converts) and press Enter to validate. Correct segments reveal their Japanese tokens while the remaining ones stay masked. Multiple acceptable answers are supported (e.g., `です` vs `だ`, `私` vs `僕`).

Example interaction for: `I am a student[がくせい].`

```
_ _ ____ ____    (initial skeleton)
私 _ ____ ____   (after typing "watashi" + Enter)
私 は 学生 ____  (after typing "ha" + Enter then "gakusei" + Enter)
私 は 学生 です ✓ (after typing "desu" + Enter)
```

You may also supply a casual variant (`私 は 学生 だ。`) and the progress tracker will choose the best matching variant as you answer.

## API

### `makeQuestion(english, japanese)`

Creates a Question object with tokenized and augmented Japanese answers.

**Parameters:**
- `english` (string): English text with optional furigana annotations in brackets: `word[ふりがな]`
- `japanese` (string[]): Array of acceptable Japanese answers

**Returns:** `Promise<Question>`

**Example:**
```typescript
const q = await makeQuestion('I eat[たべる] sushi[すし].', [
  '私 は 寿司 を 食べます。',
  '私 は 寿司 を 食べる。',
]);
```

### `supplyQuestion(question)`

Supply a question to the control for display.

**Parameters:**
- `question` (Question): The question object created by `makeQuestion()`

**Example:**
```typescript
const control = document.querySelector('kana-control');
await control.supplyQuestion(question);
```

### Answer Validation Flow

1. User types romaji or kana into the input.
2. On Enter key, the component converts the input to katakana for matching.
3. The internal `markTokens()` algorithm tries to match readings against all answer variants.
4. The variant with the most progress is selected; matched tokens are marked and revealed.
5. Input clears only if some progress was made (at least one token matched).
6. When all non-punctuation tokens are marked, a completion indicator (✓) appears.

### Token Augmentation

`makeQuestion()` automatically augments acceptable answers with variants (e.g., pronouns, polite/casual endings). This allows learners to answer flexibly without strict phrasing.

### Furigana Annotation Syntax

In the English prompt, annotate words with `[ふりがな]` to display clickable furigana hints:

```
'I live[すむ] in Seattle[シアトル].'
```

### CSS Parts

- `kana-input`: The kana input field
- `english`: The English prompt display
- `skeleton`: The progress skeleton display

### Completion Handling

Listen for progress by observing changes on the component (e.g., via MutationObserver) or extend the component to dispatch a custom event when `✓` appears. (Custom completion event can be added if needed.)

### CSS Parts

- `kana-input`: The kana input field
- `english`: The English prompt display
- `skeleton`: The progress skeleton display

## About this release

This is a pre-release of Lit 3.0, the next major version of Lit.

Lit 3.0 has very few breaking changes from Lit 2.0:

- Drops support for IE11
- Published as ES2021
- Removes a couple of deprecated Lit 1.x APIs

Lit 3.0 should require no changes to upgrade from Lit 2.0 for the vast majority of users. Once the full release is published, most apps and libraries will be able to extend their npm version ranges to include both 2.x and 3.x, like `"^2.7.0 || ^3.0.0"`.

Lit 2.x and 3.0 are _interoperable_: templates, base classes, directives, decorators, etc., from one version of Lit will work with those from another.

Please file any issues you find on our [issue tracker](https://github.com/lit/lit/issues).

## Setup

Install dependencies:

```bash
npm i
```

## Build

This sample uses the TypeScript compiler to produce JavaScript that runs in modern browsers.

To build the JavaScript version of your component:

```bash
npm run build
```

To watch files and rebuild when the files are modified, run the following command in a separate shell:

```bash
npm run build:watch
```

Both the TypeScript compiler and lit-analyzer are configured to be very strict. You may want to change `tsconfig.json` to make them less strict.

## Testing

This sample uses modern-web.dev's
[@web/test-runner](https://www.npmjs.com/package/@web/test-runner) for testing. See the
[modern-web.dev testing documentation](https://modern-web.dev/docs/test-runner/overview) for
more information.

Tests can be run with the `test` script, which will run your tests against Lit's development mode (with more verbose errors) as well as against Lit's production mode:

```bash
npm test
```

For local testing during development, the `test:dev:watch` command will run your tests in Lit's development mode (with verbose errors) on every change to your source files:

```bash
npm test:watch
```

Alternatively the `test:prod` and `test:prod:watch` commands will run your tests in Lit's production mode.

## Dev Server

This sample uses modern-web.dev's [@web/dev-server](https://www.npmjs.com/package/@web/dev-server) for previewing the project without additional build steps. Web Dev Server handles resolving Node-style "bare" import specifiers, which aren't supported in browsers. It also automatically transpiles JavaScript and adds polyfills to support older browsers. See [modern-web.dev's Web Dev Server documentation](https://modern-web.dev/docs/dev-server/overview/) for more information.

To run the dev server and open the project in a new browser tab:

```bash
npm run serve
```

There is a development HTML file located at `/dev/index.html` that you can view at http://localhost:8000/dev/index.html. Note that this command will serve your code using Lit's development mode (with more verbose errors). To serve your code against Lit's production mode, use `npm run serve:prod`.

## Editing

If you use VS Code, we highly recommend the [lit-plugin extension](https://marketplace.visualstudio.com/items?itemName=runem.lit-plugin), which enables some extremely useful features for lit-html templates:

- Syntax highlighting
- Type-checking
- Code completion
- Hover-over docs
- Jump to definition
- Linting
- Quick Fixes

The project is setup to recommend lit-plugin to VS Code users if they don't already have it installed.

## Linting

Linting of TypeScript files is provided by [ESLint](eslint.org) and [TypeScript ESLint](https://github.com/typescript-eslint/typescript-eslint). In addition, [lit-analyzer](https://www.npmjs.com/package/lit-analyzer) is used to type-check and lint lit-html templates with the same engine and rules as lit-plugin.

The rules are mostly the recommended rules from each project, but some have been turned off to make LitElement usage easier. The recommended rules are pretty strict, so you may want to relax them by editing `.eslintrc.json` and `tsconfig.json`.

To lint the project run:

```bash
npm run lint
```

## Formatting

[Prettier](https://prettier.io/) is used for code formatting. It has been pre-configured according to the Lit's style. You can change this in `.prettierrc.json`.

Prettier has not been configured to run when committing files, but this can be added with Husky and `pretty-quick`. See the [prettier.io](https://prettier.io/) site for instructions.

## Static Site

This project includes a simple website generated with the [eleventy](https://11ty.dev) static site generator and the templates and pages in `/docs-src`. The site is generated to `/docs` and intended to be checked in so that GitHub pages can serve the site [from `/docs` on the main branch](https://help.github.com/en/github/working-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

To enable the site go to the GitHub settings and change the GitHub Pages &quot;Source&quot; setting to &quot;main branch /docs folder&quot;.</p>

To build the site, run:

```bash
npm run docs
```

To serve the site locally, run:

```bash
npm run docs:serve
```

To watch the site files, and re-build automatically, run:

```bash
npm run docs:gen:watch
```

The site will usually be served at http://localhost:8000.

**Note**: The project uses Rollup to bundle and minify the source code for the docs site and not to publish to NPM. For bundling and minification, check the [Bundling and minification](#bundling-and-minification) section.

## Bundling and minification

As stated in the [static site generation](#static-site) section, the bundling and minification setup in the Rollup configuration in this project is there specifically for the docs generation.

We recommend publishing components as unoptimized JavaScript modules and performing build-time optimizations at the application level. This gives build tools the best chance to deduplicate code, remove dead code, and so on.

Please check the [Publishing best practices](https://lit.dev/docs/tools/publishing/#publishing-best-practices) for information on publishing reusable Web Components, and [Build for production](https://lit.dev/docs/tools/production/) for building application projects that include LitElement components, on the Lit site.

## More information

See [Get started](https://lit.dev/docs/getting-started/) on the Lit site for more information.
