import React, { useState, useEffect, useCallback } from 'react';
import CommentForm from './components/CommentForm';
import './App.css';
import { io } from 'socket.io-client';

const socket = io('https://<your-render-backend-url>.onrender.com', {
  transports: ['websocket'],
});

export default function App() {
  const [comments, setComments] = useState([]);
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?sort=${sort}&order=${order}&page=${page}`);
      const json = await res.json();
      setComments(json.comments);
      setTotalPages(json.totalPages);
    } catch (err) {
      console.error('❌ Помилка при завантаженні коментарів:', err);
    }
  }, [sort, order, page]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    socket.on('new-comment', fetchComments);
    return () => {
      socket.off('new-comment', fetchComments);
    };
  }, [fetchComments]);

  return (
    <div className="container">
      <h2>Leave a Comment</h2>
      <CommentForm parentId={null} onAfterSubmit={fetchComments} />
      <div style={{ margin: '20px 0' }}>
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
        <Comment key={comment._id} data={comment} />
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
