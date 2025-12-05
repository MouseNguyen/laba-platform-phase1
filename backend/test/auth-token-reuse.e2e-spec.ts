import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';

import { AppModule } from '../src/app.module';
import { AuthRateLimitService } from '../src/auth/auth-rate-limit.service'; // [NEW] Import
import { SecurityLoggerService } from '../src/common/security-logger.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth Token Reuse (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let mockWebhook: jest.SpyInstance;

  // ===================================================================
  // [ROBUST] Helper: Extract cookie value with error handling
  // ===================================================================
  const getCookie = (res: request.Response, name: string): string => {
    const cookies = res.get('Set-Cookie');
    if (!cookies || !Array.isArray(cookies)) {
      console.warn(`[WARN] No Set-Cookie header found or invalid for cookie: ${name}`);
      return '';
    }
    const cookie = cookies.find((c) => c && c.startsWith(`${name}=`));
    if (!cookie) {
      console.warn(`[WARN] Cookie ${name} not found in Set-Cookie array`);
      console.warn('[DEBUG] Available cookies:', cookies);
      return '';
    }
    const value = cookie.split(';')[0].split('=')[1];
    return value || '';
  };

  // ===================================================================
  // [ROBUST] Helper: Register and Login with detailed error logging
  // ===================================================================
  const registerAndLogin = async (email: string, password: string) => {
    // [DEBUG] Step 1: Register
    const registerRes = await request(app.getHttpServer()).post('/auth/register').send({
      email,
      password,
      fullName: 'Test User',
    });

    if (registerRes.status !== 201) {
      console.error('[CRITICAL] Register failed:');
      console.error('  Status:', registerRes.status);
      console.error('  Body:', JSON.stringify(registerRes.body, null, 2));
      console.error('  Payload:', { email, password: '[HIDDEN]', fullName: 'Test User' });
      throw new Error(
        `Register failed with status ${registerRes.status}: ${JSON.stringify(registerRes.body)}`,
      );
    }

    // [DEBUG] Step 2: Login
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password });

    if (loginRes.status !== 200) {
      console.error('[CRITICAL] Login failed:');
      console.error('  Status:', loginRes.status);
      console.error('  Body:', JSON.stringify(loginRes.body, null, 2));
      throw new Error(`Login failed with status ${loginRes.status}`);
    }

    // [DEBUG] Step 3: Extract tokens
    const accessToken = loginRes.body?.access_token;
    const refreshTokenCookie = getCookie(loginRes, 'refresh_token');
    const userId = loginRes.body?.user?.id;

    if (!accessToken || !refreshTokenCookie || !userId) {
      console.error('[CRITICAL] Missing tokens or userId in login response:');
      console.error('  access_token:', !!accessToken);
      console.error('  refresh_token cookie:', !!refreshTokenCookie);
      console.error('  user.id:', !!userId);
      console.error('  Full response body:', JSON.stringify(loginRes.body, null, 2));
      throw new Error('Incomplete login response data');
    }

    return { accessToken, refreshTokenCookie, userId };
  };

  // ===================================================================
  // [ROBUST] Setup: Mock rate limit to avoid 429 in tests
  // ===================================================================
  beforeAll(async () => {
    console.log('[SETUP] Creating test module...');
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // [NEW] Mock AuthRateLimitService - vô hiệu hóa rate limit trong test
      .overrideProvider(AuthRateLimitService)
      .useValue({
        checkRegisterLimit: jest.fn().mockResolvedValue(undefined),
        checkLoginLimit: jest.fn().mockResolvedValue(undefined),
        checkRefreshLimit: jest.fn().mockResolvedValue(undefined),
        getClientIp: () => '127.0.0.1',
        cleanupRefreshLimitStore: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();

    // Setup app exactly like main.ts
    app.use(cookieParser(process.env.COOKIE_SECRET));
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    prisma = app.get(PrismaService);

    // Check DB connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('[SETUP] Database connection OK');
    } catch (error) {
      console.error('[CRITICAL] Database connection failed:', error);
      throw error;
    }

    // Mock SecurityLoggerService webhook
    const securityLogger = app.get(SecurityLoggerService);
    mockWebhook = jest.spyOn(securityLogger, 'notifyAlertWebhook').mockResolvedValue(undefined);

    console.log('[SETUP] Test environment ready');
  });

  afterAll(async () => {
    console.log('[TEARDOWN] Cleaning up...');
    mockWebhook.mockRestore();
    await prisma.$disconnect();
    await app.close();
    console.log('[TEARDOWN] Done');
  });

  // ===================================================================
  // [ROBUST] Cleanup: Handle foreign key constraints and errors
  // ===================================================================
  beforeEach(async () => {
    console.log('[CLEANUP] Starting DB cleanup...');
    try {
      // Delete in correct order: child table first, then parent
      const tokenResult = await prisma.userToken.deleteMany();
      console.log(`[CLEANUP] Deleted ${tokenResult.count} user_tokens`);

      const userResult = await prisma.user.deleteMany();
      console.log(`[CLEANUP] Deleted ${userResult.count} users`);

      mockWebhook.mockClear();
      console.log('[CLEANUP] Cleanup completed successfully');
    } catch (error) {
      console.error('[CRITICAL] Cleanup failed:', error);
      throw error;
    }
  });

  // ===================================================================
  // [TEST] Scenario 1: Token Reuse Attack
  // ===================================================================
  describe('Scenario 1: Token Reuse Attack', () => {
    it('should detect reuse, revoke all sessions, and return 403', async () => {
      console.log('[TEST] Starting Scenario 1...');
      const email = `hacker-${Date.now()}@laba.test`;
      const password = 'StrongPass@123';

      // 1. Login -> Get Token 1
      console.log('[TEST] Step 1: Register & Login');
      const { refreshTokenCookie: token1, userId } = await registerAndLogin(email, password);
      console.log(`[TEST] Got first token for user ${userId}`);

      // 2. Refresh (Legit) -> Get Token 2
      console.log('[TEST] Step 2: Legitimate refresh');
      const refresh1 = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', [`refresh_token=${token1}`])
        .expect(200);

      const token2 = getCookie(refresh1, 'refresh_token');
      expect(token2).toBeDefined();
      expect(token2).not.toBe(token1);
      console.log('[TEST] Got second token after rotation');

      // 3. ATTACK: Reuse Token 1
      console.log('[TEST] Step 3: Simulating token reuse attack');
      const attackRes = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', [`refresh_token=${token1}`])
        .expect(403);

      // Verify Response
      expect(attackRes.body.code).toBe('SESSION_COMPROMISED');
      console.log('[TEST] ✓ Attack detected, 403 returned');

      // Verify Webhook Alert
      expect(mockWebhook).toHaveBeenCalledWith(
        'SESSION_COMPROMISED',
        expect.objectContaining({ userId }),
      );
      console.log('[TEST] ✓ Webhook alert triggered');

      // Verify DB: Check user token version or token status
      const user = await prisma.user.findUnique({ where: { id: userId } });
      expect(user).toBeDefined();

      // Verify Token 2 (Legit) is now dead
      console.log('[TEST] Step 4: Verify kill switch activated');
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', [`refresh_token=${token2}`])
        .expect(403); // Should be 403 because all sessions revoked
      console.log('[TEST] ✓ Kill switch activated, token2 also dead');
    });
  });

  // ===================================================================
  // [TEST] Scenario 2: Reuse after Revoke All
  // ===================================================================
  describe('Scenario 2: Reuse after Revoke All', () => {
    it('should block reuse of old token after global revoke', async () => {
      console.log('[TEST] Starting Scenario 2...');
      const email = `victim-${Date.now()}@laba.test`;
      const password = 'StrongPass@123';

      // 1. Login Device A
      console.log('[TEST] Device A login');
      const { accessToken: accessA, refreshTokenCookie: refreshA } = await registerAndLogin(
        email,
        password,
      );

      // 2. Login Device B
      console.log('[TEST] Device B login');
      const loginB = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password })
        .expect(200);

      // 3. Revoke All (from Device B)
      console.log('[TEST] Revoke all sessions from Device B');
      await request(app.getHttpServer())
        .post('/auth/revoke-all')
        .set('Authorization', `Bearer ${loginB.body.access_token}`)
        .expect(200);
      console.log('[TEST] ✓ Revoke-all successful');

      // 4. Try Refresh with Token A (Old)
      console.log('[TEST] Attempting refresh with old token A');
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', [`refresh_token=${refreshA}`]);

      // Should be 403 (SESSION_COMPROMISED) or 401 (invalid)
      expect([401, 403]).toContain(res.status);
      if (res.status === 403) {
        expect(res.body.code).toBe('SESSION_COMPROMISED');
      }
      console.log('[TEST] ✓ Old token blocked correctly');
    });
  });

  // ===================================================================
  // [TEST] Scenario 3: Isolation
  // ===================================================================
  describe('Scenario 3: Isolation', () => {
    it('should not affect other users when one is compromised', async () => {
      console.log('[TEST] Starting Scenario 3...');
      const emailA = `alice-${Date.now()}@laba.test`;
      const emailB = `bob-${Date.now()}@laba.test`;
      const password = 'StrongPass@123';

      // 1. Setup User A
      console.log('[TEST] Setup User A');
      const { refreshTokenCookie: tokenA } = await registerAndLogin(emailA, password);

      // 2. Setup User B (rate limit đã được mock, không cần delay)
      console.log('[TEST] Setup User B');
      const { refreshTokenCookie: tokenB } = await registerAndLogin(emailB, password);

      // 3. User A refreshes (Legit) -> Token A2
      console.log('[TEST] User A legit refresh');
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', [`refresh_token=${tokenA}`])
        .expect(200);

      // 4. User A Reuse Attack -> Compromised
      console.log('[TEST] User A token reuse attack');
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', [`refresh_token=${tokenA}`])
        .expect(403);

      // 5. User B Refresh -> Should be OK
      console.log('[TEST] Verify User B unaffected');
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', [`refresh_token=${tokenB}`])
        .expect(200);
      console.log('[TEST] ✓ User B session intact');
    });
  });
});
