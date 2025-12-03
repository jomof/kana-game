/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {KanaControl, makeQuestion} from '../kana-control.js';
import {fixture, assert} from '@open-wc/testing';
import {html} from 'lit/static-html.js';

suite('kana-control', () => {
  test('is defined', () => {
    const el = document.createElement('kana-control');
    assert.instanceOf(el, KanaControl);
  });

  test('renders with default values', async () => {
    const el = (await fixture(
      html`<kana-control></kana-control>`
    )) as KanaControl;
    const input = el.shadowRoot!.querySelector('#kana-input');
    assert.ok(input, 'kana input should exist');
  });

  test('styling applied', async () => {
    const el = (await fixture(
      html`<kana-control></kana-control>`
    )) as KanaControl;
    await el.updateComplete;
    assert.equal(getComputedStyle(el).paddingTop, '16px');
  });

  test('wanakana converts romaji input to kana', async () => {
    const el = (await fixture(
      html`<kana-control></kana-control>`
    )) as KanaControl;
    await el.updateComplete;
    const input = el.shadowRoot!.querySelector(
      '#kana-input'
    ) as HTMLInputElement;
    // Type romaji and trigger input event to let WanaKana convert it
    input.value = 'konnnichiha';
    input.dispatchEvent(new Event('input', {bubbles: true, composed: true}));
    // Expect conversion to Japanese kana
    assert.equal(input.value, 'こんにちは');
  });

  test('makeQuestion creates a question object', async () => {
    const q = await makeQuestion('I am a student[がくせい].', [
      '私 は 学生 です。',
    ]);
    assert.equal(q.english, 'I am a student[がくせい].');
    assert.deepEqual(q.japanese, ['私 は 学生 です。']);
    assert.isArray(q.parsed);
    assert.isTrue(q.parsed.length > 0);
    // Check that tokens are marked as false initially
    q.parsed.forEach((group) => {
      group.forEach((token) => {
        assert.isFalse(token.marked);
      });
    });
  });

  test('supplyQuestion parses English with furigana annotations', async () => {
    const el = (await fixture(
      html`<kana-control></kana-control>`
    )) as KanaControl;
    const q = await makeQuestion('I live[すむ] in Seattle[シアトル].', [
      '私 は シアトル に 住んでいます。',
    ]);
    await el.supplyQuestion(q);
    await el.updateComplete;

    assert.equal(el.parsedEnglish.length, 4);
    assert.deepEqual(el.parsedEnglish, [
      {englishWord: 'I', furigana: ''},
      {englishWord: 'live', furigana: 'すむ'},
      {englishWord: 'in', furigana: ''},
      {englishWord: 'Seattle', furigana: 'シアトル'},
    ]);
  });

  test('English prompt displays with furigana annotations', async () => {
    const el = (await fixture(
      html`<kana-control></kana-control>`
    )) as KanaControl;
    const q = await makeQuestion('I eat[たべる] sushi[すし].', [
      '私 は 寿司 を 食べます。',
    ]);
    await el.supplyQuestion(q);
    await el.updateComplete;

    const englishDiv = el.shadowRoot!.querySelector('#english');
    assert.ok(englishDiv, 'English prompt div should exist');

    const wordSpans = englishDiv!.querySelectorAll('.english-word');
    assert.equal(wordSpans.length, 3, 'Should have 3 word spans');

    // Check that words with furigana have the has-furigana attribute
    const eatSpan = wordSpans[1] as HTMLElement;
    assert.isTrue(
      eatSpan.hasAttribute('has-furigana'),
      'eat word should have has-furigana attribute'
    );

    const sushiSpan = wordSpans[2] as HTMLElement;
    assert.isTrue(
      sushiSpan.hasAttribute('has-furigana'),
      'sushi word should have has-furigana attribute'
    );
  });

  test('Clicking word with furigana toggles display', async () => {
    const el = (await fixture(
      html`<kana-control></kana-control>`
    )) as KanaControl;
    const q = await makeQuestion('Hello[こんにちは] World', ['こんにちは']);
    await el.supplyQuestion(q);
    await el.updateComplete;

    const wordSpans = el.shadowRoot!.querySelectorAll('.english-word');
    const helloSpan = wordSpans[0] as HTMLElement;

    // Initially, furigana should not be visible
    assert.isFalse(
      helloSpan.innerHTML.includes('<ruby>'),
      'Furigana should not be visible initially'
    );

    // Click to show furigana
    helloSpan.click();
    await el.updateComplete;

    const ruby = helloSpan.querySelector('ruby');
    assert.ok(ruby, 'Ruby element should be present after click');
    const rb = helloSpan.querySelector('rb');
    const rt = helloSpan.querySelector('rt');
    assert.equal(rb?.textContent, 'Hello', 'English word should be in rb');
    assert.equal(rt?.textContent, 'こんにちは', 'Furigana should be in rt');

    // Click again to hide furigana
    helloSpan.click();
    await el.updateComplete;

    assert.isFalse(
      helloSpan.innerHTML.includes('<ruby>'),
      'Furigana should be hidden after second click'
    );
  });

  test('Skeleton displays progress for question', async () => {
    const el = (await fixture(
      html`<kana-control></kana-control>`
    )) as KanaControl;
    const q = await makeQuestion('I am a student.', ['私 は 学生 です。']);
    await el.supplyQuestion(q);
    await el.updateComplete;

    const skeleton = el.shadowRoot!.querySelector('#skeleton');
    assert.ok(skeleton, 'Skeleton div should exist');
    
    // Initially all tokens should be unmarked (showing as underscores)
    const skeletonText = skeleton!.textContent?.trim();
    assert.ok(skeletonText, 'Skeleton should have text');
    assert.ok(skeletonText.includes('_'), 'Skeleton should contain underscores for unmarked tokens');
  });

  test('Question with marked tokens shows progress in skeleton', async () => {
    const el = (await fixture(
      html`<kana-control></kana-control>`
    )) as KanaControl;
    const q = await makeQuestion('I am a student.', ['私 は 学生 です。']);
    
    // Mark some tokens manually for testing
    if (q.parsed[0] && q.parsed[0].length > 0) {
      q.parsed[0][0].marked = true; // Mark first token
    }
    
    await el.supplyQuestion(q);
    await el.updateComplete;

    const skeleton = el.shadowRoot!.querySelector('#skeleton');
    const skeletonText = skeleton!.textContent?.trim();
    
    // Should contain both revealed characters and underscores
    assert.ok(skeletonText, 'Skeleton should have text');
    assert.notEqual(skeletonText, '', 'Skeleton text should not be empty');
  });

  test('Multiple questions with different furigana annotations', async () => {
    const el = (await fixture(
      html`<kana-control></kana-control>`
    )) as KanaControl;

    // First question
    const q1 = await makeQuestion('I am a teacher[せんせい].', [
      '私 は 先生 です。',
    ]);
    await el.supplyQuestion(q1);
    await el.updateComplete;

    assert.equal(el.parsedEnglish.length, 4);
    assert.equal(el.parsedEnglish[3].englishWord, 'teacher');
    assert.equal(el.parsedEnglish[3].furigana, 'せんせい');

    // Second question
    const q2 = await makeQuestion('I can speak[はなす] Japanese[にほんご].', [
      '私 は 日本語 を 話せます。',
    ]);
    await el.supplyQuestion(q2);
    await el.updateComplete;

    assert.equal(el.parsedEnglish.length, 4);
    assert.equal(el.parsedEnglish[2].englishWord, 'speak');
    assert.equal(el.parsedEnglish[2].furigana, 'はなす');
    assert.equal(el.parsedEnglish[3].englishWord, 'Japanese');
    assert.equal(el.parsedEnglish[3].furigana, 'にほんご');
  });

    test('validates user answers and marks tokens', async () => {
      const el = (await fixture(
        html`<kana-control></kana-control>`
      )) as KanaControl;
    
      // Create a simple question
      const q = await makeQuestion('I am a student[がくせい].', [
        '私 は 学生 です。',
      ]);
      await el.supplyQuestion(q);
      await el.updateComplete;
    
      const input = el.shadowRoot!.querySelector('#kana-input') as HTMLInputElement;
    
      // Type "watashi" and press enter
      input.value = 'watashi';
      const event1 = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      input.dispatchEvent(event1);
      await el.updateComplete;
    
      // Input should be cleared after successful match
      assert.equal(input.value, '');
    
      // The skeleton should now show "私" as marked
      const skeleton = el.shadowRoot!.querySelector('#skeleton');
      assert.ok(skeleton?.textContent?.includes('私'), 'skeleton should show marked token');
    
      // Type "ha" and press enter
      input.value = 'ha';
      const event2 = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      input.dispatchEvent(event2);
      await el.updateComplete;
    
      // Continue typing the rest
      input.value = 'gakusei';
      const event3 = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      input.dispatchEvent(event3);
      await el.updateComplete;
    
      input.value = 'desu';
      const event4 = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      input.dispatchEvent(event4);
      await el.updateComplete;
    
      // Should show completion indicator
      const completed = skeleton?.textContent?.includes('✓');
      assert.ok(completed, 'skeleton should show completion indicator');
    });

    test('dispatches request-next-question event when Enter is pressed on completed question', async () => {
      const el = (await fixture(
        html`<kana-control></kana-control>`
      )) as KanaControl;
    
      // Create a simple question
      const q = await makeQuestion('I am a student[がくせい].', [
        '私 は 学生 です。',
      ]);
      await el.supplyQuestion(q);
      await el.updateComplete;
    
      const input = el.shadowRoot!.querySelector('#kana-input') as HTMLInputElement;
    
      // Complete the question
      const answers = ['watashi', 'ha', 'gakusei', 'desu'];
      for (const ans of answers) {
        input.value = ans;
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        await el.updateComplete;
      }
      
      // Verify it is completed
      const skeleton = el.shadowRoot!.querySelector('#skeleton');
      assert.ok(skeleton?.textContent?.includes('✓'), 'skeleton should show completion indicator');

      // Listen for the event
      let eventFired = false;
      el.addEventListener('request-next-question', () => {
        eventFired = true;
      });

      // Press Enter again
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      await el.updateComplete;

      assert.isTrue(eventFired, 'request-next-question event should be fired');
    });
});
