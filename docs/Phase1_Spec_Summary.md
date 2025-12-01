# Laba Platform – Phase 1 Spec Summary (v2.3 Final Lockdown)



> **Mục tiêu:**  

> Xây 1 nền tảng core vững, bảo mật cao, dễ mở rộng:  

> - Backend: Core + Auth (JWT + Refresh Cookie, RBAC, soft delete)  

> - Frontend: Landing page động, đọc nội dung từ DB  

> - Không làm CMS UI trong Phase 1 (admin chỉnh dữ liệu qua seed / công cụ tạm)



---



## 1. Tech stack chính



- **Backend:** NestJS, TypeScript

- **ORM:** Prisma

- **Database:** PostgreSQL

- **Auth:** JWT Access Token + Refresh Token (HttpOnly Cookie)

- **Hash mật khẩu:** Argon2id (bắt buộc, không dùng bcrypt)

- **Frontend:** Next.js (App Router), TypeScript

- **Triển khai:** Phase 1 chạy local/dev, chưa chốt cloud



---



## 2. Auth \& Bảo mật – Ý tưởng cốt lõi



### 2.1. Token model



- Access token (JWT) chứa:

&nbsp; - `sub` (user id)

&nbsp; - `email`

&nbsp; - `ver` = `user.token_version` (int)

- Refresh token:

&nbsp; - Lưu ở cookie `refresh_token` (HttpOnly, Secure, SameSite=Strict, path `/`)

&nbsp; - Trong DB chỉ lưu **hash SHA-256** (`refresh_token_hash`), KHÔNG lưu token thô.



### 2.2. Token versioning (kill switch)



- Bảng `users` có cột: `token_version INT DEFAULT 0`.

- Mọi access token / refresh token đều chứa `ver`.

- Khi:

&nbsp; - Đổi mật khẩu

&nbsp; - Logout all devices (`/auth/revoke-all`)

- → Tăng `user.token_version++` → **toàn bộ token cũ vô hiệu ngay lập tức**.



### 2.3. Bảng `user_tokens`



Lưu từng phiên đăng nhập:



- `user_id`

- `refresh_token_hash`

- `device_hash` (fingerprint mềm)

- `device_info` (JSON: ua, ip, os…)

- `expires_at`, `created_at`, `revoked_at`



Dùng để:



- Phát hiện **token reuse** (tấn công dùng lại refresh token cũ đã revoke).

- Dọn dẹp bằng cron (`TOKEN_CLEANUP_*`).



### 2.4. Device fingerprint (chỉ WARN, không block trong Phase 1)



- `device_hash = SHA256(User-Agent + IP subnet)`  

&nbsp; - IPv4: dùng `/24`  

&nbsp; - IPv6: dùng `/64`

- Trong `/auth/refresh`:

&nbsp; - Nếu fingerprint khác → `logger.warn("AUTH_DEVICE_MISMATCH", ...)`

&nbsp; - **Không chặn**, vẫn cho refresh (tránh làm phiền user dùng VPN/4G)

- Sau này Phase 2 có thể nâng lên thành block cứng.



### 2.5. Rate limit \& Lock account



- Rate limit:

&nbsp; - `/auth/login`: per-user, per-IP (ENV: `RATE_LIMIT_LOGIN_PER_USER`, `RATE_LIMIT_LOGIN_PER_IP`)

&nbsp; - `/auth/register`: per-IP (ENV: `RATE_LIMIT_REGISTER_PER_IP`)

- Lock account:

&nbsp; - `failed_login_attempts`, `lock_until`, `last_failed_attempt`

&nbsp; - Sau X lần sai trong Y phút → lock tạm thời (423 Locked).



---



## 3. Database – Các bảng quan trọng



### 3.1. Users



- `id`, `email`, `password_hash (Argon2id)`, `full_name`

- `token_version`, `email_verified_at?`

- `failed_login_attempts`, `lock_until`, `last_failed_attempt`

- Soft delete: `deleted_at`



### 3.2. UserTokens



- `user_id`, `refresh_token_hash`, `device_hash`, `device_info`

- `expires_at`, `created_at`, `revoked_at`

- Index cho lookup \& cleanup (dùng `CREATE INDEX CONCURRENTLY`).



### 3.3. RBAC / khác



- `roles`, `permissions`, `user_roles`, `role_permissions`

- `branches`, `user_branches`

- Tất cả bảng business đều có `deleted_at` (soft delete).



---



## 4. Landing page – Bảng `landing_content`



- Mục đích: Render landing page/public home từ DB (không hard-code).

- Bảng chính: `landing_content`

&nbsp; - `id`

&nbsp; - `key`:

&nbsp;   - `"hero" | "farm" | "homestay" | "cafe" | "about" | "product_highlight"`

&nbsp; - `locale`: hiện tại chỉ dùng `"vi"`

&nbsp; - `status`: `"draft" | "published" | "archived"`  

&nbsp;   → Phase 1: FE chỉ load `status = 'published'`

&nbsp; - `sort_order`: số nguyên, dùng để sắp xếp block

&nbsp; - `content`: JSON, dạng:



```jsonc

{

&nbsp; "image_url": "https://...",

&nbsp; "image_mobile_url": "https://... (optional)",

&nbsp; "image_alt": "Mô tả ảnh cho SEO \& screen reader",

&nbsp; "title": "Tiêu đề block",

&nbsp; "subtitle": "Phụ đề",

&nbsp; "short_story": "2–4 câu kể chuyện ngắn",

&nbsp; "story_link": "/blog/...",

&nbsp; "story_link_target": "_self hoặc _blank"

}

````



* Phase 1: **admin không có UI**, dữ liệu được:



&nbsp; * seed bằng script (`npm run seed`)

&nbsp; * hoặc nhập tay (Prisma Studio / SQL / tool tạm)



---



## 5. Frontend – Next.js App Router



* Dùng Next.js (App Router) + TypeScript.

* Access token:



&nbsp; * **Chỉ lưu trong memory** (React state/context), không dùng localStorage.

* Flow chính:



&nbsp; * Gọi API `/landing` (hoặc tương tự) → nhận về mảng blocks:



&nbsp;   ```json

&nbsp;   {

&nbsp;     "blocks": \[

&nbsp;       { "key": "hero", "data": { ... } },

&nbsp;       { "key": "farm", "data": { ... } }

&nbsp;     ]

&nbsp;   }

&nbsp;   ```

&nbsp; * FE map theo `sort_order`, render thành các section: Hero, Farm, Homestay, Cafe, About, Product highlight.

* Auth FE (chuẩn bị sẵn cho admin sau này):



&nbsp; * Interceptor bắt 401 → gọi `/auth/refresh` → retry.

&nbsp; * Nếu 403 SESSION_COMPROMISED → logout, redirect `/login`.



---



## 6. Dev flow cơ bản (local)



* Yêu cầu: Node.js LTS, PostgreSQL.

* Bước chính (tóm tắt):



&nbsp; 1. Clone repo, tạo file `.env` cho backend (theo ENV Guide).

&nbsp; 2. `cd backend` → `npm install`.

&nbsp; 3. `npx prisma migrate dev` → tạo schema.

&nbsp; 4. `npm run seed` (nếu có) → tạo admin, branch, landing demo.

&nbsp; 5. `npm run start:dev` → chạy API.

&nbsp; 6. `cd ../frontend` → `npm install` → `npm run dev` → chạy web.



Chi tiết lệnh, biến ENV, seed data, v.v. đã mô tả trong 6 file spec Phase 1.



---



## 7. Non-goals Phase 1 (Cố tình KHÔNG làm)



* Không triển khai CMS UI (admin tự sửa nội dung landing).

* Không bật CSP phức tạp (nonce, strict-dynamic…) vì Next.js Streaming phức tạp. Phase 1 chỉ yêu cầu:



&nbsp; * Cookie HttpOnly + SameSite=Strict

&nbsp; * Không nhúng script inline bừa bãi.

* Không triển khai monitoring/alerting full (Prometheus/Grafana…) – đưa vào **Phase1.5_Future_Hardening_Roadmap**.



---



## 8. Phase 1.5 / Future Hardening (tham khảo nhanh)



Đã có file riêng: `Phase1_5_Future_Hardening_Roadmap.docx`, gồm:



* Rate limit riêng cho `/auth/refresh`.

* Giới hạn số session / user.

* docker-compose dev (Postgres, Redis, Mailhog).

* Script generate secrets, script seed chuẩn.

* Redis rate limit, Prometheus metrics, alert rules.

* Load test, security scan, contract testing.

* Silent token refresh, v.v.

## 9. Các file spec chi tiết đi kèm

> Ghi chú: Nếu nội dung trong file tóm tắt này khác với spec chi tiết, **spec chi tiết sẽ luôn được ưu tiên**.

- LabaPlatform_Phase1_README_TongQuan_v2_3_Final_Lockdown.docx
- README_Backend_LabaPlatform_Phase1_Core_Auth_v2_3_Final_Lockdown.docx
- SoDo_DB_Phase1_LabaPlatform_Core_Auth_v2_3_Final_Lockdown.docx
- ENV_Guide_Phase1_LabaPlatform_v2_3_Final_Lockdown.docx
- API_Auth_Phase1_LabaPlatform_v2_3_Final_Lockdown.docx
- README_Frontend_LabaPlatform_Phase1_NextJS_v2_3_Final_Lockdown.docx
- Landing_Content_Spec_v5_....docx
- Phase1_5_Future_Hardening_Roadmap.docx
