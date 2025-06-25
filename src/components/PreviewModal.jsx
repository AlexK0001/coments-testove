import React from 'react';
import sanitizeHtml from 'sanitize-html';

export default function PreviewModal({ text, onClose }) {
  const cleanText = sanitizeHtml(text, {
    allowedTags: ['a', 'code', 'i', 'strong'],
    allowedAttributes: {
      a: ['href', 'title'],
    },
  });

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Preview</h3>
        <div dangerouslySetInnerHTML={{ __html: cleanText }} />
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
