/**
 * @license
 * Copyright 2025 Jomo Fisher
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {IpadicFeatures} from '@patdx/kuromoji';
import {tokenize} from './tokenize.js';

type TokenAugmenter = (tokens: IpadicFeatures[]) => Promise<IpadicFeatures[][]>;

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
    const raw = tokens.map((t) => t.surface_form).join(' ');
    const variants = replacer(raw);
    const out: IpadicFeatures[][] = [];
    for (const text of variants) {
      const toks = await tokenize(text);
      out.push(toks); // filter out empty tokens
    }
    return out;
  };
}




async function augmentDesuDaTokens(
  tokens: IpadicFeatures[]
): Promise<IpadicFeatures[][]> {
  const desuIndex = tokens.findIndex((t) => t.surface_form === 'です');
  
  if (desuIndex !== tokens.length - 1 &&
     (desuIndex !== tokens.length - 2 ||
      (tokens[tokens.length - 1].pos !== '記号' &&
      tokens[tokens.length - 1].pos !== '名詞'))) {
    
    return Promise.resolve([]);
  }
  if (desuIndex > 0) {
    const prior = tokens[desuIndex - 1];
    if (prior.pos !== '名詞') {
      return Promise.resolve([]);
    }
  }
  
  const replacement = tokens
    .map((t, i) => {
      if (i === desuIndex) return 'だ';
      return t.surface_form;
    })
    .join(' ');
  const replacementTokens = await tokenize(replacement);
  return Promise.resolve([replacementTokens]);
}

function makeReplaceWholeToken(
  search: string,
  replacement: string
): TokenAugmenter {
  async function replace(tokens: IpadicFeatures[]) {
    const result = []
    let changed = false;
    for (const token of tokens) {
      if (token.surface_form === search) {
        changed = true;
        result.push(replacement);
      } else {
        result.push(token.surface_form);
      }
    }
    if (!changed) return Promise.resolve([]);
    return Promise.resolve([await tokenize(result.join(' '))]);
  };
  return replace
}

const augmentDropWatashiHa = makeTokenAugmenter(
  // Guard: first two tokens are 私 + は, and there’s at least one more token
  (tokens) => tokens.length > 1 && tokens[0].surface_form === '私', // &&
  // tokens[1].surface_form === 'は',

  // Replacer: lexically cut off the leading “私は”
  (raw) => {
    const dropped = raw.slice('私 は '.length);
    return [dropped];
  }
);

export function makeReadingModifierAugmenter(
  surfaceForm: string,
  newReading: string
): TokenAugmenter {
  return async (tokens: IpadicFeatures[]): Promise<IpadicFeatures[][]> => {
    const tokenIndex = tokens.findIndex((t) => t.surface_form === surfaceForm);

    if (tokenIndex === -1) {
      return Promise.resolve([]);
    }

    const newGroup = structuredClone(tokens);
    newGroup[tokenIndex].reading = newReading;
    return Promise.resolve([newGroup]);
  };
}

const tokenAugmenters: TokenAugmenter[] = [
  makeReplaceWholeToken('私', '僕'),
  makeReplaceWholeToken('僕', '俺'),
  makeReplaceWholeToken('あなた', '君'),
  makeReplaceWholeToken('君', 'あなた'),
  makeReplaceWholeToken('私', 'あたし'),
  augmentDesuDaTokens,
  augmentDropWatashiHa,
  makeReadingModifierAugmenter('日本', 'ニホン'),
];

export function toLexicalKey(tokens: IpadicFeatures[]): string {
  return JSON.stringify(tokens.map((t) => `${t.surface_form}(${t.reading})`));
}

export async function augmentTokenGroups(
  initialGroups: IpadicFeatures[][]
): Promise<IpadicFeatures[][]> {
  // map rawSurface → tokens, to dedupe
  const map = new Map<string, IpadicFeatures[]>();
  // a queue of groups we still need to process
  const queue: IpadicFeatures[][] = [];

  function addToQueue(tokens: IpadicFeatures[]) {
    const noWhitespace = tokens.filter(
      (it) => it.surface_form.trim().length !== 0
    );
    const key = toLexicalKey(noWhitespace);
    if (!map.has(key)) {
      map.set(key, noWhitespace);
      queue.push(noWhitespace);
    }
  }

  // seed with the originals
  for (const grp of initialGroups) {
    addToQueue(grp);
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

  const result = Array.from(map.values());
  result.sort((a, b) => toLexicalKey(a).localeCompare(toLexicalKey(b)));

  return result;
}
