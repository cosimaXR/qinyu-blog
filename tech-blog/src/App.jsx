import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useParams, Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Mail, Github, Twitter, Linkedin, ArrowLeft, Calendar, Clock } from 'lucide-react'
import { blogAPI } from './services/blogAPI.js'
import CategoryPage from './components/CategoryPage.jsx'
import NewsletterPage from './components/NewsletterPage.jsx'
import './App.css'

// Enhanced markdown to HTML converter
function parseMarkdown(markdown) {
  if (!markdown) return '';
  
  let html = markdown;
  
  // Handle images with proper rendering
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="markdown-image" style="max-width: 100%; height: auto; margin: 20px 0; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />');
  
  // Handle headings
  html = html.replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-5 mb-2 text-[#2c2c2c]">$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-6 mb-3 text-[#2c2c2c]">$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-8 mb-4 text-[#2c2c2c]">$1</h1>');
  
  // Handle bold and italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Handle inline code
  html = html.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono border">$1</code>');
  
  // Handle code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-4 rounded-lg border-2 border-gray-300 font-mono text-sm my-4 overflow-x-auto"><code>$1</code></pre>');
  
  // Handle blockquotes
  html = html.replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-purple-500 pl-4 italic text-gray-700 my-4 bg-purple-50 py-2">$1</blockquote>');
  
  // Handle bullet points
  html = html.replace(/^- (.*$)/gm, '<li class="ml-6 mb-2">$1</li>');
  html = html.replace(/^\* (.*$)/gm, '<li class="ml-6 mb-2">$1</li>');
  
  // Handle numbered lists
  html = html.replace(/^\d+\.\s(.*$)/gm, '<li class="ml-6 mb-2">$1</li>');
  
  // Handle line breaks and paragraphs
  html = html.replace(/\n\n/g, '</p><p class="mb-4 leading-relaxed text-lg text-[#2c2c2c]">');
  html = html.replace(/\n/g, '<br>');
  
  // Wrap in paragraph tags if not already wrapped
  if (!html.startsWith('<')) {
    html = '<p class="mb-4 leading-relaxed text-lg text-[#2c2c2c]">' + html + '</p>';
  }
  
  return html;
}

// Blog Post Page Component
function BlogPost({ language }) {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log(`Fetching post with ID: ${id}`);
        const postData = await blogAPI.getPostById(id, language)
        if (postData) {
          console.log('Post data received:', postData);
          setPost(postData)
        } else {
          setError('Post not found')
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchPost()
    }
  }, [id, language])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5dc] flex items-center justify-center">
        <div className="text-2xl font-bold">Loading post...</div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#f5f5dc] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <Link to="/" className="text-purple-600 hover:underline">← Back to Home</Link>
        </div>
      </div>
    )
  }

  const content = {
    en: {
      backToHome: "Back to Home",
      category: post.category.charAt(0).toUpperCase() + post.category.slice(1),
      readTime: `${post.readTime} min read`
    },
    zh: {
      backToHome: "返回首页",
      category: getCategoryName(post.category, 'zh'),
      readTime: `${post.readTime}分钟阅读`
    }
  }

  const t = content[language]
  
  return (
    <div className="min-h-screen bg-[#f5f5dc]">
      {/* Header */}
      <header className="blog-header p-5 border-b-3 border-[#2c2c2c]">
        <nav className="flex justify-between items-center border-b-3 border-[#2c2c2c]">
          <Link to="/" className="blog-logo">QINYU</Link>
          <Link to="/" className="inline-flex items-center gap-2 nav-item">
            <ArrowLeft size={16} />
            {t.backToHome}
          </Link>
        </nav>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <article className="bg-white border-3 border-[#2c2c2c] rounded-lg overflow-hidden shadow-lg">
          {/* Article Header */}
          <div className="article-header p-8 md:p-12 bg-gradient-to-r from-purple-50 to-blue-50 border-b-3 border-[#2c2c2c]">
            <div className="mb-6">
              <Link 
                to={`/category/${post.category}`}
                className="inline-block bg-[#2c2c2c] text-white px-4 py-2 text-sm font-bold uppercase tracking-wide hover:bg-purple-600 transition-colors"
              >
                {t.category}
              </Link>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight text-[#2c2c2c]">
              {post.title[language]}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                {new Date(post.date).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                {t.readTime}
              </div>
            </div>

            {/* Author Info */}
            <div className="flex items-center gap-4 p-4 bg-white rounded-lg border-2 border-[#2c2c2c]">
              <img 
                src="/qinyu_author_image.png" 
                alt="Qinyu" 
                className="w-12 h-12 rounded-full object-cover border-2 border-[#2c2c2c]"
              />
              <div>
                <div className="font-bold text-[#2c2c2c]">Qinyu</div>
                <div className="text-sm text-gray-600">
                  {language === 'en' 
                    ? 'HCI Designer • Engineer • Product Manager' 
                    : 'HCI设计师 • 工程师 • 产品经理'
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="article-content p-8 md:p-12">
            <div className="prose prose-lg max-w-none markdown-content">
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: parseMarkdown(post.content[language]) 
                }}
                className="markdown-content"
              />
            </div>
          </div>

          {/* Article Footer with Navigation */}
          <div className="article-footer p-8 md:p-12 bg-gray-50 border-t-3 border-[#2c2c2c]">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <Link 
                to={`/category/${post.category}`}
                className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium transition-colors"
              >
                ← {language === 'en' ? 'More in' : '更多'} {t.category}
              </Link>
              
              <div className="flex gap-4">
                <Link 
                  to="/newsletter"
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  {language === 'en' ? 'Subscribe to Newsletter' : '订阅通讯'}
                </Link>
                <Link 
                  to="/"
                  className="bg-[#2c2c2c] text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  {language === 'en' ? 'All Articles' : '所有文章'}
                </Link>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}

// Helper function to get category name
function getCategoryName(category, language) {
  const categories = {
    expression: { en: 'Expression', zh: '表达' },
    experiment: { en: 'Experiment', zh: '实验' },
    experience: { en: 'Experience', zh: '体验' }
  }
  return categories[category]?.[language] || category
}

// Home Page Component
function HomePage({ language, setLanguage }) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [blogData, setBlogData] = useState({ posts: [], featured: [], regular: [] })
  const [categories, setCategories] = useState({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Function to refresh blog data
  const refreshBlogData = async () => {
    try {
      setRefreshing(true)
      const [postsData, categoriesData] = await Promise.all([
        blogAPI.refreshPosts(language),
        blogAPI.getCategories()
      ])
      setBlogData(postsData)
      setCategories(categoriesData)
      setMessage(language === 'en' ? 'Blog refreshed!' : '博客已刷新！')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error refreshing blog data:', error)
      setMessage(language === 'en' ? 'Failed to refresh' : '刷新失败')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        setLoading(true)
        const [postsData, categoriesData] = await Promise.all([
          blogAPI.getAllPosts(language),
          blogAPI.getCategories()
        ])
        setBlogData(postsData)
        setCategories(categoriesData)
      } catch (error) {
        console.error('Error fetching blog data:', error)
        // Fallback data will be used from API service
      } finally {
        setLoading(false)
      }
    }

    fetchBlogData()
  }, [language])

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en')
  }

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      // Create an AbortController for timeout handling
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

      const response = await fetch('https://0vhlizcpp770.manus.space/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          language: language
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setMessage(language === 'en' ? 'Thank you for subscribing!' : '感谢您的订阅！')
        setEmail('')
      } else {
        setMessage(data.message || (language === 'en' ? 'Subscription failed. Please try again.' : '订阅失败，请重试。'))
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      
      if (error.name === 'AbortError') {
        setMessage(language === 'en' ? 'Request timeout. Please try again.' : '请求超时，请重试。')
      } else if (error.message.includes('HTTP error')) {
        setMessage(language === 'en' ? 'Server error. Please try again later.' : '服务器错误，请稍后重试。')
      } else {
        setMessage(language === 'en' ? 'Network error. Please try again.' : '网络错误，请重试。')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const content = {
    en: {
      logo: "QINYU",
      nav: {
        expression: "Expression",
        experiment: "Experiment", 
        experience: "Experience"
      },
      newsletter: "Join Newsletter",
      langToggle: "中文",
      hero: {
        title: "From pixels to code to product vision — I'm Qinyu",
        subtitle: "I've worn many hats in tech. My journey began in HCI design, where I learned to see through users' eyes. Engineering taught me to build what matters. Now, as a product manager in AI/VR/AR, I'm shaping the future of human-computer interaction. Welcome to my digital space where design thinking meets technical execution."
      },
      newsletterBlock: {
        title: "Stay Updated",
        subtitle: "Get the latest insights on technology, creativity, and innovation delivered to your inbox.",
        placeholder: "Enter your email",
        subscribe: "Subscribe"
      },
      readMore: "Read Article",
      loading: "Loading blog posts..."
    },
    zh: {
      logo: "QINYU",
      nav: {
        expression: "表达",
        experiment: "实验",
        experience: "体验"
      },
      newsletter: "订阅通讯",
      langToggle: "EN",
      hero: {
        title: "从像素到代码再到产品愿景 — 我是秦雨",
        subtitle: "我在科技领域扮演过许多角色。我的旅程始于HCI设计，在那里我学会了从用户的角度看问题。工程经验教会了我如何构建重要的东西。现在，作为AI/VR/AR领域的产品经理，我正在塑造人机交互的未来。欢迎来到我的数字空间，这里设计思维与技术执行相遇。"
      },
      newsletterBlock: {
        title: "保持更新",
        subtitle: "获取关于技术、创意和创新的最新见解，直接发送到您的收件箱。",
        placeholder: "输入您的邮箱",
        subscribe: "订阅"
      },
      readMore: "阅读文章",
      loading: "正在加载博客文章..."
    }
  }

  const t = content[language]
  const featuredPost = blogData.featured[0]
  const regularPosts = blogData.regular

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5dc] flex items-center justify-center">
        <div className="text-2xl font-bold">{t.loading}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="blog-header p-5 md:px-10 md:py-5 flex flex-col md:flex-row justify-between items-center gap-5">
        <Link to="/" className="blog-logo">{t.logo}</Link>
        <nav className="flex flex-wrap items-center gap-5 md:gap-10">
          <Link to="/category/expression" className="nav-item">{t.nav.expression}</Link>
          <Link to="/category/experiment" className="nav-item">{t.nav.experiment}</Link>
          <Link to="/category/experience" className="nav-item">{t.nav.experience}</Link>
          <div className="flex items-center gap-4">
            <button className="lang-toggle" onClick={toggleLanguage}>
              {t.langToggle}
            </button>
            <Link to="/newsletter" className="newsletter-btn">
              {t.newsletter}
            </Link>
            <button 
              onClick={refreshBlogData}
              disabled={refreshing}
              className="refresh-btn"
              title={language === 'en' ? 'Refresh blog posts' : '刷新博客文章'}
            >
              {refreshing ? '⟳' : '↻'}
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section p-10 md:p-15">
        <div className="hero-content max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-5">{t.hero.title}</h1>
          <p className="text-lg leading-relaxed opacity-80">{t.hero.subtitle}</p>
        </div>
      </section>

      {/* Blog Section */}
      <section className="blog-section p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Featured Article */}
          {featuredPost && (
            <Link to={`/post/${featuredPost.id}`} className="blog-card large featured md:col-span-2 cursor-pointer">
              <span className="category-tag">{getCategoryName(featuredPost.category, language)}</span>
              <div className="card-content">
                <div className="card-header">
                  <h3>{featuredPost.title[language]}</h3>
                  <p className="card-excerpt">{featuredPost.excerpt[language]}</p>
                </div>
                <div className="card-footer">
                  <div className="card-meta">{featuredPost.meta[language]}</div>
                  <div className="read-more">{t.readMore}</div>
                </div>
              </div>
            </Link>
          )}

          {/* Newsletter Signup */}
          <div className="newsletter-block p-10 text-center relative">
            <h3 className="text-2xl font-bold mb-4 uppercase tracking-wide relative z-10">
              {t.newsletterBlock.title}
            </h3>
            <p className="mb-6 opacity-90 relative z-10">{t.newsletterBlock.subtitle}</p>
            <form className="email-form relative z-10" onSubmit={handleNewsletterSubmit}>
              <Input
                type="email"
                className="email-input"
                placeholder={t.newsletterBlock.placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
              <Button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? (language === 'en' ? 'Subscribing...' : '订阅中...') : t.newsletterBlock.subscribe}
              </Button>
            </form>
            {message && (
              <div className={`mt-4 p-3 rounded relative z-10 ${
                message.includes('Thank you') || message.includes('感谢') 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {message}
              </div>
            )}
          </div>

          {/* Regular Blog Posts */}
          {regularPosts.map((post) => (
            <Link key={post.id} to={`/post/${post.id}`} className="blog-card cursor-pointer">
              <span className="category-tag">{getCategoryName(post.category, language)}</span>
              <div className="card-content">
                <div className="card-header">
                  <h3>{post.title[language]}</h3>
                  <p className="card-excerpt">{post.excerpt[language]}</p>
                </div>
                <div className="card-footer">
                  <div className="card-meta">{post.meta[language]}</div>
                  <div className="read-more">{t.readMore}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="blog-footer p-10 text-center">
        <div className="flex justify-center gap-8 mb-5">
          <a href="https://www.linkedin.com/in/qin-yu-01a41212a/" target="_blank" rel="noopener noreferrer" className="social-link">
            <Linkedin size={20} />
          </a>
          <a href="https://medium.com/@cosimaqin_vrar" target="_blank" rel="noopener noreferrer" className="social-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
            </svg>
          </a>
        </div>
        <div className="text-sm opacity-70">
          © 2024 Tech Blog. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

// Category Page Wrapper to extract category from URL
function CategoryPageWrapper({ language }) {
  const { category } = useParams()
  return <CategoryPage language={language} category={category} />
}

// Main App Component
function App() {
  const [language, setLanguage] = useState('en')

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage language={language} setLanguage={setLanguage} />} />
        <Route path="/post/:id" element={<BlogPost language={language} />} />
        <Route path="/category/:category" element={<CategoryPageWrapper language={language} />} />
        <Route path="/newsletter" element={<NewsletterPage language={language} />} />
      </Routes>
    </Router>
  )
}

export default App

