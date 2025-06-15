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

// Initialize Notion to Markdown converter with custom image handling
const n2m = new NotionToMarkdown({ 
  notionClient: notion,
  config: {
    parseChildPages: false, // Don't parse child pages to avoid recursion
    convertImagesToBase64: false, // Keep image URLs as-is
  }
});

// Custom image transformer to handle Notion images properly
n2m.setCustomTransformer('image', async (block) => {
  const { image } = block;
  let imageUrl = '';
  let alt = 'Image';
  
  if (image.type === 'external') {
    imageUrl = image.external.url;
  } else if (image.type === 'file') {
    imageUrl = image.file.url;
  }
  
  // Get caption if available
  if (image.caption && image.caption.length > 0) {
    alt = image.caption.map(c => c.plain_text).join('');
  }
  
  return `![${alt}](${imageUrl})`;
});

// Initialize cache
const cache = new NodeCache({ stdTTL: process.env.CACHE_TTL || 3600 });

export const notionService = {
  // Get all published blog posts
  async getAllPosts() {
    const cacheKey = 'all_posts';
    const cachedPosts = cache.get(cacheKey);
    
    if (cachedPosts) {
      console.log('Returning cached posts');
      return cachedPosts;
    }

    try {
      console.log('Fetching posts from Notion...');
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

      console.log(`Found ${response.results.length} published posts`);

      const posts = await Promise.all(
        response.results.map(async (page) => {
          try {
            console.log(`Processing post: ${page.id}`);
            const mdblocks = await n2m.pageToMarkdown(page.id);
            const markdown = n2m.toMarkdownString(mdblocks);
            
            // Extract properties from the page
            const properties = page.properties;
            
            const post = {
              id: page.id,
              title: {
                en: properties.Title?.title[0]?.plain_text || '',
                zh: properties['Title (Chinese)']?.rich_text[0]?.plain_text || properties.Title?.title[0]?.plain_text || ''
              },
              excerpt: {
                en: properties.Excerpt?.rich_text[0]?.plain_text || '',
                zh: properties['Excerpt (Chinese)']?.rich_text[0]?.plain_text || properties.Excerpt?.rich_text[0]?.plain_text || ''
              },
              content: {
                en: markdown.parent || markdown,
                zh: properties['Content (Chinese)']?.rich_text[0]?.plain_text || markdown.parent || markdown
              },
              category: properties.Category?.select?.name || 'uncategorized',
              date: properties.Date?.date?.start || new Date().toISOString().split('T')[0],
              readTime: properties['Read Time']?.number || 5,
              featured: properties.Featured?.checkbox || false,
              meta: {
                en: `${new Date(properties.Date?.date?.start || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} — ${properties['Read Time']?.number || 5} min read`,
                zh: `${new Date(properties.Date?.date?.start || Date.now()).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })} — ${properties['Read Time']?.number || 5}分钟阅读`
              }
            };
            
            console.log(`Successfully processed post: ${post.title.en}`);
            return post;
          } catch (error) {
            console.error(`Error processing post ${page.id}:`, error);
            // Return a basic post structure if processing fails
            return {
              id: page.id,
              title: { en: 'Error loading post', zh: '加载文章出错' },
              excerpt: { en: 'This post could not be loaded', zh: '无法加载此文章' },
              content: { en: 'Content unavailable', zh: '内容不可用' },
              category: 'uncategorized',
              date: new Date().toISOString().split('T')[0],
              readTime: 1,
              featured: false,
              meta: { en: 'Error', zh: '错误' }
            };
          }
        })
      );

      console.log(`Successfully processed ${posts.length} posts`);

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
      console.log(`Fetching post ${postId} from Notion...`);
      const page = await notion.pages.retrieve({ page_id: postId });
      const mdblocks = await n2m.pageToMarkdown(page.id);
      const markdown = n2m.toMarkdownString(mdblocks);
      
      const properties = page.properties;
      
      const post = {
        id: page.id,
        title: {
          en: properties.Title?.title[0]?.plain_text || '',
          zh: properties['Title (Chinese)']?.rich_text[0]?.plain_text || properties.Title?.title[0]?.plain_text || ''
        },
        excerpt: {
          en: properties.Excerpt?.rich_text[0]?.plain_text || '',
          zh: properties['Excerpt (Chinese)']?.rich_text[0]?.plain_text || properties.Excerpt?.rich_text[0]?.plain_text || ''
        },
        content: {
          en: markdown.parent || markdown,
          zh: properties['Content (Chinese)']?.rich_text[0]?.plain_text || markdown.parent || markdown
        },
        category: properties.Category?.select?.name || 'uncategorized',
        date: properties.Date?.date?.start || new Date().toISOString().split('T')[0],
        readTime: properties['Read Time']?.number || 5,
        featured: properties.Featured?.checkbox || false,
        meta: {
          en: `${new Date(properties.Date?.date?.start || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} — ${properties['Read Time']?.number || 5} min read`,
          zh: `${new Date(properties.Date?.date?.start || Date.now()).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })} — ${properties['Read Time']?.number || 5}分钟阅读`
        }
      };

      // Cache the result
      cache.set(cacheKey, post);
      
      console.log(`Successfully fetched post: ${post.title.en}`);
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
    console.log('Cache cleared');
  }
};