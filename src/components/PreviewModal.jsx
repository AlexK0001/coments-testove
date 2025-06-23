import React from 'react';

export default function PreviewModal({ text, onClose }) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Preview</h3>
        <div
          className="preview-content"
          dangerouslySetInnerHTML={{ __html: text }}
        />
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
