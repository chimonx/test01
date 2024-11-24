import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, addDoc, getDocs } from 'firebase/firestore';

function CommentSection({ postId, username, isAuthenticated }) {
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      const commentsRef = collection(db, 'posts', postId, 'comments');
      const querySnapshot = await getDocs(commentsRef);
      const commentsArray = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setComments(commentsArray);
    };
    fetchComments();
  }, [postId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('You need to log in to add a comment.');
      return;
    }
    try {
      const commentsRef = collection(db, 'posts', postId, 'comments');
      await addDoc(commentsRef, {
        text: comment,
        username: username,
        createdAt: new Date().toISOString(),
      });
      setComment('');
      const querySnapshot = await getDocs(commentsRef);
      const commentsArray = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setComments(commentsArray);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div className="mt-3">
      {isAuthenticated && (
        <form onSubmit={handleAddComment} className="d-flex mb-2">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
            className="form-control me-2"
            required
          />
          <button type="submit" className="btn btn-primary">
            Comment
          </button>
        </form>
      )}
      <div>
        {comments.map((comment) => (
          <p key={comment.id} className="mb-1">
            <strong>{comment.username}:</strong> {comment.text}
          </p>
        ))}
      </div>
    </div>
  );
}

export default CommentSection;
