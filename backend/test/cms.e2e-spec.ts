import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';

import { AppModule } from '../src/app.module';
import { AuthRateLimitService } from '../src/auth/auth-rate-limit.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('CMS E2E Flow', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let testEmail: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // Mock custom rate limit service
      .overrideProvider(AuthRateLimitService)
      .useValue({
        checkRegisterLimit: jest.fn().mockResolvedValue(undefined),
        checkLoginLimit: jest.fn().mockResolvedValue(undefined),
        checkRefreshLimit: jest.fn().mockResolvedValue(undefined),
        checkConcurrentSessions: jest.fn().mockResolvedValue(undefined),
        getClientIp: () => '127.0.0.1',
        cleanupRefreshLimitStore: jest.fn(),
      })
      // Mock NestJS ThrottlerGuard to bypass rate limiting
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser(process.env.COOKIE_SECRET));
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });

    await app.init();
    prisma = app.get(PrismaService);

    // Setup Admin User & Login
    testEmail = `admin-test-${Date.now()}@laba.vn`;
    const password = 'Admin@123';

    // 1. Register Admin
    const registerRes = await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      email: testEmail,
      password,
      fullName: 'Admin Test',
    });

    console.log('Register Response:', registerRes.status, registerRes.body);

    // 2. Assign ADMIN Role
    const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
    const user = await prisma.user.findUnique({ where: { email: testEmail } });

    if (adminRole && user) {
      await prisma.userRole.create({
        data: {
          user_id: user.id,
          role_id: adminRole.id,
        },
      });
    } else {
      console.log('WARNING: Admin role or user not found!', { adminRole, user });
    }

    // 3. Login to get Token
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: testEmail, password });

    console.log('Login Response:', loginRes.status, loginRes.body);

    if (loginRes.status === 200) {
      adminToken = loginRes.body.access_token;
    }
  }, 30000); // 30s timeout for setup

  afterAll(async () => {
    try {
      // Cleanup test data (ignore errors if tables don't exist)
      await prisma.post.deleteMany({ where: { title: { contains: 'E2E Test' } } }).catch(() => {});
      await prisma.userRole
        .deleteMany({ where: { user: { email: { contains: 'admin-test-' } } } })
        .catch(() => {});
      await prisma.user
        .deleteMany({ where: { email: { contains: 'admin-test-' } } })
        .catch(() => {});
    } catch (e) {
      console.log('Cleanup error (ignored):', e.message);
    }
    await app.close();
  });

  it('should create, publish and view a blog post', async () => {
    const slug = `e2e-test-post-${Date.now()}`;

    // 1. Create Post (Draft)
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/cms/posts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'E2E Test Post',
        slug: slug,
        type: 'BLOG',
        content: { blocks: [{ type: 'paragraph', data: { text: 'Hello World' } }] },
        isPublished: false,
      });

    // Debug: Log response if not 201
    if (createRes.status !== 201) {
      console.log('Create Post Failed:', createRes.status, createRes.body);
    }
    expect(createRes.status).toBe(201);

    const postId = createRes.body.id;
    expect(postId).toBeDefined();

    // 2. Verify not visible in public list
    const publicListRes1 = await request(app.getHttpServer())
      .get('/api/v1/posts')
      .query({ type: 'BLOG' });

    const foundDraft = publicListRes1.body.items?.find((p: any) => p.id === postId);
    expect(foundDraft).toBeUndefined();

    // 3. Publish Post
    const publishRes = await request(app.getHttpServer())
      .patch(`/api/v1/cms/posts/${postId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isPublished: true });

    if (publishRes.status !== 200) {
      console.log('Publish Failed:', publishRes.status, publishRes.body);
    }
    expect(publishRes.status).toBe(200);

    // 4. Verify visible in public list
    const publicListRes2 = await request(app.getHttpServer())
      .get('/api/v1/posts')
      .query({ type: 'BLOG' });

    const foundPublished = publicListRes2.body.items?.find((p: any) => p.id === postId);
    expect(foundPublished).toBeDefined();
    expect(foundPublished.title).toBe('E2E Test Post');

    // 5. Verify detail by slug
    const detailRes = await request(app.getHttpServer()).get(`/api/v1/posts/slug/${slug}`);

    expect(detailRes.status).toBe(200);
    expect(detailRes.body.id).toBe(postId);
    expect(detailRes.body.title).toBe('E2E Test Post');
  }, 30000); // 30s timeout for test
});
