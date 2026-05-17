import type { ArgumentsHost } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

function makeHost(url = '/api/v1/dogs'): ArgumentsHost {
  const send = jest.fn();
  const status = jest.fn().mockReturnValue({ send });
  return {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
      getRequest: () => ({ url }),
    }),
  } as unknown as ArgumentsHost;
}

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
  });

  it('sends RFC 7807 response for string message', () => {
    const host = makeHost();
    const send = host.switchToHttp().getResponse().status(404).send;
    const exception = new HttpException('Not found', HttpStatus.NOT_FOUND);

    filter.catch(exception, host);

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 404,
        type: 'https://dogapp.io/errors/404',
        title: 'NOT_FOUND',
        detail: 'Not found',
        instance: '/api/v1/dogs',
      }),
    );
  });

  it('joins array validation messages', () => {
    const host = makeHost();
    const send = host.switchToHttp().getResponse().status(400).send;
    const exception = new HttpException(
      { message: ['field is required', 'must be string'] },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, host);

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 400,
        detail: 'field is required, must be string',
      }),
    );
  });

  it('extracts object message.message string', () => {
    const host = makeHost();
    const send = host.switchToHttp().getResponse().status(422).send;
    const exception = new HttpException(
      { message: 'Unprocessable' },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );

    filter.catch(exception, host);

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ status: 422, detail: 'Unprocessable' }),
    );
  });
});
