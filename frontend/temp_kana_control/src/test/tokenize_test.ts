import { tokenize, setTokenizer, resetTokenizer } from '../tokenize.js';
import { assert } from 'chai';
import * as sinon from 'sinon';

suite('tokenize', () => {
  teardown(() => {
    resetTokenizer();
  });

  test('setTokenizer overrides implementation', async () => {
    const mock = sinon.fake.resolves([]);
    setTokenizer(mock);
    await tokenize('test');
    assert.isTrue(mock.calledWith('test'));
  });
});
