/**
 * @license
 * Copyright 2019 Jomo Fisher
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, css} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import * as wanakana from 'wanakana';
import Mecab, {MecabToken} from 'mecab-wasm';

export interface Question {
  english: string;
  japanese: string[];
  parsed: MecabToken[][];
}

export interface Token extends MecabToken {
  marked: boolean | undefined;
}

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
    const r = tokens[i].reading;
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
function selectBestGroup(groups: Token[][]): Token[] | null {
  if (groups.length === 0) return null;

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
 *  – If `t.marked === true`, emits `t.word`.
 *  – If unmarked and `t.pos_detail1 === "句点"`, emits `""` (omits punctuation).
 *  – Otherwise emits `"_"` repeated to match `t.word.length`.
 *
 * @param group  A Token[] to format.
 * @returns      The masked string.
 */
function formatTokenGroup(group: Token[]): string {
  return group
    .map((t) => {
      if (t.marked) {
        return t.word;
      } else if (t.pos_detail1 !== '句点') {
        return '_'.repeat(t.word.length);
      } else {
        // unmarked punctuation → omit entirely
        return '';
      }
    })
    .join('');
}

@customElement('kana-game')
export class KanaGame extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;

      /* allow both light & dark; UA picks based on prefers-color-scheme */
      color-scheme: light dark;

      /* default (light) look */
      border: var(--kana-game-border, solid 1px gray);
      padding: var(--kana-game-padding, 16px);
      max-width: var(--kana-game-max-width, 800px);
      background-color: var(--kana-game-background-color, #fff);
      color: var(--kana-game-text-color, #000);
    }

    span#english {
      font-family: var(
        --kana-game-english-font-family,
        'Noto Sans JP',
        sans-serif
      );
      font-size: var(--kana-game-english-font-size, 22px);
      text-align: var(--kana-game-english-text-align, center);
      width: var(--kana-game-english-width, 100%);
    }

    span#skeleton {
      font-family: var(
        --kana-game-skeleton-font-family,
        'Noto Sans JP',
        sans-serif
      );
      font-size: var(--kana-game-skeleton-font-size, 22px);
      text-align: var(--kana-game-skeleton-text-align, center);
      width: var(--kana-game-skeleton-width, 100%);
    }

    input#kana-input {
      font-family: var(
        --kana-game-input-font-family,
        'Noto Sans JP',
        sans-serif
      );
      font-size: var(--kana-game-input-font-size, 22px);
      line-height: var(--kana-game-input-line-height, 33px);
      text-align: var(--kana-game-input-text-align, center);
      width: var(--kana-game-input-width, 100%);

      /* light-mode input styling */
      background-color: var(--kana-game-input-bg, #fff);
      color: var(--kana-game-input-color, #000);
      border: var(--kana-game-input-border, solid 1px #ccc);
    }

    @media (prefers-color-scheme: dark) {
      :host {
        /* dark-mode host overrides */
        background-color: var(--kana-game-background-color-dark, #121212);
        color: var(--kana-game-text-color-dark, #eee);
        border: var(--kana-game-border-dark, solid 1px #444);
      }

      span#english {
        /* if you want a different heading color in dark */
        color: var(--kana-game-english-color-dark, #eee);
      }

      input#kana-input {
        /* dark-mode input overrides */
        background-color: var(--kana-game-input-bg-dark, #222);
        color: var(--kana-game-input-color-dark, #eee);
        border: var(--kana-game-input-border-dark, solid 1px #555);
      }
    }
  `;

  /**
   * Whether mecab has been initialized.
   */
  @property({type: Boolean})
  mecabInitialized = false;

  @property({type: String})
  english = 'I live in Seattle.';

  @property({type: String})
  skeleton = '';

  @query('#kana-input')
  kana!: HTMLInputElement;

  question: Question | null = null;

  /**
   * Called to supply a new question to the game.
   * @param question
   */
  supplyQuestion(question: Question) {
    this.question = structuredClone(question);
    this.english = this.question.english;
    this.question.parsed = this.question.japanese.map(Mecab.query);

    const group = this.question!.parsed as Token[][];
    const best = selectBestGroup(group);
    this.skeleton = formatTokenGroup(best!);
  }

  override firstUpdated() {
    if (this.kana) {
      wanakana.bind(this.kana, {IMEMode: true});
      this.kana.focus();
    }
  }

  protected override async getUpdateComplete(): Promise<boolean> {
    const result = await super.getUpdateComplete();
    if (result) {
      await Mecab.waitReady();
      this._onMecabReady();
    }
    return result;
  }

  override render() {
    return html`
      <span id="english" part="english">${this.english}</span><br />
      <span id="skeleton" part="skeleton">${this.skeleton}</span><br />
      <input
        id="kana-input"
        part="kana-input"
        type="text"
        @keydown=${this.handleKeydown}
        placeholder="答え"
      />
    `;
  }

  private _onMecabReady() {
    this.mecabInitialized = true;
    this.dispatchEvent(new CustomEvent('mecab-ready'));
  }

  private handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      if (this.question === null) return;
      const value = (e.target as HTMLInputElement).value;
      const group = this.question!.parsed as Token[][];
      const katakana = wanakana.toKatakana(value);
      const marked = markTokens(group, katakana);
      const best = selectBestGroup(group);
      this.skeleton = formatTokenGroup(best!);
      if (anyMarked(marked)) {
        this.kana.value = '';
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'kana-game': KanaGame;
  }
}
