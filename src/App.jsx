import React, { useState, useEffect } from 'react';
import CommentForm from './components/CommentForm';
import './App.css';

const Comment = ({ data, onReply }) => {
  const [showReply, setShowReply] = useState(false);

  return (
    <div style={{ marginLeft: data.parentId ? 30 : 0, borderLeft: '1px solid #ccc', paddingLeft: 10 }}>
      <p><strong>{data.username}</strong>: <span dangerouslySetInnerHTML={{ __html: data.text }} /></p>

      {data.imagePath && (
        <div>
          <img src={data.imagePath} alt="attachment" style={{ maxWidth: 320, maxHeight: 240 }} />
        </div>
      )}

      {data.txtAttachment && (
        <pre style={{ background: '#f4f4f4', padding: '5px', whiteSpace: 'pre-wrap' }}>
          {data.txtAttachment}
        </pre>
      )}

      <button onClick={() => setShowReply(!showReply)}>Reply</button>
      {showReply && (
        <CommentForm
          onSubmit={(form) => {
            onReply(form, data._id);
            setShowReply(false);
          }}
          parentId={data._id}
        />
      )}

      {data.replies && data.replies.map(reply => (
        <Comment key={reply._id} data={reply} onReply={onReply} />
      ))}
    </div>
  );
};

export default function App() {
  const [comments, setComments] = useState([]);
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?sort=${sort}&order=${order}&page=${page}`);
      const json = await res.json();
      setComments(json.comments);
      setTotalPages(json.totalPages);
    } catch (err) {
      console.error('❌ Помилка при завантаженні коментарів:', err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [sort, order, page]);

  const handleSubmit = async (form, parentId = null) => {
    const formData = new FormData();
    formData.append('username', form.username);
    formData.append('email', form.email);
    formData.append('homepage', form.homepage);
    formData.append('text', form.text);
    formData.append('captcha', form.captcha);
    formData.append('parentId', parentId || '');

    if (form.image) formData.append('image', form.image);
    if (form.textFile) formData.append('textFile', form.textFile);

    const res = await fetch('/api/comments', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      setPage(1);
      await fetchComments();
    } else {
      const error = await res.json();
      console.error('❌ Server error:', error);
    }
  };

  return (
    <div className="container">
      <h2>Leave a Comment</h2>
      <CommentForm onSubmit={(form) => handleSubmit(form)} parentId={null} />

      <div style={{ marginTop: 20, marginBottom: 20 }}>
        <label>Sort by:&nbsp;
          <select value={sort} onChange={e => setSort(e.target.value)}>
            <option value="createdAt">Date</option>
            <option value="username">User Name</option>
            <option value="email">Email</option>
          </select>
        </label>
        &nbsp;&nbsp;
        <label>Order:&nbsp;
          <select value={order} onChange={e => setOrder(e.target.value)}>
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </label>
      </div>

      <h3>All Comments</h3>
      {comments.map(comment => (
        <Comment key={comment._id} data={comment} onReply={handleSubmit} />
      ))}

      <div style={{ marginTop: 20 }}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <button
            key={p}
            onClick={() => setPage(p)}
            style={{
              margin: '0 5px',
              fontWeight: page === p ? 'bold' : 'normal',
              background: page === p ? '#ccc' : '#eee'
            }}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
