import Redis from 'ioredis';
import { config } from './config';

const redisConfig = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  maxRetriesPerRequest: null, // Required by BullMQ
  retryStrategy(times: number) {
    const delay = Math.min(times * 200, 2000);
    return delay;
  },
};

export const redisConnection = new Redis(redisConfig);

redisConnection.on('connect', () => {
  console.log(`[Redis] Connected successfully to ${config.redis.host}:${config.redis.port}`);
});

redisConnection.on('error', (err) => {
  console.error('[Redis] Connection error:', err.message);
});

export const createRedisClient = () => new Redis(redisConfig);
