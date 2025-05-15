/**
 * @license
 * Copyright 2019 
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import * as wanakana from 'wanakana';
import Mecab from 'mecab-wasm';

/**
 * An example element.
 *
 * @fires count-changed - Indicates when the count changes
 * @slot - This element has a slot
 * @csspart button - The button
 */
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
   * The name to say "Hello" to.
   */
  @property()
  name = 'World';

  /**
   * The number of times the button has been clicked.
   */
  @property({type: Number})
  count = 0;

  /**
   * Whether mecab has been initialized.
   */
  @property({type: Boolean})
  mecabInitialized = false;

  override firstUpdated() {
    const input = this.shadowRoot?.getElementById('kana-input') as HTMLInputElement;
    if (input) {
      wanakana.bind(input, { IMEMode: true });
    }
    
  }

  protected override async getUpdateComplete(): Promise<boolean> {
    const result = await super.getUpdateComplete();
    if (result) {
      await Mecab.waitReady();
      this._onMecabReady();
      const mc = Mecab.query('日本語を勉強しています。');
      console.log("MECABX" + mc);
    }
    return result;
  }

  override render() {
    return html`
      <h1>${this.sayHello(this.name)}!</h1>
      <button @click=${this._onClick} part="button">
        Click Count: ${this.count}
      </button>
      <slot></slot>
      <input id="kana-input" type="text" placeholder="Type in romaji..." />
    `;
  }

  private _onMecabReady() {
    this.mecabInitialized = true;
    this.dispatchEvent(new CustomEvent('mecab-ready'));
  }

  private _onClick() {
    this.count++;
    this.dispatchEvent(new CustomEvent('count-changed'));
  }

  /**
   * Formats a greeting
   * @param name The name to say "Hello" to
   */
  sayHello(name: string): string {
    return `Hello, ${name}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'kana-game': KanaGame;
  }
}
