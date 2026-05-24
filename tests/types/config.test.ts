// @vitest-environment happy-dom
import { expect, describe, it } from 'vitest';
import { assertString, assertDefined } from '../../src/types/config.js';

describe('config type-guards', () => {
  describe('assertString', () => {
    it('does not throw for a valid string', () => {
      expect(() => assertString('hello', 'field')).not.to.throw();
    });

    it('throws for a number', () => {
      expect(() => assertString(42, 'field')).to.throw(
        'Invalid config: "field" must be a string, got number'
      );
    });

    it('throws for null', () => {
      expect(() => assertString(null, 'field')).to.throw(
        'Invalid config: "field" must be a string, got object'
      );
    });

    it('throws for undefined', () => {
      expect(() => assertString(undefined, 'field')).to.throw(
        'Invalid config: "field" must be a string, got undefined'
      );
    });
  });

  describe('assertDefined', () => {
    it('does not throw for a defined value', () => {
      expect(() => assertDefined('value', 'field')).not.to.throw();
      expect(() => assertDefined(0, 'field')).not.to.throw();
      expect(() => assertDefined(false, 'field')).not.to.throw();
    });

    it('throws for undefined', () => {
      expect(() => assertDefined(undefined, 'field')).to.throw(
        'Invalid config: "field" is required but was not provided'
      );
    });

    it('throws for null', () => {
      expect(() => assertDefined(null, 'field')).to.throw(
        'Invalid config: "field" is required but was not provided'
      );
    });
  });
});
