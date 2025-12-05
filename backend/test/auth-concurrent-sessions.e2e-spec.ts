import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth Concurrent Sessions (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const getCookie = (res: request.Response, name: string): string => {
    const cookies = res.get('Set-Cookie');
    if (!cookies || !Array.isArray(cookies)) return '';
    const cookie = cookies.find((c) => c && c.startsWith(`${name}=`));
    if (!cookie) return '';
    return cookie.split(';')[0].split('=')[1] || '';
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser(process.env.COOKIE_SECRET));
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );

    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    await prisma.userToken.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('Max Concurrent Sessions', () => {
    it('should revoke oldest session when limit is exceeded', async () => {
      const email = `session-limit-${Date.now()}@laba.test`;
      const password = 'StrongPass@123';

      // 1. Register
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password, fullName: 'Test User' })
        .expect(201);

      // 2. Login 5 times (limit is 5)
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/auth/login')
          .send({ email, password })
          .expect(200);
        // Small delay to ensure createdAt timestamp difference
        await new Promise((r) => setTimeout(r, 100));
      }

      const user = await prisma.user.findUnique({ where: { email } });

      // Verify 5 active tokens
      const activeTokens = await prisma.userToken.count({
        where: { user_id: user.id, revoked_at: null },
      });
      expect(activeTokens).toBe(5);

      // 3. Login 6th time
      await request(app.getHttpServer()).post('/auth/login').send({ email, password }).expect(200);

      // 4. Verify count is still 5 active
      const activeTokensAfter = await prisma.userToken.count({
        where: { user_id: user.id, revoked_at: null },
      });
      expect(activeTokensAfter).toBe(5);

      // 5. Verify oldest token is revoked
      const allTokens = await prisma.userToken.findMany({
        where: { user_id: user.id },
        orderBy: { created_at: 'asc' },
      });

      // Should have 6 tokens total (5 active, 1 revoked)
      expect(allTokens.length).toBe(6);

      // The first one should be revoked
      expect(allTokens[0].revoked_at).not.toBeNull();

      // The others should be active
      for (let i = 1; i < 6; i++) {
        expect(allTokens[i].revoked_at).toBeNull();
      }
    });
  });
});
