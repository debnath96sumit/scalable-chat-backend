import { Request, Response } from 'express';
import { Chat } from '../models/chat.model';
import { Message } from '../models/message.model';

export const createChat = async (req: Request, res: Response) => {
  const { userId } = req.body;
  const myId = (req as any).userId;

  if (!userId || userId === myId){
     res.status(400).json({ message: 'Invalid userId' });
     return;
  }

  let chat = await Chat.findOne({ isGroup: false, members: { $all: [myId, userId] } });
  if (chat){
    res.json(chat);
    return;
  }

  chat = await Chat.create({ members: [myId, userId] });
  res.status(201).json(chat);
  return
};

export const getChats = async (req: Request, res: Response) => {
  const myId = (req as any).userId;

  const chats = await Chat.find({ members: myId })
    .populate('members', 'name email')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

  res.json(chats);
  return;
};

export const getMessages = async (req: Request, res: Response) => {
  const { chatId } = req.params;

  const messages = await Message.find({ chatId })
    .sort({ createdAt: 1 });

  res.json(messages);
  return;
};

export const sendMessage = async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const { content, type = 'text' } = req.body;
  const senderId = (req as any).userId;

  const message = await Message.create({ chatId, senderId, content, type });

  await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id, updatedAt: new Date() });

  res.status(201).json(message);
  return;
};
