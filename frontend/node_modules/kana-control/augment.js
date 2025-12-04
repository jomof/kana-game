/**
 * @license
 * Copyright 2025 Jomo Fisher
 * SPDX-License-Identifier: BSD-3-Clause
 */
import { tokenize } from './tokenize.js';
/**
 * Creates a TokenAugmenter by:
 *  – checking `guard(tokens)`
 *  – joining tokens → raw string
 *  – running replacer(raw) → [variant1, variant2…]
 *  – tokenizing each variant → Token[]
 */
function makeTokenAugmenter(guard, replacer) {
    return async (tokens) => {
        if (!guard(tokens))
            return [];
        const raw = tokens.map((t) => t.surface_form).join(' ');
        const variants = replacer(raw);
        const out = [];
        for (const text of variants) {
            const toks = await tokenize(text);
            out.push(toks);
        }
        return out;
    };
}
function makeReplaceWholeToken(search, replacement) {
    async function replace(tokens) {
        const result = [];
        for (const token of tokens) {
            if (token.surface_form === search) {
                result.push(replacement);
            }
            else {
                result.push(token.surface_form);
            }
        }
        return Promise.resolve([await tokenize(result.join(' '))]);
    }
    return replace;
}
/**
 * Creates a TokenAugmenter that handles multi-morpheme words that might get split during tokenization.
 * Joins without spaces to preserve morpheme boundaries.
 */
function makeReplaceCompoundToken(search, replacement) {
    async function replace(tokens) {
        let found = false;
        const result = [];
        for (const token of tokens) {
            if (token.surface_form === search) {
                result.push(replacement);
                found = true;
            }
            else {
                result.push(token.surface_form);
            }
        }
        if (!found)
            return [];
        // Join without spaces to let tokenizer handle morpheme boundaries naturally
        return Promise.resolve([await tokenize(result.join(''))]);
    }
    return replace;
}
const augmentDropWatashiHa = makeTokenAugmenter(
// Guard: first two tokens are 私 + は, and there's at least one more token
(tokens) => tokens.length > 2 && tokens[0].surface_form === '私' && tokens[1].surface_form === 'は', 
// Replacer: lexically cut off the leading "私は"
(raw) => {
    // Drop leading tokens up to and including "私 は"
    const parts = raw.split(' ').filter((p) => p.length > 0);
    if (parts.length >= 2 && parts[0] === '私' && parts[1] === 'は') {
        return [parts.slice(2).join(' ')];
    }
    return [raw];
});
export function makeReadingModifierAugmenter(surfaceForm, newReading) {
    return async (tokens) => {
        const tokenIndex = tokens.findIndex((t) => t.surface_form === surfaceForm);
        if (tokenIndex === -1) {
            return Promise.resolve([]);
        }
        const newGroup = structuredClone(tokens);
        newGroup[tokenIndex].reading = newReading;
        return Promise.resolve([newGroup]);
    };
}
const tokenAugmenters = [
    makeReplaceWholeToken('私', '僕'),
    makeReplaceWholeToken('僕', '俺'),
    makeReplaceWholeToken('あなた', '君'),
    makeReplaceWholeToken('君', 'あなた'),
    makeReplaceWholeToken('私', 'あたし'),
    augmentDropWatashiHa,
    makeReadingModifierAugmenter('日本', 'ニッポン'),
    makeReadingModifierAugmenter('日本', 'ニホン'),
    // Quotation contractions: という → っていう
    async (tokens) => {
        // Guard: find token "という" or sequence 助詞 と + 動詞 言う
        // Prefer whole-token replacement first
        const idxWhole = tokens.findIndex((t) => t.surface_form === 'という');
        if (idxWhole !== -1) {
            const out = tokens.map((t, i) => (i === idxWhole ? 'っていう' : t.surface_form)).join(' ');
            return [await tokenize(out)];
        }
        // Sequence case: 助詞 と followed by 動詞 言う
        for (let i = 0; i < tokens.length - 1; i++) {
            const t0 = tokens[i];
            const t1 = tokens[i + 1];
            if (t0.surface_form === 'と' && t0.pos === '助詞' && t1.pos === '動詞' && (t1.basic_form === '言う' || t1.surface_form === '言う')) {
                const out = tokens
                    .map((t, j) => {
                    if (j === i)
                        return 'って';
                    return t.surface_form;
                })
                    .join(' ');
                return [await tokenize(out)];
            }
        }
        return [];
    },
    // Reverse quotation contractions: っていう → という, って + 言う → と + 言う
    async (tokens) => {
        const idxWhole = tokens.findIndex((t) => t.surface_form === 'っていう');
        if (idxWhole !== -1) {
            const out = tokens.map((t, i) => (i === idxWhole ? 'という' : t.surface_form)).join(' ');
            return [await tokenize(out)];
        }
        for (let i = 0; i < tokens.length - 1; i++) {
            const t0 = tokens[i];
            const t1 = tokens[i + 1];
            if (t0.surface_form === 'って' && t1.pos === '動詞' && (t1.basic_form === '言う' || t1.surface_form === '言う')) {
                const out = tokens
                    .map((t, j) => {
                    if (j === i)
                        return 'と';
                    return t.surface_form;
                })
                    .join(' ');
                return [await tokenize(out)];
            }
        }
        return [];
    },
    // Expand quotation contractions to cover 思う and similar verbs
    async (tokens) => {
        for (let i = 0; i < tokens.length - 1; i++) {
            const t0 = tokens[i];
            const t1 = tokens[i + 1];
            if (t0.surface_form === 'と' &&
                t0.pos === '助詞' &&
                t1.pos === '動詞' &&
                (t1.basic_form === '思う' || t1.surface_form === '思う')) {
                const out = tokens
                    .map((t, j) => {
                    if (j === i)
                        return 'って';
                    return t.surface_form;
                })
                    .join(' ');
                return [await tokenize(out)];
            }
        }
        return [];
    },
    async (tokens) => {
        for (let i = 0; i < tokens.length - 1; i++) {
            const t0 = tokens[i];
            const t1 = tokens[i + 1];
            if (t0.surface_form === 'って' &&
                t1.pos === '動詞' &&
                (t1.basic_form === '思う' || t1.surface_form === '思う')) {
                const out = tokens
                    .map((t, j) => {
                    if (j === i)
                        return 'と';
                    return t.surface_form;
                })
                    .join(' ');
                return [await tokenize(out)];
            }
        }
        return [];
    },
    // Past copula: だった ↔ でした
    makeReplaceCompoundToken('だった', 'でした'),
    makeReplaceCompoundToken('でした', 'だった'),
];
export function toLexicalKey(tokens) {
    return JSON.stringify(tokens.map((t) => `${t.surface_form}(${t.reading})`));
}
export async function augmentTokenGroups(initialGroups) {
    // map rawSurface → tokens, to dedupe
    const map = new Map();
    // a queue of groups we still need to process
    const queue = [];
    function addToQueue(tokens) {
        const noWhitespace = tokens.filter((it) => it.surface_form.trim().length !== 0);
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
        const grp = queue.shift();
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
//# sourceMappingURL=augment.js.map