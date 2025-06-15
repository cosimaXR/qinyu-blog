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

// Initialize caches with different TTLs
const listCache = new NodeCache({ stdTTL: 1800 }); // 30 minutes for post lists
const contentCache = new NodeCache({ stdTTL: 3600 }); // 1 hour for full content
const metaCache = new NodeCache({ stdTTL: 7200 }); // 2 hours for metadata only

export const notionService = {
  // PERFORMANCE OPTIMIZED: Get posts metadata only (fast loading for homepage)
  async getPostsMetadata() {
    const cacheKey = 'posts_metadata';
    const cachedMeta = listCache.get(cacheKey);
    
    if (cachedMeta) {
      console.log('📋 Returning cached post metadata');
      return cachedMeta;
    }

    try {
      console.log('⚡ Fetching post metadata from Notion...');
      const startTime = Date.now();
      
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

      // Process metadata only (no content fetching)
      const posts = response.results.map((page) => {
        const properties = page.properties;
        
        return {
          id: page.id,
          title: {
            en: properties.Title?.title[0]?.plain_text || '',
            zh: properties['Title (Chinese)']?.rich_text[0]?.plain_text || properties.Title?.title[0]?.plain_text || ''
          },
          excerpt: {
            en: properties.Excerpt?.rich_text[0]?.plain_text || '',
            zh: properties['Excerpt (Chinese)']?.rich_text[0]?.plain_text || properties.Excerpt?.rich_text[0]?.plain_text || ''
          },
          category: properties.Category?.select?.name || 'uncategorized',
          date: properties.Date?.date?.start || new Date().toISOString().split('T')[0],
          readTime: properties['Read Time']?.number || 5,
          featured: properties.Featured?.checkbox || false,
          meta: {
            en: `${new Date(properties.Date?.date?.start || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} — ${properties['Read Time']?.number || 5} min read`,
            zh: `${new Date(properties.Date?.date?.start || Date.now()).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })} — ${properties['Read Time']?.number || 5}分钟阅读`
          },
          // Add flag to indicate content needs to be loaded separately
          contentLoaded: false
        };
      });

      const loadTime = Date.now() - startTime;
      console.log(`⚡ Fetched ${posts.length} posts metadata in ${loadTime}ms`);

      // Cache the metadata
      listCache.set(cacheKey, posts);
      
      return posts;
    } catch (error) {
      console.error('❌ Error fetching posts metadata from Notion:', error);
      throw error;
    }
  },

  // PERFORMANCE OPTIMIZED: Get all posts with content (for full data when needed)
  async getAllPosts() {
    const cacheKey = 'all_posts_with_content';
    const cachedPosts = contentCache.get(cacheKey);
    
    if (cachedPosts) {
      console.log('📄 Returning cached posts with content');
      return cachedPosts;
    }

    try {
      // First get metadata quickly
      const postsMetadata = await this.getPostsMetadata();
      console.log('🔄 Processing content for posts...');
      
      const startTime = Date.now();
      
      // Process content concurrently with controlled concurrency (max 5 at once)
      const BATCH_SIZE = 5;
      const posts = [];
      
      for (let i = 0; i < postsMetadata.length; i += BATCH_SIZE) {
        const batch = postsMetadata.slice(i, i + BATCH_SIZE);
        
        const batchResults = await Promise.allSettled(
          batch.map(async (postMeta) => {
            try {
              const mdblocks = await n2m.pageToMarkdown(postMeta.id);
              const markdown = n2m.toMarkdownString(mdblocks);
              
              return {
                ...postMeta,
                content: {
                  en: markdown.parent || markdown,
                  zh: postMeta.content?.zh || markdown.parent || markdown
                },
                contentLoaded: true
              };
            } catch (error) {
              console.error(`⚠️ Error processing content for post ${postMeta.id}:`, error);
              // Return metadata with error content
              return {
                ...postMeta,
                content: {
                  en: 'Content could not be loaded',
                  zh: '内容无法加载'
                },
                contentLoaded: false
              };
            }
          })
        );
        
        // Add successful results
        batchResults.forEach(result => {
          if (result.status === 'fulfilled') {
            posts.push(result.value);
          }
        });
        
        console.log(`📦 Processed batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(postsMetadata.length / BATCH_SIZE)}`);
      }

      const loadTime = Date.now() - startTime;
      console.log(`🚀 Processed ${posts.length} posts with content in ${loadTime}ms`);

      // Cache the full posts
      contentCache.set(cacheKey, posts);
      
      return posts;
    } catch (error) {
      console.error('❌ Error fetching posts with content from Notion:', error);
      throw error;
    }
  },

  // PERFORMANCE OPTIMIZED: Get single post with content caching
  async getPostById(postId) {
    const cacheKey = `post_content_${postId}`;
    const cachedPost = contentCache.get(cacheKey);
    
    if (cachedPost) {
      console.log(`📄 Returning cached post: ${postId}`);
      return cachedPost;
    }

    try {
      console.log(`⚡ Fetching post ${postId} from Notion...`);
      const startTime = Date.now();
      
      // Fetch page metadata and content concurrently
      const [page, mdblocks] = await Promise.all([
        notion.pages.retrieve({ page_id: postId }),
        n2m.pageToMarkdown(postId)
      ]);
      
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
          zh: `${new Date(properties.Date?.date?.start || Date.now()).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })} — ${properties['Read Time']?.number || 5}분钟阅读`
        },
        contentLoaded: true
      };

      const loadTime = Date.now() - startTime;
      console.log(`⚡ Fetched post in ${loadTime}ms: ${post.title.en}`);

      // Cache the result with longer TTL for individual posts
      contentCache.set(cacheKey, post, 7200); // 2 hours for individual posts
      
      return post;
    } catch (error) {
      console.error(`❌ Error fetching post ${postId} from Notion:`, error);
      throw error;
    }
  },

  // PERFORMANCE OPTIMIZED: Get posts by category using metadata
  async getPostsByCategory(category) {
    const allPostsMeta = await this.getPostsMetadata();
    return allPostsMeta.filter(post => post.category.toLowerCase() === category.toLowerCase());
  },

  // PERFORMANCE OPTIMIZED: Get categories from cached metadata
  async getCategories() {
    const cacheKey = 'categories';
    const cachedCategories = metaCache.get(cacheKey);
    
    if (cachedCategories) {
      return cachedCategories;
    }

    const allPostsMeta = await this.getPostsMetadata();
    const categories = [...new Set(allPostsMeta.map(post => post.category))];
    
    const result = categories.reduce((acc, category) => {
      acc[category.toLowerCase()] = {
        en: category.charAt(0).toUpperCase() + category.slice(1),
        zh: this.getCategoryChineseName(category)
      };
      return acc;
    }, {});

    metaCache.set(cacheKey, result);
    return result;
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

  // PERFORMANCE OPTIMIZED: Clear all caches
  clearCache() {
    listCache.flushAll();
    contentCache.flushAll();
    metaCache.flushAll();
    console.log('🧹 All caches cleared');
  },

  // NEW: Get cache statistics
  getCacheStats() {
    return {
      listCache: {
        keys: listCache.keys().length,
        stats: listCache.getStats()
      },
      contentCache: {
        keys: contentCache.keys().length,
        stats: contentCache.getStats()
      },
      metaCache: {
        keys: metaCache.keys().length,
        stats: metaCache.getStats()
      }
    };
  }
};