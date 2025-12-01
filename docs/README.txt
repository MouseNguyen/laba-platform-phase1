
## 1. Đoạn note về ảnh (bạn có thể chèn vào cuối file Landing_Content_Spec_v5 hoặc README tổng)

**Gợi ý chuẩn ảnh cho Landing Page (Phase 1)**

Để frontend hiển thị đẹp và tối ưu tốc độ, đề nghị team dev/thiết kế dùng guideline sau:

**1. Ảnh HERO (banner chính):**

* Tỉ lệ khung hình: **16:9** (ảnh ngang).
* Kích thước gốc khuyến nghị:

  * Ưu tiên: **1920 × 1080 px**
  * Nếu muốn nét hơn: **2400 × 1350 px** hoặc **2560 × 1440 px**
* Định dạng: **JPG** hoặc **WebP**
* Dung lượng khuyến nghị: **≤ 400–500 KB / ảnh**
* Khi triển khai Cloudinary: dùng transform kiểu `w_1920,q_auto,f_auto` + `object-fit: cover`.

**2. Ảnh các block Farm / Homestay / Café / About:**

* Tỉ lệ khung hình: **3:2** hoặc **4:3** (ảnh ngang).
* Kích thước gốc khuyến nghị:

  * **1200 × 800 px** (3:2), hoặc
  * **1200 × 900 px** (4:3).
* Định dạng: JPG/WebP, dung lượng khoảng **150–300 KB**.

**3. Cách sử dụng trong Phase 1:**

* Ảnh sẽ được **upload lên Cloudinary** (free tier) → lấy `image_url` để lưu trong DB (`landing_contents`).
* Admin không upload trực tiếp từ CMS trong Phase 1, mà:

  * Ảnh được chuẩn bị trước (AI/studio/stock),
  * Upload lên Cloudinary,
  * Dán URL vào CMS / seed data hoặc chỉnh sửa bằng giao diện admin (khi có).

---

## 2. Đoạn “lời nhắn” cho Dev Team – bạn chỉ cần copy gửi là xong

Bạn có thể gửi nguyên đoạn sau cho dev (qua Zalo/Slack/email), hoặc đặt vào **đầu README tổng**:

> **Gửi Dev Team,**
>
> Đây là **bộ tài liệu Phase 1 – Version 2.3 Final Lockdown** cho dự án Laba Platform.
>
> Anh em vui lòng:
>
> 1. **Đọc kỹ toàn bộ các file sau trước khi bắt đầu code:**
>
>    * `LabaPlatform_Phase1_README_TongQuan_v2_3_Final_Lockdown.docx`
>    * `README_Backend_LabaPlatform_Phase1_Core_Auth_v2_3_Final_Lockdown.docx`
>    * `SoDo_DB_Phase1_LabaPlatform_Core_Auth_v2_3_Final_Lockdown.docx`
>    * `ENV_Guide_Phase1_LabaPlatform_v2_3_Final_Lockdown.docx`
>    * `API_Auth_Phase1_LabaPlatform_v2_3_Final_Lockdown.docx`
>    * `README_Frontend_LabaPlatform_Phase1_NextJS_v2_3_Final_Lockdown.docx`
>    * `Landing_Content_Spec_v5_Final.docx` (spec cho Landing Page + nội dung mẫu hero/farm/homestay/cafe/about)
> 2. **Mục tiêu Phase 1:**
>
>    * Hoàn thiện **Auth Core** (Login / Register / Refresh / Logout / Revoke-all) theo đúng chuẩn security trong tài liệu (Token Versioning, Argon2id, SHA-256 token hash, Rate limit, Lock account…).
>    * Implement **Landing Page** đọc dữ liệu từ DB theo spec `landing_contents` (hero + các block story), hiển thị đúng thứ tự, đúng trạng thái `published`.
> 3. **Yêu cầu quan trọng:**
>
>    * Tuân thủ đúng **schema DB**, **API spec**, **ENV guide** trong tài liệu – hạn chế tự ý đổi tên field / đổi kiểu dữ liệu.
>    * Nếu cần đề xuất thay đổi kiến trúc, vui lòng **note lại riêng** (issue / ghi chú), không chỉnh sửa ngầm so với spec gốc.
> 4. **Definition of Done cho Phase 1:**
>
>    * Chạy được full flow: **Register → Login → Refresh → Logout → Revoke-all** trên môi trường local (có PostgreSQL & .env đúng).
>    * Landing page hiển thị được nội dung hero + 3–4 block story (farm / homestay / cafe / about) từ DB (không hard-code).
>    * Có thể seed nhanh 1 admin và 1 bộ nội dung landing theo hướng dẫn trong tài liệu (script seed hoặc insert qua Prisma Studio).
>
