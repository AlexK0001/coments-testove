import express from 'express';
import { upload } from '../middleware/upload.js';
import Comment from '../models/Comment.js';
import fs from 'fs';
import path from 'path';
import sanitizeHtml from 'sanitize-html';

const router = express.Router();

router.post(
  '/',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'textFile', maxCount: 1 }
  ]),
  async (req, res) => {
    console.log('[DEBUG] req.body =', req.body);
    console.log('[DEBUG] req.files =', req.files);

    const {
      username,
      email,
      homepage,
      text,
      parentId,
      captcha
    } = req.body;

    const errors = {};

    if (!username || !/^[A-Za-z0-9]+$/.test(username)) {
      errors.username = 'Username is required and must be alphanumeric.';
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Valid email is required.';
    }
    if (!text || text.length < 1) {
      errors.text = 'Message is required.';
    }
    if (!captcha) {
      errors.captcha = 'CAPTCHA is required.';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    try {
      const imageFile = req.files?.image?.[0];
      const textFile = req.files?.textFile?.[0];

      const imagePath = imageFile ? `/uploads/${imageFile.filename}` : null;
      let txtAttachment = null;

      if (textFile) {
        const contentPath = path.resolve(textFile.path);
        const fileContent = fs.readFileSync(contentPath, 'utf-8');
        txtAttachment = sanitizeHtml(fileContent.slice(0, 100000), {
          allowedTags: [],
          allowedAttributes: {}
        });
      }

      if (parentId && !/^[a-f\d]{24}$/i.test(parentId.trim())) {
        return res.status(400).json({ errors: { parentId: 'Invalid parentId format' } });
      }

      const allowedTags = ['a', 'code', 'strong', 'i'];
      const allowedAttributes = {
        a: ['href', 'title']
      };

      const cleanText = sanitizeHtml(text, {
        allowedTags,
        allowedAttributes,
        allowedSchemes: ['http', 'https'],
        allowedSchemesByTag: {
          a: ['http', 'https']
        }
      });


      const comment = new Comment({
        username,
        email,
        homepage,
        text: cleanText,
        parentId: parentId?.trim() || null,
        imagePath,
        txtAttachment,
        createdAt: new Date()
      });

      // Перевірка CAPTCHA
      if (!req.session?.captcha || captcha.trim().toLowerCase() !== req.session.captcha.toLowerCase()) {
        return res.status(400).json({ errors: { captcha: 'Неправильна CAPTCHA.' } });
      }
      req.session.captcha = null;

      await comment.save();
      res.status(201).json({ message: 'Comment saved' });

      // Витягуємо io з app
      const io = req.app.get('io');
      io.emit('new-comment', comment); // ← трансляція для всіх підключених клієнтів

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

    const rootComments = await Comment.find({ parentId: null })
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    const allComments = await Comment.find().lean();

    const buildTree = (comment, all) => {
      const children = all.filter(c =>
        c.parentId?.toString?.() === comment._id.toString()
      );
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
