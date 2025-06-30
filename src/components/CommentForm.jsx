import React, { useState, useEffect } from 'react';
import PreviewModal from './PreviewModal';

export default function CommentForm({ onSubmit, parentId = null }) {
  const [form, setForm] = useState({
    username: '',
    email: '',
    homepage: '',
    text: '',
    captcha: '',
  });

  const [errors, setErrors] = useState({});
  const [captchaUrl, setCaptchaUrl] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Генеруємо унікальний URL, щоб уникати кешу
  const refreshCaptcha = () => {
    setCaptchaUrl(`/api/captcha?${Date.now()}`);
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!form.username.trim() || !/^[A-Za-z0-9]+$/.test(form.username)) {
      newErrors.username = 'Ім’я користувача обовʼязкове і має бути алфанумеричним.';
    }
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Введіть дійсну електронну адресу.';
    }
    if (!form.text.trim()) {
      newErrors.text = 'Поле коментаря не може бути порожнім.';
    }
    if (!form.captcha.trim()) {
      newErrors.captcha = 'Введіть код з CAPTCHA.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
    setErrors({});
    setCaptchaError('');

    if (!validateForm()) {
      refreshCaptcha(); // навіть при локальних помилках оновлюємо
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    formData.append('parentId', parentId || '');

    const imageFile = e.target.image?.files?.[0];
    const txtFile = e.target.textFile?.files?.[0];
    if (imageFile) formData.append('image', imageFile);
    if (txtFile) formData.append('textFile', txtFile);

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        setForm({ username: '', email: '', homepage: '', text: '', captcha: '' });
        refreshCaptcha();
        onSubmit();
      } else if (res.status === 400 && result.errors) {
        setErrors(result.errors);
        refreshCaptcha();
      } else if (result.error) {
        setCaptchaError(result.error);
        refreshCaptcha();
      }
    } catch (err) {
      console.error('❌ Network error:', err);
      refreshCaptcha();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      <div>
        <label>User Name *</label>
        <input type="text" name="username" value={form.username} onChange={handleChange} />
        {errors.username && <div className="error">{errors.username}</div>}
      </div>

      <div>
        <label>Email *</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} />
        {errors.email && <div className="error">{errors.email}</div>}
      </div>

      <div>
        <label>Home page</label>
        <input type="url" name="homepage" value={form.homepage} onChange={handleChange} />
      </div>

      <div>
        <label>Message *</label>
        <div className="tag-buttons">
          <button type="button" onClick={() => insertTag('i')}>[i]</button>
          <button type="button" onClick={() => insertTag('strong')}>[strong]</button>
          <button type="button" onClick={() => insertTag('code')}>[code]</button>
          <button type="button" onClick={() => insertTag('a href="" title=""', false)}>[a]</button>
        </div>
        <textarea name="text" value={form.text} onChange={handleChange} />
        {errors.text && <div className="error">{errors.text}</div>}
      </div>

      <div>
        <label>Attach image (.jpg/.png/.gif, ≤ 320×240)</label>
        <input type="file" name="image" accept="image/png, image/jpeg, image/gif" />
      </div>

      <div>
        <label>Attach .txt file (≤ 100 KB)</label>
        <input type="file" name="textFile" accept=".txt" />
      </div>

      <div>
        <img src={captchaUrl} alt="captcha" style={{ display: 'block', marginBottom: 5 }} />
        <input type="text" name="captcha" value={form.captcha} onChange={handleChange} placeholder="Enter CAPTCHA" />
        {errors.captcha && <div className="error">{errors.captcha}</div>}
        {captchaError && <div className="error">{captchaError}</div>}
      </div>

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
