import dotenv from "dotenv";

dotenv.config();

const redisUrl = process.env.REDIS_URL;

let host = process.env.REDIS_HOST || "127.0.0.1";
let port = parseInt(process.env.REDIS_PORT || "6379", 10);
let username = process.env.REDIS_USERNAME || undefined;
let password = process.env.REDIS_PASSWORD || undefined;
let tls: Record<string, any> | undefined = process.env.REDIS_TLS === "true" ? {} : undefined;

if (redisUrl) {
  try {
    const parsed = new URL(redisUrl);
    host = parsed.hostname;
    port = parseInt(parsed.port || "6379", 10);
    username = parsed.username || undefined;
    password = parsed.password || undefined;
    if (parsed.protocol === "rediss:") {
      tls = {};
    }
  } catch (error) {
    // Fallback if URL parsing fails
  }
}

export const redisConfig = {
  url: redisUrl,
  host,
  port,
  username,
  password,
  tls,
  maxRetriesPerRequest: null,
};
