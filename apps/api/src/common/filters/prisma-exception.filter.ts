import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { FastifyReply, FastifyRequest } from 'fastify';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let detail = 'Database error';

    if (exception.code === 'P2002') {
      status = HttpStatus.CONFLICT;
      detail = 'Unique constraint violation';
    } else if (exception.code === 'P2025') {
      status = HttpStatus.NOT_FOUND;
      detail = 'Record not found';
    }

    void response.status(status).send({
      type: `https://dogapp.io/errors/${status}`,
      title: HttpStatus[status] ?? 'Error',
      status,
      detail,
      instance: request.url,
    });
  }
}
