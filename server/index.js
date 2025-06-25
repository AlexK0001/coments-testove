import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import commentsRouter from './routes/comments.js';
import captchaRouter from './routes/captcha.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/comments', commentsRouter);
app.use('/api/captcha', captchaRouter);

// Files
app.use('/uploads', express.static('uploads'));

// DB + Start
const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Server start failed:', error.message);
  }
};

start();
