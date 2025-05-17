/**
 * @license
 * Copyright 2019 Jomo Fisher
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, css} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import * as wanakana from 'wanakana';
import Mecab from 'mecab-wasm';

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
        "Noto Sans JP",
        sans-serif
      );
      font-size: var(--kana-game-english-font-size, 22px);
      text-align: var(--kana-game-english-text-align, center);
      width: var(--kana-game-english-width, 100%);
    }

    span#skeleton {
      font-family: var(
        --kana-game-skeleton-font-family,
        "Noto Sans JP",
        sans-serif
      );
      font-size: var(--kana-game-skeleton-font-size, 22px);
      text-align: var(--kana-game-skeleton-text-align, center);
      width: var(--kana-game-skeleton-width, 100%);
    }

    input#kana-input {
      font-family: var(
        --kana-game-input-font-family,
        "Noto Sans JP",
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
  skeleton = '___________________';

  @query('#kana-input')
  kana!: HTMLInputElement;

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
      <span 
        id="english"
        part="english">${this.english}</span><br />
      <span 
        id="skeleton"
        part="skeleton">${this.skeleton}</span><br />
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
      const value = (e.target as HTMLInputElement).value;
      if (this.skeleton[0] === '_') this.skeleton = '';
      this.skeleton += value;
      this.kana.value = '';
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'kana-game': KanaGame;
  }
}
