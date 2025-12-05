import * as path from 'path';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Verifier } from '@pact-foundation/pact';
import * as argon2 from 'argon2';

import { AppModule } from '../../../src/app.module';
import { RedisThrottlerStorage } from '../../../src/auth/redis-throttler-storage.service';
import { RefreshLockService } from '../../../src/auth/refresh-lock.service';
import { PrismaService } from '../../../src/prisma/prisma.service';

describe('Pact Provider Verification', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(RedisThrottlerStorage)
      .useValue({
        increment: jest.fn().mockResolvedValue({ totalHits: 1, timeToExpire: 60 }),
      })
      .overrideProvider(RefreshLockService)
      .useValue({
        acquireLock: jest.fn().mockResolvedValue(true),
        releaseLock: jest.fn().mockResolvedValue(true),
      })
      .overrideProvider('REDIS_CLIENT')
      .useValue({
        get: jest.fn(),
        set: jest.fn(),
        incr: jest.fn(),
        expire: jest.fn(),
        on: jest.fn(),
        pttl: jest.fn(),
        setex: jest.fn(),
        del: jest.fn(),
      })
      .compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    await app.init();
  });

  it('should validate contracts', async () => {
    await app.listen(0);
    const url = await app.getUrl();

    const stateHandlers = {
      'user test@laba.vn exists with password Test@123': async () => {
        const password_hash = await argon2.hash('Test@123', { type: argon2.argon2id });
        await prisma.user.upsert({
          where: { email: 'test@laba.vn' },
          update: { password_hash },
          create: {
            email: 'test@laba.vn',
            password_hash,
            full_name: 'Test User',
            token_version: 0,
          },
        });
      },
      'no user test@laba.vn': async () => {
        await prisma.user.deleteMany({ where: { email: 'test@laba.vn' } });
      },
    };

    const verifier = new Verifier({
      provider: 'LabaBackend',
      providerBaseUrl: url,
      pactUrls: [path.resolve(process.cwd(), '../frontend/pacts/LabaFrontend-LabaBackend.json')], // Adjust path as needed
      stateHandlers,
      publishVerificationResult: true,
      providerVersion: process.env.GIT_SHA || 'local',
    });

    await verifier.verifyProvider();
  });

  afterAll(async () => {
    await app.close();
  });
});
