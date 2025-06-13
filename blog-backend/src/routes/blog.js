import express from 'express';
import { notionService } from '../services/notionService.js';

const router = express.Router();

// Fallback mock data
const mockPosts = [
  {
    id: 'future-technology-human-connection',
    title: 'The Future of Technology and Human Connection',
    excerpt: 'Exploring how emerging technologies are reshaping the way we interact...',
    category: 'experience',
    date: '2024-03-15',
    featured: true
  },
  {
    id: 'minimalist-design-principles',
    title: 'Minimalist Design Principles for Modern Web',
    excerpt: 'Understanding the power of simplicity in creating effective user experiences...',
    category: 'expression',
    date: '2024-03-12',
    featured: false
  }
];

const mockCategories = ['experience', 'expression', 'experiment'];

// Get all blog posts
router.get('/posts', async (req, res) => {
  try {
    // Try Notion first, fallback to mock data
    let posts, featured, regular;
    
    try {
      posts = await notionService.getAllPosts();
      featured = posts.filter(post => post.featured);
      regular = posts.filter(post => !post.featured);
    } catch (notionError) {
      console.log('Notion API failed, using mock data:', notionError.message);
      posts = mockPosts;
      featured = mockPosts.filter(post => post.featured);
      regular = mockPosts.filter(post => !post.featured);
    }
    
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

// Get categories
router.get('/categories', async (req, res) => {
  try {
    let categories;
    
    try {
      categories = await notionService.getCategories();
    } catch (notionError) {
      console.log('Notion API failed, using mock categories:', notionError.message);
      categories = mockCategories;
    }
    
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

// Get a specific post by ID
router.get('/posts/:id', async (req, res) => {
  try {
    let post;
    
    try {
      post = await notionService.getPostById(req.params.id);
    } catch (notionError) {
      console.log('Notion API failed, using mock post:', notionError.message);
      post = mockPosts.find(p => p.id === req.params.id);
    }
    
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
    let posts;
    
    try {
      posts = await notionService.getPostsByCategory(req.params.category);
    } catch (notionError) {
      console.log('Notion API failed, using mock posts:', notionError.message);
      posts = mockPosts.filter(post => post.category === req.params.category);
    }
    
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

export { router as blogRoutes };