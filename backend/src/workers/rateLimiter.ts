import { redisConnection } from '../config/redis';
import { config } from '../config/config';

export interface RateLimitResult {
  allowed: boolean;
  currentCount: number;
  limit: number;
  msUntilNextHour: number;
}

/**
 * Checks and atomically increments the hourly email counter for a specific sender in Redis.
 * Uses Redis keys in format: rate_limit:{sender}:{YYYY-MM-DD-HH}
 */
export const checkAndIncrementRateLimit = async (
  sender: string,
  customHourlyLimit?: number
): Promise<RateLimitResult> => {
  const limit = customHourlyLimit || config.maxEmailsPerHour;
  
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hour = String(now.getUTCHours()).padStart(2, '0');
  
  const redisKey = `rate_limit:${sender}:${year}-${month}-${day}-${hour}`;
  
  // Calculate milliseconds remaining until the top of the next UTC hour
  const nextHour = new Date(Date.UTC(year, now.getUTCMonth(), now.getUTCDate(), now.getUTCHours() + 1, 0, 0, 0));
  const msUntilNextHour = Math.max(1000, nextHour.getTime() - now.getTime());
  const secondsUntilNextHour = Math.ceil(msUntilNextHour / 1000);

  // Atomically check if current count already reached limit BEFORE incrementing
  const currentVal = await redisConnection.get(redisKey);
  const currentCount = currentVal ? parseInt(currentVal, 10) : 0;

  if (currentCount >= limit) {
    return {
      allowed: false,
      currentCount,
      limit,
      msUntilNextHour,
    };
  }

  // Atomically increment counter and set TTL if new key
  const newCount = await redisConnection.incr(redisKey);
  if (newCount === 1) {
    await redisConnection.expire(redisKey, secondsUntilNextHour + 3600); // Expiration with safety margin
  }

  if (newCount > limit) {
    // We exceeded limit on concurrent increment, decrement back
    await redisConnection.decr(redisKey);
    return {
      allowed: false,
      currentCount: newCount - 1,
      limit,
      msUntilNextHour,
    };
  }

  return {
    allowed: true,
    currentCount: newCount,
    limit,
    msUntilNextHour,
  };
};
