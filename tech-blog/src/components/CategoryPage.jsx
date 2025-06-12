import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { blogAPI } from '../services/blogAPI.js'

// Category Page Component
function CategoryPage({ language, category }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCategoryPosts = async () => {
      try {
        setLoading(true)
        const categoryPosts = await blogAPI.getPostsByCategory(category, language)
        setPosts(categoryPosts || [])
      } catch (err) {
        setError('Failed to load category posts')
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryPosts()
  }, [category, language])

  const content = {
    en: {
      backToHome: "Back to Home",
      categories: {
        expression: "Expression",
        experiment: "Experiment", 
        experience: "Experience"
      },
      descriptions: {
        expression: "Thoughts, insights, and perspectives on design, technology, and innovation.",
        experiment: "Explorations, prototypes, and experimental projects pushing boundaries.",
        experience: "Real-world experiences, lessons learned, and practical insights."
      },
      noPosts: "No posts found in this category yet.",
      readMore: "Read Article"
    },
    zh: {
      backToHome: "返回首页",
      categories: {
        expression: "表达",
        experiment: "实验",
        experience: "体验"
      },
      descriptions: {
        expression: "关于设计、技术和创新的思考、见解和观点。",
        experiment: "探索、原型和突破界限的实验项目。",
        experience: "真实世界的经验、学到的教训和实用见解。"
      },
      noPosts: "此类别中暂无文章。",
      readMore: "阅读文章"
    }
  }

  const t = content[language]
  const categoryName = t.categories[category]
  const categoryDescription = t.descriptions[category]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5dc] flex items-center justify-center">
        <div className="text-2xl font-bold">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5dc]">
      {/* Header */}
      <header className="blog-header p-5 md:px-10 md:py-5 flex justify-between items-center">
        <Link to="/" className="blog-logo">QINYU</Link>
        <Link to="/" className="flex items-center gap-2 nav-item">
          <ArrowLeft size={16} />
          {t.backToHome}
        </Link>
      </header>

      {/* Category Hero */}
      <section className="category-hero p-10 md:p-15 text-center border-3 border-t-0 border-[#2c2c2c] bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
        <h1 className="text-4xl md:text-6xl font-bold mb-5 text-white">{categoryName}</h1>
        <p className="text-lg md:text-xl text-white opacity-90 max-w-2xl mx-auto">{categoryDescription}</p>
      </section>

      {/* Posts Grid */}
      <section className="posts-section p-10 border-3 border-t-0 border-[#2c2c2c]">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl opacity-70">{t.noPosts}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link 
                key={post.id} 
                to={`/post/${post.id}`} 
                className="blog-card cursor-pointer"
              >
                <span className="category-tag">{categoryName}</span>
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
        )}
      </section>
    </div>
  )
}

export default CategoryPage

