import { Router } from 'express';
import { createChat, getChats, getMessages, sendMessage } from '../controllers/chat.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', createChat);
router.get('/', getChats);
router.get('/:chatId/messages', getMessages);
router.post('/:chatId/message', sendMessage);

export default router;
