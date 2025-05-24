/**
 * @license
 * Copyright 2025 Jomo Fisher
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {IpadicFeatures} from '@patdx/kuromoji';
import {tokenize} from './tokenize.js';



type TokenAugmenter = (tokens: IpadicFeatures[]) => Promise<IpadicFeatures [][]>;

/**
 * Creates a TokenAugmenter by:
 *  – checking `guard(tokens)`
 *  – joining tokens → raw string
 *  – running replacer(raw) → [variant1, variant2…]
 *  – tokenizing each variant → Token[]
 */
function makeTokenAugmenter(
  guard: (tokens: IpadicFeatures[]) => boolean,
  replacer: (raw: string) => string[]
): TokenAugmenter {
  return async (tokens) => {
    if (!guard(tokens)) return [];
    const raw = tokens
        .filter((t) => t.surface_form.trim().length !== 0) // filter out empty tokens
        .map((t) => t.surface_form).join(' ');
    const variants = replacer(raw);
    const out: IpadicFeatures[][] = [];
    for (const text of variants) {
      const toks = await tokenize(text);
      out.push(toks.filter((t) => t.surface_form.trim().length !== 0)); // filter out empty tokens
    }
    return out;
  };
}

const augmentWatashiTokens = makeTokenAugmenter(
  (tokens) => tokens.some((t) => t.surface_form === '私'),
  (raw) => [raw.replace(/私/g, '僕')]
);

const augmentBokuTokens = makeTokenAugmenter(
  (tokens) => tokens.some((t) => t.surface_form === '僕'),
  (raw) => [raw.replace(/僕/g, '俺')]
);

const augmentAnataTokens = makeTokenAugmenter(
  (tokens) => tokens.some((t) => t.surface_form === 'あなた'),
  (raw) => [raw.replace(/あなた/g, '君')]
);

const augmentAtashiTokens = makeTokenAugmenter(
  (tokens) => tokens.some((t) => t.surface_form === '私'),
  (raw) => [raw.replace(/私/g, 'あたし')]
);

const augmentDesuDaTokens = makeTokenAugmenter(
  (tokens) => {
    const n = tokens.length;
    if (n < 2) return false;
    const pen = tokens[n - 2],
      last = tokens[n - 1];
    return (
      pen.surface_form === 'です' &&
      pen.pos === '助動詞' &&
      pen.conjugated_form === '基本形' &&
      last.surface_form === '。' &&
      last.pos === '記号'
    );
  },
  (raw) => {
    const stem = raw.slice(0, -' です。'.length);
    return [stem + 'だ。'];
  }
);

const augmentDropWatashiHa = makeTokenAugmenter(
  // Guard: first two tokens are 私 + は, and there’s at least one more token
  (tokens) =>
    tokens.length > 2 &&
    tokens[0].surface_form === '私' &&
    tokens[1].surface_form === 'は' &&
    // ensure next token isn’t another particle (so we won’t start with は)
    tokens[2].pos !== '助詞',

  // Replacer: lexically cut off the leading “私は”
  (raw) => {
    const dropped = raw.trim().slice('私 は'.length);
    return [dropped.trim()];
  }
);

export function makeReadingModifierAugmenter(
  surfaceForm: string,
  originalReading: string,
  newReading: string
): TokenAugmenter {
  return async (tokens: IpadicFeatures[]): Promise<IpadicFeatures[][]> => {
    const tokenIndex = tokens.findIndex(
      (t) => t.surface_form === surfaceForm && t.reading === originalReading
    );

    if (tokenIndex === -1) {
      return Promise.resolve([]);
    }

    const newGroup = structuredClone(tokens);
    newGroup[tokenIndex].reading = newReading;
    return Promise.resolve([newGroup]);
  };
}

const tokenAugmenters: TokenAugmenter[] = [
  augmentWatashiTokens,
  augmentBokuTokens,
  augmentAnataTokens,
  augmentAtashiTokens,
  augmentDesuDaTokens,
  augmentDropWatashiHa,
  makeReadingModifierAugmenter('日本', 'ニッポン', 'ニホン'),
  makeReadingModifierAugmenter('日本', 'ニホン', 'ニッポン')
];

export function toLexicalKey(
  tokens: IpadicFeatures[]
): string {
  return tokens.map((t) => `${t.surface_form}(${t.reading})`).join('|');
}

export async function augmentTokenGroups(
  initialGroups: IpadicFeatures[][]
): Promise<IpadicFeatures[][]> {
  // map rawSurface → tokens, to dedupe
  const map = new Map<string, IpadicFeatures[]>();
  // a queue of groups we still need to process
  const queue: IpadicFeatures[][] = [];

  function addToQueue(tokens: IpadicFeatures[]) {
    const key = toLexicalKey(tokens);
    if (!map.has(key)) {
      map.set(key, tokens);
      queue.push(tokens);
    }
  }

  // seed with the originals
  for (const grp of initialGroups) {
    addToQueue(grp)
  }

  // process until no new groups are produced
  while (queue.length > 0) {
    const grp = queue.shift()!;
    for (const plugin of tokenAugmenters) {
      const results = await plugin(grp);
      for (const newGrp of results) {
        addToQueue(newGrp);
      }
    }
  }

  const result = Array.from(map.values()).map((tokens) => tokens.filter((token) => token.surface_form.trim().length !== 0));
  result.sort((a, b) => toLexicalKey(a).localeCompare(toLexicalKey(b)));

  return result;
}
