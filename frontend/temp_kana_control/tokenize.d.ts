/**
 * @license
 * Copyright 2025 Jomo Fisher
 * SPDX-License-Identifier: BSD-3-Clause
 */
import * as kuromoji from '@patdx/kuromoji';
export type TokenizerFn = (text: string) => Promise<kuromoji.IpadicFeatures[]>;
export declare const tokenize: TokenizerFn;
export declare function setTokenizer(fn: TokenizerFn): void;
export declare function resetTokenizer(): void;
//# sourceMappingURL=tokenize.d.ts.map