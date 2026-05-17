import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor';

const mockContext = {} as ExecutionContext;

function makeHandler(value: unknown): CallHandler {
  return { handle: () => of(value) };
}

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor;

  beforeEach(() => {
    interceptor = new TransformInterceptor();
  });

  it('wraps plain data in { data }', (done) => {
    interceptor.intercept(mockContext, makeHandler({ foo: 'bar' })).subscribe((result) => {
      expect(result).toEqual({ data: { foo: 'bar' } });
      done();
    });
  });

  it('passes through object that already has data key', (done) => {
    interceptor
      .intercept(mockContext, makeHandler({ data: { userId: '1' } }))
      .subscribe((result) => {
        expect(result).toEqual({ data: { user_id: '1' } });
        done();
      });
  });

  it('wraps null in { data: null }', (done) => {
    interceptor.intercept(mockContext, makeHandler(null)).subscribe((result) => {
      expect(result).toEqual({ data: null });
      done();
    });
  });

  it('wraps undefined in { data: null }', (done) => {
    interceptor.intercept(mockContext, makeHandler(undefined)).subscribe((result) => {
      expect(result).toEqual({ data: null });
      done();
    });
  });

  it('converts camelCase keys to snake_case', (done) => {
    interceptor
      .intercept(mockContext, makeHandler({ firstName: 'John', lastName: 'Doe' }))
      .subscribe((result) => {
        expect(result).toEqual({ data: { first_name: 'John', last_name: 'Doe' } });
        done();
      });
  });
});
