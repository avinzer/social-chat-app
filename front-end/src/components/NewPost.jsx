/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import axios from 'axios';

const NewPost = () => {
  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/posts', { content });
    setContent(''); // Clear the input after submission
    // Optionally navigate back to Posts or show a success message
  };

  return (
    <div>
      <h1>Create New Post</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your post here..."
          required
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default NewPost;