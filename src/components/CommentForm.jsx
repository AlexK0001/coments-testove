import React, { useState } from 'react';
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

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
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

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      <div>
        <label>User Name *</label>
        <input name="username" type="text" required pattern="[A-Za-z0-9]+" value={form.username} onChange={handleChange} />
      </div>
      <div>
        <label>Email *</label>
        <input name="email" type="email" required value={form.email} onChange={handleChange} />
      </div>
      <div>
        <label>Home page</label>
        <input name="homepage" type="url" value={form.homepage} onChange={handleChange} />
      </div>
      <div>
        <label>Message *</label>
        <div className="tag-buttons">
          <button type="button" onClick={() => insertTag('i')}>[i]</button>
          <button type="button" onClick={() => insertTag('strong')}>[strong]</button>
          <button type="button" onClick={() => insertTag('code')}>[code]</button>
          <button type="button" onClick={() => insertTag('a href="" title=""', false)}>[a]</button>
        </div>
        <textarea name="text" required value={form.text} onChange={handleChange} />
      </div>

      <div>
        <label>CAPTCHA *</label>
        <img src="/api/captcha" alt="CAPTCHA" />
        <input name="captcha" required pattern="[A-Za-z0-9]+" value={form.captcha} onChange={handleChange} />
      </div>

      <button type="button" onClick={() => setShowPreview(true)}>Preview</button>
      <button type="submit">Submit</button>

      {showPreview && (
        <PreviewModal
          text={form.text}
          onClose={() => setShowPreview(false)}
        />
      )}
    </form>
  );
}
