// API service for blog data
import { translationService } from './translationService.js';

const API_BASE_URL = import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:5000';
// Add this line after the API_BASE_URL definition (around line 5)
console.log('API_BASE_URL being used:', API_BASE_URL);
console.log('Environment variable:', import.meta.env.VITE_APP_BACKEND_URL);
console.log('All env vars:', import.meta.env);


export const blogAPI = {
  // Get all blog posts with auto-translation and cache-busting
  async getAllPosts(language = 'en', bustCache = false) {
    try {
      // Add cache-busting parameter
      const cacheBuster = bustCache ? `?t=${Date.now()}` : '';
      const response = await fetch(`${API_BASE_URL}/api/blog/posts${cacheBuster}`);
      const data = await response.json();
      
      if (data.success) {
        const result = {
          posts: data.posts,
          featured: data.featured,
          regular: data.regular
        };

        // Auto-translate if needed
        if (language === 'zh') {
          result.featured = translationService.translatePosts(result.featured, 'zh');
          result.regular = translationService.translatePosts(result.regular, 'zh');
          result.posts = translationService.translatePosts(result.posts, 'zh');
        }

        return result;
      } else {
        throw new Error(data.message || 'Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      // Return fallback data if API fails
      return this.getFallbackData(language);
    }
  },

  // Get a specific blog post by ID with auto-translation and cache-busting
  async getPostById(postId, language = 'en', bustCache = false) {
    try {
      // Add cache-busting parameter
      const cacheBuster = bustCache ? `?t=${Date.now()}` : '';
      const response = await fetch(`${API_BASE_URL}/api/blog/posts/${postId}${cacheBuster}`);
      const data = await response.json();
      
      if (data.success) {
        let post = data.post;
        
        // Auto-translate if needed
        if (language === 'zh') {
          post = translationService.translatePost(post, 'zh');
        }
        
        return post;
      } else {
        throw new Error(data.message || 'Post not found');
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
      return null;
    }
  },

  // Get posts by category
  async getPostsByCategory(category) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/blog/posts/category/${category}`);
      const data = await response.json();
      
      if (data.success) {
        return data.posts;
      } else {
        throw new Error(data.message || 'Failed to fetch posts by category');
      }
    } catch (error) {
      console.error('Error fetching posts by category:', error);
      return [];
    }
  },

  // Get available categories
  async getCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/blog/categories`);
      const data = await response.json();
      
      if (data.success) {
        return data.categories;
      } else {
        throw new Error(data.message || 'Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      return this.getFallbackCategories();
    }
  },

  // Fallback data when API is unavailable
  getFallbackData(language = 'en') {
    const fallbackData = {
      posts: [
        {
          id: 'future-technology-human-connection',
          category: 'experience',
          title: {
            en: 'The Future of Technology and Human Connection',
            zh: '技术与人类连接的未来'
          },
          excerpt: {
            en: 'Exploring how emerging technologies are reshaping the way we interact, communicate, and build meaningful relationships in the digital age.',
            zh: '探索新兴技术如何重塑我们在数字时代互动、交流和建立有意义关系的方式。'
          },
          content: {
            en: 'This is fallback content. The blog API is currently unavailable.',
            zh: '这是后备内容。博客API目前不可用。'
          },
          meta: {
            en: 'March 15 — 8 min read',
            zh: '3月15日 — 8分钟阅读'
          },
          date: '2024-03-15',
          readTime: 8,
          featured: true
        }
      ],
      featured: [
        {
          id: 'future-technology-human-connection',
          category: 'experience',
          title: {
            en: 'The Future of Technology and Human Connection',
            zh: '技术与人类连接的未来'
          },
          excerpt: {
            en: 'Exploring how emerging technologies are reshaping the way we interact, communicate, and build meaningful relationships in the digital age.',
            zh: '探索新兴技术如何重塑我们在数字时代互动、交流和建立有意义关系的方式。'
          },
          content: {
            en: 'This is fallback content. The blog API is currently unavailable.',
            zh: '这是后备内容。博客API目前不可用。'
          },
          meta: {
            en: 'March 15 — 8 min read',
            zh: '3月15日 — 8分钟阅读'
          },
          date: '2024-03-15',
          readTime: 8,
          featured: true
        }
      ],
      regular: []
    };

    // Auto-translate if needed
    if (language === 'zh') {
      fallbackData.featured = translationService.translatePosts(fallbackData.featured, 'zh');
      fallbackData.regular = translationService.translatePosts(fallbackData.regular, 'zh');
      fallbackData.posts = translationService.translatePosts(fallbackData.posts, 'zh');
    }

    return fallbackData;
  },

  getFallbackCategories() {
    return {
      expression: {
        en: 'Expression',
        zh: '表达'
      },
      experiment: {
        en: 'Experiment', 
        zh: '实验'
      },
      experience: {
        en: 'Experience',
        zh: '体验'
      }
    };
  },

  // Force refresh all posts (cache-busting)
  async refreshPosts(language = 'en') {
    return this.getAllPosts(language, true);
  },

  // Force refresh a specific post (cache-busting)
  async refreshPost(postId, language = 'en') {
    return this.getPostById(postId, language, true);
  }
};

