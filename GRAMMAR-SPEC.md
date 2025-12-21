# Spec: Enhanced Question Format for kana-control

## Overview

The backend API now returns additional grammar analysis for each answer in a question. The `kana-control` component needs to be updated to accept this enhanced format and potentially utilize the grammar information in its UI.

## New Data Format

The question object passed to `makeQuestion()` (or however your component receives question data) now includes an additional `answerGrammar` field:

```typescript
interface GrammarAnalysis {
  kotogram: string;                // Linguistic encoding of the sentence
  formality: "formal" | "neutral" | "casual";
  formality_score: number;         // Range: approximately -1.0 to 1.0
  formality_is_pragmatic: boolean; // Whether formality is context-dependent
  gender: "masculine" | "feminine" | "neutral";
  gender_score: number;            // Range: approximately -1.0 to 1.0
  gender_is_pragmatic: boolean;    // Whether gender is context-dependent
  registers: string[];             // e.g., ["neutral"], ["danseigo"], ["kansaiben"]
  register_scores: Record<string, number>;  // Score for each possible register
  is_grammatic: boolean;           // Whether the sentence is grammatically correct
  grammaticality_score: number;    // Confidence score, typically 0.0 to 1.0
}

interface Question {
  prompt: string;                           // The English prompt with furigana hints
  answers: string[];                        // Array of valid Japanese answers
  answerGrammar: Record<string, GrammarAnalysis>;  // Map: answer text → grammar analysis
}
```


## Register Values

The `registers` array can contain any of these values:

| Value | Description |
|-------|-------------|
| `"neutral"` | Standard Japanese |
| `"danseigo"` | Masculine speech |
| `"joseigo"` | Feminine speech |
| `"sonkeigo"` | Respectful/honorific language |
| `"kenjogo"` | Humble language |
| `"kansaiben"` | Kansai dialect |
| `"hakataben"` | Hakata dialect |
| `"tohoku"` | Tohoku dialect |
| `"netslang"` | Internet slang |
| `"ojousama"` | Refined feminine speech |
| `"guntai"` | Military speech |
| `"burikko"` | Cutesy/affected speech |
| `"bushi"` | Samurai/warrior speech |
| `"kyoshigo"` | Archaic/classical speech |

## Example Data

```json
{
  "prompt": "I live[すむ] in Seattle[シアトル].",
  "answers": [
    "おれはシアトルに住んでいます。",
    "おれはシアトルに住んでいる。",
    "おれはシアトルに住んでる。"
  ],
  "answerGrammar": {
    "おれはシアトルに住んでいます。": {
      "kotogram": "⌈ˢおれᵖpronʳオレ⌉⌈ˢはᵖparticle:binding-particleʳハ⌉⌈ˢシアトルᵖnoun:proper-noun:place-name⌉⌈ˢにᵖparticle:case-particleʳニ⌉⌈ˢ住んᵖverb:general:godan-ma:continuative-nasalᵇ住むᵈ住むʳスン⌉⌈ˢでᵖparticle:conjunctive-particleʳデ⌉⌈ˢいᵖverb:bound:upper-ichidan-a:continuativeᵇいるᵈいるʳイ⌉⌈ˢますᵖaux-verb:aux-masu:terminalʳマス⌉⌈ˢ。ᵖaux-symbol:period⌉",
      "formality": "formal",
      "formality_score": 0.504,
      "gender": "masculine",
      "gender_score": -0.999,
      "registers": ["danseigo"],
      "is_grammatic": true,
      "grammaticality_score": 0.999
    },
    "おれはシアトルに住んでいる。": {
      "kotogram": "⌈ˢおれᵖpronʳオレ⌉⌈ˢはᵖparticle:binding-particleʳハ⌉⌈ˢシアトルᵖnoun:proper-noun:place-name⌉⌈ˢにᵖparticle:case-particleʳニ⌉⌈ˢ住んᵖverb:general:godan-ma:continuative-nasalᵇ住むᵈ住むʳスン⌉⌈ˢでᵖparticle:conjunctive-particleʳデ⌉⌈ˢいるᵖverb:bound:upper-ichidan-a:terminalʳイル⌉⌈ˢ。ᵖaux-symbol:period⌉",
      "formality": "neutral",
      "formality_score": -0.00005,
      "gender": "masculine",
      "gender_score": -0.999,
      "registers": ["danseigo"],
      "is_grammatic": true,
      "grammaticality_score": 0.999
    },
    "おれはシアトルに住んでる。": {
      "kotogram": "⌈ˢおれᵖpronʳオレ⌉⌈ˢはᵖparticle:binding-particleʳハ⌉⌈ˢシアトルᵖnoun:proper-noun:place-name⌉⌈ˢにᵖparticle:case-particleʳニ⌉⌈ˢ住んᵖverb:general:godan-ma:continuative-nasalᵇ住むᵈ住むʳスン⌉⌈ˢでるᵖaux-verb:lower-ichidan-da:terminalʳデル⌉⌈ˢ。ᵖaux-symbol:period⌉",
      "formality": "neutral",
      "formality_score": -0.001,
      "gender": "masculine",
      "gender_score": -0.999,
      "registers": ["danseigo"],
      "is_grammatic": true,
      "grammaticality_score": 0.999
    }
  }
}
```

## Required Changes

1. **Update `makeQuestion()` signature** to add a third parameter for grammar data:

   ```typescript
   function makeQuestion(
     prompt: string, 
     answers: string[], 
     answerGrammar: Record<string, GrammarAnalysis>
   ): Promise<...>;
   ```

2. **Store grammar data** for use when displaying answer feedback or hints

3. **UI enhancements** (suggested, not required):
   - Display formality level badge (formal/neutral/casual) when showing the correct answer
   - Show gender/register info to help learners understand usage context
   - When showing the alternative answers that were available, make those sentences clickable to show detailed grammar information about that sentence.

## Notes

- The `kotogram` field contains the internal linguistic representation — use `kotogramToJapanese()` to render it
- `formality_score` and `gender_score` are raw model outputs; the categorical `formality` and `gender` fields are more useful for UI
- All answers should have a corresponding entry in `answerGrammar`, but defensively handle missing entries

## TypeScript Kotogram Library

There is a sister **kotogram** library available on npm that provides utilities for working with the grammar data:

```bash
npm install kotogram
```

### Key Functions

#### `kotogramToJapanese(kotogram: string, options?): string`

Converts a kotogram string back to readable Japanese text. This is useful for displaying answers with proper formatting.

```typescript
import { kotogramToJapanese } from 'kotogram';

const kotogram = "⌈ˢおれᵖpronʳオレ⌉⌈ˢはᵖparticle...⌉";
const japanese = kotogramToJapanese(kotogram);
// => "おれは..."

// With furigana output (for displaying readings)
const withFurigana = kotogramToJapanese(kotogram, { furigana: true });
```

The furigana option is particularly useful when you need to display readings for kanji characters in the possible answers.

#### `GrammarAnalysis.fromJson(json: string | object): GrammarAnalysis`

Deserializes the grammar analysis object sent from the backend. The backend uses `GrammarAnalysis.to_json()` (Python) to serialize, ensuring field parity.

```typescript
import { GrammarAnalysis } from 'kotogram';

// From the API response
const grammarData = question.answerGrammar["おれはシアトルに住んでいます。"];

// Deserialize to get a proper GrammarAnalysis instance
const analysis = GrammarAnalysis.fromJson(grammarData);

// Now you can use the typed object
console.log(analysis.formality);    // "formal"
console.log(analysis.isGrammatic);  // true
console.log(analysis.registers);    // ["danseigo"]
```

### Why Use the Library?

1. **Type safety** — `GrammarAnalysis.fromJson()` returns a properly typed object with methods
2. **Furigana rendering** — `kotogramToJapanese()` can emit furigana for displaying answer readings
3. **Cross-language parity** — The TypeScript and Python implementations are kept in sync

## Migration Note: Removing MeCab Dependency

With this new grammar/kotogram integration, **kana-control can remove its dependency on the MeCab library**. 

Previously, MeCab was used for Japanese text parsing and tokenization. Now:
- The backend performs all parsing using kotogram's `SudachiJapaneseParser`
- The kotogram string contains all the linguistic information (readings, POS tags, etc.)
- The TypeScript `kotogramToJapanese()` function can extract Japanese text with furigana from the kotogram

This eliminates the need for client-side Japanese morphological analysis and simplifies the dependency tree.
