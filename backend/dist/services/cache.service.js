import { createClient } from "redis";
import { redisConfig } from "../config/redis.js";
import { logger } from "../utils/logger.js";
const DEFAULT_TTL_SECONDS = parseInt(process.env.CACHE_TTL_SECONDS || "120", 10);
const CACHE_KEY_PREFIX = "cache";
let cacheClient = null;
let cacheClientConnectPromise = null;
export const assignmentCacheKeys = {
    list: `${CACHE_KEY_PREFIX}:assignments:list`,
    detail: (assignmentId) => `${CACHE_KEY_PREFIX}:assignments:detail:${assignmentId}`,
};
async function getCacheClient() {
    if (cacheClient?.isOpen) {
        return cacheClient;
    }
    if (cacheClientConnectPromise) {
        return cacheClientConnectPromise;
    }
    cacheClient = createClient({
        socket: {
            host: redisConfig.host,
            port: redisConfig.port,
        },
    });
    cacheClient.on("error", (error) => {
        logger.warn(`Redis cache client error: ${error}`);
    });
    cacheClientConnectPromise = cacheClient
        .connect()
        .then(() => {
        logger.info("Redis cache client connected successfully");
        return cacheClient;
    })
        .finally(() => {
        cacheClientConnectPromise = null;
    });
    return cacheClientConnectPromise;
}
export class CacheService {
    static async getJson(key) {
        try {
            const client = await getCacheClient();
            const cachedValue = await client.get(key);
            if (!cachedValue) {
                logger.info(`Cache miss: ${key}`);
                return null;
            }
            logger.info(`Cache hit: ${key}`);
            return JSON.parse(cachedValue);
        }
        catch (error) {
            logger.warn(`Cache read failed for key '${key}': ${error}`);
            return null;
        }
    }
    static async setJson(key, value, ttlSeconds = DEFAULT_TTL_SECONDS) {
        try {
            const client = await getCacheClient();
            await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
            logger.info(`Cache set: ${key} (ttl=${ttlSeconds}s)`);
        }
        catch (error) {
            logger.warn(`Cache write failed for key '${key}': ${error}`);
        }
    }
    static async deleteMany(keys) {
        if (keys.length === 0) {
            return;
        }
        try {
            const client = await getCacheClient();
            await client.del(keys);
            logger.info(`Cache deleteMany: ${keys.join(", ")}`);
        }
        catch (error) {
            logger.warn(`Cache deleteMany failed for keys '${keys.join(", ")}': ${error}`);
        }
    }
    static async invalidateAssignmentCaches(assignmentId) {
        const keys = [assignmentCacheKeys.list];
        if (assignmentId) {
            keys.push(assignmentCacheKeys.detail(assignmentId));
        }
        await CacheService.deleteMany(keys);
    }
}
