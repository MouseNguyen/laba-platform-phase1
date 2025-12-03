import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as cookieParser from 'cookie-parser';

describe('Auth Device Fingerprint (E2E)', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.use(cookieParser(process.env.COOKIE_SECRET));
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
        // Trust proxy is needed for X-Forwarded-For to work if app.set('trust proxy') is used, 
        // but in testing with supertest, we are hitting the app directly. 
        // AuthService.getClientIp reads header directly so it should work.

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

    describe('IPv6 Device Fingerprint', () => {
        it('should generate same hash for IPs in same /64 subnet', async () => {
            const email = `ipv6-test-${Date.now()}@laba.test`;
            const password = 'StrongPass@123';

            // Register
            await request(app.getHttpServer())
                .post('/auth/register')
                .send({ email, password, fullName: 'Test User' })
                .expect(201);

            const user = await prisma.user.findUnique({ where: { email } });

            // 1. Login with IP A (2001:db8:abcd:0012::1)
            await request(app.getHttpServer())
                .post('/auth/login')
                .set('X-Forwarded-For', '2001:db8:abcd:0012::1')
                .set('User-Agent', 'TestAgent')
                .send({ email, password })
                .expect(200);

            const tokenA = await prisma.userToken.findFirst({
                where: { user_id: user.id },
                orderBy: { created_at: 'desc' }
            });

            // 2. Login with IP B (2001:db8:abcd:0012::2) - Same /64
            await request(app.getHttpServer())
                .post('/auth/login')
                .set('X-Forwarded-For', '2001:db8:abcd:0012::2')
                .set('User-Agent', 'TestAgent')
                .send({ email, password })
                .expect(200);

            const tokenB = await prisma.userToken.findFirst({
                where: { user_id: user.id },
                orderBy: { created_at: 'desc' }
            });

            // Hash should be identical because User-Agent is same and IP is in same /64
            expect(tokenB.device_hash).toBe(tokenA.device_hash);

            // 3. Login with IP C (2001:db8:abcd:0013::1) - Diff /64
            await request(app.getHttpServer())
                .post('/auth/login')
                .set('X-Forwarded-For', '2001:db8:abcd:0013::1')
                .set('User-Agent', 'TestAgent')
                .send({ email, password })
                .expect(200);

            const tokenC = await prisma.userToken.findFirst({
                where: { user_id: user.id },
                orderBy: { created_at: 'desc' }
            });

            // Hash should be different
            expect(tokenC.device_hash).not.toBe(tokenA.device_hash);
        });

        it('should generate same hash for IPs in same IPv4 /24 subnet', async () => {
            const email = `ipv4-test-${Date.now()}@laba.test`;
            const password = 'StrongPass@123';

            // Register
            await request(app.getHttpServer())
                .post('/auth/register')
                .send({ email, password, fullName: 'Test User' })
                .expect(201);

            const user = await prisma.user.findUnique({ where: { email } });

            // 1. Login with IP A (192.168.1.5)
            await request(app.getHttpServer())
                .post('/auth/login')
                .set('X-Forwarded-For', '192.168.1.5')
                .set('User-Agent', 'TestAgent')
                .send({ email, password })
                .expect(200);

            const tokenA = await prisma.userToken.findFirst({
                where: { user_id: user.id },
                orderBy: { created_at: 'desc' }
            });

            // 2. Login with IP B (192.168.1.20) - Same /24
            await request(app.getHttpServer())
                .post('/auth/login')
                .set('X-Forwarded-For', '192.168.1.20')
                .set('User-Agent', 'TestAgent')
                .send({ email, password })
                .expect(200);

            const tokenB = await prisma.userToken.findFirst({
                where: { user_id: user.id },
                orderBy: { created_at: 'desc' }
            });

            expect(tokenB.device_hash).toBe(tokenA.device_hash);

            // 3. Login with IP C (192.168.2.5) - Diff /24
            await request(app.getHttpServer())
                .post('/auth/login')
                .set('X-Forwarded-For', '192.168.2.5')
                .set('User-Agent', 'TestAgent')
                .send({ email, password })
                .expect(200);

            const tokenC = await prisma.userToken.findFirst({
                where: { user_id: user.id },
                orderBy: { created_at: 'desc' }
            });

            expect(tokenC.device_hash).not.toBe(tokenA.device_hash);
        });
    });
});
