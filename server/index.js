/* global process */
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import commentsRouter from './routes/comments.js';
import captchaRouter from './routes/captcha.js';
import { Server } from 'socket.io';
import http from 'http';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';

dotenv.config();

const app = express();
// Ensure this file is run with Node.js, as 'process' is a Node.js global variable.
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
app.use(helmet());
app.use(express.json());
app.use(mongoSanitize());

app.use((req, res, next) => {
  if (
    req.body &&
    Object.values(req.body).some(val => typeof val === 'object' && val !== null && !Array.isArray(val))
  ) {
    return res.status(400).json({ error: 'Nested objects are not allowed in request body.' });
  }
  next();
});

// API Routes
app.use('/api/comments', commentsRouter);
app.use('/api/captcha', captchaRouter);

// Files
app.use('/uploads', express.static(path.resolve('public/uploads')));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI
  }),
  cookie: {
    secure: true, // якщо HTTPS
    maxAge: 1000 * 60 * 60 // 1 година
  }
}));

// DB + Start
const start = async () => {
  try {
    mongoose.connect(process.env.MONGO_URI, {
      tls: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
    });
    console.log('✅ MongoDB connected');

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Server start failed:', error.message);
  }
};

start();
