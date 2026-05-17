import type { ArgumentsHost } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaExceptionFilter } from './prisma-exception.filter';

function makeException(code: string): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError('msg', {
    code,
    clientVersion: '6.0.0',
  });
}

function makeHost(): { host: ArgumentsHost; send: jest.Mock } {
  const send = jest.fn();
  const status = jest.fn().mockReturnValue({ send });
  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
      getRequest: () => ({ url: '/api/v1/dogs' }),
    }),
  } as unknown as ArgumentsHost;
  return { host, send };
}

describe('PrismaExceptionFilter', () => {
  let filter: PrismaExceptionFilter;

  beforeEach(() => {
    filter = new PrismaExceptionFilter();
  });

  it('maps P2002 to 409 Conflict', () => {
    const { host, send } = makeHost();
    filter.catch(makeException('P2002'), host);
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ status: HttpStatus.CONFLICT }));
  });

  it('maps P2025 to 404 Not Found', () => {
    const { host, send } = makeHost();
    filter.catch(makeException('P2025'), host);
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ status: HttpStatus.NOT_FOUND }));
  });

  it('maps unknown codes to 500', () => {
    const { host, send } = makeHost();
    filter.catch(makeException('P9999'), host);
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ status: HttpStatus.INTERNAL_SERVER_ERROR }),
    );
  });

  it('includes RFC 7807 fields', () => {
    const { host, send } = makeHost();
    filter.catch(makeException('P2002'), host);
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.stringContaining('dogapp.io'),
        instance: '/api/v1/dogs',
      }),
    );
  });
});
