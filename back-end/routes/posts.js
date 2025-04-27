const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const Post = require('../models/Post');

// Configure multer for multiple file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Get posts by type
router.get('/:type', auth, async (req, res) => {
  try {
    console.log('Fetching posts of type:', req.params.type);
    const posts = await Post.find({ type: req.params.type })
      .populate('author', 'username _id')
      .sort({ createdAt: -1 });
    
    // Transform posts to handle null authors
    const transformedPosts = posts.map(post => {
      const postObj = post.toObject();
      if (!postObj.author) {
        postObj.author = { username: 'Unknown User', _id: null };
      }
      return postObj;
    });
    
    console.log('Posts fetched:', transformedPosts);
    res.json(transformedPosts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
});

// Create a new post
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    console.log('Received post data:', req.body);
    const { type, title, content, price, phoneNumber } = req.body;
    
    // Validate required fields
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    if (type === 'advertisement' && (!title || !price || !phoneNumber)) {
      return res.status(400).json({ 
        message: 'Title, price, and phone number are required for advertisements' 
      });
    }

    const newPost = new Post({
      type,
      title,
      content,
      price: type === 'advertisement' ? Number(price) : undefined,
      phoneNumber: type === 'advertisement' ? phoneNumber : undefined,
      images: req.files ? req.files.map(file => `/uploads/${file.filename}`) : [],
      author: req.user.userId
    });

    console.log('Saving post:', newPost);

    await newPost.save();
    const populatedPost = await Post.findById(newPost._id)
      .populate('author', 'username _id');

    console.log('Post saved:', populatedPost);

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
});

// Update post
router.put('/:postId', auth, upload.array('images', 5), async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updates = {
      title: req.body.title,
      content: req.body.content,
      price: req.body.price,
      phoneNumber: req.body.phoneNumber
    };

    if (req.files?.length) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      updates.images = [...(post.images || []), ...newImages];
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      updates,
      { new: true }
    ).populate('author', 'username _id');

    res.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Error updating post', error: error.message });
  }
});

// Delete post
router.delete('/:postId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Post.findByIdAndDelete(req.params.postId);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
});

module.exports = router; 