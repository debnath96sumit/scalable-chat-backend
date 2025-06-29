import { Queue } from "bullmq";
import { redisClient } from "../config/redis";

export const messageQueue = new Queue("message-queue", { connection: redisClient });
export const addMessageToQueue = async (data: any) => {
  await messageQueue.add("store-message", data, {
    attempts: 3,
    backoff: 5000,
  });
};
