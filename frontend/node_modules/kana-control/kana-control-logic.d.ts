/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
/**
 * A Token represents a parsed Japanese morpheme with optional marking state.
 */
export interface Token {
    marked: boolean | undefined;
    surface_form: string;
    reading?: string;
    pos?: string;
}
/**
 * A Question contains the English prompt with furigana annotations and
 * multiple acceptable Japanese answers.
 */
export interface Question {
    english: string;
    japanese: string[];
    parsed: Token[][];
}
/**
 * ParsedEnglishPart represents a word in the English prompt, optionally
 * with furigana (reading) attached.
 */
export interface ParsedEnglishPart {
    englishWord: string;
    furigana: string;
}
export type ParsedEnglish = ParsedEnglishPart[];
/**
 * Recursive helper to find matching tokens.
 * @returns an array of token‐indices if `str` can be covered by a subsequence
 *          of `tokens[i].reading`, or `null` otherwise.
 */
export declare function findMatch(tokens: Token[], str: string, startIdx: number, pos: number): number[] | null;
/** Flat‐array overload */
export declare function markTokens(tokens: Token[], str: string): {
    matched: number[] | null;
};
/** Nested‐array overload */
export declare function markTokens(tokens: Token[][], str: string): {
    matched: number[] | null;
}[];
/**
 * Filters an array of token groups, returning only those with the maximum
 * number of marked tokens.
 */
export declare function getGroupsWithMaxMarkedTokens(groups: Token[][]): Token[][];
/**
 * Returns true if any token was newly marked.
 */
export declare function anyMarked(result: {
    matched: number[] | null;
}[]): boolean;
/**
 * Selects the "best" token sequence from an array of candidate groups.
 * Criteria:
 *  1. Highest number of tokens with `marked === true`
 *  2. (Tiebreaker) Lowest number of tokens with `marked === false`
 */
export declare function selectBestGroup(groups: Token[][]): Token[];
/**
 * Returns true if every non-punctuation token in the array is marked.
 */
export declare function isCompleted(tokens: Token[]): boolean;
/**
 * Creates a Question object from an English prompt and Japanese answer(s).
 * English can include furigana annotations in brackets: "word[ふりがな]"
 *
 * @param english - English text with optional furigana annotations
 * @param japanese - Array of acceptable Japanese answers
 * @returns A Question object with tokenized and augmented Japanese
 *
 * @example
 * ```ts
 * const q = await makeQuestion('I live[すむ] in Seattle[シアトル].', [
 *   '私 は シアトル に 住んでいます。',
 *   '私 は シアトル に 住んでる。',
 * ]);
 * ```
 */
export declare function makeQuestion(english: string, japanese: string[]): Promise<Question>;
export declare function parseEnglishString(eng: string): ParsedEnglish;
//# sourceMappingURL=kana-control-logic.d.ts.map