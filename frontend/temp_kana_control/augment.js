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
async function augmentDesuDaTokens(tokens) {
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
        if (i === desuIndex)
            return 'だ';
        return t.surface_form;
    })
        .join(' ');
    const replacementTokens = await tokenize(replacement);
    return Promise.resolve([replacementTokens]);
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
    augmentDesuDaTokens,
    augmentDropWatashiHa,
    makeReadingModifierAugmenter('日本', 'ニッポン'),
    makeReadingModifierAugmenter('日本', 'ニホン'),
    // Bidirectional copula variants
    // です → だ handled by augmentDesuDaTokens; add だ → です
    async (tokens) => {
        const daIndex = tokens.findIndex((t) => t.surface_form === 'だ');
        if (daIndex === -1)
            return [];
        // Only allow at end or followed by 名詞/記号
        if (daIndex !== tokens.length - 1 &&
            (daIndex !== tokens.length - 2 ||
                (tokens[tokens.length - 1].pos !== '記号' &&
                    tokens[tokens.length - 1].pos !== '名詞'))) {
            return [];
        }
        // Prior should be a noun when exists
        if (daIndex > 0 && tokens[daIndex - 1].pos !== '名詞')
            return [];
        const replacement = tokens
            .map((t, i) => (i === daIndex ? 'です' : t.surface_form))
            .join(' ');
        const replacementTokens = await tokenize(replacement);
        return [replacementTokens];
    },
    // Contractions/exapansions: では ↔ じゃ (whole-token only)
    async (tokens) => {
        const idx = tokens.findIndex((t) => t.surface_form === 'では');
        if (idx === -1)
            return [];
        // Guard: Don't contract では → じゃ when followed by ありない
        // (ではありない is valid, but じゃありない mixes formality levels)
        if (idx + 1 < tokens.length && tokens[idx + 1].surface_form === 'あり') {
            if (idx + 2 < tokens.length && tokens[idx + 2].surface_form === 'ない') {
                return []; // Block ではありない → じゃありない
            }
        }
        const out = tokens.map((t, i) => (i === idx ? 'じゃ' : t.surface_form)).join(' ');
        return [await tokenize(out)];
    },
    async (tokens) => {
        const idx = tokens.findIndex((t) => t.surface_form === 'じゃ');
        if (idx === -1)
            return [];
        const out = tokens.map((t, i) => (i === idx ? 'では' : t.surface_form)).join(' ');
        return [await tokenize(out)];
    },
    // Progressive: apply only to final verb token
    async (tokens) => {
        // Find last non-symbol token
        let lastIdx = tokens.length - 1;
        while (lastIdx >= 0 && tokens[lastIdx].pos === '記号') {
            lastIdx--;
        }
        // Handle split tokens ending with て/で + いる → て/で + る
        if (lastIdx >= 1) {
            const last = tokens[lastIdx];
            const prev = tokens[lastIdx - 1];
            if (last.pos === '動詞' && last.surface_form === 'いる' && prev.surface_form.match(/^(て|で)$/)) {
                const out = tokens
                    .map((t, i) => {
                    if (i === lastIdx)
                        return 'る';
                    return t.surface_form;
                })
                    .join(' ');
                return [await tokenize(out)];
            }
        }
        if (lastIdx < 0)
            return [];
        const last = tokens[lastIdx];
        if (!last || last.pos !== '動詞')
            return [];
        if (!last.surface_form.includes('ている') && !last.surface_form.includes('でいる'))
            return [];
        const repl = last.surface_form.replace(/ている/g, 'てる').replace(/でいる/g, 'でる');
        const out = tokens.map((t, i) => (i === lastIdx ? repl : t.surface_form)).join(' ');
        return [await tokenize(out)];
    },
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
    async (tokens) => {
        // Find last non-symbol token
        let lastIdx = tokens.length - 1;
        while (lastIdx >= 0 && tokens[lastIdx].pos === '記号') {
            lastIdx--;
        }
        if (lastIdx < 0)
            return [];
        const last = tokens[lastIdx];
        if (!last || last.pos !== '動詞')
            return [];
        if (!last.surface_form.includes('てる') && !last.surface_form.includes('でる'))
            return [];
        const repl = last.surface_form.replace(/てる/g, 'ている').replace(/でる/g, 'でいる');
        const out = tokens.map((t, i) => (i === lastIdx ? repl : t.surface_form)).join(' ');
        return [await tokenize(out)];
    },
    // Basic negatives and politeness toggles
    // Copula negatives: だ/です ↔ じゃない/ではない
    // Safer: operate per-token with POS/context guards
    // Verb negatives: naive transform ～る → ～ない, ～う-stem verbs not handled exhaustively
    // For this project scope, apply simple string-level replacements for examples
    // Politeness: naive stem + ます ↔ dictionary form
    async (tokens) => {
        // polite → stem (remove trailing ます) on final token that endswith ます
        // Find last non-symbol token
        let lastIdx = tokens.length - 1;
        while (lastIdx >= 0 && tokens[lastIdx].pos === '記号') {
            lastIdx--;
        }
        if (lastIdx < 0)
            return [];
        const last = tokens[lastIdx];
        if (!last || last.pos !== '動詞' || !last.surface_form.endsWith('ます'))
            return [];
        const stem = last.surface_form.replace(/ます$/, '');
        const replaced = tokens
            .map((t, i) => (i === lastIdx ? stem : t.surface_form))
            .join(' ');
        return [await tokenize(replaced)];
    },
    async (tokens) => {
        // dictionary → polite (limited): handle 会う → 会います, 食べる → 食べます
        // Find last non-symbol token
        let lastIdx = tokens.length - 1;
        while (lastIdx >= 0 && tokens[lastIdx].pos === '記号') {
            lastIdx--;
        }
        if (lastIdx < 0)
            return [];
        const last = tokens[lastIdx];
        if (!last || last.pos !== '動詞')
            return [];
        let polite = null;
        if (/る$/.test(last.surface_form)) {
            // ichidan: remove る add ます
            polite = last.surface_form.replace(/る$/, 'ます');
        }
        else if (/う$/.test(last.surface_form)) {
            // godan う → い + ます (会う→会います)
            polite = last.surface_form.replace(/う$/, 'います');
        }
        if (!polite)
            return [];
        const replaced = tokens
            .map((t, i) => (i === lastIdx ? polite : t.surface_form))
            .join(' ');
        return [await tokenize(replaced)];
    },
    // Polite negative ～ません ↔ plain negative ～ない
    async (tokens) => {
        // Find ませ ん pattern (polite negative), allowing for trailing symbols
        if (tokens.length < 2)
            return [];
        // Find last non-symbol token
        let lastIdx = tokens.length - 1;
        while (lastIdx >= 0 && tokens[lastIdx].pos === '記号') {
            lastIdx--;
        }
        if (lastIdx < 1)
            return [];
        const last = tokens[lastIdx];
        const secondLast = tokens[lastIdx - 1];
        if (secondLast.surface_form === 'ませ' && last.surface_form === 'ん') {
            // Guard: Don't convert ありません → ありない (not a valid conjugation)
            // Valid: ではありません → ではない, じゃありません → じゃない
            // Invalid: ではありません → ではありない, じゃありません → じゃありない
            const beforeMase = lastIdx >= 2 ? tokens[lastIdx - 2] : null;
            if (beforeMase && beforeMase.surface_form === 'あり') {
                return []; // Block ありません → ありない
            }
            // Replace ませ ん with ない, keeping trailing symbols
            const beforeNegative = tokens.slice(0, lastIdx - 1).map(t => t.surface_form);
            const afterNegative = tokens.slice(lastIdx + 1).map(t => t.surface_form);
            const replaced = beforeNegative.concat(['ない'], afterNegative).join(' ');
            return [await tokenize(replaced)];
        }
        return [];
    },
    async (tokens) => {
        // Find ない pattern and convert to ませ ん (if preceded by verb stem)
        if (tokens.length < 2)
            return [];
        // Find last non-symbol token
        let lastIdx = tokens.length - 1;
        while (lastIdx >= 0 && tokens[lastIdx].pos === '記号') {
            lastIdx--;
        }
        if (lastIdx < 1)
            return [];
        const last = tokens[lastIdx];
        const secondLast = tokens[lastIdx - 1];
        if (last.surface_form !== 'ない')
            return [];
        // Only convert if previous token is a verb (stem)
        if (secondLast.pos !== '動詞')
            return [];
        const beforeNegative = tokens.slice(0, lastIdx).map(t => t.surface_form);
        const afterNegative = tokens.slice(lastIdx + 1).map(t => t.surface_form);
        const replaced = beforeNegative.concat(['ませ', 'ん'], afterNegative).join(' ');
        return [await tokenize(replaced)];
    },
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