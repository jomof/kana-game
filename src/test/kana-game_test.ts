/**
 * @license
 * Copyright 2025
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {KanaGame, Token, markTokens, Question} from '../kana-game.js';
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
      </span>
      <br>
      <div class="answer-box">
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
        <button
          aria-label="Next question"
          class="next-button"
        >
          Next ➔
        </button>
      </div>
    `;
  }

  interface Model {
    game: KanaGame;
    shadowRoot: ShadowRoot;
    input: HTMLInputElement;
  }

  async function getModel(): Promise<Model> {
    const game = (await fixture(html`<kana-game></kana-game>`)) as KanaGame;
    const shadowRoot = game.shadowRoot;
    assert.ok(shadowRoot, 'Shadow root should be present');
    const input = shadowRoot.querySelector('#kana-input') as HTMLInputElement;
    assert.ok(input, 'Input element should be present');
    return {
      game: game,
      shadowRoot: shadowRoot,
      input: input,
    };
  }

  async function sendInput(model: Model, text: string, enter = true) {
    const input = model.input;
    // Set the input value to a romaji string
    input.value = text;

    // Dispatch an input event to trigger WanaKana binding
    input.dispatchEvent(new Event('input', {bubbles: true, composed: true}));

    // Perform a keydown event to simulate pressing the Enter key
    if (enter) {
      input.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
          composed: true,
        })
      );
    }

    // Wait for any asynchronous updates
    await model.game.updateComplete;
  }

  async function sendBackspace(model: Model) {
    const input = model.input;
    // Set the input value to a romaji string
    input.value = input.value.slice(0, -1);

    // Dispatch an input event to trigger WanaKana binding
    input.dispatchEvent(new Event('input', {bubbles: true, composed: true}));

    // Wait for any asynchronous updates
    await model.game.updateComplete;
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
    kana.value = '';
    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      composed: true,
    });
    kana.dispatchEvent(enterEvent);
    await game.updateComplete;
    assert.equal(game.skeleton, '');
  });

  test('notifies Mecab', async () => {
    const el = (await fixture(html`<kana-game></kana-game>`)) as KanaGame;
    await el.updateComplete;
    assert.equal(el.mecabInitialized, true);
  });

  test('check supplyQuestion', async () => {
    const model = await getModel();
    const game = model.game;
    game.supplyQuestion({
      english: 'I am a teacher.',
      japanese: ['先生です。', '先生だ。'],
      parsed: [],
    });
    await game.updateComplete;
    assert.equal(game.english, 'I am a teacher.');
  });

  test('converts romaji input to kana using WanaKana', async () => {
    const model = await getModel();
    await sendInput(model, 'konnnichiha');
    // Assert that the input value has been converted to kana
    assert.equal(model.input.value, 'こんにちは');
  });

  test('mark tokens 1', async () => {
    const tokens = Mecab.query('私は学生です。') as Token[];
    const result = markTokens(tokens, 'ワタシハガクセイデス');
    assert.deepEqual(result.matched, [0, 1, 2, 3]);
    assert.isTrue(tokens[0].marked);
    assert.isTrue(tokens[1].marked);
    assert.isTrue(tokens[2].marked);
    assert.isTrue(tokens[3].marked);
    assert.isUndefined(tokens[4].marked);
  });

  test('mark tokens 2', async () => {
    const tokens = Mecab.query('私は学生です。') as Token[];
    markTokens(tokens, 'ワタシ');
    markTokens(tokens, 'ハ');
    markTokens(tokens, 'ガクセイ');
    markTokens(tokens, 'デス');
    assert.isTrue(tokens[0].marked);
    assert.isTrue(tokens[1].marked);
    assert.isTrue(tokens[2].marked);
    assert.isTrue(tokens[3].marked);
    assert.isUndefined(tokens[4].marked);
  });

  test('mark tokens 3', async () => {
    const tokens = [Mecab.query('私は学生です。') as Token[]];
    assert.deepEqual(markTokens(tokens, 'ワタシハ')[0].matched, [0, 1]);
    assert.deepEqual(markTokens(tokens, 'ハガクセイ')[0].matched, [2]);
    assert.deepEqual(markTokens(tokens, 'ガクセイデス')[0].matched, [3]);
    assert.deepEqual(markTokens(tokens, 'デス')[0].matched, []);
    assert.isTrue(tokens[0][0].marked);
    assert.isTrue(tokens[0][1].marked);
    assert.isTrue(tokens[0][2].marked);
    assert.isTrue(tokens[0][3].marked);
    assert.isUndefined(tokens[0][4].marked);
  });

  test('mark tokens 3.1', async () => {
    const tokens = [
      Mecab.query('私は学生です。') as Token[],
      Mecab.query('私は学生だ。') as Token[],
    ];
    const desuMarked = markTokens(tokens, 'デス');

    assert.deepEqual(desuMarked[0].matched, [3]);
    assert.equal(desuMarked[1].matched, null);

    const daMarked = markTokens(tokens, 'ダ');

    assert.deepEqual(daMarked[0].matched, null);
    assert.deepEqual(daMarked[1].matched, null);
  });

  test('mark tokens 4', async () => {
    const tokens = Mecab.query('私は学生です。') as Token[];
    assert.isNull(markTokens(tokens, 'ガ').matched);
    assert.deepEqual(markTokens(tokens, 'ハ').matched, [1]);
    assert.deepEqual(markTokens(tokens, 'ガクセイデス').matched, [2, 3]);
    assert.deepEqual(markTokens(tokens, 'ワタシ').matched, [0]);
  });

  test('no subgroup matches → all matched=null, no mutation', () => {
    const groups: Token[][] = [
      [{reading: 'a', marked: false} as Token],
      [{reading: 'b', marked: false} as Token],
    ];
    const before = groups.map((g) => g.map((t) => t.marked));
    const results = markTokens(groups, 'c') as {matched: number[] | null}[];
    assert.deepEqual(
      results.map((r) => r.matched),
      [null, null]
    );
    assert.deepEqual(
      groups.map((g) => g.map((t) => t.marked)),
      before
    );
  });

  test('only highest-marked subgroups get processed', () => {
    const g0: Token[] = [
      {reading: 'a', marked: true} as Token,
      {reading: 'b', marked: false} as Token,
    ]; // 1 marked
    const g1: Token[] = [
      {reading: 'x', marked: false} as Token,
      {reading: 'y', marked: false} as Token,
    ]; // 0 marked
    const groups = [g0, g1];
    const before = groups.map((g) => g.map((t) => t.marked));

    // both can match 'b' or 'y' respectively…
    const results = markTokens(groups, 'b') as any[];
    // only g0 had the highest initial mark-count (1), so only it is processed:
    assert.deepEqual(results[0].matched, [1], 'g0 should mark index 1');
    assert.strictEqual(results[1].matched, null, 'g1 should be skipped');
    // g1 remains entirely unmutated
    assert.deepEqual(
      groups[1].map((t) => t.marked),
      before[1]
    );
  });

  test('ties in marked‐count → all tied groups get processed', () => {
    const g0: Token[] = [
      {reading: 'p', marked: false} as Token,
      {reading: 'q', marked: false} as Token,
    ]; // 0 marked
    const g1: Token[] = [{reading: 'pq', marked: false} as Token]; // 0 marked
    const groups = [g0, g1];

    const results = markTokens(groups, 'pq') as any[];
    // both groups had 0 marked → both are eligible
    assert.deepEqual(results[0].matched, [0, 1], 'g0 should mark [0,1]');
    assert.deepEqual(results[1].matched, [0], 'g1 should mark [0]');
  });

  test('nested empty subgroup participates correctly', () => {
    const g0: Token[] = [];
    const g1: Token[] = [{reading: '', marked: false} as Token];
    const groups = [g0, g1];

    // match empty string
    const results = markTokens(groups, '');
    // both have same marked-count (0), so both processed:
    //  - g0.flat: findMatch([], '') → []  → matched=[]
    //  - g1.flat: findMatch([''], '') → [] → matched=[]
    assert.deepEqual(results[0].matched, []);
    assert.deepEqual(results[1].matched, []);

    // if trying to match non-empty, neither can match → both null
    const r2 = markTokens(groups, 'x') as any[];
    assert.deepEqual(
      r2.map((r) => r.matched),
      [null, null]
    );
  });

  test('empty token array should return matched=null', () => {
    const tokens: Token[] = [];
    const result = markTokens(tokens, 'any');
    assert.strictEqual((result as any).matched, null);
  });

  test('empty string should match trivially ([]), no mutation', () => {
    const tokens: Token[] = [
      {reading: 'a', marked: false} as Token,
      {reading: 'bc', marked: false} as Token,
    ];
    const before = tokens.map((t) => t.marked);
    const result = markTokens(tokens, '');
    assert.deepEqual((result as any).matched, []);
    // no token was flipped
    assert.deepEqual(
      tokens.map((t) => t.marked),
      before
    );
  });

  test('partial coverage must fail (null), no mutation', () => {
    const tokens: Token[] = [
      {reading: 'ab', marked: false} as Token,
      {reading: 'cd', marked: false} as Token,
    ];
    const before = tokens.map((t) => t.marked);
    const result = markTokens(tokens, 'abc'); // cannot cover 'abc' exactly
    assert.strictEqual((result as any).matched, null);
    assert.deepEqual(
      tokens.map((t) => t.marked),
      before
    );
  });

  test('all tokens already marked → matched=[] and no mutation', () => {
    const tokens: Token[] = [
      {reading: 'x', marked: true} as Token,
      {reading: 'y', marked: true} as Token,
    ];
    const before = tokens.map((t) => t.marked);
    const result = markTokens(tokens, 'xy');
    assert.deepEqual((result as any).matched, []);
    assert.deepEqual(
      tokens.map((t) => t.marked),
      before
    );
  });

  test('run to correct completion', async () => {
    const model = await getModel();
    const game = model.game;
    game.supplyQuestion({
      english: 'I am a student.',
      japanese: ['私は学生です。', '私は学生だ。', '学生です。', '学生だ。'],
    } as Question);
    await game.updateComplete;
    assert.equal(game.english, 'I am a student.');
    assert.isNotNull(game.question);
    await sendInput(model, 'da');
    assert.equal(game.state, 'normal');
    assert.equal(game.skeleton, '__だ');
    await sendInput(model, 'gakusei');
    assert.equal(game.state, 'completed');
    assert.equal(game.skeleton, '学生だ。');
  });

  test('run to error then return to normal', async () => {
    const model = await getModel();
    const game = model.game;
    game.supplyQuestion({
      english: 'I am a student.',
      japanese: ['私は学生です。', '私は学生だ。', '学生です。', '学生だ。'],
    } as Question);
    await game.updateComplete;
    assert.equal(game.skeleton, '____');
    await sendInput(model, 'ni'); // incorrect input
    assert.equal(game.state, 'error');
    assert.equal(game.skeleton, '____');
    await sendBackspace(model); // Backspace returns to normal
    assert.equal(game.state, 'normal');
    assert.equal(game.skeleton, '____');
  });
});
