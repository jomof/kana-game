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
function formatTokenGroup(group: Token[], includePunctuation: Boolean): string {
  return group
    .map((t) => {
      if (t.marked || includePunctuation) {
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

/**
 * Returns true if every non-punctuation token in the array is marked.
 * Punctuation tokens (where pos_detail1 === "句点") are ignored.
 *
 * @param tokens  Array of Token objects to check.
 */
function isCompleted(tokens: Token[]): boolean {
  return tokens.every((t) => t.pos_detail1 === '句点' || t.marked);
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
      border: 2px solid green;
      outline: none;
      box-shadow: 0 0 0 2px green;
    }

    :host([state='error']) input#kana-input {
      border: 2px solid tomato;
      outline: none;
      box-shadow: 0 0 0 2px tomato;
    }

    :host([state="completed"]) .next-button {
      display: block;            /* show when completed */
    }

    :host([state="completed"]) .next-button:hover {
      color: #000;
    }

    .answer-box {
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
      display: none;             /* hidden by default */
    }

    span#english {
      font-family: 'Noto Sans JP', sans-serif;
      font-size: 22px;
      text-align: center;
      width: 100%;
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
      padding-right: 2.5em;      /* make room for the arrow */
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

    @media (prefers-color-scheme: dark) {
      :host {
        /* dark-mode host overrides */
        background-color: #121212;
        color: #eee;
        border: solid 1px #444;
      }

      :host([state="completed"]) .next-button:hover {
        color: #eee;
      }

      .next-button {
        color: #ccc;
      }

      span#english {
        color: #eee;
      }

      input#kana-input {
        /* dark-mode input overrides */
        background-color: #222;
        color: #eee;
        border: solid 1px #555;
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

  @property({type: String, reflect: true})
  state: 'normal' | 'completed' | 'error' = 'normal';

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
    this.skeleton = formatTokenGroup(best!, false);
    this.state = 'normal';
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
      <div class="answer-box">
        <input
          id="kana-input"
          part="kana-input"
          type="text"
          .readOnly=${this.state === 'completed'}
          @keydown=${this.handleKeydown}
          placeholder="答え"
        />
        <button
          class="next-button"
          @click=${this._onNextClick}
          aria-label="Next question"
        >
          ➔
        </button>
      </div>
    `;
  }

  private _onNextClick() {
    this.dispatchEvent(new CustomEvent('next-question'));
  }

  private _onMecabReady() {
    this.mecabInitialized = true;
    this.dispatchEvent(new CustomEvent('mecab-ready'));
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
    const best = selectBestGroup(group);
    if (anyMarked(marked)) {
      this.kana.value = '';
    }
    let showPuncuation = false;
    if (isCompleted(best!)) {
      showPuncuation = true;
      this.state = 'completed';
    } else if (!anyMarked(marked)) {
      this.state = 'error';
    } else {
      this.state = 'normal';
    }

    this.skeleton = formatTokenGroup(best!, showPuncuation);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'kana-game': KanaGame;
  }
}
