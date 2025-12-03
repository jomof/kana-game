/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {tokenize} from './tokenize.js';
import {augmentTokenGroups} from './augment.js';

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
export function findMatch(
  tokens: Token[],
  str: string,
  startIdx: number,
  pos: number
): number[] | null {
  if (pos === str.length) return [];
  for (let i = startIdx; i < tokens.length; i++) {
    const r = tokens[i].reading!;
    if (str.startsWith(r, pos)) {
      const rest = findMatch(tokens, str, i + 1, pos + r.length);
      if (rest) return [i, ...rest];
    }
  }
  return null;
}

/** Flat‐array overload */
export function markTokens(
  tokens: Token[],
  str: string
): {matched: number[] | null};

/** Nested‐array overload */
export function markTokens(
  tokens: Token[][],
  str: string
): {matched: number[] | null}[];

/**
 * If given a flat Token[], tries to match & flip exactly as before.
 * If given Token[][], first picks only those sub‐arrays with the
 * **highest current count** of `marked===true`, and runs the flat logic
 * on them; all others return `{ matched: null }`.
 */
export function markTokens(
  tokens: Token[] | Token[][],
  str: string
): {matched: number[] | null} | {matched: number[] | null}[] {
  // ——— Nested case ———
  if (tokens.length > 0 && Array.isArray(tokens[0])) {
    const groups = tokens as Token[][];
    const candidateGroups = getGroupsWithMaxMarkedTokens(groups);

    return groups.map((g) => {
      if (candidateGroups.includes(g)) {
        return markTokens(g, str) as {matched: number[] | null};
      } else {
        return {matched: null};
      }
    });
  }

  // ——— Flat case ———
  const flat = tokens as Token[];
  const matchIndices = findMatch(flat, str, 0, 0);
  if (!matchIndices) {
    return {matched: null};
  }

  const newlyMarked: number[] = [];
  for (const idx of matchIndices) {
    if (!flat[idx].marked) {
      flat[idx].marked = true;
      newlyMarked.push(idx);
    }
  }
  return {matched: newlyMarked};
}

/**
 * Filters an array of token groups, returning only those with the maximum
 * number of marked tokens.
 */
export function getGroupsWithMaxMarkedTokens(groups: Token[][]): Token[][] {
  if (groups.length === 0) {
    return [];
  }

  const markedCounts = groups.map((g) =>
    g.reduce((n, t) => n + (t.marked ? 1 : 0), 0)
  );
  const maxMarkedCount = Math.max(...markedCounts);

  return groups.filter((_, i) => markedCounts[i] === maxMarkedCount);
}

/**
 * Returns true if any token was newly marked.
 */
export function anyMarked(result: {matched: number[] | null}[]): boolean {
  return result.some((r) => r.matched !== null && r.matched.length > 0);
}

/**
 * Selects the "best" token sequence from an array of candidate groups.
 * Criteria:
 *  1. Highest number of tokens with `marked === true`
 *  2. (Tiebreaker) Lowest number of tokens with `marked === false`
 */
export function selectBestGroup(groups: Token[][]): Token[] {
  if (groups.length === 0) throw new Error('No groups provided');

  const groupsWithMaxMarked = getGroupsWithMaxMarkedTokens(groups);

  if (groupsWithMaxMarked.length === 1) {
    return groupsWithMaxMarked[0];
  }

  let bestGroup = groupsWithMaxMarked[0];
  let minTotalTokens = bestGroup.length;

  for (let i = 1; i < groupsWithMaxMarked.length; i++) {
    const currentGroup = groupsWithMaxMarked[i];
    if (currentGroup.length < minTotalTokens) {
      bestGroup = currentGroup;
      minTotalTokens = currentGroup.length;
    }
  }

  return bestGroup;
}

/**
 * Returns true if every non-punctuation token in the array is marked.
 */
export function isCompleted(tokens: Token[]): boolean {
  return tokens.every((t) => t.pos === '記号' || t.marked);
}

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
export async function makeQuestion(
  english: string,
  japanese: string[]
): Promise<Question> {
  const groups = await Promise.all(
    japanese.map(async (it) => await tokenize(it))
  );
  const augmented = await augmentTokenGroups(groups);
  const parsed: Token[][] = augmented.map((group) =>
    group.map((t) => ({
      surface_form: t.surface_form,
      reading: t.reading,
      pos: t.pos,
      marked: false,
    }))
  );
  return {
    english,
    japanese,
    parsed,
  } as Question;
}

export function parseEnglishString(eng: string): ParsedEnglish {
  const regex = /(\w+)\s*(?:\[([^\]]+)\])?/g;
  const parts: ParsedEnglish = [];
  let match;
  while ((match = regex.exec(eng)) !== null) {
    parts.push({
      englishWord: match[1],
      furigana: match[2] || '',
    });
  }
  return parts;
}
