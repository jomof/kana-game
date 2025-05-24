/**
 * @license
 * Copyright 2025 Jomo Fisher
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, PropertyValues, html, css} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import * as wanakana from 'wanakana';
import * as kuromoji from '@patdx/kuromoji';
import {tokenize} from './tokenize.js';
import {augmentTokenGroups} from './augment.js';

export interface Token extends kuromoji.IpadicFeatures {
  marked: boolean | undefined;
}

export async function makeQuestion(
  english: string,
  japanese: string[]
): Promise<Question> {
  const groups = await Promise.all(
    japanese.map(async (it) => await tokenize(it))
  );
  const parsed = (await augmentTokenGroups(groups)) as Token[][];
  parsed.forEach((group) => group.forEach((token) => (token.marked = false)));
  return {
    english: english,
    parsed: parsed,
  } as Question;
}

export interface Question {
  english: string;
  japanese: string[];
  parsed: Token[][];
}

export interface Token extends kuromoji.IpadicFeatures {
  marked: boolean | undefined;
}

export interface ParsedEnglishPart {
  englishWord: string;
  furigana: string;
}

export type ParsedEnglish = ParsedEnglishPart[];

/**
 * Recursive helper (unchanged).
 * @returns an array of token‐indices if `str` can be covered by a subsequence
 *          of `tokens[i].reading`, or `null` otherwise.
 */
function findMatch(
  tokens: Token[],
  str: string,
  startIdx: number,
  pos: number
): number[] | null {
  if (pos === str.length) return [];
  for (let i = startIdx; i < tokens.length; i++) {
    const r = tokens[i].reading!;
    if (str.startsWith(r, pos)) {
      const rest = findMatch(tokens, str, i + 1, pos + r.length);
      if (rest) return [i, ...rest];
    }
  }
  return null;
}

/** Flat‐array overload */
export function markTokens(
  tokens: Token[],
  str: string
): {matched: number[] | null};

/** Nested‐array overload */
export function markTokens(
  tokens: Token[][],
  str: string
): {matched: number[] | null}[];

/**
 * If given a flat Token[], tries to match & flip exactly as before.
 * If given Token[][], first picks only those sub‐arrays with the
 * **highest current count** of `marked===true`, and runs the flat logic
 * on them; all others return `{ matched: null }`.
 */
export function markTokens(
  tokens: Token[] | Token[][],
  str: string
): {matched: number[] | null} | {matched: number[] | null}[] {
  // ——— Nested case ———
  if (tokens.length > 0 && Array.isArray(tokens[0])) {
    const groups = tokens as Token[][];
    // 1) count how many are already marked in each subgroup
    const markedCounts = groups.map((g) =>
      g.reduce((n, t) => n + (t.marked ? 1 : 0), 0)
    );
    const maxCount = Math.max(...markedCounts);
    // 2) only process those at maxCount
    return groups.map((g, i) => {
      if (markedCounts[i] === maxCount) {
        // recurse into flat logic
        return markTokens(g, str) as {matched: number[] | null};
      } else {
        // skip marking entirely
        return {matched: null};
      }
    });
  }

  // ——— Flat case ———
  const flat = tokens as Token[];
  const matchIndices = findMatch(flat, str, 0, 0);
  if (!matchIndices) {
    return {matched: null};
  }

  const newlyMarked: number[] = [];
  for (const idx of matchIndices) {
    if (!flat[idx].marked) {
      flat[idx].marked = true;
      newlyMarked.push(idx);
    }
  }
  return {matched: newlyMarked};
}

/**
 * Returns true if any token was newly marked.
 */
function anyMarked(result: {matched: number[] | null}[]): boolean {
  return result.some((r) => r.matched !== null && r.matched.length > 0);
}

/**
 * Selects the “best” token sequence from an array of candidate groups.
 * Criteria:
 *  1. Highest number of tokens with `marked === true`
 *  2. (Tiebreaker) Lowest number of tokens with `marked === false`
 *
 * @param groups  An array of Token[] candidate sequences.
 * @returns       The best Token[] (or `null` if `groups` is empty).
 */
function selectBestGroup(groups: Token[][]): Token[] {
  if (groups.length === 0) throw new Error('No groups provided');

  let bestGroup = groups[0];
  let bestMarked = bestGroup.filter((t) => t.marked).length;
  let bestUnmarked = bestGroup.length - bestMarked;

  for (let i = 1; i < groups.length; i++) {
    const grp = groups[i];
    const markedCount = grp.filter((t) => t.marked).length;
    const unmarkedCount = grp.length - markedCount;

    if (
      markedCount > bestMarked ||
      (markedCount === bestMarked && unmarkedCount < bestUnmarked)
    ) {
      bestGroup = grp;
      bestMarked = markedCount;
      bestUnmarked = unmarkedCount;
    }
  }

  return bestGroup;
}

/**
 * Formats a single Token[] into a masked string:
 *  – If `t.marked === true`, emits `t.surface`.
 *  – If unmarked and `t.pos_detail1 === "記号"`, emits `""` (omits punctuation).
 *  – Otherwise emits `"_"` repeated to match `t.surface.length`.
 *
 * @param group  A Token[] to format.
 * @returns      The masked string.
 */
function formatTokenGroup(group: Token[], includePunctuation: Boolean): string {
  return group
    .map((t) => {
      if (t.marked || includePunctuation) {
        return t.surface_form;
      } else if (t.pos !== '記号') {
        return '_'.repeat(t.surface_form.length);
      } else {
        // unmarked punctuation → omit entirely
        return '';
      }
    })
    .join('');
}

/**
 * Returns true if every non-punctuation token in the array is marked.
 * Punctuation tokens (where pos_detail1 === "記号") are ignored.
 *
 * @param tokens  Array of Token objects to check.
 */
function isCompleted(tokens: Token[]): boolean {
  return tokens.every((t) => t.pos === '記号' || t.marked);
}

@customElement('kana-game')
export class KanaGame extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      height: 100%;
      min-height: 300px;

      /* allow both light & dark; UA picks based on prefers-color-scheme */
      /* lit-analyzer ignore no-invalid-css */
      color-scheme: light dark;

      /* default (light) look */
      border: solid 1px gray;
      padding: 16px;
      max-width: 800px;
      background-color: #fff;
      color: #000;
    }

    :host([state='completed']) span#skeleton {
      color: green;
    }

    :host([state='normal']) input#kana-input {
      border: solid 1px #ccc;
    }

    :host([state='completed']) input#kana-input {
      outline: none;
      box-shadow: 0 0 0 1px green;
    }

    :host([state='error']) input#kana-input {
      animation: shake 0.3s ease-in-out;
      outline: none;
      box-shadow: 0 0 0 1px tomato;
    }

    :host([state='completed']) .next-button {
      display: block; /* show when completed */
    }

    :host([state='completed']) .next-button:hover {
      color: #000;
    }

    .answer-box {
      margin-top: auto;
      position: relative;
      width: 100%;
    }

    .next-button {
      position: absolute;
      top: 50%;
      right: 0.5em;
      transform: translateY(-50%);
      border: none;
      background: none;
      font-size: 1.5em;
      line-height: 1;
      cursor: pointer;
      color: #444;
      display: none; /* hidden by default */
    }

    span#english {
      font-family: 'Noto Sans JP', sans-serif;
      font-size: 30px;
      text-align: center;
      width: 100%;
    }

    .english-word[has-furigana] {
      cursor: pointer;
    }

    span#skeleton {
      font-family: 'Noto Sans JP', sans-serif;
      font-size: 22px;
      text-align: center;
      width: 100%;
    }

    input#kana-input {
      box-sizing: border-box;
      width: 100%;
      padding-left: 2.5em;
      padding-right: 2.5em; /* make room for the arrow */
      border-radius: 8px;

      font-family: 'Noto Sans JP', sans-serif;
      font-size: 22px;
      line-height: 33px;
      text-align: center;
      width: 100%;

      /* light-mode input styling */
      background-color: #fff;
      color: #000;
      border-radius: 8px;
    }

    @keyframes shake {
      0% {
        transform: translateX(0);
      }
      20% {
        transform: translateX(-4px);
      }
      40% {
        transform: translateX(4px);
      }
      60% {
        transform: translateX(-4px);
      }
      80% {
        transform: translateX(4px);
      }
      100% {
        transform: translateX(0);
      }
    }

    @media (prefers-color-scheme: dark) {
      :host {
        /* dark-mode host overrides */
        background-color: #121212;
        color: #eee;
        border: solid 1px #444;
      }

      :host([state='completed']) .next-button:hover {
        color: #eee;
      }

      .next-button {
        color: #ccc;
      }

      span#english {
        color: #eee;
      }

      input#kana-input {
        background-color: #222;
        color: #eee;
        border: solid 1px #555;
      }
    }
  `;

  @property({type: String})
  skeleton = '';

  @query('#kana-input')
  kana!: HTMLInputElement;

  @property({type: String, reflect: true})
  state: 'normal' | 'completed' | 'error' = 'normal';

  private _furiganaVisibility: boolean[] = [];
  public parsedEnglish: ParsedEnglish = [];
  question: Question | null = null;

  // For debugging: the hiragana readings of all possible answers.
  answerHiragana: string[] = [];

  /**
   * Called to supply a new question to the game.
   * @param question
   */
  async supplyQuestion(question: Question) {
    const allGroups = question.parsed;
    this.question = structuredClone(question);
    this.parsedEnglish = this._parseEnglishString(question.english);
    this._furiganaVisibility = new Array(this.parsedEnglish.length).fill(false);
    const best = selectBestGroup(allGroups)!;
    this.skeleton = formatTokenGroup(best, false);
    this.state = 'normal';
    this.kana.value = '';
    this.kana.focus();
    this._updateDebugFields();
  }

  override firstUpdated() {
    if (this.kana) {
      wanakana.bind(this.kana, {IMEMode: true});
      this.kana.focus();
    }
  }
  override connectedCallback() {
    super.connectedCallback();
    // fire & forget: warm up the tokenizer
    tokenize(''); // this will load the dictionary
  }

  protected override updated(changed: PropertyValues) {
    super.updated(changed);
    this.dispatchEvent(
      new CustomEvent('properties-changed', {
        detail: [...changed.keys()],
      })
    );
  }

  override render() {
    return html`
      <span id="english" part="english">
        ${this.parsedEnglish.map(
          (part, index) => html`
            <!-- lit-analyzer ignore no-unknown-attribute -->
            <span
              class="english-word"
              ?has-furigana=${part.furigana !== ''}
              @click=${() => this._handleEnglishWordClick(index)}
            >
              ${this._furiganaVisibility[index] && part.furigana
                ? html`<ruby
                    ><rb>${part.englishWord}</rb><rt>${part.furigana}</rt></ruby
                  >`
                : part.englishWord}
            </span>
          `
        )} </span
      ><br />
      <span id="skeleton" part="skeleton">${this.renderSkeleton()}</span><br />
      <div class="answer-box">
        <input
          id="kana-input"
          part="kana-input"
          type="text"
          .readOnly=${this.state === 'completed'}
          @keydown=${this.handleKeydown}
          @input=${this.handleInput}
          placeholder="答え"
        />
        <button
          class="next-button"
          @click=${this._onNextClick}
          aria-label="Next question"
        >
          Next ➔
        </button>
      </div>
    `;
  }

  private renderSkeleton() {
    if (!this.question) return html``;
    const groups = this.question.parsed as Token[][];
    const best = selectBestGroup(groups) || [];

    return html`${best.map((t) => {
      // skip unmarked punctuation unless we're in completed state
      if (t.pos === '記号' && this.state !== 'completed') {
        return '';
      }

      // unrevealed → underscores
      if (!t.marked && this.state !== 'completed') {
        return html`<span class="mask"
          >${'_'.repeat(t.surface_form.length)}</span
        >`;
      }

      // revealed → ruby with furigana
      const kana = wanakana.toHiragana(t.reading);
      if (kana === t.surface_form) return html`${kana}`;
      return html`<ruby><rb>${t.surface_form}</rb><rt>${kana}</rt></ruby>`;
    })}`;
  }

  private _onNextClick() {
    this.dispatchEvent(new CustomEvent('next-question'));
  }

  private handleInput(_: InputEvent) {
    // as soon as the user types or pastes anything, clear the error
    if (this.state === 'error') {
      this.state = 'normal';
    }
  }

  private handleKeydown(e: KeyboardEvent) {
    if (this.question === null) return;
    if (e.key !== 'Enter') return;
    if (this.state === 'completed') {
      e.preventDefault();
      this._onNextClick();
      return;
    }

    const value = (e.target as HTMLInputElement).value;
    const group = this.question!.parsed as Token[][];
    const katakana = wanakana.toKatakana(value);
    const marked = markTokens(group, katakana);
    this._updateDebugFields();
    const best = selectBestGroup(group);
    if (anyMarked(marked)) {
      this.kana.value = '';
    }
    let showPunctuation = false;
    if (isCompleted(best!)) {
      showPunctuation = true;
      this.state = 'completed';
    } else if (!anyMarked(marked)) {
      this.state = 'error';
    } else {
      this.state = 'normal';
    }
    this.skeleton = formatTokenGroup(best!, showPunctuation);
  }

  private _handleEnglishWordClick(index: number) {
    if (
      this.parsedEnglish &&
      this.parsedEnglish[index] &&
      this.parsedEnglish[index].furigana
    ) {
      // Check if the index is valid for _furiganaVisibility
      if (index < this._furiganaVisibility.length) {
        this._furiganaVisibility[index] = !this._furiganaVisibility[index];
      } else {
        // This case should ideally not happen if _furiganaVisibility is always synced with parsedEnglish
        console.error(
          'Furigana visibility array out of sync with parsed English parts.'
        );
      }
    }
    // For words without furigana, or if the part doesn't exist, we do nothing to the visibility state.
    // The old logic used to set _showFuriganaForIndex to null, effectively hiding other furigana.
    // The new requirement is that other furigana should remain visible.

    this.requestUpdate();
  }

  private _updateDebugFields() {
    if (!this.question) return;

    // Take each token‐group (one per possible answer),
    // turn every token’s katakana reading into hiragana,
    // join them with spaces, and store in answerHiragana.
    const groups = this.question.parsed as Token[][];
    this.answerHiragana = groups.map((group) =>
      group.map((token) => wanakana.toHiragana(token.reading)).join(' ')
    );
  }

  private _parseEnglishString(eng: string): ParsedEnglish {
    const regex = /(\w+)\s*(?:\[([^\]]+)\])?/g;
    const parts: ParsedEnglish = [];
    let match;
    while ((match = regex.exec(eng)) !== null) {
      parts.push({
        englishWord: match[1],
        furigana: match[2] || '',
      });
    }
    return parts;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'kana-game': KanaGame;
  }
}
