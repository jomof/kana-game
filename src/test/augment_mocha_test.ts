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
});

// suite('augment', () => {
//   test('watashi', async () => {
//     const tokenGroups = await tokenizeAll(['私 は 今 本 を 読んでいます。']);
//     const augmented = (await augmentTokenGroups(tokenGroups)).map(
//       tokensToString
//     );
//     assert.deepEqual(augmented, [
//       'あたし(アタシ)|は(ハ)|今(イマ)|本(ホン)|を(ヲ)|読ん(ヨン)|で(デ)|い(イ)|ます(マス)|。(。)',
//       '今(イマ)|本(ホン)|を(ヲ)|読ん(ヨン)|で(デ)|い(イ)|ます(マス)|。(。)',
//       '俺(オレ)|は(ハ)|今(イマ)|本(ホン)|を(ヲ)|読ん(ヨン)|で(デ)|い(イ)|ます(マス)|。(。)',
//       '僕(ボク)|は(ハ)|今(イマ)|本(ホン)|を(ヲ)|読ん(ヨン)|で(デ)|い(イ)|ます(マス)|。(。)',
//       '私(ワタシ)|は(ハ)|今(イマ)|本(ホン)|を(ヲ)|読ん(ヨン)|で(デ)|い(イ)|ます(マス)|。(。)',
//     ]);
//   });

//   test('nippon to nihon', async () => {
//     const tokenGroups = await tokenizeAll(['日本 に 行きたい。']);
//     const augmented = (await augmentTokenGroups(tokenGroups)).map(
//       tokensToString
//     );
//     assert.deepEqual(augmented, [
//       '日本(ニッポン)|に(ニ)|行き(イキ)|たい(タイ)|。(。)',
//       '日本(ニホン)|に(ニ)|行き(イキ)|たい(タイ)|。(。)',
//     ]);
//   });
// });
