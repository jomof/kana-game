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
      "彼(カレ)|の(ノ)|犬(イヌ)|は(ハ)|静か(シズカ)|だ(ダ)",
      "彼(カレ)|の(ノ)|犬(イヌ)|は(ハ)|静か(シズカ)|です(デス)"
    ]);
  });

  it('desu。 -> da。', async () => {
    const tokenGroups = await tokenizeAll(['彼の犬は静かです。']);
    const augmented = (await augmentTokenGroups(tokenGroups)).map(
      tokensToString
    );
    assert.deepEqual(augmented, [
      "彼(カレ)|の(ノ)|犬(イヌ)|は(ハ)|静か(シズカ)|だ(ダ)|。(。)",
      "彼(カレ)|の(ノ)|犬(イヌ)|は(ハ)|静か(シズカ)|です(デス)|。(。)"
    ]);
  });

  it('desu. -> da.', async () => {
    const tokenGroups = await tokenizeAll(['彼の犬は静かです.']);
    const augmented = (await augmentTokenGroups(tokenGroups)).map(
      tokensToString
    );
    assert.deepEqual(augmented, [
      "彼(カレ)|の(ノ)|犬(イヌ)|は(ハ)|静か(シズカ)|だ(ダ)|.(undefined)",
      "彼(カレ)|の(ノ)|犬(イヌ)|は(ハ)|静か(シズカ)|です(デス)|.(undefined)"
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
    assert.deepEqual(augmented, ["これ(コレ)|は(ハ)|ペン(ペン)|です(デス)|か(カ)|？(？)"]);
  });

  it('da after 行きたい is ungrammatical', async () => {
    const tokenGroups = await tokenizeAll(['行きたいです。']);
    const augmented = (await augmentTokenGroups(tokenGroups)).map(
      tokensToString
    );
    assert.deepEqual(augmented, ["行き(イキ)|たい(タイ)|です(デス)|。(。)"]);
  });

  it('desu after noun -> da', async () => {
    const tokenGroups = await tokenizeAll(['猫です。']);
    const augmented = (await augmentTokenGroups(tokenGroups)).map(
      tokensToString
    );
    assert.deepEqual(augmented, [
      '猫(ネコ)|だ(ダ)|。(。)', "猫(ネコ)|です(デス)|。(。)"]);
  });

  it('desu after na-adjective -> da', async () => {
    const tokenGroups = await tokenizeAll(['有名です']);
    const augmented = (await augmentTokenGroups(tokenGroups)).map(
      tokensToString
    );
    assert.deepEqual(augmented, [
      "有名(ユウメイ)|だ(ダ)",
      "有名(ユウメイ)|です(デス)"]);
  });

  it('desu alone', async () => {
    const tokenGroups = await tokenizeAll(['です']);
    const augmented = (await augmentTokenGroups(tokenGroups)).map(
      tokensToString
    );
    assert.deepEqual(augmented, [
      "だ(ダ)",
      "です(デス)"]);
  });

  it('今 本 as "now book"', async () => {
    const tokenGroups = await tokenizeAll(['今 本 です。']);
    const augmented = (await augmentTokenGroups(tokenGroups)).map(
      tokensToString
    );
    assert.deepEqual(augmented, [
      "今(イマ)|本(ホン)|だ(ダ)|。(。)",
      "今(イマ)|本(ホン)|です(デス)|。(。)"]);
  });

  it('今 本 as "imamoto" (name)', async () => {
    const tokenGroups = await tokenizeAll(['今本です。']);
    const augmented = (await augmentTokenGroups(tokenGroups)).map(
      tokensToString
    );
    assert.deepEqual(augmented, [
      "今本(イマモト)|だ(ダ)|。(。)",
      "今本(イマモト)|です(デス)|。(。)"]);
  });

});
