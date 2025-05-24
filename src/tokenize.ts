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

const tokenizerPromise = new kuromoji.TokenizerBuilder({loader}).build();
await tokenizerPromise.catch((e) => console.error('tokenizer failed to load', e));

export function tokenize(text: string): Promise<kuromoji.IpadicFeatures[]> {
  return tokenizerPromise.then(
    (tokenizer) => tokenizer.tokenize(text) as kuromoji.IpadicFeatures[]
  );
}
