import React, { useState } from 'react';

const allowedTags = ['<a>', '<code>', '<i>', '<strong>'];

export default function CommentForm({ onSubmit }) {
  const [form, setForm] = useState({
    username: '',
    email: '',
    homepage: '',
    text: '',
    captcha: '',
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      <div>
        <label>User Name *</label>
        <input
          name="username"
          type="text"
          required
          pattern="[A-Za-z0-9]+"
          value={form.username}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Email *</label>
        <input
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Home page</label>
        <input
          name="homepage"
          type="url"
          value={form.homepage}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Message *</label>
        <textarea
          name="text"
          required
          value={form.text}
          onChange={handleChange}
        />
      </div>

      {/* CAPTCHA (згодом підключимо з бекенду) */}
      <div>
        <label>CAPTCHA *</label>
        <img src="/api/captcha" alt="CAPTCHA" />
        <input
          name="captcha"
          required
          pattern="[A-Za-z0-9]+"
          value={form.captcha}
          onChange={handleChange}
        />
      </div>

      <button type="submit">Submit</button>
    </form>
  );
}
