import type {JestConfigWithTsJest} from 'ts-jest';

const config: JestConfigWithTsJest = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  roots: ['src'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {useESM: true}],
  },
  testMatch: ['**/src/test/**/*_jest_test.ts'],
};

export default config;
