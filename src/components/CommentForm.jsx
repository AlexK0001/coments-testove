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
  const [captchaSvg, setCaptchaSvg] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

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
    setErrors({});
    setCaptchaError('');

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    formData.append('parentId', parentId || '');

    const imageFile = e.target.image?.files?.[0];
    const txtFile = e.target.textFile?.files?.[0];
    if (imageFile) formData.append('image', imageFile);
    if (txtFile) formData.append('textFile', txtFile);

    const res = await fetch('/api/comments', {
      method: 'POST',
      body: formData,
    });

    const result = await res.json();

    if (res.ok) {
      setForm({ username: '', email: '', homepage: '', text: '', captcha: '' });
      await fetchCaptcha();
      onSubmit();
    } else if (res.status === 400 && result.errors) {
      setErrors(result.errors);
    } else if (result.error) {
      setCaptchaError(result.error);
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

      <div dangerouslySetInnerHTML={{ __html: captchaSvg }} />
      <input type="text" name="captcha" value={form.captcha} onChange={handleChange} placeholder="Enter CAPTCHA" />
      {captchaError && <div className="error">{captchaError}</div>}

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
