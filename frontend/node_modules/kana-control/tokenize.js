/**
 * @license
 * Copyright 2025 Jomo Fisher
 * SPDX-License-Identifier: BSD-3-Clause
 */
import * as kuromoji from '@patdx/kuromoji';
const loader = {
    async loadArrayBuffer(url) {
        url = url.replace(/\.gz$/, '');
        const res = await fetch('https://cdn.jsdelivr.net/npm/@aiktb/kuromoji@1.0.2/dict/' + url);
        if (!res.ok) {
            throw new Error(`Failed to fetch ${url}: ${res.status}`);
        }
        return res.arrayBuffer();
    },
};
let tokenizerPromise = null;
function getTokenizer() {
    if (!tokenizerPromise) {
        tokenizerPromise = new kuromoji.TokenizerBuilder({ loader }).build();
    }
    return tokenizerPromise;
}
const defaultTokenize = async (text) => {
    try {
        const tokenizer = await getTokenizer();
        return tokenizer.tokenize(text.replace(/\s/g, ''));
    }
    catch (error) {
        console.error('Tokenization failed:', error);
        throw error;
    }
};
let tokenizeImpl = defaultTokenize;
export const tokenize = (text) => tokenizeImpl(text);
export function setTokenizer(fn) {
    tokenizeImpl = fn;
}
export function resetTokenizer() {
    tokenizeImpl = defaultTokenize;
}
//# sourceMappingURL=tokenize.js.map