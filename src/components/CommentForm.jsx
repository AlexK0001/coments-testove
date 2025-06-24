import React, { useState, useEffect } from 'react';
import PreviewModal from './PreviewModal';

export default function CommentForm({ onSubmit }) {
  const [form, setForm] = useState({
    username: '',
    email: '',
    homepage: '',
    text: '',
    captcha: '',
  });

  const [showPreview, setShowPreview] = useState(false);
  const [captchaSvg, setCaptchaSvg] = useState('');
  const [captchaError, setCaptchaError] = useState('');

  const fetchCaptcha = async () => {
    try {
      const res = await fetch('/api/captcha');
      const svg = await res.text();
      setCaptchaSvg(svg);
    } catch (err) {
      console.error('Failed to load CAPTCHA', err);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const insertTag = (tag, closing = true) => {
    const textarea = document.querySelector('textarea[name="text"]');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const openTag = `<${tag}>`;
    const closeTag = closing ? `</${tag}>` : '';
    const selectedText = form.text.slice(start, end);
    const newText =
      form.text.slice(0, start) +
      openTag +
      selectedText +
      closeTag +
      form.text.slice(end);

    setForm(prev => ({ ...prev, text: newText }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

      // 1. Перевірка CAPTCHA перед відправкою
      const res = await fetch('/api/captcha/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ captcha: form.captcha }),
      });
  
      const result = await res.json();
  
      if (!result.valid) {
        setCaptchaError('Код із зображення введено неправильно');
        await fetchCaptcha(); // оновити CAPTCHA
        return;
      }
  
      setCaptchaError('');
      onSubmit(form); // передати форму зовні (в App)
      setForm({ username: '', email: '', homepage: '', text: '', captcha: '' });
      await fetchCaptcha(); // оновити CAPTCHA після відправки
    };

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      <div>
        <label>User Name *</label>
        <input type="text" name="username" value={form.username} onChange={handleChange} placeholder="User name" required />
      </div>
      <div>
        <label>Email *</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="E-mail" required />
      </div>
      <div>
        <label>Home page</label>
        <input type="url" name="homepage" value={form.homepage} onChange={handleChange} placeholder="Homepage (optional)" />
      </div>
      <div>
        <label>Message *</label>
        <div className="tag-buttons">
          <button type="button" onClick={() => insertTag('i')}>[i]</button>
          <button type="button" onClick={() => insertTag('strong')}>[strong]</button>
          <button type="button" onClick={() => insertTag('code')}>[code]</button>
          <button type="button" onClick={() => insertTag('a href="" title=""', false)}>[a]</button>
        </div>
        <textarea name="text" value={form.text} onChange={handleChange} placeholder="Message..." required />
      </div>

       {/* CAPTCHA */}
       <div dangerouslySetInnerHTML={{ __html: captchaSvg }} />
      <input type="text" name="captcha" value={form.captcha} onChange={handleChange} placeholder="Enter CAPTCHA" required />
      {captchaError && <p style={{ color: 'red' }}>{captchaError}</p>}

      <button type="button" onClick={() => setShowPreview(true)}>Preview</button>
      <button type="submit">Send</button>

      {showPreview && (
        <PreviewModal
          text={form.text}
          onClose={() => setShowPreview(false)}
        />
      )}
    </form>
  );
}
