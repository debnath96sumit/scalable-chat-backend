import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import chatRoutes from './routes/chat.routes';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI!).then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.error('MongoDB error:', err);
});

app.use('/api/auth', authRoutes);

app.use('/api/chats', chatRoutes);

export default app;
