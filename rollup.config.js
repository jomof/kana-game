/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import summary from 'rollup-plugin-summary';
import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import analyze from 'rollup-plugin-analyzer';
import copy from 'rollup-plugin-copy';
import commonjs   from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'kana-game.js',
  output: {
    file: 'kana-game.bundled.js',
    format: 'esm',
  },
  onwarn(warning) {
    if (warning.code !== 'THIS_IS_UNDEFINED') {
      console.error(`(!) ${warning.message}`);
    }
  },
  plugins: [
    replace({preventAssignment: false, 'Reflect.decorate': 'undefined'}),
    resolve(),
    nodeResolve({
      browser:     true,
      extensions:  ['.mjs', '.js', '.json', '.wasm'],
      mainFields:  ['browser','module','main']
    }),
    commonjs(),
    copy({
      targets: [
        { src: 'node_modules/mecab-wasm/lib/*.wasm', dest: 'docs' },
        { src: 'node_modules/mecab-wasm/lib/*.data', dest: 'docs' },
        { src: 'node_modules/lit/polyfill-support.js', dest: 'docs/node_modules/lit' },
        { src: 'node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js', dest: 'docs/node_modules/@webcomponents/webcomponentsjs' },

        
      ]
    }),
    /**
     * This minification setup serves the static site generation.
     * For bundling and minification, check the README.md file.
     */
    terser({
      ecma: 2021,
      module: true,
      warnings: true,
      mangle: {
        properties: {
          regex: /^__/,
        },
      },
    }),
    analyze({ summaryOnly: true }),
    summary(),
  ],
};
