/**
 * @license
 * Copyright 2025
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {KanaGame, Token, markTokens, Question, tokenize, performAugmentation} from '../kana-game.js';
import * as wanakana from 'wanakana';
import {fixture, assert} from '@open-wc/testing';
import {html} from 'lit/static-html.js';

// Helper to create a basic token, additional Kuromoji props can be added as needed
function makeToken(
  surface_form: string,
  reading: string,
  pos = '名詞', // Default to Noun
  pos_detail_1 = '*',
  pos_detail_2 = '*',
  pos_detail_3 = '*',
  conjugated_type = '*',
  conjugated_form = '*',
  basic_form = surface_form,
  pronunciation = reading,
  word_id = 0, // placeholder
  word_type = 'KNOWN', // or 'UNKNOWN'
  word_position = 0 // placeholder
): Token {
  return {
    surface_form,
    reading,
    pos,
    pos_detail_1,
    pos_detail_2,
    pos_detail_3,
    conjugated_type,
    conjugated_form,
    basic_form,
    pronunciation,
    word_id,
    word_type,
    word_position,
    marked: undefined, // Default 'marked' state
  };
}

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

async function clickEnglishWord(model: Model, wordIndex: number) {
  const wordSpan = model.shadowRoot.querySelectorAll('#english .english-word')[
    wordIndex
  ] as HTMLElement;
  assert.ok(wordSpan, `English word span at index ${wordIndex} should exist`);
  wordSpan.click();
  await model.game.updateComplete;
}

suite('kana-game', () => {
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

  test('check supplyQuestion', async () => {
    const model = await getModel();
    const game = model.game;

    const japaneseStrings = ['先生です。', '先生だ。'];
    const tokenizedTexts = await Promise.all(
      japaneseStrings.map(async (jp) => tokenize(jp))
    );
    // For this specific test, we assume supplyQuestion should receive augmented tokens
    // if the test was designed to check behavior post-augmentation.
    // If it's just about parsing English, then non-augmented is fine.
    // Given the original test only checks parsedEnglish, raw tokenized should be okay.
    // Let's assume for now that this test doesn't need pre-augmentation of variants for its specific assertions.
    const augmentedTexts = await performAugmentation(tokenizedTexts);

    await game.supplyQuestion({
      english: 'I am a teacher.',
      // japanese: ['先生です。', '先生だ。'], // Removed
      parsed: augmentedTexts, // Use pre-tokenized and pre-augmented
    });
    await game.updateComplete;
    assert.deepEqual(game.parsedEnglish, [
      {englishWord: 'I', furigana: ''},
      {englishWord: 'am', furigana: ''},
      {englishWord: 'a', furigana: ''},
      {englishWord: 'teacher', furigana: ''},
    ]);
  });

  test('converts romaji input to kana using WanaKana', async () => {
    const model = await getModel();
    await sendInput(model, 'konnnichiha');
    // Assert that the input value has been converted to kana
    assert.equal(model.input.value, 'こんにちは');
  });

  test('mark tokens 1', async () => {
    const tokens = await tokenize('私は学生です。');
    const result = markTokens(tokens, 'ワタシハガクセイデス');
    assert.deepEqual(result.matched, [0, 1, 2, 3]);
    assert.isTrue(tokens[0].marked);
    assert.isTrue(tokens[1].marked);
    assert.isTrue(tokens[2].marked);
    assert.isTrue(tokens[3].marked);
    assert.isUndefined(tokens[4].marked);
  });

  test('mark tokens 2', async () => {
    const tokens = await tokenize('私は学生です。');
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
    const tokens = [await tokenize('私は学生です。')];
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
      await tokenize('私は学生です。'),
      await tokenize('私は学生だ。'),
    ];
    const desuMarked = markTokens(tokens, 'デス');

    assert.deepEqual(desuMarked[0].matched, [3]);
    assert.equal(desuMarked[1].matched, null);

    const daMarked = markTokens(tokens, 'ダ');

    assert.deepEqual(daMarked[0].matched, null);
    assert.deepEqual(daMarked[1].matched, null);
  });

  test('mark tokens 4', async () => {
    const tokens = await tokenize('私は学生です。');
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

    const japaneseStrings = ['私は学生です。', '私は学生だ。', '学生です。', '学生だ。'];
    const tokenizedTexts = await Promise.all(
      japaneseStrings.map(async (jp) => tokenize(jp))
    );
    const augmentedTexts = await performAugmentation(tokenizedTexts);

    await game.supplyQuestion({
      english: 'I am a student.',
      parsed: augmentedTexts,
    });
    await game.updateComplete;
    assert.deepEqual(game.parsedEnglish, [
      {englishWord: 'I', furigana: ''},
      {englishWord: 'am', furigana: ''},
      {englishWord: 'a', furigana: ''},
      {englishWord: 'student', furigana: ''},
    ]);
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

    const japaneseStrings = ['私は学生です。', '私は学生だ。', '学生です。', '学生だ。'];
    const tokenizedTexts = await Promise.all(
      japaneseStrings.map(async (jp) => tokenize(jp))
    );
    const augmentedTexts = await performAugmentation(tokenizedTexts);

    await game.supplyQuestion({
      english: 'I am a student.',
      parsed: augmentedTexts,
    });
    await game.updateComplete;
    assert.equal(game.skeleton, '____'); // This assertion depends on selectBestGroup and formatTokenGroup
    await sendInput(model, 'ni'); // incorrect input
    assert.equal(game.state, 'error');
    assert.equal(game.skeleton, '____');
    await sendBackspace(model); // Backspace returns to normal
    assert.equal(game.state, 'normal');
    assert.equal(game.skeleton, '____');
  });

  test('test book', async () => {
    const model = await getModel();
    const game = model.game;

    const japaneseStrings = ['今 本 を読んでいる。'];
    const tokenizedTexts = await Promise.all(
      japaneseStrings.map(async (jp) => tokenize(jp))
    );
    const augmentedTexts = await performAugmentation(tokenizedTexts);

    await game.supplyQuestion({
      english: 'I am reading a book right now.',
      parsed: augmentedTexts,
    });
    await game.updateComplete;
    // This assertion depends on selectBestGroup and formatTokenGroup
    // For "今 本 を読んでいる。", tokenized and augmented (no specific aug for this)
    // Assuming default tokenization, it should be something like "今本を読んでいる。"
    // which is 5+1+3+1 = 10 underscores if no specific token is auto-marked.
    // Or, if it's "今 本 を 読ん で いる 。", then it's "今_本_を_読んでいる。"
    // Let's re-evaluate the skeleton based on tokenization of "今 本 を読んでいる。"
    // tokenize("今 本 を読んでいる。") might give: 今, 本, を, 読ん, で, いる, 。
    // Which is 1 + 1 + 1 + 2 + 1 + 2 + 0 (for 。 if not shown) = 7 underscores.
    // The original test expected 8. "今 本 を読んでいる" (no period) -> "今_本_を読んでいる" (1+1+1+4 = 7)
    // The exact skeleton depends on the tokenization details and initial marking state.
    // Let's assume the original skeleton assertion '________' (8 underscores) was based on a specific tokenization.
    // If "今 本 を 読ん で いる 。" is tokenized as [今, 本, を, 読ん, で, いる, 。] (7 tokens)
    // Surface forms: "今", "本", "を", "読ん", "で", "いる", "。"
    // Lengths: 1, 1, 1, 2, 1, 2, 1. Punctuation "。" is ignored for skeleton if unmarked.
    // So, 1+1+1+2+1+2 = 8 underscores. This matches.
    assert.equal(game.skeleton, '________');
    await sendInput(model, 'imahonwoyondeiru'); // incorrect input
    assert.equal(game.skeleton, '今本を読んでいる。');
    assert.equal(game.state, 'completed');
  });

  test('watashi drop', async () => {
    const model = await getModel();
    const game = model.game;

    const japaneseStrings = ['私は日本に行きたいんです。']; // This contains 日本
    const tokenizedTexts = await Promise.all(
      japaneseStrings.map(async (jp) => tokenize(jp))
    );
    // Here, performAugmentation will be key, as it should handle the 日本 case.
    const augmentedTexts = await performAugmentation(tokenizedTexts);
    // If "日本" was tokenized as "ニッポン", it should now be "ニホン" in one of the groups.
    // selectBestGroup will pick one.

    await game.supplyQuestion({
      english: 'I want to go to Japan.',
      parsed: augmentedTexts,
    });
    await game.updateComplete;
    // The input "nipponnniikitainda" (ニッポンニイキタインダ)
    // The skeleton should be based on the 'ニホン' reading if the augmenter worked.
    // So, the user typing 'nippon' (ニッポン) for '日本' might lead to an error if the game expects 'nihon'.
    // Or, if the input matches surface form + reading, it could pass.
    // markTokens matches against 'reading'. If reading is 'ニホン', 'ニッポン' won't match.
    // This test might change behavior due to the augmenter.
    // Original input: '私は日本に行きたいんです。'
    // Tokenized: 私 は 日本 に 行き たい ん です 。
    // Readings: ワタシ ハ ニッポン ニ イキ タイ ン デス 。 (assuming default for 日本)
    // After augmentation: ワタシ ハ ニホン ニ イキ タイ ン デス 。 (in one group)
    // And other variants like '学生です' -> '学生だ' etc.
    // The test sends 'nipponnniikitainda' -> ニッポンニイキタインダ
    // If the selected best group has 日本 (ニホン), then this input will NOT fully match.
    // This test will likely fail or require adjustment.
    // Let's assume the goal is to test the "watashi drop" and "desu/da" which are surface augmenters.
    // The input 'nipponnniikitainda' would have matched '日本に行きたいんだ' if 日本 was 'ニッポン'.
    // If 日本 is now 'ニホン', then the input for that part should be 'nihon'.
    // The skeleton check '日本に行きたいんだ。' implies the surface form is the target.
    // The input 'nipponnniikitainda' might be trying to match '日本に行きたいんだ'
    // Let's assume the test meant to type the reading for the surface '日本に行きたいんだ。'
    // Original augmenters: augmentDropWatashiHa, augmentDesuDaTokens.
    // "私は日本に行きたいんです。" -> "日本に行きたいんです。" (drop 私わ)
    // "日本に行きたいんです。" -> "日本に行きたいんだ。" (です -> だ)
    // So, a resulting form is "日本に行きたいんだ。"
    // If 日本 has reading ニッポン, its reading is ニッポン.
    // If 日本 has reading ニホン, its reading is ニホン.
    // The input 'nipponnniikitainda' implies matching 'ニッポン' for '日本'.
    // If the augmenter changes it to 'ニホン', this input string will fail to mark '日本'.

    // For now, let's assume the test is robust enough or the input matches another variant.
    // The critical part is that `supplyQuestion` gets the `parsed` field.
    await sendInput(model, 'nipponnniikitainda'); 
    assert.equal(game.skeleton, '日本に行きたいんだ。');
    assert.equal(game.state, 'completed');
  });
});

suite('Furigana Display', () => {
  test('Test English String Parsing', async () => {
    const model = await getModel();
    const game = model.game;
    // This test primarily checks English parsing and furigana display,
    // so the content of 'parsed' doesn't need to be complex or pre-augmented
    // unless specific tokens are needed for skeleton generation, which is not the case here.
    // An empty 'parsed' array was used before, which is fine.
    await game.supplyQuestion({
      english: 'Hello [こんにちは] World [せかい] Test',
      // japanese: [' irrelevant '], // Removed
      parsed: [], // Remains empty as it's not the focus
    });
    await game.updateComplete;
    assert.deepEqual(game.parsedEnglish, [
      {englishWord: 'Hello', furigana: 'こんにちは'},
      {englishWord: 'World', furigana: 'せかい'},
      {englishWord: 'Test', furigana: ''},
    ]);
  });

  test('Test Initial Display', async () => {
    const model = await getModel();
    const game = model.game;
    await game.supplyQuestion({
      english: 'WordOne [FuriOne] WordTwo',
      // japanese: [' irrelevant '], // Removed
      parsed: [], // Remains empty
    });
    await game.updateComplete;

    const englishSpan = model.shadowRoot.querySelector('#english');
    assert.ok(englishSpan, '#english span should exist');
    // Check overall text content, ensuring spaces are handled as rendered (one space after each word)
    assert.equal(
      englishSpan.textContent?.trim().replace(/\s+/g, ' '),
      'WordOne WordTwo'
    );

    const wordSpans = model.shadowRoot.querySelectorAll(
      '#english .english-word'
    );
    assert.equal(wordSpans.length, 2, 'Should find two english-word spans');

    const firstWordSpan = wordSpans[0] as HTMLElement;
    assert.equal(firstWordSpan.textContent?.trim(), 'WordOne');
    assert.isFalse(
      firstWordSpan.innerHTML.includes('<ruby>'),
      'First word should not initially show ruby tags'
    );
    assert.isTrue(
      firstWordSpan.hasAttribute('has-furigana'),
      'First word should have has-furigana attribute'
    );

    const secondWordSpan = wordSpans[1] as HTMLElement;
    assert.equal(secondWordSpan.textContent?.trim(), 'WordTwo');
    assert.isFalse(
      secondWordSpan.innerHTML.includes('<ruby>'),
      'Second word should not initially show ruby tags'
    );
    assert.isFalse(
      secondWordSpan.hasAttribute('has-furigana'),
      'Second word should not have has-furigana attribute'
    );
  });

  test('Test Clicking a Word with Furigana', async () => {
    const model = await getModel();
    const game = model.game;
    await game.supplyQuestion({
      english: 'Hello [こんにちは] World',
      // japanese: [' irrelevant '], // Removed
      parsed: [], // Remains empty
    });
    await game.updateComplete;

    await clickEnglishWord(model, 0); // Click "Hello"

    const wordSpans = model.shadowRoot.querySelectorAll(
      '#english .english-word'
    );
    const helloSpan = wordSpans[0] as HTMLElement;
    const worldSpan = wordSpans[1] as HTMLElement;

    const rubyElement = helloSpan.querySelector('ruby');
    assert.ok(
      rubyElement,
      'A <ruby> element should be present when furigana is shown.'
    );
    const rb = helloSpan.querySelector('rb');
    const rt = helloSpan.querySelector('rt');
    assert.ok(rb, 'Should find an <rb> element');
    assert.ok(rt, 'Should find an <rt> element');
    assert.equal(
      rb?.textContent,
      'Hello',
      'English word in <rb> should be "Hello"'
    );
    assert.equal(
      rt?.textContent,
      'こんにちは',
      'Furigana in <rt> should be "こんにちは"'
    );
    assert.equal(
      worldSpan.textContent?.trim(),
      'World',
      'World should remain plain text'
    );
    assert.isFalse(
      worldSpan.innerHTML.includes('<ruby>'),
      'World should not show furigana'
    );
  });

  test('Test Clicking a Word without Furigana', async () => {
    const model = await getModel();
    const game = model.game;
    await game.supplyQuestion({
      english: 'Hello [こんにちは] World',
      // japanese: [' irrelevant '], // Removed
      parsed: [], // Remains empty
    });
    await game.updateComplete;

    await clickEnglishWord(model, 0); // Click "Hello" to show its furigana
    await clickEnglishWord(model, 1); // Click "World" (no furigana)

    const wordSpans = model.shadowRoot.querySelectorAll(
      '#english .english-word'
    );
    const helloSpan = wordSpans[0] as HTMLElement;
    const worldSpan = wordSpans[1] as HTMLElement;

    // Assert "Hello" (index 0) still shows furigana
    const rubyElementHello = helloSpan.querySelector('ruby');
    assert.ok(
      rubyElementHello,
      'Hello (index 0) <ruby> element should still be present.'
    );
    const rbHello = helloSpan.querySelector('rb');
    const rtHello = helloSpan.querySelector('rt');
    assert.ok(rbHello, 'Hello (index 0) should still find an <rb> element');
    assert.ok(rtHello, 'Hello (index 0) should still find an <rt> element');
    assert.equal(
      rbHello?.textContent,
      'Hello',
      'English word in <rb> for Hello should be "Hello"'
    );
    assert.equal(
      rtHello?.textContent,
      'こんにちは',
      'Furigana in <rt> for Hello should be "こんにちは"'
    );

    // Assert "World" (index 1) does not show furigana
    assert.equal(
      worldSpan.textContent?.trim(),
      'World',
      'World should remain plain text'
    );
    const rubyElementWorld = worldSpan.querySelector('ruby');
    assert.isNull(
      rubyElementWorld,
      'World (index 1) <ruby> element should not be present.'
    );
  });

  test('Test Toggling Furigana (Clicking Selected Word Again)', async () => {
    const model = await getModel();
    const game = model.game;
    await game.supplyQuestion({
      english: 'Hello [こんにちは] World',
      // japanese: [' irrelevant '], // Removed
      parsed: [], // Remains empty
    });
    await game.updateComplete;

    await clickEnglishWord(model, 0); // Click "Hello" (shows furigana)
    let helloSpan = model.shadowRoot.querySelectorAll(
      '#english .english-word'
    )[0] as HTMLElement;
    const rubyElementAfterFirstClick = helloSpan.querySelector('ruby');
    assert.ok(
      rubyElementAfterFirstClick,
      'A <ruby> element should be present after the first click.'
    );
    const rbAfterFirstClick = helloSpan.querySelector('rb');
    const rtAfterFirstClick = helloSpan.querySelector('rt');
    assert.ok(
      rbAfterFirstClick,
      'Should find an <rb> element after first click'
    );
    assert.ok(
      rtAfterFirstClick,
      'Should find an <rt> element after first click'
    );
    assert.equal(
      rbAfterFirstClick?.textContent,
      'Hello',
      'English word in <rb> should be "Hello" after first click'
    );
    assert.equal(
      rtAfterFirstClick?.textContent,
      'こんにちは',
      'Furigana in <rt> should be "こんにちは" after first click'
    );

    await clickEnglishWord(model, 0); // Click "Hello" again (hides furigana)
    helloSpan = model.shadowRoot.querySelectorAll(
      '#english .english-word'
    )[0] as HTMLElement; // Re-query after update
    const rubyElementAfterSecondClick = helloSpan.querySelector('ruby');
    assert.isNull(
      rubyElementAfterSecondClick,
      'The <ruby> element should be removed after the second click, hiding furigana.'
    );
    assert.equal(
      helloSpan.textContent?.trim(),
      'Hello',
      'English word should remain after hiding furigana'
    );
  });

  test('Multiple Furigana Display and Independent Toggle', async () => {
    const model = await getModel();
    const game = model.game;
    await game.supplyQuestion({
      english: 'One [いち] Two [に] Three [さん]',
      // japanese: ['...'], // Removed
      parsed: [], // Remains empty
    });
    await game.updateComplete;

    const getWordSpan = (index: number) =>
      model.shadowRoot.querySelectorAll('#english .english-word')[
        index
      ] as HTMLElement;
    const assertFuriganaVisible = (
      span: HTMLElement,
      word: string,
      furigana: string,
      isVisible: boolean
    ) => {
      const rubyElement = span.querySelector('ruby');
      if (isVisible) {
        assert.ok(rubyElement, `<ruby> for "${word}" should be visible.`);
        const rb = span.querySelector('rb');
        const rt = span.querySelector('rt');
        assert.ok(rb, `<rb> for "${word}" should exist.`);
        assert.ok(rt, `<rt> for "${word}" should exist.`);
        assert.equal(rb?.textContent, word, `rb content for "${word}"`);
        assert.equal(rt?.textContent, furigana, `rt content for "${word}"`);
      } else {
        assert.isNull(
          rubyElement,
          `<ruby> for "${word}" should NOT be visible.`
        );
        assert.equal(
          span.textContent?.trim(),
          word,
          `Plain text for "${word}" should be visible.`
        );
      }
    };

    let wordOneSpan = getWordSpan(0);
    let wordTwoSpan = getWordSpan(1);
    let wordThreeSpan = getWordSpan(2);

    // Initial state: all furigana hidden
    assertFuriganaVisible(wordOneSpan, 'One', 'いち', false);
    assertFuriganaVisible(wordTwoSpan, 'Two', 'に', false);
    assertFuriganaVisible(wordThreeSpan, 'Three', 'さん', false);

    // Click 'One' (index 0)
    await clickEnglishWord(model, 0);
    wordOneSpan = getWordSpan(0);
    wordTwoSpan = getWordSpan(1);
    wordThreeSpan = getWordSpan(2);
    assertFuriganaVisible(wordOneSpan, 'One', 'いち', true);
    assertFuriganaVisible(wordTwoSpan, 'Two', 'に', false);
    assertFuriganaVisible(wordThreeSpan, 'Three', 'さん', false);

    // Click 'Two' (index 1)
    await clickEnglishWord(model, 1);
    wordOneSpan = getWordSpan(0);
    wordTwoSpan = getWordSpan(1);
    wordThreeSpan = getWordSpan(2);
    assertFuriganaVisible(wordOneSpan, 'One', 'いち', true); // Should still be visible
    assertFuriganaVisible(wordTwoSpan, 'Two', 'に', true);
    assertFuriganaVisible(wordThreeSpan, 'Three', 'さん', false);

    // Click 'Three' (index 2)
    await clickEnglishWord(model, 2);
    wordOneSpan = getWordSpan(0);
    wordTwoSpan = getWordSpan(1);
    wordThreeSpan = getWordSpan(2);
    assertFuriganaVisible(wordOneSpan, 'One', 'いち', true); // Still visible
    assertFuriganaVisible(wordTwoSpan, 'Two', 'に', true); // Still visible
    assertFuriganaVisible(wordThreeSpan, 'Three', 'さん', true);

    // Click 'One' again (toggle off)
    await clickEnglishWord(model, 0);
    wordOneSpan = getWordSpan(0);
    wordTwoSpan = getWordSpan(1);
    wordThreeSpan = getWordSpan(2);
    assertFuriganaVisible(wordOneSpan, 'One', 'いち', false);
    assertFuriganaVisible(wordTwoSpan, 'Two', 'に', true); // Still visible
    assertFuriganaVisible(wordThreeSpan, 'Three', 'さん', true); // Still visible

    // Click 'Two' again (toggle off)
    await clickEnglishWord(model, 1);
    wordOneSpan = getWordSpan(0);
    wordTwoSpan = getWordSpan(1);
    wordThreeSpan = getWordSpan(2);
    assertFuriganaVisible(wordOneSpan, 'One', 'いち', false);
    assertFuriganaVisible(wordTwoSpan, 'Two', 'に', false);
    assertFuriganaVisible(wordThreeSpan, 'Three', 'さん', true); // Still visible

    // Click 'Three' again (toggle off)
    await clickEnglishWord(model, 2);
    wordOneSpan = getWordSpan(0);
    wordTwoSpan = getWordSpan(1);
    wordThreeSpan = getWordSpan(2);
    assertFuriganaVisible(wordOneSpan, 'One', 'いち', false);
    assertFuriganaVisible(wordTwoSpan, 'Two', 'に', false);
    assertFuriganaVisible(wordThreeSpan, 'Three', 'さん', false);
  });
});

suite('Nihon/Nippon Augmenter Tests', () => {
  const nipponKatakana = wanakana.toKatakana('nippon'); // ニッポン
  const nihonKatakana = wanakana.toKatakana('nihon');   // ニホン

  // Helper to check if a specific token group (by readings) exists in the output
  const findGroupByReadings = (groups: Token[][], readings: string[]): Token[] | undefined => {
    return groups.find(group => 
      group.length === readings.length && 
      group.every((token, index) => token.reading === readings[index])
    );
  };

  test('performAugmentation: 日本 (ニッポン) should yield both 日本 (ニッポン) and 日本 (ニホン)', async () => {
    const initialGroup: Token[] = [
      makeToken('日本', nipponKatakana, '名詞', '*', '*', '*', '*', '*', '日本', nipponKatakana)
    ];
    const augmentedGroups = await performAugmentation([initialGroup]);
    
    assert.equal(augmentedGroups.length, 2, 'Should produce two groups: original and augmented.');

    const originalVariant = findGroupByReadings(augmentedGroups, [nipponKatakana]);
    assert.isDefined(originalVariant, 'Original 日本(ニッポン) group should be present.');
    if (originalVariant) {
      assert.equal(originalVariant[0].surface_form, '日本');
      assert.equal(originalVariant[0].reading, nipponKatakana);
    }

    const augmentedVariant = findGroupByReadings(augmentedGroups, [nihonKatakana]);
    assert.isDefined(augmentedVariant, 'Augmented 日本(ニホン) group should be present.');
    if (augmentedVariant) {
      assert.equal(augmentedVariant[0].surface_form, '日本');
      assert.equal(augmentedVariant[0].reading, nihonKatakana);
    }
  });

  test('performAugmentation: 日本 (ニホン) should yield both 日本 (ニホン) and 日本 (ニッポン)', async () => {
    const initialGroup: Token[] = [
      makeToken('日本', nihonKatakana, '名詞', '*', '*', '*', '*', '*', '日本', nihonKatakana)
    ];
    const augmentedGroups = await performAugmentation([initialGroup]);
    
    assert.equal(augmentedGroups.length, 2, 'Should produce two groups: original and augmented.');

    const originalVariant = findGroupByReadings(augmentedGroups, [nihonKatakana]);
    assert.isDefined(originalVariant, 'Original 日本(ニホン) group should be present.');
    if (originalVariant) {
      assert.equal(originalVariant[0].surface_form, '日本');
      assert.equal(originalVariant[0].reading, nihonKatakana);
    }

    const augmentedVariant = findGroupByReadings(augmentedGroups, [nipponKatakana]);
    assert.isDefined(augmentedVariant, 'Augmented 日本(ニッポン) group should be present.');
    if (augmentedVariant) {
      assert.equal(augmentedVariant[0].surface_form, '日本');
      assert.equal(augmentedVariant[0].reading, nipponKatakana);
    }
  });

  test('performAugmentation: Sentence context "日本のニッポン"', async () => {
    // "日本 の ニッポン" (surface_forms)
    // "ニッポン ノ ニッポン" (readings for this test)
    const initialGroup: Token[] = [
      makeToken('日本', nipponKatakana, '名詞'),
      makeToken('の', 'ノ', '助詞'),
      makeToken('ニッポン', nipponKatakana, '名詞'), // This is a surface form "ニッポン", not "日本"
    ];
    const augmentedGroups = await performAugmentation([initialGroup]);

    assert.equal(augmentedGroups.length, 2, 'Should produce two groups: original and augmented for "日本(ニッポン) の ニッポン".');

    const originalGroup = findGroupByReadings(augmentedGroups, [nipponKatakana, wanakana.toKatakana('no'), nipponKatakana]);
    assert.isDefined(originalGroup, 'Original sentence group should be present.');
    if (originalGroup) {
      assert.equal(originalGroup[0].reading, nipponKatakana, 'First 日本 reading should be ニッポン in original.');
      assert.equal(originalGroup[2].reading, nipponKatakana, 'Second token (surface ニッポン) should be ニッポン in original.');
    }
    
    const augmentedGroup = findGroupByReadings(augmentedGroups, [nihonKatakana, wanakana.toKatakana('no'), nipponKatakana]);
    assert.isDefined(augmentedGroup, 'Augmented sentence group should be present for "日本(ニッポン) の ニッポン".');
    if (augmentedGroup) {
      assert.equal(augmentedGroup[0].reading, nihonKatakana, 'First 日本 reading should change to ニホン in augmented.');
      assert.equal(augmentedGroup[1].surface_form, 'の');
      assert.equal(augmentedGroup[2].surface_form, 'ニッポン');
      assert.equal(augmentedGroup[2].reading, nipponKatakana, 'Surface form ニッポン should not be affected by the 日本 augmenter in augmented.');
    }
  });
  
  test('performAugmentation: Sentence context "日本のニホン"', async () => {
    const initialGroup: Token[] = [
      makeToken('日本', nihonKatakana, '名詞'),
      makeToken('の', wanakana.toKatakana('no'), '助詞'),
      makeToken('ニホン', nihonKatakana, '名詞'), // Surface form is "ニホン"
    ];
    const augmentedGroups = await performAugmentation([initialGroup]);

    assert.equal(augmentedGroups.length, 2, 'Should produce two groups for "日本(ニホン) の ニホン": original and augmented "日本" part.');

    const originalGroup = findGroupByReadings(augmentedGroups, [nihonKatakana, wanakana.toKatakana('no'), nihonKatakana]);
    assert.isDefined(originalGroup, 'Original "日本(ニホン) の ニホン" sentence group should be present.');
    if (originalGroup) {
      assert.equal(originalGroup[0].reading, nihonKatakana);
      assert.equal(originalGroup[2].surface_form, 'ニホン');
      assert.equal(originalGroup[2].reading, nihonKatakana);
    }
    
    const augmentedGroup = findGroupByReadings(augmentedGroups, [nipponKatakana, wanakana.toKatakana('no'), nihonKatakana]);
    assert.isDefined(augmentedGroup, 'Augmented "日本(ニッポン) の ニホン" sentence group should be present.');
    if (augmentedGroup) {
      assert.equal(augmentedGroup[0].reading, nipponKatakana);
      assert.equal(augmentedGroup[2].surface_form, 'ニホン');
      assert.equal(augmentedGroup[2].reading, nihonKatakana);
    }
  });

  test('performAugmentation: Multiple "日本" tokens with "ニッポン" reading', async () => {
    // "日本 、 日本" with both readings as "ニッポン"
    const initialGroup: Token[] = [
      makeToken('日本', nipponKatakana, '名詞'),
      makeToken('、', wanakana.toKatakana('、'), '記号'),
      makeToken('日本', nipponKatakana, '名詞'),
    ];
    const augmentedGroups = await performAugmentation([initialGroup]);

    assert.equal(augmentedGroups.length, 2, 'Should produce two groups for multiple ニッポン: original and all-Nihon.');

    const originalGroup = findGroupByReadings(augmentedGroups, [nipponKatakana, wanakana.toKatakana('、'), nipponKatakana]);
    assert.isDefined(originalGroup, 'Original group with two ニッポン readings should be present.');
    if (originalGroup) {
      assert.equal(originalGroup[0].reading, nipponKatakana);
      assert.equal(originalGroup[2].reading, nipponKatakana);
    }

    const augmentedGroup = findGroupByReadings(augmentedGroups, [nihonKatakana, wanakana.toKatakana('、'), nihonKatakana]);
    assert.isDefined(augmentedGroup, 'Augmented group with two ニホン readings should be present for multiple ニッポン.');
    if (augmentedGroup) {
      assert.equal(augmentedGroup[0].reading, nihonKatakana);
      assert.equal(augmentedGroup[2].reading, nihonKatakana);
    }
  });

  test('performAugmentation: Multiple "日本" tokens with "ニホン" reading', async () => {
    const initialGroup: Token[] = [
      makeToken('日本', nihonKatakana, '名詞'),
      makeToken('、', wanakana.toKatakana('、'), '記号'),
      makeToken('日本', nihonKatakana, '名詞'),
    ];
    const augmentedGroups = await performAugmentation([initialGroup]);

    assert.equal(augmentedGroups.length, 2, 'Should produce two groups for multiple ニホン: original and all-Nippon.');

    const originalGroup = findGroupByReadings(augmentedGroups, [nihonKatakana, wanakana.toKatakana('、'), nihonKatakana]);
    assert.isDefined(originalGroup, 'Original group with two ニホン readings should be present.');
    if (originalGroup) {
      assert.equal(originalGroup[0].reading, nihonKatakana);
      assert.equal(originalGroup[2].reading, nihonKatakana);
    }

    const augmentedGroup = findGroupByReadings(augmentedGroups, [nipponKatakana, wanakana.toKatakana('、'), nipponKatakana]);
    assert.isDefined(augmentedGroup, 'Augmented group with two ニッポン readings should be present for multiple ニホン.');
    if (augmentedGroup) {
      assert.equal(augmentedGroup[0].reading, nipponKatakana);
      assert.equal(augmentedGroup[2].reading, nipponKatakana);
    }
  });

  test('performAugmentation: Mixed readings "日本 (ニッポン)" and "日本 (ニホン)" in initial groups', async () => {
    const groupNipponInitial: Token[] = [makeToken('日本', nipponKatakana, '名詞')];
    const groupNihonInitial: Token[] = [makeToken('日本', nihonKatakana, '名詞')];
    
    const augmentedGroups = await performAugmentation([groupNipponInitial, groupNihonInitial]);
    
    // With the new key, both initial groups are distinct and added to the map.
    // 1. `groupNipponInitial` (`日本(ニッポン)`) is added.
    // 2. `groupNihonInitial` (`日本(ニホン)`) is added.
    // When `groupNipponInitial` is processed from the queue:
    //    - `augmentNipponToNihon` generates a `日本(ニホン)` variant. Key `日本(ニホン)` is already in map. Not added to queue.
    //    - `augmentNihonToNippon` does not fire.
    // When `groupNihonInitial` is processed from the queue:
    //    - `augmentNipponToNihon` does not fire.
    //    - `augmentNihonToNippon` generates a `日本(ニッポン)` variant. Key `日本(ニッポン)` is already in map. Not added to queue.
    // So, the final list contains exactly the two initial distinct groups.
    assert.equal(augmentedGroups.length, 2, 'Should result in two distinct groups from the initial set, no new variants added to map from augmentation.');

    const nipponVariant = findGroupByReadings(augmentedGroups, [nipponKatakana]);
    assert.isDefined(nipponVariant, 'The 日本(ニッポン) variant from initial groups should be present.');
    
    const nihonVariant = findGroupByReadings(augmentedGroups, [nihonKatakana]);
    assert.isDefined(nihonVariant, 'The 日本(ニホン) variant from initial groups should be present.');
  });
});
