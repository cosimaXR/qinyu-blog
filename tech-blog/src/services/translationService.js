// Translation service for auto-translating content
class TranslationService {
  constructor() {
    this.cache = new Map()
  }

  // Simple translation mapping for common terms
  translateText(text, targetLang) {
    if (!text || targetLang === 'en') return text
    
    // Check cache first
    const cacheKey = `${text}_${targetLang}`
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    let translated = text

    if (targetLang === 'zh') {
      // Basic translation mappings for common blog terms
      const translations = {
        // Time and dates
        'min read': '分钟阅读',
        'minute read': '分钟阅读',
        'minutes read': '分钟阅读',
        'Read Article': '阅读文章',
        'Back to Home': '返回首页',
        'Published on': '发布于',
        'Loading...': '加载中...',
        'Loading blog posts...': '正在加载博客文章...',
        
        // Categories
        'Expression': '表达',
        'Experiment': '实验', 
        'Experience': '体验',
        
        // Common phrases
        'Design Principles Every Developer Should Know': '每个开发者都应该知道的设计原则',
        'HCI Design Trends in the Age of Generative AI': '生成式AI时代的HCI设计趋势',
        'Building Scalable Systems': '构建可扩展系统',
        'Product Management in Tech': '科技产品管理',
        
        // Article content keywords
        'technology': '技术',
        'design': '设计',
        'development': '开发',
        'innovation': '创新',
        'artificial intelligence': '人工智能',
        'user experience': '用户体验',
        'product management': '产品管理',
        'engineering': '工程',
        'creativity': '创意',
        'digital': '数字化',
        'interface': '界面',
        'interaction': '交互',
        'system': '系统',
        'platform': '平台',
        'solution': '解决方案',
        'strategy': '策略',
        'process': '流程',
        'framework': '框架',
        'methodology': '方法论',
        'best practices': '最佳实践'
      }

      // Apply translations
      for (const [english, chinese] of Object.entries(translations)) {
        translated = translated.replace(new RegExp(english, 'gi'), chinese)
      }
    }

    // Cache the result
    this.cache.set(cacheKey, translated)
    return translated
  }

  // Translate blog post content
  translatePost(post, targetLang) {
    if (!post || targetLang === 'en') return post

    const translatedPost = { ...post }

    // If the post already has the target language, return it
    if (post.title && post.title[targetLang]) {
      return translatedPost
    }

    // Auto-translate if target language content doesn't exist
    if (targetLang === 'zh' && post.title && post.title.en) {
      translatedPost.title = {
        ...post.title,
        zh: this.translateText(post.title.en, 'zh')
      }
    }

    if (targetLang === 'zh' && post.excerpt && post.excerpt.en) {
      translatedPost.excerpt = {
        ...post.excerpt,
        zh: this.translateText(post.excerpt.en, 'zh')
      }
    }

    if (targetLang === 'zh' && post.content && post.content.en) {
      translatedPost.content = {
        ...post.content,
        zh: this.translateText(post.content.en, 'zh')
      }
    }

    if (targetLang === 'zh' && post.meta && post.meta.en) {
      translatedPost.meta = {
        ...post.meta,
        zh: this.translateText(post.meta.en, 'zh')
      }
    }

    return translatedPost
  }

  // Translate array of posts
  translatePosts(posts, targetLang) {
    if (!posts || targetLang === 'en') return posts
    
    return posts.map(post => this.translatePost(post, targetLang))
  }
}

export const translationService = new TranslationService()

