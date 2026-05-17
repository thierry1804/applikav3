import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { ConflictException } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { mock } from 'jest-mock-extended';
import { of } from 'rxjs';
import type { IdempotencyService } from '../../idempotency/idempotency.service';
import { IDEMPOTENT_KEY } from '../decorators/idempotent.decorator';
import { IdempotencyInterceptor } from './idempotency.interceptor';

function makeContext(headers: Record<string, string>): ExecutionContext {
  const handler = jest.fn();
  return {
    getHandler: () => handler,
    switchToHttp: () => ({
      getRequest: () => ({ headers }),
    }),
  } as unknown as ExecutionContext;
}

function makeHandler(value: unknown = { data: 'ok' }): CallHandler {
  return { handle: () => of(value) };
}

describe('IdempotencyInterceptor', () => {
  let interceptor: IdempotencyInterceptor;
  const reflector = mock<Reflector>();
  const idempotencyService = mock<IdempotencyService>();

  beforeEach(() => {
    interceptor = new IdempotencyInterceptor(reflector, idempotencyService);
    jest.clearAllMocks();
  });

  it('passes through when route is not idempotent', async () => {
    reflector.get.mockReturnValue(false);
    const result = await interceptor.intercept(makeContext({}), makeHandler());
    return new Promise<void>((resolve) => {
      result.subscribe((v) => {
        expect(v).toEqual({ data: 'ok' });
        resolve();
      });
    });
  });

  it('passes through when idempotency-key header is missing', async () => {
    reflector.get.mockReturnValue(true);
    const result = await interceptor.intercept(makeContext({}), makeHandler());
    return new Promise<void>((resolve) => {
      result.subscribe((v) => {
        expect(v).toEqual({ data: 'ok' });
        resolve();
      });
    });
  });

  it('throws ConflictException when request is already processing', async () => {
    reflector.get.mockReturnValue(true);
    idempotencyService.get.mockResolvedValue({ status: 'processing' });

    const ctx = makeContext({ 'idempotency-key': 'key-1' });
    await expect(interceptor.intercept(ctx, makeHandler())).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('returns cached response when completed', async () => {
    reflector.get.mockReturnValue(true);
    idempotencyService.get.mockResolvedValue({ status: 'completed', response: { data: 'cached' } });

    const ctx = makeContext({ 'idempotency-key': 'key-2' });
    const result = await interceptor.intercept(ctx, makeHandler());

    return new Promise<void>((resolve) => {
      result.subscribe((v) => {
        expect(v).toEqual({ data: 'cached' });
        resolve();
      });
    });
  });

  it('marks key as processing then completed for new request', async () => {
    reflector.get.mockReturnValue(true);
    idempotencyService.get.mockResolvedValue(null);
    idempotencyService.setProcessing.mockResolvedValue(undefined);
    idempotencyService.setCompleted.mockResolvedValue(undefined);

    const ctx = makeContext({ 'idempotency-key': 'key-3' });
    const result = await interceptor.intercept(ctx, makeHandler({ data: 'new' }));

    return new Promise<void>((resolve) => {
      result.subscribe({
        next: (v) => {
          expect(v).toEqual({ data: 'new' });
        },
        complete: () => {
          expect(idempotencyService.setProcessing).toHaveBeenCalledWith('key-3');
          expect(idempotencyService.setCompleted).toHaveBeenCalledWith('key-3', { data: 'new' });
          resolve();
        },
      });
    });
  });

  it('handles array idempotency-key header (takes first)', async () => {
    reflector.get.mockReturnValue(true);
    idempotencyService.get.mockResolvedValue({ status: 'completed', response: { data: 'arr' } });

    const ctx = {
      getHandler: () => jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ headers: { 'idempotency-key': ['key-arr', 'key-arr-2'] } }),
      }),
    } as unknown as ExecutionContext;

    const result = await interceptor.intercept(ctx, makeHandler());
    return new Promise<void>((resolve) => {
      result.subscribe((v) => {
        expect(idempotencyService.get).toHaveBeenCalledWith('key-arr');
        expect(v).toEqual({ data: 'arr' });
        resolve();
      });
    });
  });

  it('calls reflector with IDEMPOTENT_KEY', async () => {
    reflector.get.mockReturnValue(false);
    const ctx = makeContext({});
    await interceptor.intercept(ctx, makeHandler());
    expect(reflector.get).toHaveBeenCalledWith(IDEMPOTENT_KEY, expect.any(Function));
  });
});
