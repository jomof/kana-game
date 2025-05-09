/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {KanaGame} from '../kana-game.js';

import {fixture, assert} from '@open-wc/testing';
import {html} from 'lit/static-html.js';

suite('kana-game', () => {
  test('is defined', () => {
    const el = document.createElement('kana-game');
    assert.instanceOf(el, KanaGame);
  });

  test('renders with default values', async () => {
    const el = await fixture(html`<kana-game></kana-game>`);
    const shadowRoot = el.shadowRoot;
    assert.ok(shadowRoot, 'Shadow root should be present');
    const input = shadowRoot.querySelector('#kana-input');
    assert.ok(input, 'input should be present');
    input.removeAttribute('data-wanakana-id');
    input.removeAttribute('data-previous-attributes');

    assert.shadowDom.equal(
      el,
      `
      <h1>Hello, World!</h1>
      <button part="button">Click Count: 0</button>
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
    `
    );
  });

  test('renders with a set name', async () => {
    const el = await fixture(html`<kana-game name="Test"></kana-game>`);
    const shadowRoot = el.shadowRoot;
    assert.ok(shadowRoot, 'Shadow root should be present');
    const input = shadowRoot.querySelector('#kana-input');
    assert.ok(input, 'input should be present');
    input.removeAttribute('data-wanakana-id');
    input.removeAttribute('data-previous-attributes');
    assert.shadowDom.equal(
      el,
      `
      <h1>Hello, Test!</h1>
      <button part="button">Click Count: 0</button>
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
    `
    );
  });

  test('handles a click', async () => {
    const el = (await fixture(html`<kana-game></kana-game>`)) as KanaGame;
    const button = el.shadowRoot!.querySelector('button')!;
    button.click();
    await el.updateComplete;
    const shadowRoot = el.shadowRoot;
    assert.ok(shadowRoot, 'Shadow root should be present');
    const input = shadowRoot.querySelector('#kana-input');
    assert.ok(input, 'input should be present');
    input.removeAttribute('data-wanakana-id');
    input.removeAttribute('data-previous-attributes');
    assert.shadowDom.equal(
      el,
      `
      <h1>Hello, World!</h1>
      <button part="button">Click Count: 1</button>
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
    `
    );
  });

  test('styling applied', async () => {
    const el = (await fixture(html`<kana-game></kana-game>`)) as KanaGame;
    await el.updateComplete;
    assert.equal(getComputedStyle(el).paddingTop, '16px');
  });
});
