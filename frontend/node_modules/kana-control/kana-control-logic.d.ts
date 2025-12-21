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
 * Grammar analysis for a Japanese answer sentence.
 * Contains linguistic information about formality, gender, register, etc.
 */
export interface GrammarAnalysis {
    /** Linguistic encoding of the sentence in kotogram format */
    kotogram: string;
    /** Formality level of the sentence */
    formality: 'formal' | 'neutral' | 'casual';
    /** Raw formality score, approximately -1.0 to 1.0 */
    formality_score: number;
    /** Whether formality is context-dependent */
    formality_is_pragmatic: boolean;
    /** Gender tendency of the sentence */
    gender: 'masculine' | 'feminine' | 'neutral';
    /** Raw gender score, approximately -1.0 to 1.0 */
    gender_score: number;
    /** Whether gender is context-dependent */
    gender_is_pragmatic: boolean;
    /** Register categories, e.g., ["neutral"], ["danseigo"], ["kansaiben"] */
    registers: string[];
    /** Score for each possible register */
    register_scores: Record<string, number>;
    /** Whether the sentence is grammatically correct */
    is_grammatic: boolean;
    /** Grammaticality confidence score, typically 0.0 to 1.0 */
    grammaticality_score: number;
}
/**
 * A Question contains the English prompt with furigana annotations and
 * multiple acceptable Japanese answers.
 */
export interface Question {
    english: string;
    japanese: string[];
    parsed: Token[][];
    /** Map from answer text to its grammar analysis */
    answerGrammar: Record<string, GrammarAnalysis>;
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
 * Checks for common Japanese punctuation POS tags.
 */
export declare function isCompleted(tokens: Token[]): boolean;
/**
 * Creates a Question object from an English prompt and Japanese answer(s).
 * English can include furigana annotations in brackets: "word[ふりがな]"
 *
 * @param english - English text with optional furigana annotations
 * @param japanese - Array of acceptable Japanese answers
 * @param answerGrammar - Map from answer text to grammar analysis.
 *                        Each answer MUST have a corresponding entry with kotogram data.
 * @returns A Question object with parsed Japanese tokens
 *
 * @example
 * ```ts
 * const q = await makeQuestion('I live[すむ] in Seattle[シアトル].',
 *   ['私はシアトルに住んでいます。'],
 *   {
 *     '私はシアトルに住んでいます。': {
 *       kotogram: '⌈ˢ私ᵖpronʳワタシ⌉⌈ˢはᵖparticleʳハ⌉...',
 *       formality: 'formal',
 *       formality_score: 0.5,
 *       gender: 'neutral',
 *       gender_score: 0,
 *       formality_is_pragmatic: false,
 *       gender_is_pragmatic: false,
 *       registers: ['neutral'],
 *       register_scores: {},
 *       is_grammatic: true,
 *       grammaticality_score: 1.0,
 *     }
 *   }
 * );
 * ```
 */
export declare function makeQuestion(english: string, japanese: string[], answerGrammar: Record<string, GrammarAnalysis>): Promise<Question>;
export declare function parseEnglishString(eng: string): ParsedEnglish;
//# sourceMappingURL=kana-control-logic.d.ts.map