/**
 * @license
 * Copyright 2025
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {augmentTokenGroups} from '../augment.js';
import {IpadicFeatures} from '@patdx/kuromoji';
import {tokenize} from '../tokenize.js';
import {strict as assert} from 'assert';

function tokensToString(tokens: IpadicFeatures[]): string {
  return tokens.map((t) => `${t.surface_form}(${t.reading})`).join('|');
}
function tokenizeAll(groups: string[]): Promise<IpadicFeatures[][]> {
  return Promise.all(groups.map((text) => tokenize(text)));
}
describe('augment', () => {
  it('watashi', async () => {
    const tokenGroups = await tokenizeAll(['私 は 今 本 を 読んでいます。']);
    const augmented = (await augmentTokenGroups(tokenGroups)).map(
      tokensToString
    );
    assert.deepEqual(augmented, [
      'あたし(アタシ)|は(ハ)|今(イマ)|本(ホン)|を(ヲ)|読ん(ヨン)|で(デ)|い(イ)|ます(マス)|。(。)',
      '今(イマ)|本(ホン)|を(ヲ)|読ん(ヨン)|で(デ)|い(イ)|ます(マス)|。(。)',
      '俺(オレ)|は(ハ)|今(イマ)|本(ホン)|を(ヲ)|読ん(ヨン)|で(デ)|い(イ)|ます(マス)|。(。)',
      '僕(ボク)|は(ハ)|今(イマ)|本(ホン)|を(ヲ)|読ん(ヨン)|で(デ)|い(イ)|ます(マス)|。(。)',
      '私(ワタシ)|は(ハ)|今(イマ)|本(ホン)|を(ヲ)|読ん(ヨン)|で(デ)|い(イ)|ます(マス)|。(。)',
    ]);
  });

  it('watashi alone', async () => {
    const tokenGroups = await tokenizeAll(['私']);
    const augmented = (await augmentTokenGroups(tokenGroups)).map(
      tokensToString
    );
    assert.deepEqual(augmented, [
      'あたし(アタシ)',
      '俺(オレ)',
      '僕(ボク)',
      '私(ワタシ)',
    ]);
  });

  it('empty sentence', async () => {
    const tokenGroups = await tokenizeAll(['']);
    const augmented = (await augmentTokenGroups(tokenGroups)).map(
      tokensToString
    );
    assert.deepEqual(augmented, ['']);
  });

  it('empty list', async () => {
    const tokenGroups = await tokenizeAll([]);
    const augmented = (await augmentTokenGroups(tokenGroups)).map(
      tokensToString
    );
    assert.deepEqual(augmented, []);
  });

  it('second word は', async () => {
    const tokenGroups = await tokenizeAll(['猫は寝ている。']);
    const augmented = (await augmentTokenGroups(tokenGroups)).map(
      tokensToString
    );
    assert.deepEqual(augmented, [
      '猫(ネコ)|は(ハ)|寝(ネ)|て(テ)|いる(イル)|。(。)',
    ]);
  });

  it('nippon to nihon', async () => {
    const tokenGroups = await tokenizeAll(['日本 に 行きたい。']);
    const augmented = (await augmentTokenGroups(tokenGroups)).map(
      tokensToString
    );
    assert.deepEqual(augmented, [
      '日本(ニッポン)|に(ニ)|行き(イキ)|たい(タイ)|。(。)',
      '日本(ニホン)|に(ニ)|行き(イキ)|たい(タイ)|。(。)',
    ]);
  });

  it('anata -> kimi', async () => {
    const tokenGroups = await tokenizeAll(['あなた は 誰 です か？']);
    const augmented = (await augmentTokenGroups(tokenGroups)).map(
      tokensToString
    );
    assert.deepEqual(augmented, [
      'あなた(アナタ)|は(ハ)|誰(ダレ)|です(デス)|か(カ)|？(？)',
      '君(キミ)|は(ハ)|誰(ダレ)|です(デス)|か(カ)|？(？)',
    ]);
  });

  it('kimi -> anata', async () => {
    const tokenGroups = await tokenizeAll(['君 は 誰 です か']);
    const augmented = (await augmentTokenGroups(tokenGroups)).map(
      tokensToString
    );
    assert.deepEqual(augmented, [
      'あなた(アナタ)|は(ハ)|誰(ダレ)|です(デス)|か(カ)',
      '君(キミ)|は(ハ)|誰(ダレ)|です(デス)|か(カ)',
    ]);
  });

  it('desu -> da', async () => {
    const tokenGroups = await tokenizeAll(['彼の犬は静かです']);
    const augmented = (await augmentTokenGroups(tokenGroups)).map(
      tokensToString
    );
    assert.deepEqual(augmented, [
      '彼(カレ)|の(ノ)|犬(イヌ)|は(ハ)|静か(シズカ)|だ(ダ)',
      '彼(カレ)|の(ノ)|犬(イヌ)|は(ハ)|静か(シズカ)|です(デス)',
    ]);
  });

  it('desu。 -> da。', async () => {
    const tokenGroups = await tokenizeAll(['彼の犬は静かです。']);
    const augmented = (await augmentTokenGroups(tokenGroups)).map(
      tokensToString
    );
    assert.deepEqual(augmented, [
      '彼(カレ)|の(ノ)|犬(イヌ)|は(ハ)|静か(シズカ)|だ(ダ)|。(。)',
      '彼(カレ)|の(ノ)|犬(イヌ)|は(ハ)|静か(シズカ)|です(デス)|。(。)',
    ]);
  });

  it('desu. -> da.', async () => {
    const tokenGroups = await tokenizeAll(['彼の犬は静かです.']);
    const augmented = (await augmentTokenGroups(tokenGroups)).map(
      tokensToString
    );
    assert.deepEqual(augmented, [
      '彼(カレ)|の(ノ)|犬(イヌ)|は(ハ)|静か(シズカ)|だ(ダ)|.(undefined)',
      '彼(カレ)|の(ノ)|犬(イヌ)|は(ハ)|静か(シズカ)|です(デス)|.(undefined)',
    ]);
  });

  it('da after i-adjective is ungrammatical', async () => {
    const tokenGroups = await tokenizeAll(['難しいです']);
    const augmented = (await augmentTokenGroups(tokenGroups)).map(
      tokensToString
    );
    assert.deepEqual(augmented, ['難しい(ムズカシイ)|です(デス)']);
  });

  it('da before ka is ungrammatical', async () => {
    const tokenGroups = await tokenizeAll(['これはペンですか？']);
    const augmented = (await augmentTokenGroups(tokenGroups)).map(
      tokensToString
    );
    assert.deepEqual(augmented, [
      'これ(コレ)|は(ハ)|ペン(ペン)|です(デス)|か(カ)|？(？)',
    ]);
  });

  it('da after 行きたい is ungrammatical', async () => {
    const tokenGroups = await tokenizeAll(['行きたいです。']);
    const augmented = (await augmentTokenGroups(tokenGroups)).map(
      tokensToString
    );
    assert.deepEqual(augmented, ['行き(イキ)|たい(タイ)|です(デス)|。(。)']);
  });

  it('desu after noun -> da', async () => {
    const tokenGroups = await tokenizeAll(['猫です。']);
    const augmented = (await augmentTokenGroups(tokenGroups)).map(
      tokensToString
    );
    assert.deepEqual(augmented, [
      '猫(ネコ)|だ(ダ)|。(。)',
      '猫(ネコ)|です(デス)|。(。)',
    ]);
  });

  it('desu after na-adjective -> da', async () => {
    const tokenGroups = await tokenizeAll(['有名です']);
    const augmented = (await augmentTokenGroups(tokenGroups)).map(
      tokensToString
    );
    assert.deepEqual(augmented, [
      '有名(ユウメイ)|だ(ダ)',
      '有名(ユウメイ)|です(デス)',
    ]);
  });

  it('desu alone', async () => {
    const tokenGroups = await tokenizeAll(['です']);
    const augmented = (await augmentTokenGroups(tokenGroups)).map(
      tokensToString
    );
    assert.deepEqual(augmented, ['だ(ダ)', 'です(デス)']);
  });

  it('今 本 as "now book"', async () => {
    const tokenGroups = await tokenizeAll(['今 本 です。']);
    const augmented = (await augmentTokenGroups(tokenGroups)).map(
      tokensToString
    );
    assert.deepEqual(augmented, [
      '今(イマ)|本(ホン)|だ(ダ)|。(。)',
      '今(イマ)|本(ホン)|です(デス)|。(。)',
    ]);
  });

  it('今 本 as "imamoto" (name)', async () => {
    const tokenGroups = await tokenizeAll(['今本です。']);
    const augmented = (await augmentTokenGroups(tokenGroups)).map(
      tokensToString
    );
    assert.deepEqual(augmented, [
      '今本(イマモト)|だ(ダ)|。(。)',
      '今本(イマモト)|です(デス)|。(。)',
    ]);
  });

  it('desu followed by adverb should not become da', async () => {
    const tokenGroups = await tokenizeAll(['静かによくです']);
    const augmented = (await augmentTokenGroups(tokenGroups)).map(
      tokensToString
    );
    assert.deepEqual(augmented, ['静か(シズカ)|に(ニ)|よく(ヨク)|です(デス)']);
  });

  it('desu followed by incompatible particle sura should not become da', async () => {
    const tokenGroups = await tokenizeAll(['ペンですら']);
    const augmented = (await augmentTokenGroups(tokenGroups)).map(
      tokensToString
    );
    assert.deepEqual(augmented, ['ペン(ペン)|で(デ)|すら(スラ)']);
  });

  it('desu followed by particle to should not become da', async () => {
    const tokenGroups = await tokenizeAll(['彼が犯人ですと皆が言った']);
    const augmented = (await augmentTokenGroups(tokenGroups)).map(
      tokensToString
    );
    assert.deepEqual(augmented, [
      '彼(カレ)|が(ガ)|犯人(ハンニン)|です(デス)|と(ト)|皆(ミナ)|が(ガ)|言っ(イッ)|た(タ)',
    ]);
  });

  it('augmentDropWatashiHa should not drop watashi if not followed by ha', async () => {
    const tokenGroups = await tokenizeAll(['私が本を読みます']);
    const augmented = (await augmentTokenGroups(tokenGroups)).map(
      tokensToString
    );
    assert.deepEqual(
      augmented.sort(),
      [
        'あたし(アタシ)|が(ガ)|本(ホン)|を(ヲ)|読み(ヨミ)|ます(マス)',
        '俺(オレ)|が(ガ)|本(ホン)|を(ヲ)|読み(ヨミ)|ます(マス)',
        '僕(ボク)|が(ガ)|本(ホン)|を(ヲ)|読み(ヨミ)|ます(マス)',
        '本(ホン)|を(ヲ)|読み(ヨミ)|ます(マス)', // This is the result of "私 は" being (incorrectly) sliced from "私 が 本..."
        '私(ワタシ)|が(ガ)|本(ホン)|を(ヲ)|読み(ヨミ)|ます(マス)',
      ].sort()
    );
  });

  it('augmentDropWatashiHa should correctly handle full-width space after watashi before ha', async () => {
    const tokenGroups = await tokenizeAll(['私　は本を読みます']); // U+3000 full-width space
    const augmented = (await augmentTokenGroups(tokenGroups))
      .map(tokensToString)
      .sort();

    assert.deepEqual(
      augmented.sort(),
      [
        'あたし(アタシ)|は(ハ)|本(ホン)|を(ヲ)|読み(ヨミ)|ます(マス)',
        '俺(オレ)|は(ハ)|本(ホン)|を(ヲ)|読み(ヨミ)|ます(マス)',
        '僕(ボク)|は(ハ)|本(ホン)|を(ヲ)|読み(ヨミ)|ます(マス)',
        '本(ホン)|を(ヲ)|読み(ヨミ)|ます(マス)', // Correctly dropped "私 は"
        '私(ワタシ)|は(ハ)|本(ホン)|を(ヲ)|読み(ヨミ)|ます(マス)', // Original, with space normalized
      ].sort()
    );
  });

  it('pronoun replacement should not affect words containing the same character', async () => {
    const tokenGroups = await tokenizeAll(['私は私立の学校に行きます']);
    const augmented = (await augmentTokenGroups(tokenGroups))
      .map(tokensToString)
      .sort();

    assert.deepEqual(
      augmented.sort(),
      [
        'あたし(アタシ)|は(ハ)|私立(シリツ)|の(ノ)|学校(ガッコウ)|に(ニ)|行き(イキ)|ます(マス)',
        '俺(オレ)|は(ハ)|私立(シリツ)|の(ノ)|学校(ガッコウ)|に(ニ)|行き(イキ)|ます(マス)',
        '僕(ボク)|は(ハ)|私立(シリツ)|の(ノ)|学校(ガッコウ)|に(ニ)|行き(イキ)|ます(マス)',
        '私(ワタシ)|は(ハ)|私立(シリツ)|の(ノ)|学校(ガッコウ)|に(ニ)|行き(イキ)|ます(マス)',
        '私立(シリツ)|の(ノ)|学校(ガッコウ)|に(ニ)|行き(イキ)|ます(マス)',
      ].sort()
    );
  });

  it('da after ikitai is ungrammatical', async () => {
    const tokenGroups = await tokenizeAll(['私 は 日本 に 行きたい です。']);
    const augmented = (await augmentTokenGroups(tokenGroups))
      .map(tokensToString)
      .sort();

    assert.deepEqual(
      augmented.sort(),
      [
        "あたし(アタシ)|は(ハ)|日本(ニッポン)|に(ニ)|行き(イキ)|たい(タイ)|です(デス)|。(。)",
        "あたし(アタシ)|は(ハ)|日本(ニホン)|に(ニ)|行き(イキ)|たい(タイ)|です(デス)|。(。)",
        "俺(オレ)|は(ハ)|日本(ニッポン)|に(ニ)|行き(イキ)|たい(タイ)|です(デス)|。(。)",
        "俺(オレ)|は(ハ)|日本(ニホン)|に(ニ)|行き(イキ)|たい(タイ)|です(デス)|。(。)",
        "僕(ボク)|は(ハ)|日本(ニッポン)|に(ニ)|行き(イキ)|たい(タイ)|です(デス)|。(。)",
        "僕(ボク)|は(ハ)|日本(ニホン)|に(ニ)|行き(イキ)|たい(タイ)|です(デス)|。(。)",
        "日本(ニッポン)|に(ニ)|行き(イキ)|たい(タイ)|です(デス)|。(。)",
        "日本(ニホン)|に(ニ)|行き(イキ)|たい(タイ)|です(デス)|。(。)",
        "私(ワタシ)|は(ハ)|日本(ニッポン)|に(ニ)|行き(イキ)|たい(タイ)|です(デス)|。(。)",
        "私(ワタシ)|は(ハ)|日本(ニホン)|に(ニ)|行き(イキ)|たい(タイ)|です(デス)|。(。)",
      ].sort()
    );
  });
  
});
