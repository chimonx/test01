import React, { useState } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

function PostForm({ username, onPostAdded }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, 'posts'), {
        title,
        content,
        username,
        createdAt: new Date().toISOString(),
      });
      setTitle('');
      setContent('');
      onPostAdded();
      alert('Post added successfully!');
    } catch (error) {
      alert('Error adding post: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm p-4 mb-4">
      <h2 className="text-primary text-center mb-3">Create a New Post</h2>
      <form onSubmit={handlePostSubmit}>
        <div className="mb-3">
          <label htmlFor="postTitle" className="form-label">
            Post Title
          </label>
          <input
            type="text"
            className="form-control"
            id="postTitle"
            placeholder="Enter the title of your post"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="postContent" className="form-label">
            Post Content
          </label>
          <textarea
            className="form-control"
            id="postContent"
            rows="5"
            placeholder="Write your content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          ></textarea>
        </div>
        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? 'Posting...' : 'Add Post'}
        </button>
      </form>
    </div>
  );
}

export default PostForm;
