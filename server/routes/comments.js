import express from 'express';
import Comment from '../models/Comment.js';
import { sanitizeText } from '../utils/sanitizeText.js';

const router = express.Router();

// POST /api/comments — створення коментаря
router.post('/', async (req, res) => {
  try {
    const { username, email, homepage, text, parentId } = req.body;

    if (!username || !email || !text) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const cleanText = sanitizeText(text);

    const comment = new Comment({
      username,
      email,
      homepage,
      text: cleanText,
      parentId: parentId || null,
    });

    const saved = await comment.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('❌ POST /comments error:', err.message);
    res.status(500).json({ error: 'Failed to post comment' });
  }
});

// GET /api/comments — отримати коментарі (пагінація + сортування)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 25, sortField = 'createdAt', sortDir = 'desc' } = req.query;
    const sort = { [sortField]: sortDir === 'asc' ? 1 : -1 };

    // Тільки кореневі коментарі (без parentId)
    const rootComments = await Comment.find({ parentId: null })
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Comment.countDocuments({ parentId: null });
    const totalPages = Math.ceil(total / limit);

    // Отримуємо всі відповіді до root-коментарів
    const rootIds = rootComments.map(c => c._id);
    const replies = await Comment.find({ parentId: { $in: rootIds } });

    // Групуємо відповіді
    const repliesMap = {};
    replies.forEach(r => {
      const parentId = r.parentId.toString();
      if (!repliesMap[parentId]) repliesMap[parentId] = [];
      repliesMap[parentId].push(r);
    });

    // Додаємо replies до root-коментарів
    const commentsWithReplies = rootComments.map(c => ({
      ...c.toObject(),
      replies: repliesMap[c._id.toString()] || [],
    }));

    res.json({ comments: commentsWithReplies, totalPages });
  } catch (err) {
    console.error('❌ GET /comments error:', err.message);
    res.status(500).json({ error: 'Failed to load comments' });
  }
});

export default router;
