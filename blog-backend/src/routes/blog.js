import express from 'express';
import { notionService } from '../services/notionService.js';

const router = express.Router();

// Get all blog posts
router.get('/posts', async (req, res) => {
  try {
    const posts = await notionService.getAllPosts();
    const featured = posts.filter(post => post.featured);
    const regular = posts.filter(post => !post.featured);
    
    res.json({
      success: true,
      posts,
      featured,
      regular
    });
  } catch (error) {
    console.error('Error in /posts route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts'
    });
  }
});

// Get a specific post by ID
router.get('/posts/:id', async (req, res) => {
  try {
    const post = await notionService.getPostById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    res.json({
      success: true,
      post
    });
  } catch (error) {
    console.error('Error in /posts/:id route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch post'
    });
  }
});

// Get posts by category
router.get('/posts/category/:category', async (req, res) => {
  try {
    const posts = await notionService.getPostsByCategory(req.params.category);
    
    res.json({
      success: true,
      posts
    });
  } catch (error) {
    console.error('Error in /posts/category/:category route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts by category'
    });
  }
});

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await notionService.getCategories();
    
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error in /categories route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
});

// Clear cache (admin endpoint)
router.post('/clear-cache', async (req, res) => {
  try {
    notionService.clearCache();
    res.json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    console.error('Error in /clear-cache route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache'
    });
  }
});

export const blogRoutes = router; 