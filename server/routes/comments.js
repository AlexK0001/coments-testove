import express from 'express';
import { upload } from '../middleware/upload.js';
import Comment from '../models/Comment.js';

const router = express.Router();

// ✅ Тимчасовий маршрут для виправлення некоректних parentId
router.get('/fix-parentIds', async (req, res) => {
  try {
    const result = await Comment.updateMany({ parentId: '' }, { $set: { parentId: null } });
    res.json({ fixed: result.modifiedCount });
  } catch (err) {
    console.error('[GET /fix-parentIds]', err.message);
    res.status(500).json({ error: 'Failed to fix parentId fields' });
  }
});

// ✅ Створення нового коментаря
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
      const cleanParentId =
        typeof parentId === 'string' && parentId.trim()
          ? parentId
          : null;

      const imageFile = req.files?.image?.[0];
      const textFile = req.files?.textFile?.[0];

      const imagePath = imageFile ? `/uploads/${imageFile.filename}` : null;
      const textPath = textFile ? `/uploads/${textFile.filename}` : null;

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
        parentId: cleanParentId ? new mongoose.Types.ObjectId(cleanParentId) : null,
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

// ✅ Отримання коментарів з побудовою дерева
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 25;
    const skip = (page - 1) * limit;

    const sortField = req.query.sort || 'createdAt';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;

    const rootComments = await Comment.find({ parentId: null })
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    const allComments = await Comment.find().lean();

    // 🔐 Захищений buildTree
    const buildTree = (comment, all) => {
  const commentId = comment._id?.toString();

  const children = all.filter(c => {
    if (!c.parentId) return false;
    try {
      return c.parentId.toString() === commentId;
    } catch (e) {
      console.warn('[buildTree] Invalid parentId:', c.parentId);
      return false;
    }
  });

  comment.replies = children.map(child => buildTree(child, all));
  return comment
    };

    const tree = rootComments.map(root => buildTree(root, allComments)).filter(Boolean);

    const total = await Comment.countDocuments({ parentId: null });
    const totalPages = Math.ceil(total / limit);

    res.json({ comments: tree, totalPages, currentPage: page });
  } catch (err) {
    console.error('[GET /api/comments]', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
