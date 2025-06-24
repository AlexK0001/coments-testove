import React, { useEffect, useState } from 'react';
import CommentNode from './CommentNode';

export default function CommentTree() {
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [totalPages, setTotalPages] = useState(1);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?page=${page}&sortField=${sortField}&sortDir=${sortDir}`);
      const data = await res.json();
      setComments(data.comments || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [page, sortField, sortDir]);

  const toggleSort = field => {
    if (sortField === field) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  return (
    <div className="comment-tree">
      <table>
        <thead>
          <tr>
            <th onClick={() => toggleSort('username')}>User Name {sortField === 'username' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
            <th onClick={() => toggleSort('email')}>E-mail {sortField === 'email' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
            <th onClick={() => toggleSort('createdAt')}>Date {sortField === 'createdAt' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
          </tr>
        </thead>
      </table>

      <div>
        {comments.map(c => (
          <CommentNode key={c._id} comment={c} />
        ))}
      </div>

      <div className="pagination">
        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
        <span>Page {page} of {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
      </div>
    </div>
  );
}
