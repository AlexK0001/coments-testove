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

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 25;
    const skip = (page - 1) * limit;

    const sortField = req.query.sort || 'createdAt';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;

    // Отримуємо тільки топ-рівень коментарів (parentId: null)
    const rootComments = await Comment.find({ parentId: null })
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(); // lean — швидше і дозволяє мутувати результат

    // Витягуємо всі дочірні коментарі, щоб зібрати дерево
    const allComments = await Comment.find().lean();

    // Функція для каскадної побудови дерева
    const buildTree = (comment, all) => {
      const children = all.filter(c => c.parentId?.toString() === comment._id.toString());
      comment.replies = children.map(child => buildTree(child, all));
      return comment;
    };

    const tree = rootComments.map(root => buildTree(root, allComments));

    const total = await Comment.countDocuments({ parentId: null });
    const totalPages = Math.ceil(total / limit);

    res.json({ comments: tree, totalPages, currentPage: page });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  } 
});

export default router;
