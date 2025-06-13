import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import NodeCache from 'node-cache';
import dotenv from 'dotenv';

// Load environment variables for this module
dotenv.config();

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// Initialize Notion to Markdown converter
const n2m = new NotionToMarkdown({ notionClient: notion });

// Initialize cache
const cache = new NodeCache({ stdTTL: process.env.CACHE_TTL || 3600 });

export const notionService = {
  // Get all published blog posts
  async getAllPosts() {
    const cacheKey = 'all_posts';
    const cachedPosts = cache.get(cacheKey);
    
    if (cachedPosts) {
      return cachedPosts;
    }

    try {
      const response = await notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID,
        page_size: 100,
        filter: {
          property: 'Published',
          checkbox: {
            equals: true
          }
        },
        sorts: [
          {
            property: 'Date',
            direction: 'descending'
          }
        ]
      });

      const posts = await Promise.all(
        response.results.map(async (page) => {
          const mdblocks = await n2m.pageToMarkdown(page.id);
          const markdown = n2m.toMarkdownString(mdblocks);
          
          // Extract properties from the page
          const properties = page.properties;
          
          return {
            id: page.id,
            title: {
              en: properties.Title?.title[0]?.plain_text || '',
              zh: properties['Title (Chinese)']?.rich_text[0]?.plain_text || ''
            },
            excerpt: {
              en: properties.Excerpt?.rich_text[0]?.plain_text || '',
              zh: properties['Excerpt (Chinese)']?.rich_text[0]?.plain_text || ''
            },
            content: {
              en: markdown.parent,
              zh: properties['Content (Chinese)']?.rich_text[0]?.plain_text || ''
            },
            category: properties.Category?.select?.name || 'uncategorized',
            date: properties.Date?.date?.start || '',
            readTime: properties['Read Time']?.number || 5,
            featured: properties.Featured?.checkbox || false,
            meta: {
              en: `${new Date(properties.Date?.date?.start).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} — ${properties['Read Time']?.number || 5} min read`,
              zh: `${new Date(properties.Date?.date?.start).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })} — ${properties['Read Time']?.number || 5}分钟阅读`
            }
          };
        })
      );

      // Cache the results
      cache.set(cacheKey, posts);
      
      return posts;
    } catch (error) {
      console.error('Error fetching posts from Notion:', error);
      throw error;
    }
  },

  // Get a single post by ID
  async getPostById(postId) {
    const cacheKey = `post_${postId}`;
    const cachedPost = cache.get(cacheKey);
    
    if (cachedPost) {
      return cachedPost;
    }

    try {
      const page = await notion.pages.retrieve({ page_id: postId });
      const mdblocks = await n2m.pageToMarkdown(page.id);
      const markdown = n2m.toMarkdownString(mdblocks);
      
      const properties = page.properties;
      
      const post = {
        id: page.id,
        title: {
          en: properties.Title?.title[0]?.plain_text || '',
          zh: properties['Title (Chinese)']?.rich_text[0]?.plain_text || ''
        },
        excerpt: {
          en: properties.Excerpt?.rich_text[0]?.plain_text || '',
          zh: properties['Excerpt (Chinese)']?.rich_text[0]?.plain_text || ''
        },
        content: {
          en: markdown.parent,
          zh: properties['Content (Chinese)']?.rich_text[0]?.plain_text || ''
        },
        category: properties.Category?.select?.name || 'uncategorized',
        date: properties.Date?.date?.start || '',
        readTime: properties['Read Time']?.number || 5,
        featured: properties.Featured?.checkbox || false,
        meta: {
          en: `${new Date(properties.Date?.date?.start).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} — ${properties['Read Time']?.number || 5} min read`,
          zh: `${new Date(properties.Date?.date?.start).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })} — ${properties['Read Time']?.number || 5}分钟阅读`
        }
      };

      // Cache the result
      cache.set(cacheKey, post);
      
      return post;
    } catch (error) {
      console.error('Error fetching post from Notion:', error);
      throw error;
    }
  },

  // Get posts by category
  async getPostsByCategory(category) {
    const allPosts = await this.getAllPosts();
    return allPosts.filter(post => post.category.toLowerCase() === category.toLowerCase());
  },

  // Get all categories
  async getCategories() {
    const allPosts = await this.getAllPosts();
    const categories = [...new Set(allPosts.map(post => post.category))];
    
    return categories.reduce((acc, category) => {
      acc[category.toLowerCase()] = {
        en: category.charAt(0).toUpperCase() + category.slice(1),
        zh: this.getCategoryChineseName(category)
      };
      return acc;
    }, {});
  },

  // Helper function to get Chinese category names
  getCategoryChineseName(category) {
    const categoryMap = {
      'expression': '表达',
      'experiment': '实验',
      'experience': '体验'
    };
    return categoryMap[category.toLowerCase()] || category;
  },

  // Clear cache
  clearCache() {
    cache.flushAll();
  }
};