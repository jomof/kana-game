import {
  findMatch,
  markTokens,
  getGroupsWithMaxMarkedTokens,
  anyMarked,
  selectBestGroup,
  isCompleted,
  parseEnglishString,
  Token,
} from '../kana-control-logic.js';
import {assert} from 'chai';

suite('kana-control-logic', () => {
  suite('findMatch', () => {
    test('finds match at start', () => {
      const tokens: Token[] = [
        {surface_form: '私', reading: 'わたし', marked: false},
        {surface_form: 'は', reading: 'は', marked: false},
      ];
      const match = findMatch(tokens, 'わたし', 0, 0);
      assert.deepEqual(match, [0]);
    });

    test('finds match in middle', () => {
      const tokens: Token[] = [
        {surface_form: '私', reading: 'わたし', marked: false},
        {surface_form: 'は', reading: 'は', marked: false},
      ];
      const match = findMatch(tokens, 'は', 0, 0);
      assert.deepEqual(match, [1]);
    });

    test('finds multi-token match', () => {
      const tokens: Token[] = [
        {surface_form: '私', reading: 'わたし', marked: false},
        {surface_form: 'は', reading: 'は', marked: false},
      ];
      const match = findMatch(tokens, 'わたしは', 0, 0);
      assert.deepEqual(match, [0, 1]);
    });

    test('returns null for no match', () => {
      const tokens: Token[] = [
        {surface_form: '私', reading: 'わたし', marked: false},
      ];
      const match = findMatch(tokens, 'あなた', 0, 0);
      assert.isNull(match);
    });
  });

  suite('markTokens (flat)', () => {
    test('marks tokens correctly', () => {
      const tokens: Token[] = [
        {surface_form: '私', reading: 'わたし', marked: false},
        {surface_form: 'は', reading: 'は', marked: false},
      ];
      const result = markTokens(tokens, 'わたし');
      assert.deepEqual(result.matched, [0]);
      assert.isTrue(tokens[0].marked);
      assert.isFalse(tokens[1].marked);
    });

    test('does not re-mark already marked tokens', () => {
      const tokens: Token[] = [
        {surface_form: '私', reading: 'わたし', marked: true},
        {surface_form: 'は', reading: 'は', marked: false},
      ];
      const result = markTokens(tokens, 'わたし');
      assert.deepEqual(result.matched, []); // Already marked, so no *newly* marked
      assert.isTrue(tokens[0].marked);
    });
  });

  suite('markTokens (nested)', () => {
    test('marks tokens in best group', () => {
      const group1: Token[] = [
        {surface_form: 'A', reading: 'a', marked: false},
      ];
      const group2: Token[] = [
        {surface_form: 'B', reading: 'b', marked: false},
      ];
      const groups = [group1, group2];
      
      const result = markTokens(groups, 'a');
      assert.deepEqual(result[0].matched, [0]);
      assert.isNull(result[1].matched);
      assert.isTrue(group1[0].marked);
      assert.isFalse(group2[0].marked);
    });

    test('prioritizes group with most marked tokens', () => {
      const group1: Token[] = [
        {surface_form: 'A', reading: 'a', marked: true},
        {surface_form: 'B', reading: 'b', marked: false},
      ];
      const group2: Token[] = [
        {surface_form: 'A', reading: 'a', marked: false},
        {surface_form: 'C', reading: 'c', marked: false},
      ];
      const groups = [group1, group2];

      // group1 has 1 marked, group2 has 0.
      // markTokens should only consider group1.
      const result = markTokens(groups, 'b');
      
      assert.deepEqual(result[0].matched, [1]);
      assert.isNull(result[1].matched);
      assert.isTrue(group1[1].marked);
    });
  });

  suite('getGroupsWithMaxMarkedTokens', () => {
    test('returns groups with max marked count', () => {
      const g1: Token[] = [{marked: true} as any];
      const g2: Token[] = [{marked: false} as any];
      const g3: Token[] = [{marked: true} as any];
      
      const result = getGroupsWithMaxMarkedTokens([g1, g2, g3]);
      assert.lengthOf(result, 2);
      assert.include(result, g1);
      assert.include(result, g3);
    });
  });

  suite('anyMarked', () => {
    test('returns true if any result has matched tokens', () => {
      const results = [{matched: [1]}, {matched: null}];
      assert.isTrue(anyMarked(results));
    });

    test('returns false if no result has matched tokens', () => {
      const results = [{matched: []}, {matched: null}];
      assert.isFalse(anyMarked(results));
    });
  });

  suite('selectBestGroup', () => {
    test('selects group with most marked tokens', () => {
      const g1: Token[] = [{marked: true} as any];
      const g2: Token[] = [{marked: false} as any];
      assert.equal(selectBestGroup([g1, g2]), g1);
    });

    test('tiebreaker: selects group with fewest total tokens', () => {
      const g1: Token[] = [{marked: true} as any, {marked: false} as any];
      const g2: Token[] = [{marked: true} as any];
      // Both have 1 marked. g2 has length 1, g1 has length 2. g2 wins.
      assert.equal(selectBestGroup([g1, g2]), g2);
    });
  });

  suite('isCompleted', () => {
    test('returns true if all non-symbol tokens are marked', () => {
      const tokens: Token[] = [
        {marked: true, pos: 'noun'} as any,
        {marked: false, pos: '記号'} as any,
      ];
      assert.isTrue(isCompleted(tokens));
    });

    test('returns false if any non-symbol token is unmarked', () => {
      const tokens: Token[] = [
        {marked: true, pos: 'noun'} as any,
        {marked: false, pos: 'noun'} as any,
      ];
      assert.isFalse(isCompleted(tokens));
    });
  });

  suite('parseEnglishString', () => {
    test('parses plain string', () => {
      const result = parseEnglishString('Hello world');
      assert.deepEqual(result, [
        {englishWord: 'Hello', furigana: ''},
        {englishWord: 'world', furigana: ''},
      ]);
    });

    test('parses string with furigana', () => {
      const result = parseEnglishString('Hello[konnichiwa] world');
      assert.deepEqual(result, [
        {englishWord: 'Hello', furigana: 'konnichiwa'},
        {englishWord: 'world', furigana: ''},
      ]);
    });
  });
});
