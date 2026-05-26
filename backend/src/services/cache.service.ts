import { createClient, RedisClientType } from "redis";
import { redisConfig } from "../config/redis.js";
import { logger } from "../utils/logger.js";

const DEFAULT_TTL_SECONDS = parseInt(
  process.env.CACHE_TTL_SECONDS || "120",
  10,
);

const CACHE_KEY_PREFIX = "cache";

let cacheClient: RedisClientType | null = null;
let cacheClientConnectPromise: Promise<RedisClientType> | null = null;

export const assignmentCacheKeys = {
  list: `${CACHE_KEY_PREFIX}:assignments:list`,
  detail: (assignmentId: string) =>
    `${CACHE_KEY_PREFIX}:assignments:detail:${assignmentId}`,
};

async function getCacheClient(): Promise<RedisClientType> {
  if (cacheClient?.isOpen) {
    return cacheClient;
  }

  if (cacheClientConnectPromise) {
    return cacheClientConnectPromise;
  }

  cacheClient = redisConfig.url
    ? createClient({ url: redisConfig.url })
    : createClient({
        username: redisConfig.username,
        password: redisConfig.password,
        socket: {
          host: redisConfig.host,
          port: redisConfig.port,
          tls: redisConfig.tls ? true : undefined,
        },
      });

  cacheClient.on("error", (error) => {
    logger.warn(`Redis cache client error: ${error}`);
  });

  cacheClientConnectPromise = cacheClient
    .connect()
    .then(() => {
      logger.info("Redis cache client connected successfully");
      return cacheClient as RedisClientType;
    })
    .finally(() => {
      cacheClientConnectPromise = null;
    });

  return cacheClientConnectPromise;
}

export class CacheService {
  public static async getJson<T>(key: string): Promise<T | null> {
    try {
      const client = await getCacheClient();
      const cachedValue = await client.get(key);

      if (!cachedValue) {
        logger.info(`Cache miss: ${key}`);
        return null;
      }

      logger.info(`Cache hit: ${key}`);
      return JSON.parse(cachedValue) as T;
    } catch (error) {
      logger.warn(`Cache read failed for key '${key}': ${error}`);
      return null;
    }
  }

  public static async setJson(
    key: string,
    value: unknown,
    ttlSeconds: number = DEFAULT_TTL_SECONDS,
  ): Promise<void> {
    try {
      const client = await getCacheClient();
      await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
      logger.info(`Cache set: ${key} (ttl=${ttlSeconds}s)`);
    } catch (error) {
      logger.warn(`Cache write failed for key '${key}': ${error}`);
    }
  }

  public static async deleteMany(keys: string[]): Promise<void> {
    if (keys.length === 0) {
      return;
    }

    try {
      const client = await getCacheClient();
      await client.del(keys);
      logger.info(`Cache deleteMany: ${keys.join(", ")}`);
    } catch (error) {
      logger.warn(
        `Cache deleteMany failed for keys '${keys.join(", ")}': ${error}`,
      );
    }
  }

  public static async invalidateAssignmentCaches(
    assignmentId?: string,
  ): Promise<void> {
    const keys = [assignmentCacheKeys.list];

    if (assignmentId) {
      keys.push(assignmentCacheKeys.detail(assignmentId));
    }

    await CacheService.deleteMany(keys);
  }
}
