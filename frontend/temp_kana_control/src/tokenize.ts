/**
 * @license
 * Copyright 2025 Jomo Fisher
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as kuromoji from '@patdx/kuromoji';

const loader: kuromoji.LoaderConfig = {
  async loadArrayBuffer(url: string): Promise<ArrayBufferLike> {
    url = url.replace(/\.gz$/, '');
    const res = await fetch(
      'https://cdn.jsdelivr.net/npm/@aiktb/kuromoji@1.0.2/dict/' + url
    );
    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}: ${res.status}`);
    }
    return res.arrayBuffer();
  },
};

let tokenizerPromise: ReturnType<typeof kuromoji.TokenizerBuilder.prototype.build> | null = null;

function getTokenizer() {
  if (!tokenizerPromise) {
    console.log('Initializing kuromoji tokenizer...');
    tokenizerPromise = new kuromoji.TokenizerBuilder({loader}).build();
  }
  return tokenizerPromise;
}

export type TokenizerFn = (text: string) => Promise<kuromoji.IpadicFeatures[]>;

const defaultTokenize: TokenizerFn = async (text: string) => {
  try {
    const tokenizer = await getTokenizer();
    return tokenizer.tokenize(text) as kuromoji.IpadicFeatures[];
  } catch (error) {
    console.error('Tokenization failed:', error);
    throw error;
  }
};

let tokenizeImpl: TokenizerFn = defaultTokenize;

export const tokenize: TokenizerFn = (text) => tokenizeImpl(text);

export function setTokenizer(fn: TokenizerFn) {
  tokenizeImpl = fn;
}

export function resetTokenizer() {
  tokenizeImpl = defaultTokenize;
}
