import express from 'express';
import { upload } from '../middleware/upload.js';
// import sharp from 'sharp';
// import sanitizeHtml from 'sanitize-html';
import Comment from '../models/Comment.js';
import fs from 'fs';
// import path from 'path'

const router = express.Router();

// POST /api/comments — Створення нового коментаря
router.post(
  '/',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'textFile', maxCount: 1 }
  ]),
  async (req, res) => {
    console.log('[DEBUG] req.body =', req.body);
    console.log('[DEBUG] req.files =', req.files);

    try {
      const {
        username,
        email,
        homepage,
        text,
        parentId,
        captcha
      } = req.body;

      // Нормалізуємо parentId ('' → null)
      const cleanParentId = parentId && parentId.trim() !== '' ? parentId : null;
      let cleanParentId = null;
      if (typeof parentId === 'string' && parentId.trim()) {
        cleanParentId = parentId;
      }

      // ❗ Витягуємо шляхи файлів з req.files
      const imageFile = req.files?.image?.[0];
      const textFile = req.files?.textFile?.[0];

      const imagePath = imageFile ? `/uploads/${imageFile.filename}` : null;


      let txtAttachment = null;
      if (textFile) {
        const fileContent = textFile.buffer.toString('utf8');
        txtAttachment = fileContent.slice(0, 100000); // до 100кб
      }

      const comment = new Comment({
        username,
        email,
        homepage,
        text,
        parentId: cleanParentId,
        imagePath,
        txtAttachment,
        createdAt: new Date()
      });

      await comment.save();
      res.status(201).json({ message: 'Comment saved' });

    } catch (err) {
      console.error('[POST /api/comments]', err.message);
      res.status(500).json({ error: 'Failed to save comment' });
    }
  }
);


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
