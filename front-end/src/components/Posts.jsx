/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import '../style/_posts.scss';

const Posts = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPost, setNewPost] = useState({
    type: 'advertisement',
    title: '',
    content: '',
    price: '',
    phoneNumber: '',
    images: []
  });
  const [activeTab, setActiveTab] = useState('advertisement');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get(`/api/posts/${activeTab}`);
        setPosts(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch posts');
        setLoading(false);
        console.error('Error fetching posts:', err);
      }
    };

    fetchPosts();
  }, [activeTab]);

  const handleImageChange = (e) => {
    setNewPost(prev => ({
      ...prev,
      images: Array.from(e.target.files)
    }));
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      console.log('Creating post with data:', newPost); // Debug log

      const formData = new FormData();
      // Add all fields to formData
      Object.keys(newPost).forEach(key => {
        if (key === 'images') {
          newPost.images.forEach(image => {
            formData.append('images', image);
          });
        } else {
          formData.append(key, newPost[key]);
        }
      });

      const response = await api.post('/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Post created:', response.data); // Debug log
      
      setShowCreateForm(false);
      setNewPost({
        type: activeTab,
        title: '',
        content: '',
        price: '',
        phoneNumber: '',
        images: []
      });
      
      // Refresh posts
      const postsResponse = await api.get(`/api/posts/${activeTab}`);
      setPosts(postsResponse.data);
    } catch (err) {
      console.error('Error creating post:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.delete(`/api/posts/${postId}`);
        setPosts(posts.filter(post => post._id !== postId));
      } catch (err) {
        console.error('Error deleting post:', err);
        setError('Failed to delete post');
      }
    }
  };

  const handleEdit = async (e, postId) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(editingPost).forEach(key => {
        if (key !== 'images' && key !== '_id' && key !== 'author' && key !== 'newImages') {
          formData.append(key, editingPost[key]);
        }
      });

      if (editingPost.newImages?.length) {
        editingPost.newImages.forEach(image => {
          formData.append('images', image);
        });
      }

      const response = await api.put(`/api/posts/${postId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setPosts(posts.map(post => 
        post._id === postId ? response.data : post
      ));
      setEditingPost(null);
    } catch (err) {
      console.error('Error updating post:', err);
      setError('Failed to update post');
    }
  };

  const renderPost = (post) => {
    console.log('Post:', post);
    console.log('Current user:', user);
    
    const authorName = post.author?.username || 'Unknown User';
    const isAuthor = post.author?._id === user?.id || post.author?.id === user?.id || post.author === user?.id;

    if (editingPost?._id === post._id) {
      return (
        <form onSubmit={(e) => handleEdit(e, post._id)} className="edit-post-form">
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={editingPost.title}
              onChange={(e) => setEditingPost(prev => ({ ...prev, title: e.target.value }))}
              required={post.type === 'advertisement'}
            />
          </div>

          {post.type === 'advertisement' && (
            <>
              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  value={editingPost.price}
                  onChange={(e) => setEditingPost(prev => ({ ...prev, price: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={editingPost.phoneNumber}
                  onChange={(e) => setEditingPost(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Images (optional)</label>
            <input
              type="file"
              accept="image/*"
              multiple={post.type === 'advertisement'}
              onChange={(e) => setEditingPost(prev => ({
                ...prev,
                newImages: Array.from(e.target.files)
              }))}
            />
          </div>

          <div className="form-group">
            <label>{post.type === 'advertisement' ? 'Description' : 'Quote Text'}</label>
            <textarea
              value={editingPost.content}
              onChange={(e) => setEditingPost(prev => ({ ...prev, content: e.target.value }))}
              required
            />
          </div>

          <div className="edit-buttons">
            <button type="submit">Save Changes</button>
            <button type="button" onClick={() => setEditingPost(null)}>Cancel</button>
          </div>
        </form>
      );
    }

    return (
      <div className="post-content">
        {post.type === 'advertisement' && (
          <div className="post-details">
            <h2 className="post-title">{post.title}</h2>
            <div className="post-info">
              <span className="post-price">${post.price}</span>
              <span className="post-phone">{post.phoneNumber}</span>
            </div>
          </div>
        )}
        
        {post.type === 'quote' && post.title && (
          <h2 className="post-title">{post.title}</h2>
        )}

        <div className="post-header">
          <span className="post-author">{authorName}</span>
          <span className="post-date">
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
        </div>

        <p className="post-text">{post.content}</p>

        {post.images && post.images.length > 0 && (
          <div className="post-images">
            {post.images.map((image, index) => (
              <div key={index} className="post-image">
                <img src={`http://localhost:5000${image}`} alt={`Post ${index + 1}`} />
              </div>
            ))}
          </div>
        )}

        {isAuthor && (
          <div className="post-actions">
            <button 
              className="edit-button"
              onClick={() => {
                console.log('Setting editing post:', post);
                setEditingPost(post);
              }}
            >
              Edit
            </button>
            <button 
              className="delete-button"
              onClick={() => {
                console.log('Deleting post:', post._id);
                handleDelete(post._id);
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    );
  };

  if (loading) return <div className="posts-loading">Loading...</div>;
  if (error) return <div className="posts-error">{error}</div>;

  return (
    <div className="posts-container">
      <div className="posts-tabs">
        <button 
          className={`tab-button ${activeTab === 'advertisement' ? 'active' : ''}`}
          onClick={() => setActiveTab('advertisement')}
        >
          Advertisements
        </button>
        <button 
          className={`tab-button ${activeTab === 'quote' ? 'active' : ''}`}
          onClick={() => setActiveTab('quote')}
        >
          Quotes
        </button>
      </div>

      <div className="posts-header">
        <h1>{activeTab === 'advertisement' ? 'Advertisements' : 'Quotes'}</h1>
        <button 
          className="create-button"
          onClick={() => {
            setNewPost(prev => ({ ...prev, type: activeTab }));
            setShowCreateForm(!showCreateForm);
          }}
        >
          Create {activeTab === 'advertisement' ? 'Advertisement' : 'Quote'}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreatePost} className="create-post-form">
          <h3>Create {activeTab === 'advertisement' ? 'Advertisement' : 'Quote'}</h3>
          
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={newPost.title}
              onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
              placeholder={`${activeTab === 'advertisement' ? 'Advertisement' : 'Quote'} Title`}
              required={activeTab === 'advertisement'}
            />
          </div>

          {activeTab === 'advertisement' && (
            <>
              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  value={newPost.price}
                  onChange={(e) => setNewPost(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="Price"
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={newPost.phoneNumber}
                  onChange={(e) => setNewPost(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="Phone Number"
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Images {activeTab === 'advertisement' ? '(up to 5)' : '(optional)'}</label>
            <input
              type="file"
              accept="image/*"
              multiple={activeTab === 'advertisement'}
              onChange={handleImageChange}
              className="file-input"
              required={activeTab === 'advertisement'}
            />
            {newPost.images.length > 0 && (
              <div className="image-preview">
                {Array.from(newPost.images).map((image, index) => (
                  <div key={index} className="preview-item">
                    <img src={URL.createObjectURL(image)} alt={`Preview ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>{activeTab === 'advertisement' ? 'Description' : 'Quote Text'}</label>
            <textarea
              value={newPost.content}
              onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
              placeholder={activeTab === 'advertisement' ? 'Description' : 'Write your quote here...'}
              required
            />
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create'}
          </button>
        </form>
      )}

      {posts.length === 0 ? (
        <p className="no-posts">No posts yet</p>
      ) : (
        <div className="posts-list">
          {posts.map((post) => (
            <div key={post._id} className="post-card">
              {renderPost(post)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Posts;