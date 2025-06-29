import { Worker } from 'bullmq';
import { redisClient } from '../config/redis';
import { Message } from '../models/message.model';
import { io, connectedUsers } from '../sockets/socketServer';
import mongoose from 'mongoose';

// Start the worker to process queued chat messages
export const messageWorker = new Worker(
  'messageQueue',
  async (job) => {
    const {
      chat_id,
      sender_id,
      content,
      message_type = 'text',
      file_url,
      file_name,
      file_size,
      reply_to,
    } = job.data;

    // Step 1: Save the message in MongoDB
    const newMessage = await Message.create({
      chat_id: new mongoose.Types.ObjectId(chat_id),
      sender_id: new mongoose.Types.ObjectId(sender_id),
      content,
      message_type,
      file_url,
      file_name,
      file_size,
      reply_to,
    });

    // Step 2: Emit the message to other participant(s)
    // (Assumes 1:1 chat; adjust for group later)
    const recipientSocketId = Array.from(connectedUsers.entries()).find(
      ([userId, socketId]) => userId !== sender_id && socketId
    )?.[1];

    if (recipientSocketId) {
      io.to(recipientSocketId).emit('chat:message', {
        ...newMessage.toObject(),
        chat_id,
      });
    }

    return newMessage._id;
  },
  {
    connection: redisClient,
  }
);
