import express from 'express';
import { generateCaptcha } from '../utils/captcha.js';

const router = express.Router();

let currentCaptchaText = ''; // тимчасово зберігаємо CAPTCHA (демо)

router.get('/', (req, res) => {
  const captcha = generateCaptcha();
  currentCaptchaText = captcha.text;

  res.type('svg');
  res.send(captcha.data);
});

// Для перевірки (опціонально)
router.post('/verify', (req, res) => {
  const userInput = (req.body.captcha || '').toLowerCase();
  const isValid = userInput === currentCaptchaText;
  res.json({ valid: isValid });
});

export default router;
