import React, { useState } from 'react';
// import CommentForm from './CommentForm'; // використаємо пізніше

export default function CommentNode({ comment }) {
  const [showReply, setShowReply] = useState(false);

  return (
    <div className="comment-node" style={{ marginLeft: comment.parentId ? 20 : 0 }}>
      <div className="comment-header">
        <strong>{comment.username}</strong> – <em>{new Date(comment.createdAt).toLocaleString()}</em>
      </div>
      <div dangerouslySetInnerHTML={{ __html: comment.text }} />
      <button onClick={() => setShowReply(prev => !prev)}>
        {showReply ? 'Cancel' : 'Reply'}
      </button>
      {showReply && (
        <div style={{ marginTop: 8 }}>
          <em>Reply form (soon)</em>
        </div>
      )}
      {comment.replies && comment.replies.map(r => (
        <CommentNode key={r._id} comment={r} />
      ))}
    </div>
  );
}
