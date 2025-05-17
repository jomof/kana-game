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
      display: block;
      border: solid 1px gray;
      padding: 16px;
      max-width: 800px;
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
      <span id="english">${this.english}</span><br />
      <span id="skeleton">${this.skeleton}</span><br />
      <input
        id="kana-input"
        type="text"
        @keydown=${this.handleKeydown}
        placeholder="Type in romaji..."
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
