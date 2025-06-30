import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import commentsRouter from './routes/comments.js';
import captchaRouter from './routes/captcha.js';
import { Server } from 'socket.io';
import http from 'http';
import session from 'express-session';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Створення HTTP-сервера для Socket.IO
const server = http.createServer(app);

// Підключення Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Зберігаємо io глобально
app.set('io', io);

// Слухаємо зʼєднання
io.on('connection', socket => {
  console.log('🟢 New client connected');
  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected');
  });
});

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/comments', commentsRouter);
app.use('/api/captcha', captchaRouter);

// Files
app.use('/uploads', express.static(path.resolve('public/uploads')));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // для локального http; на проді — true
}));

// DB + Start
const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');

    server.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Server start failed:', error.message);
  }
};

start();
