import express from 'express';
import svgCaptcha from 'svg-captcha';

const router = express.Router();

router.get('/', (req, res) => {
  const captcha = svgCaptcha.create({
    noise: 2,
    size: 6,
    ignoreChars: '0o1il', // без неоднозначних символів
    background: '#f2f2f2'
  });

  req.session.captcha = captcha.text; // зберігаємо код у сесію

  res.type('svg');
  res.status(200).send(captcha.data); // віддаємо SVG клієнту
});

export default router