/**
 * @license
 * Copyright 2025
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {KanaGame} from '../kana-game.js';

import {fixture, assert} from '@open-wc/testing';
import {html} from 'lit/static-html.js';

suite('kana-game', () => {
  /**
   * Helper function to create a fixture of the KanaGame element.
   * @returns {Promise<KanaGame>} A promise that resolves to the KanaGame element.
   */
  async function getElement(): Promise<KanaGame> {
    const el = await fixture(html`<kana-game></kana-game>`);
    const shadowRoot = el.shadowRoot;
    assert.ok(shadowRoot, 'Shadow root should be present');
    const input = shadowRoot.querySelector('#kana-input');
    assert.ok(input, 'input should be present');
    input.removeAttribute('data-wanakana-id');
    input.removeAttribute('data-previous-attributes');
    return el as KanaGame;
  }

  function getExpectedHtml(count: number): string {
    return `
      <h1>Hello, World!</h1>
      <button part="button">Click Count: ${count}</button>
      <slot></slot>
      <input
       autocapitalize="none"
       autocomplete="off"
       autocorrect="off"
       id="kana-input"
       lang="ja"
       placeholder="Type in romaji..."
       spellcheck="false"
       type="text"
      >
    `;
  }

  test('is defined', () => {
    const el = document.createElement('kana-game');
    assert.instanceOf(el, KanaGame);
  });

  test('renders with default values', async () => {
    const el = await getElement();
    assert.shadowDom.equal(el, getExpectedHtml(0));
  });

  test('renders with a set name', async () => {
    const el = await getElement();
    assert.shadowDom.equal(el, getExpectedHtml(0));
  });

  test('handles a click', async () => {
    const el = await getElement();
    const button = el.shadowRoot!.querySelector('button')!;
    button.click();
    await el.updateComplete;
    assert.shadowDom.equal(el, getExpectedHtml(1));
  });

  test('handles a click', async () => {
    const el = await getElement();
    const button = el.shadowRoot!.querySelector('button')!;
    button.click();
    await el.updateComplete;
    assert.shadowDom.equal(el, getExpectedHtml(1));
  });

  test('notifies Mecab', async () => {
    const el = (await fixture(html`<kana-game></kana-game>`)) as KanaGame;
    await el.updateComplete;
    assert.equal(el.mecabInitialized, true);
  });

  test('converts romaji input to kana using WanaKana', async () => {
    const el = (await fixture(html`<kana-game></kana-game>`)) as KanaGame;
    const shadowRoot = el.shadowRoot;
    assert.ok(shadowRoot, 'Shadow root should be present');

    const input = shadowRoot.querySelector('#kana-input') as HTMLInputElement;
    assert.ok(input, 'Input element should be present');

    // Set the input value to a romaji string
    input.value = 'konichiha';

    // Dispatch an input event to trigger WanaKana binding
    input.dispatchEvent(new Event('input', {bubbles: true, composed: true}));

    // Wait for any asynchronous updates
    await el.updateComplete;

    // Assert that the input value has been converted to kana
    assert.equal(input.value, 'こにちは');
  });
});
