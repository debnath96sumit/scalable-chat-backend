import { Queue } from 'bullmq';
import { redisClient } from '../config/redis';

export const messageQueue = new Queue('messageQueue', { connection: redisClient });
