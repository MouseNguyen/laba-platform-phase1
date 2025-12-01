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
    RATE_LIMIT_LOGIN_PER_USER: Joi.number().default(5),
    RATE_LIMIT_LOGIN_PER_IP: Joi.number().default(10),
    RATE_LIMIT_REGISTER_PER_IP: Joi.number().default(3),
    ACCOUNT_LOCK_THRESHOLD: Joi.number().default(5),
    ACCOUNT_LOCK_DURATION_MIN: Joi.number().default(15),

    // Token Cleanup
    TOKEN_CLEANUP_GRACE_DAYS: Joi.number().default(30),
    TOKEN_CLEANUP_BATCH_SIZE: Joi.number().default(100),

    // Monitoring
    ALERT_WEBHOOK_URL: Joi.string().optional().allow(''),
});
