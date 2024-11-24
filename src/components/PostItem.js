import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { doc, deleteDoc, updateDoc, getDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import CommentSection from './CommentSection';

function PostItem({ post, onPostDeleted, username, isAuthenticated }) {
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchLikes = async () => {
      const postRef = doc(db, 'posts', post.id);
      const postDoc = await getDoc(postRef);
      if (postDoc.exists()) {
        const postData = postDoc.data();
        setLikes(postData.likes || 0);
        if (isAuthenticated) {
          setIsLiked(postData.likedBy?.includes(username) || false);
        }
      }
    };
    fetchLikes();
  }, [post.id, username, isAuthenticated]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert('You need to log in to like posts.');
      return;
    }

    const postRef = doc(db, 'posts', post.id);
    try {
      if (isLiked) {
        await updateDoc(postRef, {
          likes: likes - 1,
          likedBy: arrayRemove(username),
        });
        setLikes(likes - 1);
      } else {
        await updateDoc(postRef, {
          likes: likes + 1,
          likedBy: arrayUnion(username),
        });
        setLikes(likes + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };

  const handleDelete = async () => {
    if (!isAuthenticated) {
      alert('You need to log in to delete posts.');
      return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete this post?');
    if (confirmDelete) {
      const postRef = doc(db, 'posts', post.id);
      try {
        await deleteDoc(postRef);
        alert('Post deleted successfully!');
        onPostDeleted();
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post. Please try again.');
      }
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title text-primary">{post.title}</h5>
        <p className="card-text">{post.content}</p>
        <p className="text-muted">Posted by: {post.username}</p>
        <div className="d-flex justify-content-between">
          <button className="btn btn-warning btn-sm" onClick={handleLike}>
            {isLiked ? 'Unlike' : 'Like'} ({likes})
          </button>
          {isAuthenticated && post.username === username && (
            <button className="btn btn-danger btn-sm" onClick={handleDelete}>
              Delete Post
            </button>
          )}
        </div>
        {/* Show comment section */}
        <CommentSection postId={post.id} username={username} isAuthenticated={isAuthenticated} />
      </div>
    </div>
  );
}

export default PostItem;
