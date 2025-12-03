/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, css} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import * as wanakana from 'wanakana';
import {
  Token,
  Question,
  ParsedEnglish,
  markTokens,
  anyMarked,
  selectBestGroup,
  isCompleted,
  parseEnglishString,
} from './kana-control-logic.js';

// Re-export for consumers
export {Token, Question, ParsedEnglish, makeQuestion} from './kana-control-logic.js';

/**
 * A Japanese kana input control component with optional question/progress display.
 * Converts romaji input to kana using WanaKana IME mode.
 *
 * @fires count-changed - Indicates when the count changes
 * @slot - This element has a slot
 * @csspart button - The button
 * @csspart kana-input - The kana input field
 * @csspart english - The English prompt/question display
 * @csspart skeleton - The progress skeleton display
 */
@customElement('kana-control')
export class KanaControl extends LitElement {
  static override styles = css`
    :host {
      display: block;
      border: solid 1px gray;
      padding: 16px;
      max-width: 800px;
      /* Allow both light & dark; rely on page color scheme */
    }

    input#kana-input {
      box-sizing: border-box;
      width: 100%;
      padding-left: 2.5em;
      padding-right: 2.5em;
      border-radius: 8px;

      font-family: 'Noto Sans JP', sans-serif;
      font-size: 22px;
      line-height: 33px;
      text-align: center;
    }

    #english {
      font-family: 'Noto Sans JP', sans-serif;
      font-size: 30px;
      text-align: center;
      width: 100%;
      margin-bottom: 10px;
    }

    .english-word[has-furigana] {
      cursor: pointer;
    }

    #skeleton {
      font-family: 'Noto Sans JP', sans-serif;
      font-size: 22px;
      text-align: center;
      width: 100%;
      margin-bottom: 10px;
    }

      #skeleton .skeleton {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.2em;
        flex-wrap: wrap;
      }

      #skeleton .token {
        font-weight: normal;
        color: #999;
      }

      #skeleton .token.marked {
        font-weight: bold;
        color: #000;
      }

      #skeleton .completed {
        color: #4caf50;
        font-size: 1.5em;
        margin-left: 0.3em;
      }

      /* Dark mode adjustments */
      @media (prefers-color-scheme: dark) {
        :host {
          background-color: #121212;
          border-color: #444;
        }
        #skeleton .token.marked {
          color: #eee;
        }
        #skeleton .token {
          color: #888;
        }
        span#english, #english {
          color: #eee;
        }
      }
  `;

  /**
   * The current question being displayed/answered.
   */
  @state()
  private question: Question | null = null;

  /**
   * Parsed English parts with furigana annotations.
   */
  @state()
  parsedEnglish: ParsedEnglish = [];

  /**
   * Visibility state for each furigana annotation.
   */
  @state()
  private _furiganaVisibility: boolean[] = [];

  /**
   * Debug mode - shows all possible remaining sentences.
   */
  @property({type: Boolean})
  debug = false;

  /**
   * Supply a new question to display.
   *
   * @param question - The question to display
   *
   * @example
   * ```ts
   * const control = document.querySelector('kana-control');
   * const q = await makeQuestion('I live[すむ] in Seattle[シアトル].', [
   *   '私 は シアトル に 住んでいます。',
   * ]);
   * control.supplyQuestion(q);
   * ```
   */
  async supplyQuestion(question: Question) {
    this.question = structuredClone(question);
    this.parsedEnglish = parseEnglishString(question.english);
    this._furiganaVisibility = new Array(this.parsedEnglish.length).fill(false);
    this.requestUpdate();
  }

  override render() {
    return html`
      ${this.parsedEnglish.length > 0
        ? html`
            <div id="english" part="english">
              ${this.parsedEnglish.map(
                (part, index) => html`
                  <span
                    class="english-word"
                    ?has-furigana=${part.furigana !== ''}
                    @click=${() => this._handleEnglishWordClick(index)}
                  >
                    ${this._furiganaVisibility[index] && part.furigana
                      ? html`<ruby
                          ><rb>${part.englishWord}</rb
                          ><rt>${part.furigana}</rt></ruby
                        >`
                      : part.englishWord}
                  </span>
                `
              )}
            </div>
          `
        : html`<div id="english" part="english" style="color: #999;">
            Loading question...
          </div>`}
      ${this.question
        ? html`<div id="skeleton" part="skeleton">${this._renderSkeleton()}</div>`
        : null}
      <input
        id="kana-input"
        part="kana-input"
        type="text"
        autocapitalize="none"
        autocomplete="off"
        spellcheck="false"
        placeholder="日本語"
        @keydown=${this._handleKeydown}
      />
      ${this.debug && this.question
        ? html`<div id="debug-output" part="debug" style="margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px; font-family: monospace; font-size: 14px;">
            ${this._renderDebugInfo()}
          </div>`
        : null}
    `;
  }

  override firstUpdated(): void {
    const input = this.renderRoot.querySelector(
      '#kana-input'
    ) as HTMLInputElement | null;
    if (input) {
      // Bind WanaKana IME to convert romaji to kana as user types
      wanakana.bind(input, {IMEMode: true});
    }
  }

  private _handleKeydown(e: KeyboardEvent): void {
    if (!this.question || e.key !== 'Enter') return;

    const groups = this.question.parsed as Token[][];
    
    // If the question is already completed, pressing Enter requests the next question
    const currentBest = selectBestGroup(groups);
    if (isCompleted(currentBest)) {
      this.dispatchEvent(new CustomEvent('request-next-question', {
        bubbles: true,
        composed: true
      }));
      return;
    }

    const input = e.target as HTMLInputElement;
    const value = input.value;
    const katakana = wanakana.toKatakana(value);
    
    const marked = markTokens(groups, katakana);
    
    if (anyMarked(marked)) {
      input.value = '';
      const best = selectBestGroup(groups);
      if (isCompleted(best)) {
        console.log('Question completed!');
        // Trigger re-render to update skeleton
        this.requestUpdate();
      }
    } else {
      console.log('No match found');
    }
    
    // Always trigger re-render to update skeleton
    this.requestUpdate();
  }


  private _handleEnglishWordClick(index: number) {
    if (
      this.parsedEnglish &&
      this.parsedEnglish[index] &&
      this.parsedEnglish[index].furigana
    ) {
      if (index < this._furiganaVisibility.length) {
        this._furiganaVisibility[index] = !this._furiganaVisibility[index];
      }
    }
    this.requestUpdate();
  }

  private _renderSkeleton() {
    if (!this.question) {
      return html`<div>Loading question...</div>`;
    }

    const groups = this.question.parsed as Token[][];
    const best = selectBestGroup(groups);
    const completed = isCompleted(best);

    return html`
      <div class="skeleton">
        ${best.map(
          (t) =>
            t.pos === '記号'
              ? html`${t.surface_form}`
              : html`<span class="token ${t.marked ? 'marked' : ''}"
                  >${t.marked
                    ? t.surface_form
                    : '_'.repeat(t.surface_form.length)}</span
                >`
        )}
        ${completed ? html`<span class="completed">✓</span>` : ''}
      </div>
    `;
  }

  private _renderDebugInfo() {
    if (!this.question) {
      return html`<div>No question loaded</div>`;
    }

    const groups = this.question.parsed as Token[][];
    
    // Filter to only show groups that could still be completed
    // (groups where all marked tokens are still valid)
    const validGroups = groups.filter(group => {
      // If any token is marked, the group is still potentially valid
      const hasMarked = group.some(t => t.marked);
      // If no tokens are marked yet, all groups are valid
      const noMarksYet = !group.some(t => t.marked);
      return hasMarked || noMarksYet;
    });

    return html`
      <div style="margin-bottom: 5px; font-weight: bold; color: #666;">
        Debug: ${validGroups.length} possible sentence${validGroups.length !== 1 ? 's' : ''}
      </div>
      ${validGroups.map(
        (group, idx) => html`
          <div style="padding: 2px 0; color: #333;">
            ${idx + 1}. ${group.map(t => t.surface_form).join('')}
          </div>
        `
      )}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'kana-control': KanaControl;
  }
}
