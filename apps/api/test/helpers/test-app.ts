import { ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { mockDeep } from 'jest-mock-extended';
import type { DeepMockProxy } from 'jest-mock-extended';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { ReminderJobScheduler } from '../../src/health/reminders/reminder.scheduler';

export interface TestApp {
  app: NestFastifyApplication;
  prisma: DeepMockProxy<PrismaService>;
  jwt: JwtService;
}

export async function createTestApp(): Promise<TestApp> {
  const prisma = mockDeep<PrismaService>();

  const module = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(PrismaService)
    .useValue(prisma)
    .overrideProvider(ReminderJobScheduler)
    .useValue({
      scheduleJobs: jest.fn().mockResolvedValue(undefined),
      cancelJobs: jest.fn().mockResolvedValue(undefined),
    })
    .compile();

  const app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  await app.init();
  await app.getHttpAdapter().getInstance().ready();

  return { app, prisma, jwt: module.get(JwtService) };
}
