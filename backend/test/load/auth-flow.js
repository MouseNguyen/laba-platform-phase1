import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const loginFailRate = new Rate('login_fail');

export const options = {
    stages: [
        { duration: '30s', target: 50 },
        { duration: '2m', target: 50 },
        { duration: '30s', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],
        login_fail: ['rate<0.05'],
    },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
    // 1. Login
    const loginRes = http.post(
        `${BASE_URL}/auth/login`,
        JSON.stringify({
            email: 'admin@laba.vn',
            password: 'Admin@123456',
        }),
        { headers: { 'Content-Type': 'application/json' } }
    );

    check(loginRes, { 'login 200': (r) => r.status === 200 });
    loginFailRate.add(loginRes.status !== 200);

    if (loginRes.status === 200) {
        const accessToken = loginRes.json().access_token;

        // 2. Get /me
        const meRes = http.get(`${BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        check(meRes, { 'me 200': (r) => r.status === 200 });
    }

    sleep(1);
}
