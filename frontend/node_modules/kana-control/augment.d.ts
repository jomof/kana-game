/**
 * @license
 * Copyright 2025 Jomo Fisher
 * SPDX-License-Identifier: BSD-3-Clause
 */
import { IpadicFeatures } from '@patdx/kuromoji';
type TokenAugmenter = (tokens: IpadicFeatures[]) => Promise<IpadicFeatures[][]>;
export declare function makeReadingModifierAugmenter(surfaceForm: string, newReading: string): TokenAugmenter;
export declare function toLexicalKey(tokens: IpadicFeatures[]): string;
export declare function augmentTokenGroups(initialGroups: IpadicFeatures[][]): Promise<IpadicFeatures[][]>;
export {};
//# sourceMappingURL=augment.d.ts.map