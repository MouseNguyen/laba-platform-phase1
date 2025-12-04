# API Conventions

## 1. Response Format Standard

```json
// ✅ SUCCESS RESPONSE (200, 201)
{
  "statusCode": 200,
  "message": "Thành công",
  "data": {
    // Resource data here - can be object or array
  },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "timestamp": "2024-01-15T14:30:00+07:00"
  }
}

// ✅ SUCCESS NO DATA (204 style - but we return 200 with null)
{
  "statusCode": 200,
  "message": "Gửi email thành công",
  "data": null,
  "meta": null
}

// ❌ VALIDATION ERROR (400 Bad Request)
{
  "statusCode": 400,
  "message": "Dữ liệu không hợp lệ",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "value": "invalid-email",
      "message": "Email phải đúng định dạng"
    },
    {
      "field": "password",
      "message": "Mật khẩu ít nhất 8 ký tự, có chữ hoa, chữ thường và số"
    }
  ],
  "path": "/api/v1/auth/register",
  "requestId": "req_7f8a9b2c3d4e" // For tracing
}

// ❌ AUTH ERROR (401 Unauthorized)
{
  "statusCode": 401,
  "message": "Token không hợp lệ hoặc đã hết hạn",
  "error": "Unauthorized",
  "path": "/api/v1/auth/me",
  "requestId": "req_5g6h7i8j9k0l"
}

// ❌ PERMISSION ERROR (403 Forbidden)
{
  "statusCode": 403,
  "message": "Bạn không có quyền 'user.lock' để thực hiện hành động này",
  "error": "Forbidden",
  "requiredPermission": "user.lock",
  "path": "/api/v1/admin/users/123/lock"
}

// ❌ NOT FOUND (404)
{
  "statusCode": 404,
  "message": "Không tìm thấy bài viết với slug 'bai-viet-khong-ton-tai'",
  "error": "Not Found",
  "resource": "Post",
  "identifier": "slug=bai-viet-khong-ton-tai"
}

// ❌ CONFLICT (409)
{
  "statusCode": 409,
  "message": "Email 'admin@laba.vn' đã được sử dụng",
  "error": "Conflict",
  "code": "P2002", // Prisma error code
  "field": "email"
}
```

## 2. HTTP Status Code Usage Matrix

| Status | When to Use | Example Endpoint | Response Body |
|--------|-------------|------------------|---------------|
| 200 | Success, data returned | `GET /api/v1/posts` | `{ statusCode: 200, data: [...] }` |
| 201 | Resource created | `POST /api/v1/posts` | `{ statusCode: 201, data: { id: 123 } }` |
| 204 | No content (NOT USED - we return 200 with message) | `DELETE /api/v1/posts/123` (soft delete) | N/A |
| 400 | Validation failed | `POST /api/v1/auth/register` | `{ statusCode: 400, details: [...] }` |
| 401 | Token missing/invalid | `GET /api/v1/auth/me` | `{ statusCode: 401, error: 'Unauthorized' }` |
| 403 | Permission denied | `POST /api/v1/branches` (no permission) | `{ statusCode: 403, requiredPermission: 'branch.create' }` |
| 404 | Resource not found | `GET /api/v1/posts/non-existent` | `{ statusCode: 404, resource: 'Post' }` |
| 409 | Conflict (duplicate) | `POST /api/v1/branches` with existing code | `{ statusCode: 409, code: 'P2002' }` |
| 422 | Business logic failure (e.g., overbooking) | `POST /api/v1/booking` (no availability) | `{ statusCode: 422, message: 'Khoảng thời gian này đã hết chỗ' }` |
| 429 | Rate limited | `POST /api/v1/auth/login` (5+ attempts) | `{ statusCode: 429, retryAfter: 60 }` |

## 3. Request Conventions

### Headers
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
Accept: application/json
X-Request-Id: uuid-v4-string # For distributed tracing
X-Client-Version: 1.0.0 # Optional, for mobile
```

### URL Structure
Pattern: `/api/v1/{module}/{resource}/{id?}/{action?}`
Examples:
- `GET /api/v1/posts` (list)
- `GET /api/v1/posts?type=BLOG&page=2` (filtered list)
- `GET /api/v1/posts/my-post-slug` (detail by slug)
- `POST /api/v1/posts` (create)
- `PUT /api/v1/posts/123` (update)
- `PATCH /api/v1/posts/123/publish` (action)
- `DELETE /api/v1/posts/123` (soft delete)

### Query Parameters Standard
```typescript
// REQUIRED DTO STRUCTURE - implement in ALL list endpoints
export class QueryDto {
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100) // Hard limit 100 items per page
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sort?: string; // Format: "field:asc" or "field:desc"

  @IsOptional()
  @IsString()
  search?: string; // Full-text search

  // Additional filters as needed
  @IsOptional()
  @IsBooleanString()
  isPublished?: string; // 'true' or 'false'
}
```

## 4. Pagination & Sorting
```typescript
// Service layer MUST implement this pattern
async findAll(query: QueryPostsDto) {
  const { page = 1, limit = 10, sort = 'createdAt:desc' } = query;
  const [field, order] = sort.split(':');
  
  const [data, total] = await Promise.all([
    this.prisma.post.findMany({
      where: { deletedAt: null },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [field]: order },
      // ALWAYS use select to avoid SELECT *
      select: { id: true, title: true, /* ... */ }
    }),
    this.prisma.post.count({ where: { deletedAt: null } })
  ]);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      timestamp: new Date().toISOString()
    }
  };
}
```

## 5. Soft Delete & Restore Pattern
- **Delete**: `DELETE /api/v1/posts/123` → Status 200, set `deletedAt = now()`
- **Restore**: `POST /api/v1/posts/123/restore` (admin only) → Status 200, set `deletedAt = null`
- **Query**: ALL findMany queries MUST include `where: { deletedAt: null }`
- **Force delete**: NOT ALLOWED - always soft delete for audit trail

## 6. File Upload
```http
POST /api/v1/upload/image
Content-Type: multipart/form-data

Form fields:
- file: binary (max 5MB)
- type: 'image' | 'document'

Response 201:
{
  "statusCode": 201,
  "message": "Upload thành công",
  "data": {
    "url": "https://cdn.laba.vn/uploads/2024/01/abc123.jpg",
    "size": 204800,
    "mimeType": "image/jpeg"
  }
}

Validation errors (400):
- File too large: { "field": "file", "message": "File size phải nhỏ hơn 5MB" }
- Invalid type: { "field": "file", "message": "Chỉ chấp nhận JPG, PNG, WEBP" }
```

## 7. Real-time (WebSocket - Future Phase)
```javascript
// Connection
const ws = new WebSocket('wss://api.laba.vn/ws/booking?token=ACCESS_TOKEN');

// Subscribe
ws.send(JSON.stringify({
  event: 'subscribe',
  channel: 'booking.123' // Listen to specific booking
}));

// Receive
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // { event: "booking.updated", data: { status: "CONFIRMED" }, timestamp: "..." }
};

// Error handling
ws.onerror = (error) => {
  // Auto-reconnect with exponential backoff
};
```

## 8. Rate Limit Headers (MUST include in response)
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704110400
Retry-After: 60 # Only for 429 responses
```

## 9. CORS & Security Headers
```typescript
// main.ts configuration (See src/main.ts:44-50)
app.enableCors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id']
});

// Helmet (already installed, see src/main.ts:20-36)
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled for Next.js streaming
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  })
);
```

## 10. API Versioning Strategy
- **Current**: `/api/v1`
- **Policy**: 
  - Breaking changes → new version `/api/v2` (v1 deprecated for 3 months)
  - New fields → add to v1 (nullable/optional)
  - Bug fixes → update v1 directly
- **Response header**: `API-Version: 1.0.0`

## 11. Error Code Standards

| Application Error Code | HTTP Status | Meaning | Example |
|------------------------|-------------|---------|---------|
| AUTH_001 | 401 | Invalid token | JWT signature invalid |
| AUTH_002 | 401 | Token expired | Access token TTL exceeded |
| AUTH_003 | 403 | Insufficient permission | Missing 'user.lock' permission |
| VALID_001 | 400 | Field validation failed | Email format incorrect |
| DB_001 | 409 | Unique constraint | P2002 duplicate email |
| RATE_001 | 429 | Too many requests | 5+ login attempts |
| RESOURCE_001 | 404 | Not found | Post slug not exists |

## 12. Common Pitfalls (MUST READ)
- **NEVER** return `password_hash`, `token_version`, or sensitive fields (See `src/auth/auth.service.ts` for example of excluding these).
- **ALWAYS** use transaction for multi-table operations (e.g., create user + assign roles).
- **NEVER** trust client timezone - always convert to UTC+7 server-side.
- **ALWAYS** validate file MIME type, not just extension.
- **NEVER** log full tokens or credit card numbers.
- **ALWAYS** use `select` in Prisma queries to prevent data leak.
