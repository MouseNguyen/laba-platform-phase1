import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import path from 'path';
import axios from 'axios';

const provider = new PactV3({
    consumer: 'LabaFrontend',
    provider: 'LabaBackend',
    dir: path.resolve(process.cwd(), 'pacts'),
});

const { like } = MatchersV3;

describe('Auth API Consumer Contract', () => {
    it('should login successfully', () => {
        return provider
            .given('user test@laba.vn exists with password Test@123')
            .uponReceiving('a valid login request')
            .withRequest({
                method: 'POST',
                path: '/auth/login',
                headers: { 'Content-Type': 'application/json' },
                body: { email: 'test@laba.vn', password: 'Test@123' },
            })
            .willRespondWith({
                status: 200,
                headers: { 'Content-Type': 'application/json' },
                body: {
                    access_token: like('jwt.token.here'),
                    user: {
                        id: like(1),
                        email: like('test@laba.vn'),
                        full_name: like('Test User'),
                        roles: like(['admin']),
                    },
                },
            })
            .executeTest(async (mockServer) => {
                const response = await axios.post(`${mockServer.url}/auth/login`, {
                    email: 'test@laba.vn',
                    password: 'Test@123',
                }, {
                    headers: { 'Content-Type': 'application/json' }
                });

                expect(response.status).toBe(200);
                expect(response.data.access_token).toBeTruthy();
                expect(response.data.user.email).toBe('test@laba.vn');
            });
    });

    it('should return 401 for invalid credentials', () => {
        return provider
            .given('no user test@laba.vn')
            .uponReceiving('an invalid login request')
            .withRequest({
                method: 'POST',
                path: '/auth/login',
                body: { email: 'test@laba.vn', password: 'WrongPass' },
            })
            .willRespondWith({
                status: 401,
                headers: { 'Content-Type': 'application/json' },
                body: { message: 'Invalid credentials' },
            })
            .executeTest(async (mockServer) => {
                try {
                    await axios.post(`${mockServer.url}/auth/login`, {
                        email: 'test@laba.vn',
                        password: 'WrongPass',
                    });
                } catch (error: any) {
                    expect(error.response.status).toBe(401);
                }
            });
    });
});
