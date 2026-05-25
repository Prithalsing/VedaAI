import { Queue } from "bullmq";
import { redisConfig } from "../config/redis.js";
export const assessmentQueue = new Queue("assessment-generation", {
    connection: redisConfig,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: false,
    },
});
