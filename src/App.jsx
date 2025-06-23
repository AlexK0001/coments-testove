import React from 'react';
import CommentForm from './components/CommentForm';

function App() {
  const handleSubmit = async (data) => {
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      console.log('Submitted:', result);
    } catch (err) {
      console.error('Error submitting comment:', err);
    }
  };

  return (
    <div className="App">
      <h1>Leave a Comment</h1>
      <CommentForm onSubmit={handleSubmit} />
    </div>
  );
}

export default App;
