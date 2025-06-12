import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail } from 'lucide-react'

// Newsletter Page Component
function NewsletterPage({ language }) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const content = {
    en: {
      backToHome: "Back to Home",
      title: "Join the Newsletter",
      subtitle: "Stay Updated with Qinyu's Latest Insights",
      description: "Get exclusive content about HCI design, engineering insights, and product management in AI/VR/AR delivered directly to your inbox. Join a community of innovators and stay ahead of the curve.",
      benefits: [
        "🎨 Design thinking and HCI insights",
        "⚡ Engineering best practices and technical deep-dives", 
        "🚀 Product management strategies for emerging tech",
        "🔮 Future trends in AI, VR, and AR",
        "📚 Curated resources and tools",
        "💡 Behind-the-scenes project stories"
      ],
      placeholder: "Enter your email address",
      subscribe: "Subscribe Now",
      frequency: "Weekly newsletter • No spam • Unsubscribe anytime",
      success: "Thank you for subscribing! Check your email for confirmation.",
      error: "Something went wrong. Please try again."
    },
    zh: {
      backToHome: "返回首页",
      title: "加入通讯订阅",
      subtitle: "获取秦雨的最新见解",
      description: "获取关于HCI设计、工程见解和AI/VR/AR产品管理的独家内容，直接发送到您的收件箱。加入创新者社区，保持领先地位。",
      benefits: [
        "🎨 设计思维和HCI见解",
        "⚡ 工程最佳实践和技术深度解析",
        "🚀 新兴技术的产品管理策略", 
        "🔮 AI、VR和AR的未来趋势",
        "📚 精选资源和工具",
        "💡 幕后项目故事"
      ],
      placeholder: "输入您的邮箱地址",
      subscribe: "立即订阅",
      frequency: "每周通讯 • 无垃圾邮件 • 随时取消订阅",
      success: "感谢您的订阅！请查看您的邮箱确认。",
      error: "出现错误，请重试。"
    }
  }

  const t = content[language]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return

    setIsSubmitting(true)
    setMessage('')

    try {
      const response = await fetch('https://60h5imcez3v3.manus.space/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          language,
          source: 'newsletter_page'
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage(t.success)
        setEmail('')
      } else {
        setMessage(data.message || t.error)
      }
    } catch (error) {
      setMessage(t.error)
    } finally {
      setIsSubmitting(false)
    }
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

      {/* Newsletter Hero */}
      <section className="newsletter-hero p-10 md:p-20 text-center border-3 border-t-0 border-[#2c2c2c] bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-5 text-white">{t.title}</h1>
          <h2 className="text-xl md:text-2xl text-white opacity-90 mb-8">{t.subtitle}</h2>
          <p className="text-lg text-white opacity-80 max-w-2xl mx-auto leading-relaxed">{t.description}</p>
        </div>
      </section>

      {/* Newsletter Content */}
      <section className="newsletter-content p-10 md:p-20 border-3 border-t-0 border-[#2c2c2c]">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Benefits */}
          <div>
            <h3 className="text-2xl font-bold mb-6">What you'll get:</h3>
            <ul className="space-y-4">
              {t.benefits.map((benefit, index) => (
                <li key={index} className="text-lg flex items-start gap-3">
                  <span className="text-2xl">{benefit.split(' ')[0]}</span>
                  <span>{benefit.substring(benefit.indexOf(' ') + 1)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Signup Form */}
          <div className="newsletter-signup-card p-8 bg-white border-3 border-[#2c2c2c] rounded-lg shadow-lg">
            <div className="text-center mb-6">
              <Mail size={48} className="mx-auto mb-4 text-purple-600" />
              <h3 className="text-2xl font-bold mb-2">Ready to join?</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.placeholder}
                className="w-full p-4 border-2 border-[#2c2c2c] rounded-lg text-lg focus:outline-none focus:border-purple-600 transition-colors"
                required
              />
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-purple-600 text-white p-4 rounded-lg text-lg font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Subscribing...' : t.subscribe}
              </button>
            </form>

            {message && (
              <div className={`mt-4 p-3 rounded-lg text-center ${
                message.includes('Thank you') || message.includes('感谢') 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {message}
              </div>
            )}

            <p className="text-sm text-gray-600 text-center mt-4">{t.frequency}</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default NewsletterPage

