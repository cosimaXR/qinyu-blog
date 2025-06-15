// PERFORMANCE OPTIMIZED API service for blog data
import { translationService } from './translationService.js';

// Determine the correct backend URL
const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';
const API_BASE_URL = isDevelopment 
  ? 'http://localhost:5000' 
  : (import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:5000');

console.log('=== Frontend API Configuration ===');
console.log('Environment:', isDevelopment ? 'Development' : 'Production');
console.log('API_BASE_URL being used:', API_BASE_URL);
console.log('Environment variable:', import.meta.env.VITE_APP_BACKEND_URL);
console.log('Dev mode:', import.meta.env.DEV);
console.log('====================================');

// In-memory cache for faster repeated requests
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCacheKey(endpoint, params = {}) {
  return `${endpoint}_${JSON.stringify(params)}`;
}

function setCache(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}

function getCache(key) {
  const cached = cache.get(key);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

export const blogAPI = {
  // PERFORMANCE OPTIMIZED: Get posts metadata first (super fast for homepage)
  async getPostsMetadata(language = 'en', bustCache = false) {
    const cacheKey = getCacheKey('posts_metadata', { language });
    
    if (!bustCache) {
      const cached = getCache(cacheKey);
      if (cached) {
        console.log('⚡ Returning cached posts metadata');
        return cached;
      }
    }

    try {
      console.log('🔄 Fetching posts metadata...');
      const startTime = Date.now();
      
      const cacheBuster = bustCache ? `?t=${Date.now()}` : '';
      const response = await fetch(`${API_BASE_URL}/api/blog/posts/metadata${cacheBuster}`);
      const data = await response.json();
      
      if (data.success) {
        const loadTime = Date.now() - startTime;
        console.log(`⚡ Metadata loaded in ${loadTime}ms`);
        
        const result = {
          posts: data.posts,
          featured: data.featured,
          regular: data.regular,
          contentLoaded: false
        };

        // Auto-translate if needed
        if (language === 'zh') {
          result.featured = translationService.translatePosts(result.featured, 'zh');
          result.regular = translationService.translatePosts(result.regular, 'zh');
          result.posts = translationService.translatePosts(result.posts, 'zh');
        }

        setCache(cacheKey, result);
        return result;
      } else {
        throw new Error(data.message || 'Failed to fetch posts metadata');
      }
    } catch (error) {
      console.error('Error fetching posts metadata:', error);
      // Return fallback data if API fails
      return this.getFallbackData(language);
    }
  },

  // PERFORMANCE OPTIMIZED: Get all blog posts with content (when needed)
  async getAllPosts(language = 'en', bustCache = false) {
    const cacheKey = getCacheKey('posts_full', { language });
    
    if (!bustCache) {
      const cached = getCache(cacheKey);
      if (cached) {
        console.log('📄 Returning cached full posts');
        return cached;
      }
    }

    try {
      console.log('🔄 Fetching posts with content...');
      const startTime = Date.now();
      
      // Add cache-busting parameter and request full content
      const cacheBuster = bustCache ? `?content=true&t=${Date.now()}` : '?content=true';
      const response = await fetch(`${API_BASE_URL}/api/blog/posts${cacheBuster}`);
      const data = await response.json();
      
      if (data.success) {
        const loadTime = Date.now() - startTime;
        console.log(`📄 Full posts loaded in ${loadTime}ms`);
        
        const result = {
          posts: data.posts,
          featured: data.featured,
          regular: data.regular,
          contentLoaded: true
        };

        // Auto-translate if needed
        if (language === 'zh') {
          result.featured = translationService.translatePosts(result.featured, 'zh');
          result.regular = translationService.translatePosts(result.regular, 'zh');
          result.posts = translationService.translatePosts(result.posts, 'zh');
        }

        setCache(cacheKey, result);
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

  // PERFORMANCE OPTIMIZED: Get a specific blog post by ID with caching
  async getPostById(postId, language = 'en', bustCache = false) {
    const cacheKey = getCacheKey('post', { postId, language });
    
    if (!bustCache) {
      const cached = getCache(cacheKey);
      if (cached) {
        console.log(`📄 Returning cached post: ${postId}`);
        return cached;
      }
    }

    try {
      console.log(`🔄 Fetching post: ${postId}`);
      const startTime = Date.now();
      
      // Add cache-busting parameter
      const cacheBuster = bustCache ? `?t=${Date.now()}` : '';
      const response = await fetch(`${API_BASE_URL}/api/blog/posts/${postId}${cacheBuster}`);
      const data = await response.json();
      
      if (data.success) {
        const loadTime = Date.now() - startTime;
        console.log(`📄 Post loaded in ${loadTime}ms`);
        
        let post = data.post;
        
        // Auto-translate if needed
        if (language === 'zh') {
          post = translationService.translatePost(post, 'zh');
        }
        
        setCache(cacheKey, post);
        return post;
      } else {
        throw new Error(data.message || 'Post not found');
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
      return null;
    }
  },

  // Get posts by category (uses metadata for speed)
  async getPostsByCategory(category, language = 'en') {
    try {
      const response = await fetch(`${API_BASE_URL}/api/blog/posts/category/${category}`);
      const data = await response.json();
      
      if (data.success) {
        let posts = data.posts;
        
        // Auto-translate if needed
        if (language === 'zh') {
          posts = translationService.translatePosts(posts, 'zh');
        }
        
        return posts;
      } else {
        throw new Error(data.message || 'Failed to fetch posts by category');
      }
    } catch (error) {
      console.error('Error fetching posts by category:', error);
      return [];
    }
  },

  // Get available categories with caching
  async getCategories() {
    const cacheKey = 'categories';
    const cached = getCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/blog/categories`);
      const data = await response.json();
      
      if (data.success) {
        setCache(cacheKey, data.categories);
        return data.categories;
      } else {
        throw new Error(data.message || 'Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      return this.getFallbackCategories();
    }
  },

  // NEW: Get cache statistics from backend
  async getCacheStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/blog/cache/stats`);
      const data = await response.json();
      return data.success ? data.cache : null;
    } catch (error) {
      console.error('Error fetching cache stats:', error);
      return null;
    }
  },

  // NEW: Clear backend cache
  async clearBackendCache() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/blog/cache/clear`, {
        method: 'POST'
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error clearing backend cache:', error);
      return false;
    }
  },

  // Clear frontend cache
  clearCache() {
    cache.clear();
    console.log('🧹 Frontend cache cleared');
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
          featured: true,
          contentLoaded: false
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
          featured: true,
          contentLoaded: false
        }
      ],
      regular: [],
      contentLoaded: false
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

  // PERFORMANCE OPTIMIZED: Force refresh with metadata first, then content
  async refreshPosts(language = 'en') {
    // Clear caches first
    this.clearCache();
    
    // Get metadata first for immediate display
    const metadataResult = await this.getPostsMetadata(language, true);
    
    // Then get full content in background
    setTimeout(() => {
      this.getAllPosts(language, true);
    }, 100);
    
    return metadataResult;
  },

  // Force refresh a specific post (cache-busting)
  async refreshPost(postId, language = 'en') {
    return this.getPostById(postId, language, true);
  }
};

