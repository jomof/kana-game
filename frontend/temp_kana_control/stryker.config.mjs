/**
 * @type {import('@stryker-mutator/api/core').StrykerOptions}
 */
export default {
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress', 'json'],
  testRunner: 'mocha',
  mochaOptions: {
    spec: ['test/kana-control-logic_test.js', 'test/tokenize_test.js', 'test/augment_test.js'],
    ui: 'tdd',
  },
  mutate: ['kana-control-logic.js', 'tokenize.js', 'augment.js'],
  coverageAnalysis: 'perTest',
  thresholds: { break: 100 },
};
