/**
 * @license
 * Copyright 2025
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {KanaGame, Token, markTokens} from '../kana-game.js';
import Mecab from 'mecab-wasm';
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

  function getExpectedHtml(): string {
    return `
      <span 
        id="english"
        part="english">
        I live in Seattle.
      </span>
      <br>
      <span 
        id="skeleton"
        part="skeleton">
        _
      </span>
      <br>
      <input
       autocapitalize="none"
       autocomplete="off"
       autocorrect="off"
       id="kana-input"
       lang="ja"
       part="kana-input"
       placeholder="答え"
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
    assert.shadowDom.equal(el, getExpectedHtml());
  });

  test('renders with a set name', async () => {
    const el = await getElement();
    assert.shadowDom.equal(el, getExpectedHtml());
  });

  test('handles enter', async () => {
    const game = await getElement();
    const kana = game.kana;
    kana.value = 'こにちは';
    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      composed: true,
    });
    kana.dispatchEvent(enterEvent);
    await game.updateComplete;
    assert.equal(game.skeleton, 'こにちは');
  });

  test('notifies Mecab', async () => {
    const el = (await fixture(html`<kana-game></kana-game>`)) as KanaGame;
    await el.updateComplete;
    assert.equal(el.mecabInitialized, true);
  });

  test('check supplyQuestion', async () => {
    const game = (await fixture(html`<kana-game></kana-game>`)) as KanaGame;
    await game.updateComplete;
    game.supplyQuestion({
      english: 'I am a teacher.',
      japanese: ['先生です。', '先生だ。'],
      parsed: [],
    });
    await game.updateComplete;
    assert.equal(game.english, 'I am a teacher.');
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

  test('mark tokens 1', async () => {
    const tokens = Mecab.query('私は学生です。') as Token[];
    const result = markTokens(tokens, 'ワタシハガクセイデス')
    assert.deepEqual(result.matched, [0, 1, 2, 3]);
    assert.isTrue(tokens[0].marked);
    assert.isTrue(tokens[1].marked);
    assert.isTrue(tokens[2].marked);
    assert.isTrue(tokens[3].marked);
    assert.isUndefined(tokens[4].marked);
  });

  test('mark tokens 2', async () => {
    const tokens = Mecab.query('私は学生です。') as Token[];
    markTokens(tokens, 'ワタシ')
    markTokens(tokens, 'ハ')
    markTokens(tokens, 'ガクセイ')
    markTokens(tokens, 'デス')
    assert.isTrue(tokens[0].marked);
    assert.isTrue(tokens[1].marked);
    assert.isTrue(tokens[2].marked);
    assert.isTrue(tokens[3].marked);
    assert.isUndefined(tokens[4].marked);
  });

  test('mark tokens 3', async () => {
    const tokens = Mecab.query('私は学生です。') as Token[];
    assert.deepEqual(markTokens(tokens, 'ワタシハ').matched, [0, 1]);
    assert.deepEqual(markTokens(tokens, 'ハガクセイ').matched, [2]);
    assert.deepEqual(markTokens(tokens, 'ガクセイデス').matched, [3]);
    assert.deepEqual(markTokens(tokens, 'デス').matched, []);
    assert.isTrue(tokens[0].marked);
    assert.isTrue(tokens[1].marked);
    assert.isTrue(tokens[2].marked);
    assert.isTrue(tokens[3].marked);
    assert.isUndefined(tokens[4].marked);
  });
});
