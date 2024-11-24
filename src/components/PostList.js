import React, { useEffect, useState } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import PostForm from './PostForm';
import PostItem from './PostItem';

function PostList({ username, isAuthenticated }) {
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPosts = async () => {
    const querySnapshot = await getDocs(collection(db, 'posts'));
    const postsArray = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setPosts(postsArray);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Allow post creation only if logged in */}
      {isAuthenticated && <PostForm username={username} onPostAdded={fetchPosts} />}
      <div className="my-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="row">
        {filteredPosts.map((post) => (
          <div className="col-md-6 mb-4" key={post.id}>
            <PostItem
              post={post}
              username={username}
              isAuthenticated={isAuthenticated}
              onPostDeleted={fetchPosts}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default PostList;
