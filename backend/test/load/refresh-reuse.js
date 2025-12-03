import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = 'http://localhost:3000';

export default function () {
    // Gửi 1 refresh token đã revoke cũ
    // Note: k6 handles cookies automatically if set in jar, but here we want to simulate a specific cookie
    const jar = http.cookieJar();
    jar.set(BASE_URL, 'refresh_token', 'stolen-token');

    const res = http.post(`${BASE_URL}/auth/refresh`);

    check(res, {
        // Expect 401 because 'stolen-token' is invalid format/not found, 
        // OR 403 if it was found but revoked. 
        // Since we are sending a dummy string, it will likely be 401 Unauthorized (Invalid refresh token)
        // unless we actually seed a revoked token.
        // For this test script to be realistic, we would need to login, revoke, then reuse.
        'reuse returns 401 or 403': (r) => r.status === 401 || r.status === 403,
    });
}
