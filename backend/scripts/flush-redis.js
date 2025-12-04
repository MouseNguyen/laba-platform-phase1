const Redis = require('ioredis');

async function flush() {
    const redis = new Redis({
        host: 'localhost',
        port: 6379,
    });

    console.log('Connected to Redis...');
    await redis.flushall();
    console.log('✅ Redis flushed!');
    redis.disconnect();
}

flush().catch(console.error);
