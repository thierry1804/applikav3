import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { toSnakeCase, toCamelCase } from './case.js';

void describe('toSnakeCase', () => {
  void it('converts object keys to snake_case', () => {
    const input = { firstName: 'Rex', nestedObj: { dueDate: '2026-01-01' } };
    const result = toSnakeCase(input);
    assert.deepEqual(result, {
      first_name: 'Rex',
      nested_obj: { due_date: '2026-01-01' },
    });
  });
});

void describe('toCamelCase', () => {
  void it('converts object keys to camelCase', () => {
    const input = { first_name: 'Rex', nested_obj: { due_date: '2026-01-01' } };
    const result = toCamelCase(input);
    assert.deepEqual(result, {
      firstName: 'Rex',
      nestedObj: { dueDate: '2026-01-01' },
    });
  });
});
