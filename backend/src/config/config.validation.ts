import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'provision')
    .default('development'),
  PORT: Joi.number().default(3000),

  // Database
  DATABASE_URL: Joi.string().required(),

  // Argon2
  ARGON2_MEMORY_COST: Joi.number().default(65536),
  ARGON2_TIME_COST: Joi.number().default(3),
  ARGON2_PARALLELISM: Joi.number().default(4),

  // JWT
  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  // Cookies
  COOKIE_SECRET: Joi.string().required(),

  // CORS
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),

  // Rate Limiting & Security
  MAX_CONCURRENT_SESSIONS_PER_USER: Joi.number().integer().min(1).default(5),
  RATE_LIMIT_LOGIN_PER_USER: Joi.number().integer().min(1).default(5),
  RATE_LIMIT_LOGIN_PER_IP: Joi.number().integer().min(1).default(10),
  RATE_LIMIT_REGISTER_PER_IP: Joi.number().integer().min(1).default(3),
  RATE_LIMIT_REFRESH_PER_IP: Joi.number().integer().min(1).default(10),
  RATE_LIMIT_REFRESH_DURATION_MINUTES: Joi.number().integer().min(1).default(5),
  ACCOUNT_LOCK_THRESHOLD: Joi.number().integer().min(1).default(5),
  ACCOUNT_LOCK_DURATION_MIN: Joi.number().integer().min(1).default(15),

  // Token Cleanup
  TOKEN_CLEANUP_GRACE_DAYS: Joi.number().integer().min(0).default(30),
  TOKEN_CLEANUP_BATCH_SIZE: Joi.number().integer().min(1).default(100),

  // Monitoring
  ALERT_WEBHOOK_URL: Joi.string().uri().optional().allow(''),
  METRICS_USER: Joi.string().default('metrics'),
  METRICS_PASS: Joi.string().default('changeme'),

  // Redis
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().integer().default(6379),
  REDIS_PASSWORD: Joi.string().optional().allow('').default(''),
  REDIS_DB: Joi.number().integer().default(0),
  REDIS_TIMEOUT_MS: Joi.number().integer().default(3000),

  // Rate Limit
  RATE_LIMIT_TTL: Joi.number().integer().default(60000),
  RATE_LIMIT_MAX: Joi.number().integer().default(10),
});
